// Combat Lab P10c safe local-only experimental static host. No remote access,
// CDN, account, telemetry, network download or game code modification.
// Windows portable bundle stores this server beside ./site and node.exe.
import http from "node:http";
import {createReadStream,statSync} from "node:fs";
import {resolve,dirname,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {spawn} from "node:child_process";
const host="127.0.0.1";
const root=resolve(process.env.P10C_ROOT||resolve(dirname(fileURLToPath(import.meta.url)),"site"));
const requestedPort=process.env.P10C_PORT?Number(process.env.P10C_PORT):0;
if(!Number.isInteger(requestedPort)||requestedPort<0||requestedPort>65535)
 throw Error("Invalid local port");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".wasm":"application/wasm",
 ".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",
 ".json":"application/json; charset=utf-8",".ico":"image/x-icon"};
const server=http.createServer((req,res)=>{
 if(req.method!=="GET"&&req.method!=="HEAD"){
  res.writeHead(405,{"Allow":"GET, HEAD"});res.end("Method not allowed");return;
 }
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}
 catch{res.writeHead(400);res.end("Bad path");return;}
 if(pathname==="/")pathname="/p10.html";
 if(pathname.includes("\0")||pathname.includes("\\")){
  res.writeHead(400);res.end("Invalid path");return;
 }
 const absolute=resolve(root,"."+pathname);
 if(!(absolute===root||absolute.startsWith(root+sep))){
  res.writeHead(403);res.end("Forbidden path");return;
 }
 let info;
 try{info=statSync(absolute);if(!info.isFile())throw Error("not file");}
 catch{res.writeHead(404);res.end("File not found");return;}
 res.writeHead(200,{"Content-Type":mime[extname(absolute)]||"application/octet-stream",
  "Content-Length":info.size,"Cache-Control":"no-store",
  "X-Content-Type-Options":"nosniff"});
 if(req.method==="HEAD"){res.end();return;}
 const stream=createReadStream(absolute);
 stream.on("error",()=>res.destroy());
 stream.pipe(res);
});
server.listen(requestedPort,host,()=>{
 const port=server.address().port,url="http://"+host+":"+port+"/p10.html";
 console.log("COMBAT LAB P10b · lokalny eksperyment");
 console.log("Przeglądarka: "+url);
 console.log("Serwer jest dostępny WYŁĄCZNIE na tym komputerze (127.0.0.1).");
 console.log("Zamknij to okno, aby zatrzymać symulację.");
 if(process.platform==="win32"&&process.env.P10C_NO_OPEN!=="1"){
  try{
   const cmd=spawn("cmd.exe",["/d","/c","start","",url],
    {detached:true,stdio:"ignore",windowsHide:true});
   cmd.on("error",err=>console.log("Nie udało się otworzyć przeglądarki automatycznie: "+err.message));
   cmd.unref();
  }catch(err){console.log("Otwórz URL ręcznie: "+url+" ("+err.message+")");}
 }
});
server.on("error",error=>{console.error("Błąd lokalnego serwera:",error);process.exitCode=1;});
