(() => {
  "use strict";
  const host=document.querySelector(".recp");if(!host)return;
  const panel=document.createElement("details");panel.id="audioStudio";panel.className="audio-studio";
  panel.innerHTML=`<summary><svg class="ui-icon" aria-hidden="true"><use href="./assets/icons.svg#headphones"/></svg> <span>Ouvir e editar gravação</span><span id="audioSummary">Nenhum áudio</span><svg class="ui-icon arrow" aria-hidden="true"><use href="./assets/icons.svg#chevron-down"/></svg></summary>
  <div class="studio-body"><p class="studio-tip">O áudio original é preservado. O editor mantém apenas os intervalos selecionados na cópia exportada. Salve os arquivos antes de fechar a página.</p>
  <div class="studio-row"><label class="btn sm studio-file"><svg class="ui-icon"><use href="./assets/icons.svg#upload"/></svg> Abrir áudio <input id="audioPick" type="file" accept="audio/*,video/webm,video/mp4,.wav,.webm,.ogg,.mp3,.m4a" hidden></label>
  <button id="audioOriginal" class="btn sm" type="button">Ouvir original</button></div>
  <audio id="audioPlayer" controls preload="metadata" aria-label="Gravação da reunião"></audio>
  <div id="audioRanges" class="audio-ranges" aria-label="Trechos preservados na gravação"></div>
  <div class="studio-row"><label>Segundos antes <input id="audioPre" type="number" min="0" max="300" value="10"></label><label>Segundos depois <input id="audioPost" type="number" min="0" max="300" value="25"></label><button id="audioAuto" class="btn sm primary" type="button"><svg class="ui-icon"><use href="./assets/icons.svg#list-check"/></svg> Manter só trechos registrados</button></div>
  <div class="studio-row"><label>Início (s) <input id="audioA" type="number" min="0" step=".1" value="0"></label><label>Fim (s) <input id="audioB" type="number" min="0" step=".1" value="0"></label><button id="audioMarkA" class="btn sm" type="button">Marcar início</button><button id="audioMarkB" class="btn sm" type="button">Marcar fim</button></div>
  <div class="studio-row"><button id="audioCut" class="btn sm" type="button"><svg class="ui-icon"><use href="./assets/icons.svg#scissors"/></svg> Excluir intervalo</button><button id="audioKeep" class="btn sm" type="button">Manter intervalo</button><button id="audioReset" class="btn sm ghost" type="button">Restaurar tudo</button></div>
  <div id="audioStats" class="studio-stats">Finalize uma gravação ou abra um áudio.</div>
  <div class="studio-row"><button id="audioPreview" class="btn sm" type="button"><svg class="ui-icon"><use href="./assets/icons.svg#headphones"/></svg> Ouvir versão editada</button><button id="audioExport" class="btn sm primary" type="button"><svg class="ui-icon"><use href="./assets/icons.svg#download"/></svg> Exportar editado (.wav)</button></div>
  <p id="audioFeedback" class="studio-feedback" role="status"></p></div>`;
  const wave=host.querySelector(".wave");if(wave)wave.after(panel);else host.append(panel);
  const $=id=>document.getElementById(id),player=$("audioPlayer");
  const actions=["audioOriginal","audioAuto","audioMarkA","audioMarkB","audioCut","audioKeep","audioReset","audioPreview","audioExport"];
  let file=null,url=null,previewUrl=null,duration=0,recordingOffset=0,keep=[],decoded=null,revision=0;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const nice=n=>Number.isFinite(n)?n.toFixed(1).replace(".",","):"0";
  function notify(msg,error){const el=$("audioFeedback");el.textContent=msg;el.classList.toggle("error",!!error)}
  function normalize(ranges){const r=ranges.map(([a,b])=>[clamp(+a,0,duration),clamp(+b,0,duration)]).filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b-a>0.001).sort((a,b)=>a[0]-b[0]);const out=[];for(const [a,b] of r){const last=out[out.length-1];if(last&&a<=last[1]+.001)last[1]=Math.max(last[1],b);else out.push([a,b])}return out}
  const seconds=()=>keep.reduce((acc,[a,b])=>acc+b-a,0);
  function render(){const loaded=!!file&&duration>0;actions.forEach(id=>$(id).disabled=!loaded);$("audioPreview").disabled=$("audioExport").disabled=!loaded||seconds()<=.001;
    $("audioSummary").textContent=loaded?nice(duration)+" s":"Nenhum áudio";
    $("audioStats").textContent=loaded?keep.length+" intervalo(s) mantido(s) · "+nice(seconds())+" s preservados · "+nice(duration-seconds())+" s excluídos":"Finalize uma gravação ou abra um áudio.";
    const bar=$("audioRanges");bar.replaceChildren();if(loaded)for(const [a,b] of keep){const el=document.createElement("span");el.className="audio-range";el.style.left=(a/duration*100)+"%";el.style.width=((b-a)/duration*100)+"%";el.title="Manter de "+nice(a)+" a "+nice(b)+" segundos";bar.append(el)}
    $("audioA").max=$("audioB").max=String(duration);
  }
  function release(){if(url)URL.revokeObjectURL(url);if(previewUrl)URL.revokeObjectURL(previewUrl);url=previewUrl=null}
  function clear(){revision++;player.pause();player.removeAttribute("src");player.load();release();file=decoded=null;duration=recordingOffset=0;keep=[];notify("");render()}
  async function decode(){if(decoded)return decoded;if(!file)throw Error("Nenhum áudio selecionado.");
    const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw Error("Decodificação indisponível neste navegador.");
    const ctx=new Context();try{decoded=await ctx.decodeAudioData(await file.arrayBuffer());return decoded}finally{await ctx.close()}}
  async function load(blob,offset,label){if(!blob||!blob.size)return;clear();file=blob;recordingOffset=Number(offset)||0;url=URL.createObjectURL(file);player.src=url;panel.open=true;const token=revision;
    try{await new Promise((resolve,reject)=>{if(player.readyState>=1){resolve();return}const ok=()=>{cleanup();resolve()},bad=()=>{cleanup();reject(Error("Formato de áudio não reconhecido."))},cleanup=()=>{player.removeEventListener("loadedmetadata",ok);player.removeEventListener("error",bad)};player.addEventListener("loadedmetadata",ok);player.addEventListener("error",bad)});if(token!==revision)return;
      duration=player.duration;if(!Number.isFinite(duration)||duration<=0)duration=(await decode()).duration;if(token!==revision)return;
      keep=[[0,duration]];$("audioB").value=duration.toFixed(1);render();notify(label+" carregado. Confira os trechos antes de exportar.");
    }catch(e){notify("Não foi possível abrir o áudio: "+e.message,true);render()}
  }
  function interval(){const a=Number($("audioA").value),b=Number($("audioB").value);if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b>duration||b<=a){notify("Intervalo inválido: ajuste início e fim dentro da gravação.",true);return null}return[a,b]}
  $("audioPick").addEventListener("change",e=>{const f=e.target.files?.[0];e.target.value="";if(f)load(f,0,"Áudio importado")});
  $("audioOriginal").onclick=()=>{if(url){player.pause();player.src=url;player.play().catch(()=>{});notify("Reproduzindo o áudio original.")}};
  $("audioMarkA").onclick=()=>{$("audioA").value=player.currentTime.toFixed(1)};
  $("audioMarkB").onclick=()=>{$("audioB").value=player.currentTime.toFixed(1)};
  $("audioReset").onclick=()=>{keep=[[0,duration]];render();notify("Todos os trechos restaurados na seleção.")};
  $("audioCut").onclick=()=>{const bounds=interval();if(!bounds)return;const [a,b]=bounds,out=[];for(const[x,y]of keep){if(x<a)out.push([x,Math.min(y,a)]);if(y>b)out.push([Math.max(x,b),y])}keep=normalize(out);render();notify("Trecho excluído da cópia editada; o original foi preservado.")};
  $("audioKeep").onclick=()=>{const bounds=interval();if(!bounds)return;keep=normalize([...keep,bounds]);render();notify("Trecho mantido na seleção.")};
  $("audioAuto").onclick=()=>{const records=window.ataGetRecords?.()||[],pre=clamp(Number($("audioPre").value)||0,0,300),post=clamp(Number($("audioPost").value)||0,0,300);
    const ranges=records.map(e=>(Number(e.elapsed)-recordingOffset)/1000).filter(Number.isFinite).map(t=>[t-pre,t+post]).filter(([a,b])=>b>0&&a<duration);
    if(!ranges.length){notify("Nenhum registro temporal correspondente encontrado: a seleção não foi alterada.",true);return}
    keep=normalize(ranges);render();notify(ranges.length+" registros usados como referência. Ouça e revise a seleção antes de exportar.");
  };
  async function wav(){if(!file||!keep.length)throw Error("Seleção vazia.");const audio=await decode(),sr=audio.sampleRate,ch=Math.min(audio.numberOfChannels,2);
    const ranges=keep.map(([a,b])=>[clamp(Math.floor(a*sr),0,audio.length),clamp(Math.ceil(b*sr),0,audio.length)]),frames=ranges.reduce((n,[a,b])=>n+b-a,0),size=44+frames*ch*2;
    if(size>512*1024*1024)throw Error("Arquivo maior que 512 MB; reduza a seleção.");
    const data=new ArrayBuffer(size),view=new DataView(data),write=(p,s)=>{for(let i=0;i<s.length;i++)view.setUint8(p+i,s.charCodeAt(i))};
    write(0,"RIFF");view.setUint32(4,size-8,true);write(8,"WAVE");write(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,ch,true);view.setUint32(24,sr,true);view.setUint32(28,sr*ch*2,true);view.setUint16(32,ch*2,true);view.setUint16(34,16,true);write(36,"data");view.setUint32(40,size-44,true);
    const channels=Array.from({length:ch},(_,i)=>audio.getChannelData(i));let p=44,count=0;
    for(const[a,b]of ranges)for(let i=a;i<b;i++){for(let c=0;c<ch;c++){const v=clamp(channels[c][i],-1,1);view.setInt16(p,v<0?v*32768:v*32767,true);p+=2}if(++count%240000===0)await new Promise(resolve=>setTimeout(resolve,0))}
    return new Blob([data],{type:"audio/wav"});
  }
  async function process(kind){const btn=$(kind==="preview"?"audioPreview":"audioExport"),old=btn.innerHTML;btn.disabled=true;btn.textContent="Processando…";notify("Processando áudio neste navegador…");
    try{const out=await wav();if(kind==="preview"){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(out);player.pause();player.src=previewUrl;await player.play();notify("Reproduzindo só os trechos mantidos.");}
      else{const link=document.createElement("a"),downloadUrl=URL.createObjectURL(out);link.href=downloadUrl;link.download="ata_audio_editado.wav";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(downloadUrl),60000);notify("Áudio editado exportado, sem alterar o original.");}
    }catch(e){notify("Falha no processamento: "+e.message,true)}finally{btn.innerHTML=old;render()}
  }
  $("audioPreview").onclick=()=>process("preview");$("audioExport").onclick=()=>process("export");
  window.addEventListener("ata:audio-ready",e=>{if(e.detail?.blob)load(e.detail.blob,e.detail.startElapsedMs||0,"Gravação finalizada")});
  window.addEventListener("ata:audio-reset",clear);
  render();
})();