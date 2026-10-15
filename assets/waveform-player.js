/* Linha do tempo navegável da gravação. A onda ao vivo permanece inalterada. */
(() => {
  "use strict";
  const box=document.querySelector(".wave"),liveCanvas=document.getElementById("wave");
  if(!box||!liveCanvas)return;
  const canvas=document.createElement("canvas");canvas.id="recordingWave";canvas.className="wave-replay";
  canvas.setAttribute("role","slider");canvas.setAttribute("aria-label","Posição da gravação. Use as setas para avançar ou retroceder cinco segundos");
  canvas.setAttribute("aria-valuemin","0");canvas.setAttribute("aria-valuenow","0");canvas.tabIndex=0;
  canvas.hidden=true;box.append(canvas);
  const tip=document.createElement("span");tip.className="wave-tooltip";tip.hidden=true;box.append(tip);
  const bar=document.createElement("div");bar.className="replay-controls";bar.hidden=true;
  bar.innerHTML='<button type="button" class="btn sm replay-toggle" aria-label="Reproduzir áudio">▶ Reproduzir</button><span class="replay-clock" aria-live="off">00:00 / 00:00</span><span class="replay-legend">Clique na onda para ouvir a partir de um ponto</span><label class="replay-speed">Velocidade <select aria-label="Velocidade da reprodução"><option value=".75">0,75×</option><option value="1" selected>1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label>';
  box.after(bar);
  const button=bar.querySelector(".replay-toggle"),clock=bar.querySelector(".replay-clock"),speed=bar.querySelector("select");
  const ctx=canvas.getContext("2d");
  const colors=["--s0","--s1","--s2","--s3","--s4","--s5","--s6","--s7"];
  let player=null,duration=0,peaks=[],speakers=[],barColors=[],startMs=0,hover=null,drag=false,ready=false,seq=0,raf=0;
  const attached=new WeakSet();
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const format=sec=>{const s=Math.max(0,Math.floor(sec||0));return String(Math.floor(s/3600)).padStart(2,"0")+":"+String(Math.floor(s%3600/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
  const pal=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||"#3559c7";
  function draw(){
    if(raf){cancelAnimationFrame(raf);raf=0}
    if(!ready||!ctx||canvas.hidden)return;
    const rect=canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    ctx.clearRect(0,0,w,h);const n=peaks.length||1,bw=w/n,mid=h/2,progress=clamp((player?.currentTime||0)/duration,0,1);
    const neutral=pal("--accent"),done=pal("--ink-3"),themeColors=colors.map(pal);
    ctx.lineWidth=Math.max(1,dpr);
    for(let i=0;i<n;i++){
      const col=barColors[i]??-1;
      const base=col>=0?themeColors[col%themeColors.length]:neutral;
      ctx.fillStyle=(i+0.5)/n<=progress?base:base;
      ctx.globalAlpha=(i+0.5)/n<=progress?1:0.52;
      const peak=Math.max(.035,peaks[i]||0),bh=Math.max(2*dpr,Math.min(h*.88,peak*h*.94));
      ctx.fillRect(Math.round(i*bw+bw*.18),Math.round(mid-bh/2),Math.max(1,bw*.64),Math.round(bh));
    }
    ctx.globalAlpha=1;
    const x=Math.round(progress*w);
    ctx.strokeStyle=pal("--ink");ctx.lineWidth=1.6*dpr;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();
    ctx.fillStyle=pal("--ink");ctx.beginPath();ctx.arc(x,4*dpr,3*dpr,0,Math.PI*2);ctx.fill();
    if(hover!==null){const xx=Math.round(clamp(hover,0,duration)/duration*w);ctx.strokeStyle=done;ctx.lineWidth=dpr;ctx.setLineDash([3*dpr,3*dpr]);ctx.beginPath();ctx.moveTo(xx,10*dpr);ctx.lineTo(xx,h);ctx.stroke();ctx.setLineDash([])}
    canvas.setAttribute("aria-valuenow",String(Math.round(player?.currentTime||0)));
    canvas.setAttribute("aria-valuemax",String(Math.round(duration)));
    canvas.setAttribute("aria-valuetext",format(player?.currentTime||0)+" de "+format(duration));
    clock.textContent=format(player?.currentTime||0)+" / "+format(duration);
    button.textContent=player&&!player.paused?"❚❚ Pausar":"▶ Reproduzir";
    button.setAttribute("aria-label",player&&!player.paused?"Pausar áudio":"Reproduzir áudio");
    if(player&&!player.paused)raf=requestAnimationFrame(draw);else raf=0;
  }
  function update(){if(!ready)return;if(!raf)draw()}
  function seek(seconds,play=false){
    if(!ready||!player)return false;
    const target=clamp(seconds,0,duration);player.currentTime=target;
    if(play)player.play().catch(()=>{});
    draw();return true;
  }
  window.ataWaveSeekElapsed=ms=>seek((Number(ms)-startMs)/1000,true);
  window.ataWaveSeek=window.ataWaveSeekElapsed;
  function fromEvent(e){const r=canvas.getBoundingClientRect();return clamp((e.clientX-r.left)/Math.max(1,r.width)*duration,0,duration)}
  function tooltip(e){if(!ready)return;hover=fromEvent(e);tip.hidden=false;tip.textContent=format(hover);const r=canvas.getBoundingClientRect();tip.style.left=clamp(e.clientX-r.left,27,r.width-27)+"px";draw()}
  canvas.addEventListener("pointerdown",e=>{if(!ready)return;drag=true;canvas.setPointerCapture(e.pointerId);seek(fromEvent(e));tooltip(e);e.preventDefault()});
  canvas.addEventListener("pointermove",e=>{if(!ready)return;tooltip(e);if(drag)seek(fromEvent(e))});
  for(const name of ["pointerup","pointercancel"])canvas.addEventListener(name,e=>{if(!drag)return;drag=false;if(name==="pointerup")seek(fromEvent(e),true);try{canvas.releasePointerCapture(e.pointerId)}catch(_){}});
  canvas.addEventListener("pointerleave",()=>{if(drag)return;hover=null;tip.hidden=true;draw()});
  canvas.addEventListener("keydown",e=>{
    if(!ready)return;let target=null;
    if(e.key==="ArrowRight")target=(player?.currentTime||0)+5;
    else if(e.key==="ArrowLeft")target=(player?.currentTime||0)-5;
    else if(e.key==="Home")target=0;
    else if(e.key==="End")target=duration;
    else if(e.code==="Space"||e.key===" "){e.preventDefault();button.click();return}
    if(target!==null){e.preventDefault();seek(target)}
  });
  button.addEventListener("click",()=>{if(!ready||!player)return;if(player.paused)player.play().catch(()=>{});else player.pause();draw()});
  speed.addEventListener("change",()=>{if(player)player.playbackRate=Number(speed.value)});
  function reset(){seq++;cancelAnimationFrame(raf);raf=0;ready=false;canvas.hidden=true;bar.hidden=true;tip.hidden=true;hover=null;peaks=[];speakers=[];barColors=[];player=null;duration=0;drag=false;liveCanvas.hidden=false;box.classList.remove("wave-has-replay")}
  async function load(detail){
    reset();if(!detail||!detail.blob||!detail.player||!(detail.duration>0))return;
    const token=seq;player=detail.player;duration=detail.duration;startMs=Number(detail.startElapsedMs)||0;
    const items=detail.speakerMap===false?[]:(window.ataGetWaveSegments?.()||[]);
    speakers=items.filter(s=>Number.isFinite(Number(s.elapsed))).map(s=>({time:(Number(s.elapsed)-startMs)/1000,col:Number(s.col)})).filter(s=>s.time>=0&&s.time<=duration).sort((a,b)=>a.time-b.time);
    try{
      const buffer=await window.ataDecodeAudio();
      if(token!==seq)return;
      const ch=buffer.numberOfChannels,samples=Math.min(1500,Math.max(180,Math.floor((box.clientWidth||750)/2.8))),step=Math.max(1,Math.ceil(buffer.length/samples));
      const data=Array.from({length:Math.min(ch,2)},(_,i)=>buffer.getChannelData(i));
      peaks=new Array(samples);
      for(let i=0;i<samples;i++){
        const first=i*step,last=Math.min(buffer.length,first+step);
        let max=0;
        for(let j=first;j<last;j+=Math.max(1,Math.floor(step/70))){for(const channel of data)max=Math.max(max,Math.abs(channel[j]||0))}
        peaks[i]=Math.pow(Math.min(1,max),.72);
      }
      if(token!==seq)return;
      let cursor=0,last=null;
      barColors=peaks.map((_,i)=>{
        const t=(i+.5)/peaks.length*duration;
        while(cursor<speakers.length&&speakers[cursor].time<=t)last=speakers[cursor++];
        return last&&t-last.time<=7&&last.col>=0?last.col:-1;
      });
      ready=true;liveCanvas.hidden=true;canvas.hidden=false;bar.hidden=false;box.classList.add("wave-has-replay");
      if(!attached.has(player)){
        attached.add(player);
        for(const type of ["timeupdate","seeked","play","pause","ended"])player.addEventListener(type,update);
      }
      draw();
    }catch(err){
      if(token!==seq)return;reset();console.warn("Não foi possível desenhar a gravação:",err);
    }
  }
  window.addEventListener("ata:wave:loaded",event=>load(event.detail));
  window.addEventListener("ata:wave:mode",event=>{
    if(!ready)return;
    if(event.detail?.mode==="edited"){cancelAnimationFrame(raf);raf=0;canvas.hidden=true;bar.hidden=true;liveCanvas.hidden=false;box.classList.remove("wave-has-replay")}
    else{canvas.hidden=false;bar.hidden=false;liveCanvas.hidden=true;box.classList.add("wave-has-replay");draw()}
  });
  window.addEventListener("ata:audio-reset",reset);
  window.addEventListener("ata:recording-start",reset);
  window.addEventListener("resize",()=>{if(ready)draw()});
  try{new ResizeObserver(()=>{if(ready)draw()}).observe(box)}catch(_){}
  const transcript=document.getElementById("live");
  if(transcript){
    transcript.addEventListener("click",e=>{
      const el=e.target.closest(".seg .ts");if(!el||el.classList.contains("play"))return;
      const row=el.closest(".seg"),id=row?.dataset.seg;
      const seg=window.ataFindWaveSegment?.(id);if(!seg)return;
      seek((Number(seg.elapsed)-startMs)/1000,true);
    });
  }
})();
