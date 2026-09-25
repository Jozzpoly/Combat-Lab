export function resizeCanvas(canvas, maxDpr=2) {
  const rect=canvas.getBoundingClientRect();
  const dpr=Math.min(globalThis.devicePixelRatio || 1, maxDpr);
  const width=Math.max(1,Math.round(rect.width*dpr));
  const height=Math.max(1,Math.round(rect.height*dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width=width;
    canvas.height=height;
  }
  return {width:rect.width,height:rect.height,dpr};
}

export function beginCanvasFrame(ctx,{width,height,dpr},fill="#12161b") {
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle=fill;
  ctx.fillRect(0,0,width,height);
}
