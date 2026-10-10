import { state } from '../core/state.js';
import { FAMILIES, COMPLEX_USED } from '../domain/families.js';
import { FIGURES, FORMULAS } from '../domain/catalog.js';
import { makeId, getNickname, saveNickname, logEvent, cancelHelpTimer, startHelpTimer, isOffline, isAuthorized, verifyCode, setAuthorization, clearAuthorization, getGroup } from '../services/telemetry.js';

const app=document.querySelector('#app');
const rand = a => a[Math.floor(Math.random() * a.length)];

const familyKeysFor=figure=>Object.keys(FAMILIES).filter(k=>FAMILIES[k].figures.includes(figure)&&(state.schoolClass===3||!FAMILIES[k].strategies.includes('pitagora')));
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function shell(inner,tools=''){const nickname=getNickname();const hello=nickname?`<div class="status" style="margin-top:4px">Ciao, ${escapeHtml(nickname)}!</div>`:'';return `<div class="wrap"><div class="accent-rule"></div><header class="top"><div><h1 class="brand">GE<span>Ø</span></h1><p class="tagline">Dentro il problema</p>${hello}</div>${tools}</header>${inner}</div>`}
function ensureHomeLayoutStyle(){if(document.querySelector('#geo-home-layout-style'))return;const style=document.createElement('style');style.id='geo-home-layout-style';style.textContent=`
.home-top-grid{display:grid;grid-template-columns:minmax(280px,1fr) minmax(420px,.95fr);gap:42px;align-items:start;margin-bottom:28px}.home-brand-block{padding-top:2px}.home-brand-block .brand{margin:0}.home-brand-block .tagline{margin-top:4px}.home-login{border:1px solid #d7e2ec;border-radius:22px;padding:14px 18px;background:rgba(255,255,255,.62);box-shadow:0 8px 30px rgba(15,43,86,.035)}.home-login-line{display:block;margin-bottom:8px;line-height:1.22}.home-login-title{display:block;font-weight:800;color:var(--ink,#0b2a59);font-size:1.05rem;margin-bottom:3px}.home-login-copy{display:block;color:#64748b;font-size:.96rem}.home-login-controls{display:flex;gap:10px;align-items:center}.home-name-input{flex:1;min-width:180px;padding:10px 14px;border:1px solid #cbd5e1;border-radius:14px;background:rgba(255,255,255,.82);font:inherit;color:inherit;outline:none}.home-name-input:focus{border-color:#8eb9d9;box-shadow:0 0 0 3px rgba(142,185,217,.16)}.home-saved-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.home-saved-name{font-weight:800;color:var(--ink,#0b2a59);font-size:1.08rem}.home-saved-note{margin-top:2px;color:#64748b;font-size:.92rem}.home-saved-actions{display:flex;gap:8px;flex-wrap:wrap}.home-middle-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:28px;align-items:center;margin-bottom:14px}.home-middle-row .home-intro{margin:0}.home-tools{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}@media(max-width:820px){.home-top-grid{grid-template-columns:1fr;gap:20px}.home-middle-row{grid-template-columns:1fr;gap:14px}.home-tools{justify-content:flex-start}}@media(max-width:560px){.home-login{padding:14px 16px}.home-login-controls{align-items:stretch;flex-direction:column}.home-name-input{width:100%;box-sizing:border-box}.home-login-controls button{width:100%}}`;document.head.appendChild(style);}
export function renderHome(){cancelHelpTimer();state.view='home';state.openHelp=null;ensureHomeLayoutStyle();const nickname=getNickname();const cards=FIGURES.map(([id,label,shape])=>{const available=familyKeysFor(id).length>0;return `<button class="home-card" data-figure="${id}" ${available?'':'disabled'} title="${available?'Scegli '+label:'In arrivo'}"><svg viewBox="0 0 150 110" aria-hidden="true">${shape}</svg><div>${label}</div>${available?'':'<div class="status">in arrivo</div>'}</button>`}).join('');const loginBox=nickname?`<section class="home-login"><div class="home-saved-row"><div><div class="home-saved-name">Ciao, ${escapeHtml(nickname)}!</div><div class="home-saved-note">${isOffline()?'Versione offline':`Gruppo: ${escapeHtml(getGroup())} · Attività registrate`}</div></div><div class="home-saved-actions"><button id="changeName" class="secondary">Cambia nome</button><button id="removeNickname" class="secondary">Esci</button></div></div></section>`:isAuthorized()?`<section class="home-login"><div class="home-login-line"><span class="home-login-title">Chi sei?</span><span class="home-login-copy">${isOffline()?'Inserisci il tuo nome (facoltativo).':`Accesso autorizzato · ${escapeHtml(getGroup())}`}</span></div><div class="home-login-controls"><input id="nickname" class="home-name-input" maxlength="40" autocomplete="off" placeholder="Il tuo nome o nickname"><button id="saveNickname" class="secondary">Salva</button>${isOffline()?'':'<button id="cancelAccess" class="secondary">Esci</button>'}</div></section>`:`<section class="home-login"><div class="home-login-line"><span class="home-login-title">Chi sei?</span><span class="home-login-copy">Per registrare le attività inserisci il codice ricevuto. Puoi anche usare GEØ liberamente senza identificarti.</span></div><div class="home-login-controls"><input id="accessCode" class="home-name-input" type="password" maxlength="120" autocomplete="off" placeholder="Codice di accesso"><button id="verifyAccess" class="secondary">Verifica</button></div><div id="accessFeedback" class="status" role="status" aria-live="polite"></div></section>`;app.innerHTML=`<div class="wrap"><div class="accent-rule"></div><div class="home-top-grid"><div class="home-brand-block"><h1 class="brand">GE<span>Ø</span></h1><p class="tagline">Dentro il problema</p></div>${loginBox}</div><div class="home-middle-row"><p class="home-intro">Scegli una figura. GEØ ti proporrà un problema senza anticiparti quale strategia servirà per risolverlo.</p><div class="home-tools"><button id="form" class="tool-btn">📐 Formulario</button><button id="tables" class="tool-btn">▦ Tavole</button></div></div><div class="backline" style="margin:14px 0 20px"><span class="status">Classe</span><button data-class="2" class="${state.schoolClass===2?'primary':'secondary'}">Seconda</button><button data-class="3" class="${state.schoolClass===3?'primary':'secondary'}">Terza</button></div><section class="figure-grid">${cards}</section></div>`;app.querySelector('#form').onclick=()=>renderFormula('home');app.querySelector('#tables').onclick=()=>renderTables('home');const verify=app.querySelector('#verifyAccess');if(verify){verify.onclick=async()=>{const input=app.querySelector('#accessCode');const feedback=app.querySelector('#accessFeedback');const code=input.value.trim();if(!code){feedback.textContent='Inserisci un codice.';return;}verify.disabled=true;feedback.textContent='Verifica in corso…';try{setAuthorization(await verifyCode(code));renderHome();}catch(err){feedback.textContent=err.message;verify.disabled=false;}};app.querySelector('#accessCode').addEventListener('keydown',e=>{if(e.key==='Enter')verify.click();});}const cancel=app.querySelector('#cancelAccess');if(cancel)cancel.onclick=()=>{clearAuthorization();renderHome();};const save=app.querySelector('#saveNickname');if(save){save.onclick=()=>{const v=app.querySelector('#nickname').value.trim().slice(0,40);saveNickname(v);renderHome();};app.querySelector('#nickname').addEventListener('keydown',e=>{if(e.key==='Enter')save.click();});}const change=app.querySelector('#changeName');if(change)change.onclick=()=>{const current=getNickname();saveNickname('');renderHome();const input=app.querySelector('#nickname');if(input){input.value=current;input.focus();input.select();}};const remove=app.querySelector('#removeNickname');if(remove)remove.onclick=()=>{clearAuthorization();renderHome();};app.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>{state.schoolClass=+b.dataset.class;COMPLEX_USED.length=0;renderHome();});app.querySelectorAll('[data-figure]:not([disabled])').forEach(b=>b.onclick=()=>startFromFigure(b.dataset.figure));}
function startFromFigure(fig){const keys=familyKeysFor(fig);if(!keys.length)return;state.entryFigure=fig;logEvent('ARGOMENTO',{argomento:fig,problema:''});state.family=rand(keys);newInstance();}
function newInstance(){cancelHelpTimer();state.instance=FAMILIES[state.family].generate();state.openHelp=null;state.attemptId=makeId();state.loggedHelps=new Set();logEvent('PROBLEMA');renderProblem();}
function differentProblem(){const keys=familyKeysFor(state.entryFigure),alternatives=keys.filter(k=>k!==state.family);state.family=rand(alternatives.length?alternatives:keys);newInstance();}
function goHome(){cancelHelpTimer();if(state.view==='problem')logEvent('HOME');renderHome();}
function renderProblem(){state.view='problem';const x=state.instance;const label=FIGURES.find(f=>f[0]===state.entryFigure)?.[1]||'';app.innerHTML=shell(`<div class="problem-head"><div><div class="eyebrow">${label}</div><div class="status">Il tipo di strategia resta nascosto: scegli tu come procedere.</div></div><button id="homeTop" class="secondary">← Home</button></div><section class="card"><b>Problema</b><p>${x.debugNew?'<span style="display:inline-block;margin-right:8px;padding:2px 7px;border:1px solid currentColor;border-radius:999px;font-size:.72em;font-weight:700">NUOVO</span> ':''}${x.text}</p></section><section class="grid"><div class="diagram">${x.svg}<div class="note">${state.openHelp===null?(x.notes?.[0]||'Osserva la figura e prova a decidere da dove partire.'):(x.notes?.[x.helps[state.openHelp].scene]||x.helps[state.openHelp].text)}</div></div><div class="helps">${x.helps.map((h,i)=>`<div><button class="help-btn ${state.openHelp===i?'open':''}" data-help="${i}"><span>${i+1} — ${h.title}</span><span class="chev">▾</span></button><div class="help-text ${state.openHelp===i?'':'hidden'}" data-text="${i}">${h.text}</div></div>`).join('')}</div></section><div class="end-actions">${x.noSimilar?'':`<button id="similar" class="primary">Provane uno simile</button>`}<button id="different" class="secondary" ${(familyKeysFor(state.entryFigure).length<2&&!x.noSimilar)?'disabled title="Non ci sono ancora altri tipi di problema per questa figura"':''}>Provane uno diverso</button><button id="home" class="secondary">Torna alla home</button>${isAuthorized()?'<button id="reportIssue" class="secondary">⚑ Segnala un errore</button>':''}</div>`,'<div style="display:flex;gap:8px;flex-wrap:wrap"><button id="form" class="tool-btn">📐 Formulario</button><button id="tables" class="tool-btn">▦ Tavole</button></div>');bindProblem();applyVisual();}
function bindProblem(){const reportButton=app.querySelector('#reportIssue');if(reportButton)reportButton.onclick=openIssueReport;app.querySelector('#form').onclick=()=>{cancelHelpTimer();renderFormula('problem');};app.querySelector('#tables').onclick=()=>{cancelHelpTimer();renderTables('problem');};app.querySelector('#homeTop').onclick=goHome;app.querySelector('#home').onclick=goHome;const similar=app.querySelector('#similar');if(similar)similar.onclick=newInstance;const different=app.querySelector('#different');if(!different.disabled)different.onclick=state.instance.noSimilar?newInstance:differentProblem;app.querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>{const i=+b.dataset.help;cancelHelpTimer();state.openHelp=state.openHelp===i?null:i;renderProblem();if(state.openHelp!==null)startHelpTimer(state.openHelp);});}
// Feedback via Formspree: nessuna modifica ai log e nessun dato identificativo automatico.
const REPORT_ENDPOINT='https://formspree.io/f/xoejwdag';
function openIssueReport(){
  if(!isAuthorized())return;
  if(document.querySelector('#geo-report-overlay'))return;
  const x=state.instance;
  const overlay=document.createElement('div');
  overlay.id='geo-report-overlay';
  overlay.className='geo-report-overlay';
  overlay.innerHTML=`<div class="geo-report-dialog" role="dialog" aria-modal="true" aria-labelledby="geo-report-title">
    <div class="geo-report-heading"><h2 id="geo-report-title">Segnala un errore</h2><button type="button" id="geo-report-close" class="secondary" aria-label="Chiudi">✕</button></div>
    <p>Hai notato un problema nel testo, nel disegno o negli aiuti? Descrivilo qui.</p>
    <form id="geo-report-form">
      <label for="geo-report-type">Che cosa non funziona?</label>
      <select id="geo-report-type" name="tipo" required><option>Testo o dati</option><option>Disegno</option><option>Aiuti</option><option>Altro</option></select>
      <label for="geo-report-description">Descrizione dell'errore</label>
      <textarea id="geo-report-description" name="descrizione" maxlength="2000" minlength="8" rows="5" required placeholder="Che cosa hai osservato? Che cosa ti aspettavi?"></textarea>
      <div class="geo-report-honeypot" aria-hidden="true"><label for="geo-report-website">Lascia vuoto</label><input id="geo-report-website" name="_gotcha" tabindex="-1" autocomplete="off"></div>
      <p class="geo-report-note">Saranno allegati il testo dell'esercizio, la famiglia, la versione dell'app e l'indirizzo della pagina. Non viene allegato il tuo nickname.</p>
      <div id="geo-report-status" role="status" aria-live="polite"></div>
      <div class="geo-report-actions"><button type="button" id="geo-report-cancel" class="secondary">Annulla</button><button type="submit" id="geo-report-submit" class="primary">Invia segnalazione</button></div>
    </form>
  </div>`;
  document.body.appendChild(overlay);
  const close=()=>{document.removeEventListener('keydown',onKey);overlay.remove();};
  const onKey=e=>{if(e.key==='Escape')close();};
  document.addEventListener('keydown',onKey);
  overlay.querySelector('#geo-report-close').onclick=close;
  overlay.querySelector('#geo-report-cancel').onclick=close;
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  overlay.querySelector('#geo-report-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const submit=overlay.querySelector('#geo-report-submit');
    const status=overlay.querySelector('#geo-report-status');
    const last=Number(sessionStorage.getItem('geo-report-last')||0);
    if(Date.now()-last<60000){status.textContent='Attendi un minuto prima di inviare un’altra segnalazione.';return;}
    const form=e.currentTarget;
    const data={tipo:form.elements.tipo.value,descrizione:form.elements.descrizione.value.trim(),
      _gotcha:form.elements._gotcha.value,
      _subject:'GEØ — Segnalazione errore — '+state.family,
      versione:'v0.6',famiglia:state.family,figura:state.entryFigure,
      testo_problema:x.text.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').slice(0,3500),
      pagina:location.href};
    if(data.descrizione.length<8){status.textContent='Descrivi il problema con almeno 8 caratteri.';return;}
    submit.disabled=true;status.textContent='Invio in corso…';
    try{
      const response=await fetch(REPORT_ENDPOINT,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(data)});
      if(!response.ok)throw new Error('Invio non riuscito');
      sessionStorage.setItem('geo-report-last',String(Date.now()));
      const message=document.createElement('p');message.textContent='Segnalazione inviata. Grazie per il contributo!';form.replaceWith(message);
      overlay.querySelector('#geo-report-close').focus();
    }catch(err){status.textContent='Non è stato possibile inviare la segnalazione. Riprova più tardi.';submit.disabled=false;}
  });
  overlay.querySelector('#geo-report-description').focus();
}
function applyVisual(){
  const svg=app.querySelector('.diagram svg');
  if(!svg)return;
  svg.querySelectorAll('.dimmed,.focus-hidden,.geo-highlight,.geo-aux-highlight,.geo-label-highlight,.geo-unit-highlight').forEach(el=>el.classList.remove('dimmed','focus-hidden','geo-highlight','geo-aux-highlight','geo-label-highlight','geo-unit-highlight'));
  svg.querySelectorAll('[data-v]').forEach(g=>g.setAttribute('opacity','0'));
  if(state.openHelp===null)return;
  const step=state.instance.helps[state.openHelp].scene;
  svg.querySelectorAll('[data-v]').forEach(g=>g.setAttribute('opacity',+g.dataset.v<=step?'1':'0'));

  // Scene engine: new families declare only visual states for named SVG objects.
  const scene=state.instance.scenes?.[step];
  if(scene){
    const q=id=>svg.querySelector(`[data-geo="${id}"]`);
    if(scene.keep){
      const keep=new Set(scene.keep);
      svg.querySelectorAll('[data-geo]').forEach(el=>{
        if(keep.has(el.dataset.geo)) return;
        if(el.tagName.toLowerCase()==='text') el.classList.add('focus-hidden');
        else el.classList.add('dimmed');
      });
    }
    (scene.dim||[]).forEach(id=>q(id)?.classList.add('dimmed'));
    (scene.hide||[]).forEach(id=>q(id)?.classList.add('focus-hidden'));
    // Evidenzia la geometria, non il contenitore: stroke e stroke-width su un <g>
    // vengono ereditati anche dai <text> e li trasformano in un falso grassetto.
    const addVisualClass=(id,className)=>{
      const el=q(id);
      if(!el)return;
      if(el.tagName.toLowerCase()==='g'){
        el.querySelectorAll('path,line,rect,polygon,polyline,circle,ellipse').forEach(child=>child.classList.add(className));
      }else if(el.tagName.toLowerCase()==='text'){
        el.classList.add('geo-label-highlight');
      }else{
        el.classList.add(className);
      }
    };
    (scene.highlight||[]).forEach(id=>addVisualClass(id,'geo-highlight'));
    (scene.aux||[]).forEach(id=>addVisualClass(id,'geo-aux-highlight'));
    (scene.unit||[]).forEach(id=>addVisualClass(id,'geo-unit-highlight'));
    (scene.labels||[]).forEach(id=>q(id)?.classList.add('geo-label-highlight'));
  }

}
function renderTables(returnTo){
  state.view='tables';
  const fmtRoot=v=>v.toFixed(4).replace('.',',');
  const row=n=>`<tr${n===Number(app.querySelector?.('#tableSearch')?.value)?' class="table-focus"':''}><td>${n}</td><td>${n*n}</td><td>${n*n*n}</td><td>${fmtRoot(Math.sqrt(n))}</td><td>${fmtRoot(Math.cbrt(n))}</td></tr>`;
  const tableCss=`<style>
    .numeric-sheet{max-width:820px;margin:26px auto 10px;background:#fffefa;border:1px solid #ddd8ca;box-shadow:0 10px 30px rgba(55,45,30,.12),0 1px 2px rgba(55,45,30,.12);padding:34px 38px 42px;position:relative}
    .numeric-sheet:before{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(70,60,40,.012) 0,rgba(70,60,40,.012) 1px,transparent 1px,transparent 4px)}
    .numeric-title{font-family:Georgia,'Times New Roman',serif;text-align:center;font-size:1.35rem;margin:0 0 20px;color:#252525}
    .numeric-search{display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:24px;position:relative}
    .numeric-search label{font-weight:700}.numeric-search input{width:100px;text-align:center;font-size:1.05rem;padding:8px 10px;border:1px solid #999;background:white;border-radius:3px}
    .numeric-search button{padding:8px 14px}.numeric-error{text-align:center;min-height:24px;color:#a33;font-size:.92rem;margin:-12px 0 10px}
    .numeric-table{width:100%;border-collapse:collapse;table-layout:fixed;position:relative;font-family:Georgia,'Times New Roman',serif;font-variant-numeric:tabular-nums;background:rgba(255,255,255,.78)}
    .numeric-table th{background:#35b8dc;color:#102c36;font-style:italic;font-size:1.35rem;padding:12px 8px;border-left:2px solid rgba(20,80,100,.35);border-right:2px solid rgba(20,80,100,.35);border-bottom:2px solid #308ca5}
    .numeric-table td{text-align:right;padding:10px 16px;font-size:1.13rem;border-left:1px solid #b9b9b9;border-right:1px solid #b9b9b9;color:#292929}
    .numeric-table th:first-child,.numeric-table td:first-child{text-align:center;width:12%;font-weight:700}.numeric-table tr.table-focus td{background:#fff1a8;font-weight:700}.numeric-table tbody tr:first-child td{padding-top:15px}.numeric-table tbody tr:last-child td{padding-bottom:15px}
    .numeric-caption{text-align:center;margin-top:18px;font-size:.86rem;color:#666;position:relative}
    @media(max-width:650px){.numeric-sheet{padding:22px 12px 28px}.numeric-table th{font-size:1.05rem;padding:9px 3px}.numeric-table td{font-size:.88rem;padding:9px 5px}}
  </style>`;
  app.innerHTML=shell(`${tableCss}<div class="backline"><button id="back" class="secondary">← ${returnTo==='home'?'Torna alla home':'Torna al problema'}</button><span class="status">Tavole numeriche da 1 a 1000</span></div><section class="numeric-sheet"><h2 class="numeric-title">Tavole numeriche</h2><div class="numeric-search"><label for="tableSearch">Cerca n</label><input id="tableSearch" type="number" min="1" max="1000" step="1" inputmode="numeric" value="50"><button id="tableGo" class="primary">Cerca</button></div><div id="tableError" class="numeric-error"></div><table class="numeric-table" aria-label="Tavole numeriche"><thead><tr><th>n</th><th>n²</th><th>n³</th><th>√n</th><th>∛n</th></tr></thead><tbody id="tableBody"></tbody></table><div class="numeric-caption">Quadrati e cubi esatti · radici approssimate a quattro cifre decimali</div></section>`);
  const input=app.querySelector('#tableSearch'),body=app.querySelector('#tableBody'),error=app.querySelector('#tableError');
  function draw(){
    const n=Number(input.value);
    if(!Number.isInteger(n)||n<1||n>1000){error.textContent='Le tavole numeriche comprendono i numeri interi da 1 a 1000.';return;}
    error.textContent='';
    let start=Math.max(1,Math.min(n-2,996));
    body.innerHTML=Array.from({length:5},(_,i)=>{const k=start+i;return `<tr${k===n?' class="table-focus"':''}><td>${k}</td><td>${k*k}</td><td>${k*k*k}</td><td>${fmtRoot(Math.sqrt(k))}</td><td>${fmtRoot(Math.cbrt(k))}</td></tr>`}).join('');
  }
  app.querySelector('#back').onclick=()=>returnTo==='home'?renderHome():renderProblem();
  app.querySelector('#tableGo').onclick=draw;
  input.onkeydown=e=>{if(e.key==='Enter')draw();};
  input.oninput=()=>{if(input.value==='')error.textContent='';};
  draw();input.select();
}

function renderFormula(returnTo){
  state.view='formula';
  state.formulaReturn=returnTo;

  if(!document.querySelector('#formula-math-style')){
    const style=document.createElement('style');
    style.id='formula-math-style';

    style.textContent=`
      .formula{
        font-family:"Times New Roman","STIX Two Text",serif;
        font-size:1.35rem;
        line-height:1.5;
        font-style:italic;
        padding:14px 10px;
      }

      .formula-row{
        display:flex;
        align-items:center;
        justify-content:center;
        min-height:42px;
        margin:5px 0;
        white-space:nowrap;
      }

      .mfrac{
        display:inline-flex;
        flex-direction:column;
        vertical-align:middle;
        text-align:center;
        line-height:1.1;
        margin:0 .18em;
      }

      .mfrac > span:first-child{
        padding:0 .25em .12em;
        border-bottom:1.5px solid currentColor;
      }

      .mfrac > span:last-child{
        padding:.12em .25em 0;
      }

      .mroot{
        display:inline-flex;
        align-items:flex-start;
        vertical-align:middle;
        margin:0 .08em;
      }

      .mroot .radical{
        font-size:1.2em;
        line-height:1em;
        font-style:normal;
      }

      .mroot .radicand{
        border-top:1.5px solid currentColor;
        padding:0 .16em .05em .1em;
        line-height:1.05;
      }
    `;

    document.head.appendChild(style);
  }

  // QUESTA È LA PARTE CHE MANCAVA
  app.innerHTML=shell(`
    <div class="backline">
      <button id="back" class="secondary">
        ← ${returnTo==='home'?'Torna alla home':'Torna al problema'}
      </button>

      <span class="status">
        Le formule restano nascoste finché non scegli di visualizzarle.
      </span>
    </div>

    <div
      class="formula-grid"
      style="margin-top:16px"
    >
      ${FORMULAS.map((f,i)=>`
        <article class="formula-card">

          <h3>${f[0]}</h3>

          <div class="formula-actions">
            <button data-reveal="d${i}">
              Mostra formule dirette
            </button>

            <button data-reveal="i${i}">
              Mostra formule inverse
            </button>
          </div>

          <div id="d${i}" class="formula hidden">
            ${f[1]}
          </div>

          <div id="i${i}" class="formula hidden">
            ${f[2]}
          </div>

        </article>
      `).join('')}
    </div>
  `);

  app.querySelector('#back').onclick=()=>{
    returnTo==='home'
      ? renderHome()
      : renderProblem();
  };

  app.querySelectorAll('[data-reveal]').forEach(b=>{
    b.onclick=()=>{
      const el=app.querySelector('#'+b.dataset.reveal);
      const hidden=el.classList.toggle('hidden');

      b.textContent=hidden
        ? b.textContent.replace('Nascondi','Mostra')
        : b.textContent.replace('Mostra','Nascondi');
    };
  });
}
