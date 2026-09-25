import test from "node:test";
import assert from "node:assert/strict";
import {isEditingTarget} from "../src/core/browser-input.js";

test("Workbench editing targets are isolated from world keyboard input",()=>{
  for(const tagName of ["INPUT","TEXTAREA","SELECT","BUTTON"]){
    assert.equal(isEditingTarget({tagName}),true,tagName);
  }

  assert.equal(isEditingTarget({tagName:"DIV",isContentEditable:true}),true);
  assert.equal(isEditingTarget({tagName:"CANVAS"}),false);
  assert.equal(isEditingTarget({tagName:"BODY"}),false);
});

test("custom Workbench editing surfaces can opt into keyboard isolation",()=>{
  const target={
    tagName:"DIV",
    closest(selector){
      return selector.includes("data-workbench-input") ? {dataset:{workbenchInput:""}} : null;
    }
  };
  assert.equal(isEditingTarget(target),true);
});
