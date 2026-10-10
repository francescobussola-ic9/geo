import { state } from '../core/state.js';
import { FAMILIES } from '../domain/families.js';
// --- Telemetria GEØ ---------------------------------------------------------
// Il nickname è facoltativo: senza nickname non viene inviato alcun dato.
const LOG_ENDPOINT='https://script.google.com/macros/s/AKfycbxOtGBk53p1bHpAvGNH6a6vjYYGb0uAHkEGE1RY67tu-_QBEkj0M5mFuzbbJ0MyA-RQ/exec';
const NICKNAME_KEY='geo_v06_nickname';
const AUTH_KEY='geo_v06_auth';
const OFFLINE=location.protocol==='file:';
let auth=null;
try { auth=JSON.parse(sessionStorage.getItem(AUTH_KEY)||'null'); } catch(_) {}
export function isOffline(){return OFFLINE;}
export function isAuthorized(){return OFFLINE || Boolean(auth?.token && auth.expires>Date.now());}
export function getGroup(){return isAuthorized()&&!OFFLINE?auth.gruppo:'';}
export function clearAuthorization(){auth=null;try{sessionStorage.removeItem(AUTH_KEY);}catch(_){} saveNickname('');}
export function setAuthorization(result){if(!result?.ok||!result.token||!result.expires)throw Error('Autorizzazione non valida');auth={token:result.token,expires:Number(result.expires),gruppo:result.gruppo,categoria:result.categoria};try{sessionStorage.setItem(AUTH_KEY,JSON.stringify(auth));}catch(_){};}
// Verifica tramite JSONP: GitHub Pages non può leggere direttamente le risposte
// di Apps Script con fetch (CORS), né caricare script.google.com in un iframe.
// I codici sono codici condivisi di gruppo, NON password personali.
export function verifyCode(code){
  return new Promise((resolve,reject)=>{
    const callback='geoAuth_'+makeId().replace(/[^a-zA-Z0-9_]/g,'_');
    const script=document.createElement('script');
    let done=false;
    const finish=(err,value)=>{
      if(done)return;
      done=true;
      clearTimeout(timer);
      delete window[callback];
      script.remove();
      err?reject(err):resolve(value);
    };
    window[callback]=(result)=>{
      if(!result?.ok)return finish(Error(result?.error||'Codice non valido'));
      finish(null,result);
    };
    script.onerror=()=>finish(Error('Verifica non disponibile. Riprova.'));
    const url=new URL(LOG_ENDPOINT);
    url.searchParams.set('action','auth');
    url.searchParams.set('code',code);
    url.searchParams.set('callback',callback);
    script.src=url.toString();
    const timer=setTimeout(()=>finish(Error('Verifica non disponibile. Riprova.')),15000);
    document.head.append(script);
  });
}

const SESSION_KEY='geo_session';
const SEQUENCE_KEY='geo_sequence';
const HELP_LOG_DELAY=10000;
export function makeId(){return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;}
let volatileNickname='',volatileSessionId='';
export function getNickname(){if(!isAuthorized())return '';try{return (localStorage.getItem(NICKNAME_KEY)||volatileNickname||'').trim();}catch(_){return volatileNickname.trim();}}
export function saveNickname(value){if(value&&!isAuthorized())return;volatileNickname=(value||'').trim();try{if(volatileNickname)localStorage.setItem(NICKNAME_KEY,volatileNickname);else localStorage.removeItem(NICKNAME_KEY);}catch(_){}}
function getSessionId(){try{let id=sessionStorage.getItem(SESSION_KEY);if(!id){id=makeId();sessionStorage.setItem(SESSION_KEY,id);}return id;}catch(_){if(!volatileSessionId)volatileSessionId=makeId();return volatileSessionId;}}
function nextSequence(){try{const current=Number(sessionStorage.getItem(SEQUENCE_KEY)||'0'),next=current+1;sessionStorage.setItem(SEQUENCE_KEY,String(next));return next;}catch(_){state.volatileSequence=(state.volatileSequence||0)+1;return state.volatileSequence;}}
export function logEvent(evento,extra={}){const nickname=getNickname();if(!nickname)return;const family=state.family?FAMILIES[state.family]:null;const payload={action:'log',token:OFFLINE?'':auth?.token||'',nickname,sessione:getSessionId(),sequenza:nextSequence(),evento,argomento:extra.argomento??state.entryFigure??'',problema:extra.problema??state.family??'',aiuto:extra.aiuto??'',strategie:evento==='PROBLEMA'&&Array.isArray(family?.strategies)?family.strategies.join(', '):''};if(OFFLINE)return;fetch(LOG_ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).catch(()=>{});}
let helpTimer=null;
export function cancelHelpTimer(){if(helpTimer!==null){clearTimeout(helpTimer);helpTimer=null;}}
export function startHelpTimer(helpIndex){cancelHelpTimer();if(!getNickname()||state.loggedHelps.has(helpIndex))return;const attemptId=state.attemptId;helpTimer=setTimeout(()=>{helpTimer=null;if(state.view==='problem'&&state.attemptId===attemptId&&state.openHelp===helpIndex&&!state.loggedHelps.has(helpIndex)){state.loggedHelps.add(helpIndex);logEvent('AIUTO_USATO',{aiuto:`A${helpIndex+1}`});}},HELP_LOG_DELAY);}
