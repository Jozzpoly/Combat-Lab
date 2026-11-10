#!/usr/bin/env node
// Conservative, credential-safe public history screening.
// This does NOT replace GitHub secret scanning, expert review, or revocation.
// It never prints candidate secret values.
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const git=(args,opt={})=>execFileSync("git",args,{cwd:root,timeout:180000,
   maxBuffer:256*1024*1024,stdio:["pipe","pipe","pipe"],...opt});
assert.equal(git(["rev-parse","--is-shallow-repository"],{encoding:"utf8"}).trim(),"false");
const lines=git(["rev-list","--objects","--all"],{encoding:"utf8"}).trim().split("\n");
const objects=new Map();
for(const line of lines) {
 const match=line.match(/^([a-f0-9]{40,64})(?: (.*))?$/);
 if(match&&!objects.has(match[1]))objects.set(match[1],match[2]||"(unknown path)");
}
const ids=[...objects.keys()];
const checks=git(["cat-file","--batch-check=%(objectname) %(objecttype) %(objectsize)"],{
 input:ids.join("\n")+"\n",encoding:"utf8"}).trim().split("\n");
const blobs=[];
for(const line of checks) {
 const m=line.match(/^([a-f0-9]{40,64}) blob (\d+)$/);
 if(m&&Number(m[2])<=20_000_000)blobs.push({id:m[1],size:Number(m[2]),path:objects.get(m[1])});
}
const re=[
 ["private-key-header",/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
 ["openai-production-like-key",/\bsk-(?:proj-)?[A-Za-z0-9_-]{30,}\b/g],
 ["github-classic-or-fine-grained-token",/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/g],
 ["aws-access-key-id",/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g],
 ["cloudflare-token-assignment",/\b(?:CF_API_TOKEN|CLOUDFLARE_API_TOKEN)\s*[:=]\s*['"]?[A-Za-z0-9_-]{30,}\b/gi]
];
const result=git(["cat-file","--batch"],{input:blobs.map(b=>b.id).join("\n")+"\n"});
let offset=0,seen=0;const suspects=[];
for(const b of blobs) {
 const end=result.indexOf(0x0a,offset);
 if(end<0)throw Error("malformed cat-file header");
 const header=result.subarray(offset,end).toString("utf8");
 const m=header.match(/^([a-f0-9]{40,64}) blob (\d+)$/);
 if(!m||m[1]!==b.id||Number(m[2])!==b.size)throw Error("unexpected Git batch object");
 const data=result.subarray(end+1,end+1+b.size);
 offset=end+1+b.size+1;
 seen++;
 if(data.includes(0))continue; // binary: only inspect text sources
 const content=data.toString("utf8");
 for(const [kind,regex] of re) {
  regex.lastIndex=0;
  if(regex.test(content))suspects.push({type:kind,object:b.id.slice(0,12),path:b.path});
 }
}
assert.equal(seen,blobs.length);
const keyFiles=[...new Set([...objects.values()].filter(p=>/^(?:.*\/)?(?:\.env|id_rsa|id_ed25519|credentials\.json|service.account\.json|\.npmrc)(?:$|\/)/i.test(p)))];
console.log("SCREENED: "+ids.length+" reachable Git objects, "+blobs.length+" blob snapshots; binary excluded");
console.log("SUSPECT PATTERN CATEGORIES (NO VALUES): "+JSON.stringify(suspects.slice(0,40)));
console.log("SENSITIVE-LOOKING FILE PATHS: "+JSON.stringify(keyFiles.slice(0,40)));
if(suspects.length) {
 console.error("POTENTIAL SECRET: manual rotation / history and credentials review required. Never paste the value into a ticket or chat.");
 process.exitCode=2;
} else {
 console.log("PASS: no high-confidence credential patterns in the scanned text blobs (not a full security audit)");
}
