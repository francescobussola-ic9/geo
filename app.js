const rand = a => a[Math.floor(Math.random()*a.length)];
const gcd=(a,b)=>b?gcd(b,a%b):a;

const FAMILIES={
  perimeterDiff:{
    figures:['rettangolo'], strategies:['perimetro','differenza','area'],
    generate(){
      const h=rand([6,7,8,9,10,11,12]), d=rand([3,4,5,6,7]); const b=h+d, P=2*(b+h), A=b*h;
      return {text:`Un rettangolo ha il perimetro di ${P} cm. La base supera l’altezza di ${d} cm. Calcola l’area.`,
      svg:`<svg viewBox="0 0 520 330" aria-label="Rettangolo"><rect x="90" y="80" width="340" height="190" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="305" text-anchor="middle">b ?</text><text x="48" y="180">h ?</text><g data-v="1" opacity="0"><path class="aux" d="M90 55 H430" fill="none" stroke-width="5"/><text class="label-aux" x="260" y="40" text-anchor="middle">b + h = ${P/2} cm</text></g><g data-v="2" opacity="0"><rect x="95" y="125" width="290" height="34" fill="none" class="unit" stroke-width="4"/><rect x="95" y="192" width="205" height="34" fill="none" class="unit" stroke-width="4"/><rect x="300" y="192" width="85" height="34" fill="none" class="focus" stroke-width="4"/><text class="label-focus" x="342" y="216" text-anchor="middle">${d}</text></g><g data-v="3" opacity="0"><text class="label-aux" x="260" y="42" text-anchor="middle">${P/2} − ${d} = ${2*h} → ${2*h} : 2 = ${h}</text><text class="label-focus" x="260" y="67" text-anchor="middle">b = ${b} cm · h = ${h} cm</text></g></svg>`,
      helps:[['Da dove posso iniziare?','Una base e un’altezza insieme formano il semiperimetro.',1],['Come uso la differenza? ',`La base ha un pezzo in più di ${d} cm. Rappresenta i due lati con due barre.`,2],['Come trovo i lati?',`Togli ${d} dal semiperimetro e dividi ciò che resta in due parti uguali.`,3],['Mostrami la soluzione',`h = ${h} cm, b = ${b} cm; A = ${b} × ${h} = ${A} cm².`,3]]};
    }
  },
  areaRatio:{
    figures:['rettangolo'], strategies:['area','rapporto','UF','UQ'],
    generate(){
      const [m,n]=rand([[2,3],[3,4],[3,5],[4,5]]), u=rand([2,3,4,5]); const b=m*u,h=n*u,A=b*h,UQ=m*n,uqa=u*u;
      return {text:`Un rettangolo ha area ${A} cm². La base è i ${m}/${n} dell’altezza. Calcola le dimensioni.`,
      svg:`<svg viewBox="0 0 520 330" aria-label="Rettangolo suddiviso in unità frazionarie"><rect x="135" y="45" width="220" height="240" fill="none" stroke="currentColor" stroke-width="5"/><g data-v="1" opacity="0"><text class="label-unit" x="245" y="315" text-anchor="middle">${m} UF</text><text class="label-unit" x="78" y="165">${n} UF</text></g><g data-v="2" opacity="0">${Array.from({length:m-1},(_,i)=>`<line class="unit" x1="${135+220*(i+1)/m}" y1="45" x2="${135+220*(i+1)/m}" y2="285" stroke-width="3"/>`).join('')}${Array.from({length:n-1},(_,i)=>`<line class="unit" x1="135" y1="${45+240*(i+1)/n}" x2="355" y2="${45+240*(i+1)/n}" stroke-width="3"/>`).join('')}<text class="label-unit" x="425" y="155" text-anchor="middle">${UQ} UQ</text><text x="425" y="182" text-anchor="middle">= ${A} cm²</text></g><g data-v="3" opacity="0"><text class="label-focus" x="260" y="24" text-anchor="middle">1 UQ = ${uqa} cm² → 1 UF = √${uqa} = ${u} cm</text></g></svg>`,
      helps:[['Come rappresento il rapporto?',`La base vale ${m} UF e l’altezza ${n} UF.`,1],['Come uso l’area?',`Dividi il rettangolo secondo le UF: ottieni ${UQ} UQ.`,2],['Come torno alle lunghezze?',`1 UQ vale ${A} : ${UQ} = ${uqa} cm². Il lato di una UQ misura √${uqa} = ${u} cm.`,3],['Mostrami la soluzione',`1 UF = ${u} cm; base = ${b} cm, altezza = ${h} cm.`,3]]};
    }
  },
  trapezoid:{
    figures:['trapezio'], strategies:['differenza_basi','proiezione','pitagora','area'],
    generate(){
      const [h,p,l]=rand([[3,4,5],[5,12,13],[6,8,10]]);
      const small=rand([8,10,12,14]), big=small+2*p, A=(big+small)*h/2;
      const s=Math.min(360/big,160/h), cx=260, yB=265, yT=yB-h*s;
      const xL=cx-big*s/2, xR=cx+big*s/2, xTL=xL+p*s, xTR=xR-p*s, mark=14;
      // Label positions are derived from geometry, not fixed offsets.
      const legOffset=30;
      const leftMidX=(xL+xTL)/2, leftMidY=(yB+yT)/2;
      const rightMidX=(xTR+xR)/2, rightMidY=(yT+yB)/2;
      const leftLabelX=leftMidX-(h/l)*legOffset, leftLabelY=leftMidY-(p/l)*legOffset;
      const rightLabelX=rightMidX+(h/l)*legOffset, rightLabelY=rightMidY-(p/l)*legOffset;
      return {text:`Un trapezio isoscele ha le basi di ${big} cm e ${small} cm e i lati obliqui di ${l} cm. Calcola l’area.`,
      notes:[
        'Osserva la figura e prova a decidere da dove partire.',
        'Per calcolare l’area serve l’altezza: costruiamola.',
        `Confronta le basi: ${big} − ${small} = ${2*p} cm.`,
        `I due segmenti laterali sono uguali: ciascuno misura ${p} cm.`,
        `Concentrati sul triangolo evidenziato: conosci ${p} cm e ${l} cm, mentre h è incognita.`,
        `L’altezza misura ${h} cm. Ora possiamo tornare all’intero trapezio e calcolare l’area.`
      ],
      svg:`<svg viewBox="0 0 520 360" aria-label="Trapezio isoscele in proporzione con i dati del problema">
        <g class="geo-base">
          <line data-geo="left-leg" x1="${xL}" y1="${yB}" x2="${xTL}" y2="${yT}"/>
          <line data-geo="top-base" x1="${xTL}" y1="${yT}" x2="${xTR}" y2="${yT}"/>
          <line data-geo="right-leg" x1="${xTR}" y1="${yT}" x2="${xR}" y2="${yB}"/>
          <line data-geo="left-projection" x1="${xL}" y1="${yB}" x2="${xTL}" y2="${yB}"/>
          <line data-geo="middle-base" x1="${xTL}" y1="${yB}" x2="${xTR}" y2="${yB}"/>
          <line data-geo="right-projection" x1="${xTR}" y1="${yB}" x2="${xR}" y2="${yB}"/>
        </g>
        <text data-geo="big-label" x="${cx}" y="310" text-anchor="middle">${big} cm</text>
        <text data-geo="small-label" x="${cx}" y="${yT-18}" text-anchor="middle">${small} cm</text>
        <text data-geo="left-leg-label" x="${leftLabelX}" y="${leftLabelY}" text-anchor="middle">${l} cm</text>
        <text data-geo="right-leg-label" x="${rightLabelX}" y="${rightLabelY}" text-anchor="middle">${l} cm</text>

        <g data-v="1" opacity="0">
          <line data-geo="left-height" class="aux" x1="${xTL}" y1="${yT}" x2="${xTL}" y2="${yB}" stroke-width="4" stroke-dasharray="8 6"/>
          <line data-geo="right-height" class="aux" x1="${xTR}" y1="${yT}" x2="${xTR}" y2="${yB}" stroke-width="4" stroke-dasharray="8 6"/>
          <path data-geo="left-right-angle" class="aux" d="M${xTL} ${yB-mark} H${xTL+mark} V${yB}" fill="none" stroke-width="3"/>
          <path data-geo="right-right-angle" class="aux" d="M${xTR} ${yB-mark} H${xTR-mark} V${yB}" fill="none" stroke-width="3"/>
          <text data-geo="height-label" class="label-aux" x="${xTL+18}" y="${(yB+yT)/2}">h ?</text>
        </g>
        <g data-v="2" opacity="0">
          <text data-geo="difference-label" class="label-focus" x="${cx}" y="344" text-anchor="middle">${big} − ${small} = ${2*p} cm</text>
        </g>
        <g data-v="3" opacity="0">
          <text data-geo="left-projection-label" class="label-focus" x="${(xL+xTL)/2}" y="${yB+26}" text-anchor="middle">${p} cm</text>
          <text data-geo="right-projection-label" class="label-focus" x="${(xTR+xR)/2}" y="${yB+26}" text-anchor="middle">${p} cm</text>
        </g>
        <g data-v="5" opacity="0">
          <text data-geo="height-value" class="label-aux" x="${xTL+18}" y="${(yB+yT)/2}">${h} cm</text>
        </g>
      </svg>`,
      helps:[
        ['Da dove posso iniziare?','Per calcolare l’area manca l’altezza: tracciala.',1],
        ['Come uso le due basi?',`La parte della base maggiore che resta fuori dalla base minore misura ${big} − ${small} = ${2*p} cm.`,2],
        ['Come trovo il cateto?',`Essendo il trapezio isoscele, i due segmenti laterali sono uguali: ${2*p} : 2 = ${p} cm.`,3],
        ['Sono ancora bloccato/a',`Concentrati sul triangolo rettangolo a sinistra: ipotenusa ${l} cm, un cateto ${p} cm e l’altro cateto è h.`,4],
        ['Mostrami la soluzione',`h = √(${l}² − ${p}²) = ${h} cm; A = (${big} + ${small}) × ${h} : 2 = ${A} cm².`,5]
      ]};
    }
  }
};

const FIGURES=[
 ['triangolo','Triangoli','<path d="M25 82 L75 18 L125 82 Z"/>'],
 ['rettangolo','Rettangoli','<rect x="25" y="27" width="100" height="58"/>'],
 ['trapezio','Trapezi','<path d="M22 84 L128 84 L105 25 L45 25 Z"/>'],
 ['rombo','Rombi','<path d="M75 14 L130 55 L75 96 L20 55 Z"/>'],
 ['parallelogramma','Parallelogrammi','<path d="M38 25 L130 25 L112 85 L20 85 Z"/>'],
 ['composta','Figure composte','<path d="M20 24 H92 V48 H130 V92 H58 V68 H20 Z"/>']
];
const FORMULAS=[['Triangolo','A = b × h : 2; P = a + b + c','b = 2A : h; h = 2A : b'],['Rettangolo','A = b × h; P = 2(b + h)','b = A : h; h = A : b'],['Parallelogramma','A = b × h','b = A : h; h = A : b'],['Trapezio','A = (B + b) × h : 2','h = 2A : (B + b); B = 2A : h − b; b = 2A : h − B'],['Rombo','A = D × d : 2; P = 4l','D = 2A : d; d = 2A : D; l = P : 4'],['Quadrato','A = l²; P = 4l','l = √A; l = P : 4'],['Pitagora','i² = c₁² + c₂²','i = √(c₁² + c₂²); c₁ = √(i² − c₂²); c₂ = √(i² − c₁²)']];

const app=document.querySelector('#app');
const state={view:'home',entryFigure:null,family:null,instance:null,openHelp:null,formulaReturn:'problem'};
const familyKeysFor=figure=>Object.keys(FAMILIES).filter(k=>FAMILIES[k].figures.includes(figure));
function shell(inner,tools=''){return `<div class="wrap"><div class="accent-rule"></div><header class="top"><div><h1 class="brand">GE<span>Ø</span></h1><p class="tagline">Geometria, un pezzo alla volta.</p></div>${tools}</header>${inner}</div>`}
function renderHome(){state.view='home';state.openHelp=null;const cards=FIGURES.map(([id,label,shape])=>{const available=familyKeysFor(id).length>0;return `<button class="home-card" data-figure="${id}" ${available?'':'disabled'} title="${available?'Scegli '+label:'In arrivo'}"><svg viewBox="0 0 150 110" aria-hidden="true">${shape}</svg><div>${label}</div>${available?'':'<div class="status">in arrivo</div>'}</button>`}).join('');app.innerHTML=shell(`<p class="home-intro">Scegli una figura. GEØ ti proporrà un problema senza anticiparti quale strategia servirà per risolverlo.</p><section class="figure-grid">${cards}</section>`,'<button id="form" class="tool-btn">📐 Formulario</button>');app.querySelector('#form').onclick=()=>renderFormula('home');app.querySelectorAll('[data-figure]:not([disabled])').forEach(b=>b.onclick=()=>startFromFigure(b.dataset.figure));}
function startFromFigure(fig){const keys=familyKeysFor(fig);if(!keys.length)return;state.entryFigure=fig;state.family=rand(keys);newInstance();}
function newInstance(){state.instance=FAMILIES[state.family].generate();state.openHelp=null;renderProblem();}
function differentProblem(){const keys=familyKeysFor(state.entryFigure);const alternatives=keys.filter(k=>k!==state.family);state.family=rand(alternatives.length?alternatives:keys);newInstance();}
function renderProblem(){state.view='problem';const x=state.instance;const label=FIGURES.find(f=>f[0]===state.entryFigure)?.[1]||'';app.innerHTML=shell(`<div class="problem-head"><div><div class="eyebrow">${label}</div><div class="status">Il tipo di strategia resta nascosto: scegli tu come procedere.</div></div><button id="homeTop" class="secondary">← Home</button></div><section class="card"><b>Problema</b><p>${x.text}</p></section><section class="grid"><div class="diagram">${x.svg}<div class="note">${state.openHelp===null ? (x.notes?.[0]||'Osserva la figura e prova a decidere da dove partire.') : (x.notes?.[x.helps[state.openHelp][2]]||x.helps[state.openHelp][1])}</div></div><div class="helps">${x.helps.map((h,i)=>`<div><button class="help-btn ${state.openHelp===i?'open':''}" data-help="${i}"><span>${i+1} · ${h[0]}</span><span class="chev">▾</span></button><div class="help-text ${state.openHelp===i?'':'hidden'}" data-text="${i}">${h[1]}</div></div>`).join('')}</div></section><div class="end-actions"><button id="similar" class="primary">Provane uno simile</button><button id="different" class="secondary" ${familyKeysFor(state.entryFigure).length < 2 ? 'disabled title="Non ci sono ancora altri tipi di problema per questa figura"' : ''}>Provane uno diverso</button><button id="home" class="secondary">Torna alla home</button></div>`,'<button id="form" class="tool-btn">📐 Formulario</button>');bindProblem();applyVisual();}
function bindProblem(){app.querySelector('#form').onclick=()=>renderFormula('problem');app.querySelector('#homeTop').onclick=renderHome;app.querySelector('#home').onclick=renderHome;app.querySelector('#similar').onclick=newInstance;const different=app.querySelector('#different'); if(!different.disabled) different.onclick=differentProblem;app.querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>{const i=+b.dataset.help;state.openHelp=state.openHelp===i?null:i;renderProblem();});}
function applyVisual(){
  const svg=app.querySelector('.diagram svg');
  if(!svg)return;
  svg.querySelectorAll('.dimmed,.focus-hidden,.geo-highlight,.geo-aux-highlight,.geo-label-highlight').forEach(el=>el.classList.remove('dimmed','focus-hidden','geo-highlight','geo-aux-highlight','geo-label-highlight'));
  svg.querySelectorAll('[data-v]').forEach(g=>g.setAttribute('opacity','0'));
  if(state.openHelp===null)return;
  const step=state.instance.helps[state.openHelp][2];
  svg.querySelectorAll('[data-v]').forEach(g=>g.setAttribute('opacity',+g.dataset.v<=step?'1':'0'));
  if(state.family!=='trapezoid')return;

  // Ogni segmento geometrico esiste una sola volta. Il focus cambia solo il suo stato visivo.
  if(step===2){
    ['left-projection','right-projection'].forEach(id=>svg.querySelector(`[data-geo="${id}"]`)?.classList.add('geo-highlight'));
  }
  if(step===3){
    ['left-projection','right-projection'].forEach(id=>svg.querySelector(`[data-geo="${id}"]`)?.classList.add('geo-highlight'));
  }
  if(step===4){
    const keep=new Set(['left-leg','left-projection','left-height','left-right-angle','height-label','left-leg-label','left-projection-label']);
    svg.querySelectorAll('[data-geo]').forEach(el=>{
      if(keep.has(el.dataset.geo)) return;
      // During focus, irrelevant labels disappear completely; geometry remains faint
      // so the student can still see where the triangle comes from.
      if(el.tagName.toLowerCase()==='text') el.classList.add('focus-hidden');
      else el.classList.add('dimmed');
    });
    ['left-leg','left-projection'].forEach(id=>svg.querySelector(`[data-geo="${id}"]`)?.classList.add('geo-highlight'));
    ['left-leg-label','left-projection-label'].forEach(id=>svg.querySelector(`[data-geo="${id}"]`)?.classList.add('geo-label-highlight'));
    svg.querySelector('[data-geo="left-height"]')?.classList.add('geo-aux-highlight');
  }
  if(step===5){
    // Alla soluzione torniamo alla figura intera: niente focus, altezza nota.
    const q=svg.querySelector('[data-geo="height-label"]'); if(q) q.classList.add('dimmed');
  }
}
function renderFormula(returnTo){state.view='formula';state.formulaReturn=returnTo;app.innerHTML=shell(`<div class="backline"><button id="back" class="secondary">← ${returnTo==='home'?'Torna alla home':'Torna al problema'}</button><span class="status">Le formule restano nascoste finché non scegli di visualizzarle.</span></div><div class="formula-grid" style="margin-top:16px">${FORMULAS.map((f,i)=>`<article class="formula-card"><h3>${f[0]}</h3><div class="formula-actions"><button data-reveal="d${i}">Mostra formule dirette</button><button data-reveal="i${i}">Mostra formule inverse</button></div><div id="d${i}" class="formula hidden">${f[1]}</div><div id="i${i}" class="formula hidden">${f[2]}</div></article>`).join('')}</div>`);app.querySelector('#back').onclick=()=>returnTo==='home'?renderHome():renderProblem();app.querySelectorAll('[data-reveal]').forEach(b=>b.onclick=()=>{const el=app.querySelector('#'+b.dataset.reveal),hidden=el.classList.toggle('hidden');b.textContent=hidden?b.textContent.replace('Nascondi','Mostra'):b.textContent.replace('Mostra','Nascondi')});}
renderHome();
