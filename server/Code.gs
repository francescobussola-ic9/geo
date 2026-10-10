/** GEØ v0.6 — Apps Script collegato al Google Foglio LOG + ACCESSI.
 * Distribuzione: app web, esegui come proprietario, accessibile a chiunque.
 * Imposta SCRIPT_SECRET in Proprietà script con una stringa casuale lunga >=32 caratteri.
 * Non pubblicare il foglio né questo script con i codici.
 */
const ACCESS_SHEET='ACCESSI';
const SPREADSHEET_ID='1prR1ngqOHmybFMOZi-eh1XHQxHQA6lonE7byoTNWfok';
const LOG_SHEET='Log';
const TTL_MS=6*60*60*1000;

function doPost(e){
  try {
    const p=e.parameter||{};
    if(p.action==='auth') return authResponse_(p);
    const data=JSON.parse(e.postData.contents||'{}');
    if(data.action!=='log') throw Error('Azione non riconosciuta');
    const claims=validateToken_(data.token);
    if(!claims) throw Error('Autorizzazione mancante o scaduta');
    const nickname=String(data.nickname||'').trim().slice(0,40);
    const allowed=['ARGOMENTO','PROBLEMA','AIUTO_USATO','HOME'];
    if(!allowed.includes(data.evento)) throw Error('Evento non valido');
    if(!nickname) throw Error('Nickname mancante');
    const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet=ss.getSheetByName(LOG_SHEET);
    if(!sheet) throw Error('Scheda LOG mancante');
    const safe=x=>{const v=String(x??'').slice(0,300);return /^[=+@\-\t\r]/.test(v)?"'"+v:v;};
    if(sheet.getLastColumn()<11) throw Error('Aggiungi Categoria e Gruppo nelle colonne J e K di Log');
    const row=[new Date(),safe(nickname),safe(data.sessione),Number(data.sequenza)||0,safe(data.evento),safe(data.argomento),safe(data.problema),safe(data.aiuto),safe(data.strategie),safe(claims.categoria),safe(claims.gruppo)];
    const lock=LockService.getScriptLock();lock.waitLock(10000);
    try {sheet.appendRow(row);} finally {lock.releaseLock();}
    return ContentService.createTextOutput('OK');
  }catch(err){return ContentService.createTextOutput('ERRORE: '+err.message);}
}

function authResponse_(p){
  let result;
  try{
    const code=String(p.code||'').trim();
    if(!code||code.length>120) throw Error('Codice non valido');
    const sheet=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(ACCESS_SHEET);
    if(!sheet) throw Error('Scheda ACCESSI mancante');
    const values=sheet.getDataRange().getDisplayValues();
    const header=values.shift().map(v=>v.trim().toLowerCase());
    const idx=n=>header.indexOf(n);
    if(['codice','categoria','gruppo','attivo'].some(n=>idx(n)<0))throw Error('Intestazioni ACCESSI non valide');
    const match=values.find(r=>r[idx('codice')].trim()===code&&['sì','si','true','1','yes'].includes(r[idx('attivo')].trim().toLowerCase()));
    if(!match) throw Error('Codice non valido o disattivato');
    const categoria=match[idx('categoria')].trim(),gruppo=match[idx('gruppo')].trim();
    if(!categoria||!gruppo)throw Error('Codice non configurato');
    const expires=Date.now()+TTL_MS;
    const token=signToken_({categoria,gruppo,expires});
    result={ok:true,categoria,gruppo,expires,token};
  }catch(err){result={ok:false,error:err.message};}
  const nonce=String(p.nonce||'').slice(0,100);
  const message=JSON.stringify({geoAuthNonce:nonce,result}).replace(/</g,'\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>top.postMessage('+message+',"*");<\/script></body></html>');
}
function secret_(){const v=PropertiesService.getScriptProperties().getProperty('SCRIPT_SECRET');if(!v||v.length<32)throw Error('SCRIPT_SECRET non configurato');return v;}
function b64_(s){return Utilities.base64EncodeWebSafe(s,Utilities.Charset.UTF_8).replace(/=+$/,'');}
function sign_(payload){return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload,secret_())).replace(/=+$/,'');}
function signToken_(claims){const data=b64_(JSON.stringify(claims));return data+'.'+sign_(data);}
function validateToken_(token){
  try{
    const parts=String(token||'').split('.');if(parts.length!==2)return null;
    const expected=sign_(parts[0]);if(expected.length!==parts[1].length)return null;
    let diff=0;for(let i=0;i<expected.length;i++)diff|=expected.charCodeAt(i)^parts[1].charCodeAt(i);
    if(diff)return null;
    const claims=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
    if(!claims.expires||Date.now()>claims.expires||!claims.categoria||!claims.gruppo)return null;
    return claims;
  }catch(_){return null;}
}
