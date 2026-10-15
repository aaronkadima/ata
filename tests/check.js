const fs=require('node:fs');const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const html=read('index.html'),js=read('assets/audio-editor.js'),css=read('assets/studio.css'),icons=read('assets/icons.svg');
for(const id of ['micBtn','dlAudio','entryIn','entries','live','repOut','signBox']){
  assert.match(html,new RegExp('id="'+id+'"'),"ID ausente: "+id);
}
for(const route of ['meeting','schedule','documents','settings']){
  assert.match(html,new RegExp('data-view="'+route+'"'),"Tela ausente: "+route);
}
assert.match(html,/IS_DEV=.+location\.pathname/);
assert.match(html,/registrador-reuniao-v1".*IS_DEV/);
assert.match(html,/registrador-prefs-v1".*IS_DEV/);
assert.match(html,/ata:audio-ready/);assert.match(html,/ata:audio-reset/);
assert.match(html,/window\.ataGetRecords/);
assert.match(html,/assets\/audio-editor\.js/);
assert.match(js,/audio\.wav|audio\/wav/);
assert.match(js,/decodeAudioData/);
assert.match(js,/window\.ataGetRecords/);
assert.match(js,/audioCut/);
assert.match(js,/audioAuto/);
assert.match(css,/max-width:820px/);
for(const icon of ['mic','calendar','file-text','settings','headphones','scissors','play','download','upload','list-check'])assert.ok(icons.includes('id="'+icon+'"'),"Ícone faltante: "+icon);
console.log("ATA: referências, edição de áudio, ícones e isolamento DEV/PROD validados.");
