import { state } from '../../core/state.js';
const rand = a => a[Math.floor(Math.random()*a.length)];

export const COMPLEX_USED=[];
function linkedShapePath(type,x,y,w,h){
  if(type==='rettangolo'||type==='quadrato') return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;
  if(type==='rombo') return `<path d="M${x+w/2} ${y} L${x+w} ${y+h/2} L${x+w/2} ${y+h} L${x} ${y+h/2} Z"/>`;
  if(type==='triangolo') return `<path d="M${x+w/2} ${y} L${x+w} ${y+h} L${x} ${y+h} Z"/>`;
  if(type==='triangoloR') return `<path d="M${x} ${y} L${x} ${y+h} L${x+w} ${y+h} Z"/>`;
  if(type==='trapezio') return `<path d="M${x+w*.23} ${y} L${x+w*.77} ${y} L${x+w} ${y+h} L${x} ${y+h} Z"/>`;
  if(type==='trapezioR') return `<path d="M${x} ${y} L${x+w*.65} ${y} L${x+w} ${y+h} L${x} ${y+h} Z"/>`;
  if(type==='parallelogramma') return `<path d="M${x+w*.22} ${y} L${x+w} ${y} L${x+w*.78} ${y+h} L${x} ${y+h} Z"/>`;
  return '';
}
function linkedShape(type,x,y,w,h,labels=[]){
  const shape=linkedShapePath(type,x,y,w,h);
  // Le etichette seguono la geometria, come nelle famiglie storiche: niente pile automatiche.
  const text=(value,tx,ty,anchor='middle',extra='')=>`<text class="linked-label ${extra}" x="${tx}" y="${ty}" text-anchor="${anchor}">${value}</text>`;
  const out=[];
  const addGeneric=(value,i)=>out.push(text(value,x+w/2,y+h+27+i*25));
  labels.forEach((raw,i)=>{
    const value=String(raw);
    // Basi di trapezi: se sono dichiarate insieme, separale e legale alle due basi.
    if((type==='trapezio'||type==='trapezioR') && /B\s*=/.test(value) && /b\s*=/.test(value) && value.includes(',')){
      const parts=value.split(',').map(v=>v.trim());
      const big=parts.find(v=>/^B\s*=/.test(v));
      const small=parts.find(v=>/^b\s*=/.test(v));
      if(small) out.push(text(small,x+w/2,y-13));
      if(big) out.push(text(big,x+w/2,y+h+27));
      return;
    }
    // Singole basi: base maggiore sotto, base minore sopra.
    if((type==='trapezio'||type==='trapezioR') && /^B\s*=/.test(value)){out.push(text(value,x+w/2,y+h+27));return;}
    if((type==='trapezio'||type==='trapezioR') && /^b\s*=/.test(value)){out.push(text(value,x+w/2,y-13));return;}
    // Altezza dei trapezi/rettangoli a sinistra della figura.
    if(/^h\s*=/.test(value) && (type==='trapezio'||type==='trapezioR'||type==='rettangolo')){out.push(text(value,x-12,y+h/2+6,'end'));return;}
    // Lato obliquo di trapezio: vicino al fianco destro.
    if(/^l\s*=/.test(value) && (type==='trapezio'||type==='trapezioR')){out.push(text(value,x+w+12,y+h/2+6,'start'));return;}
    // Triangoli: base sotto, altezza a sinistra, cateti sui rispettivi lati.
    if(type==='triangolo' && /^b\s*=/.test(value)){out.push(text(value,x+w/2,y+h+27));return;}
    if(type==='triangolo' && /^h\s*=/.test(value)){out.push(text(value,x+w/2+18,y+h/2,'start'));return;}
    if(type==='triangoloR' && /^c[₁1]\s*=/.test(value)){out.push(text(value,x-10,y+h/2+6,'end'));return;}
    if(type==='triangoloR' && /^c[₂2]\s*=/.test(value)){out.push(text(value,x+w/2,y+h+27));return;}
    // Quadrato: lato sotto.
    if(type==='quadrato' && /^l/.test(value)){out.push(text(value,x+w/2,y+h+27));return;}
    // Rombo: lato a destra; diagonale nota sotto. Le relazioni globali restano sotto, ben separate.
    if(type==='rombo' && /^l\s*=/.test(value)){out.push(text(value,x+w+10,y+h/2+6,'start'));return;}
    if(type==='rombo' && /^[dD]\s*=/.test(value)){out.push(text(value,x+w/2,y+h+27));return;}
    // Rettangoli: dati dimensionali semplici legati ai lati.
    if(type==='rettangolo' && /^b\s*=/.test(value) && !/[+−-]/.test(value)){out.push(text(value,x+w/2,y+h+27));return;}
    // Le relazioni (somma/differenza/rapporto/area/perimetro) sono dati globali: scheda ordinata sotto la figura.
    addGeneric(value,i);
  });
  return shape+out.join('');
}
function linkedBridgeVisual(p,leftBox,rightBox,step){
  const [lx,ly,lw,lh]=leftBox,[rx,ry,rw,rh]=rightBox;
  if(p.bridge==='stessa area'){
    return `<g data-v="${step}" class="linked-equal-area" aria-hidden="true">${linkedShapePath(p.a,lx,ly,lw,lh)}${linkedShapePath(p.b,rx,ry,rw,rh)}</g>`;
  }
  if(p.bridge==='stesso perimetro'){
    return `<g data-v="${step}" class="linked-equal-perimeter" aria-hidden="true">${linkedShapePath(p.a,lx,ly,lw,lh)}${linkedShapePath(p.b,rx,ry,rw,rh)}</g>`;
  }
  if(p.bridge==='lato = ipotenusa'){
    // Triangolo rettangolo: ipotenusa; rombo: un lato corrispondente.
    return `<g data-v="${step}" class="linked-correspondence" aria-hidden="true"><line x1="${lx}" y1="${ly}" x2="${lx+lw}" y2="${ly+lh}"/><line x1="${rx+rw/2}" y1="${ry}" x2="${rx+rw}" y2="${ry+rh/2}"/></g>`;
  }
  if(p.bridge==='ipotenusa = diagonale'){
    // Rettangolo: diagonale; triangolo rettangolo: ipotenusa.
    return `<g data-v="${step}" class="linked-correspondence" aria-hidden="true"><line x1="${lx}" y1="${ly+lh}" x2="${lx+lw}" y2="${ly}"/><line x1="${rx}" y1="${ry}" x2="${rx+rw}" y2="${ry+rh}"/></g>`;
  }
  return '';
}
function linkedSvg(p){
  const leftBox=[45,82,155,115],rightBox=[320,82,155,115];
  const left=linkedShape(p.a,...leftBox,p.aLabels||[]), right=linkedShape(p.b,...rightBox,p.bLabels||[]);
  const bridgeStep=p.leftSteps+1;
  const bridgeVisual=linkedBridgeVisual(p,leftBox,rightBox,bridgeStep);
  const areaVisual=p.areaFocus?`<g data-v="1" aria-hidden="true">${linkedShapePath(p.a,...leftBox).replace('/>',' fill="#fff2b8" stroke="none"/>')}</g>`:'';
  const splitVisual=p.splitRectangle?`<g data-v="${bridgeStep}" aria-hidden="true"><line x1="${rightBox[0]+rightBox[2]/2}" y1="${rightBox[1]}" x2="${rightBox[0]+rightBox[2]/2}" y2="${rightBox[1]+rightBox[3]}" stroke="#46a6dc" stroke-width="3" stroke-dasharray="7 6"/><text x="${rightBox[0]+rightBox[2]/4}" y="${rightBox[1]+rightBox[3]/2}" text-anchor="middle" fill="#46a6dc">h × h</text><text x="${rightBox[0]+3*rightBox[2]/4}" y="${rightBox[1]+rightBox[3]/2}" text-anchor="middle" fill="#46a6dc">h × h</text></g>`:'';
  const forcedSecond=p.forceSecondOutline?`<g fill="none" stroke="currentColor" stroke-width="4">${linkedShapePath(p.b,...rightBox)}</g>`:'';
  return `<svg viewBox="0 0 520 390" aria-label="Due figure collegate dai dati del problema">
    <g data-geo="first" class="geo-base linked-figure">${left}</g>
    ${areaVisual}
    <g data-geo="bridge"><path class="linked-arrow" d="M215 140 H300"/><path class="linked-arrowhead" d="M292 132 L304 140 L292 148"/></g>
    <text data-geo="bridge-label" class="label-unit linked-bridge-label" x="260" y="122" text-anchor="middle">${p.bridge}</text>
    <g data-geo="second" class="geo-base linked-figure">${right}</g>
    ${forcedSecond}
    ${bridgeVisual}
    ${splitVisual}
    <text class="linked-name" x="122" y="58" text-anchor="middle">${p.aName}</text><text class="linked-name" x="397" y="58" text-anchor="middle">${p.bName}</text>
  </svg>`;
}
function linkedProblem(p){
  const helps=p.helps.map((h,i)=>({title:h.title,text:h.text,scene:i+1}));
  const scenes={};
  helps.forEach((h,i)=>{const step=i+1; if(step<=p.leftSteps) scenes[step]=p.areaFocus?{dim:['second']}:{highlight:['first'],dim:['second']}; else if(step===p.leftSteps+1) scenes[step]={labels:['bridge-label']}; else scenes[step]={dim:['first']};});
  return {debugNew:!!p.debugNew,text:p.text,notes:['Ci sono due figure: cerca prima quale informazione deve passare dalla prima alla seconda.',...p.stages],svg:linkedSvg(p),helps,scenes,noSimilar:true};
}
const COMPLEX_PROBLEMS=[
{a:'rettangolo',b:'rombo',aName:'Rettangolo',bName:'Rombo',bridge:'stesso perimetro',aLabels:['h = 26 cm','b = h + 9 cm'],bLabels:['d = 28 cm'],leftSteps:2,text:'Un rettangolo ha l’altezza di 26 cm e la base supera l’altezza di 9 cm. Un rombo è isoperimetrico al rettangolo e una sua diagonale misura 28 cm. Determina l’area del rombo.',stages:['Trova prima la base del rettangolo.','Calcola il suo perimetro: sarà il dato-ponte.','Trasferisci quel perimetro al rombo.','Dal perimetro ricava il lato del rombo.','Usa metà diagonali e Pitagora.','Con le due diagonali calcola l’area.'],helps:[
        {title:'Da quale figura conviene partire?', text:'Nel rettangolo conosci h = 26 cm e sai che la base è 9 cm più lunga.'},
        {title:'Quale dato deve passare alla seconda figura?', text:'Trova b = 26 + 9 = 35 cm, poi P = 2 × (35 + 26) = 122 cm.'},
        {title:'Che cosa significa isoperimetrico?', text:'Il rombo ha lo stesso perimetro: 122 cm.'},
        {title:'Che cosa puoi ricavare ora nel rombo?', text:'Il lato vale 122 : 4 = 30,5 cm.'},
        {title:'Come entra in gioco la diagonale?', text:'Le diagonali del rombo si dimezzano e sono perpendicolari: con lato 30,5 e semidiagonale 14 puoi usare Pitagora per trovare metà dell’altra diagonale.'},
        {title:'Mostrami la soluzione', text:'D/2 = √(30,5² − 14²) ≈ 27,10 cm; D ≈ 54,19 cm; A = 28 × 54,19 : 2 ≈ 758,7 cm².'}
      ]},
{a:'triangolo',b:'quadrato',aName:'Triangolo isoscele',bName:'Quadrato',bridge:'stesso perimetro',aLabels:['b = 24 cm','h = 16 cm'],bLabels:['l ?'],leftSteps:2,text:'Un triangolo isoscele ha la base di 24 cm e l’altezza di 16 cm. Determina l’area di un quadrato isoperimetrico al triangolo.',stages:['L’altezza divide la base a metà.','Trova il lato obliquo e poi il perimetro.','Trasferisci il perimetro al quadrato.','Trova il lato del quadrato.','Calcola l’area.'],helps:[
        {title:'Che cosa manca nel triangolo?', text:'Per conoscerne il perimetro servono i lati obliqui. L’altezza divide la base 24 cm in due parti da 12 cm.'},
        {title:'Come trovi il lato obliquo?', text:'Usa Pitagora con 12 e 16: l = 20 cm. Quindi P = 24 + 20 + 20 = 64 cm.'},
        {title:'Che cosa passa al quadrato?', text:'Isoperimetrico significa stesso perimetro: anche il quadrato ha P = 64 cm.'},
        {title:'Ora che cosa puoi trovare?', text:'Il lato del quadrato è 64 : 4 = 16 cm.'},
        {title:'Mostrami la soluzione', text:'A = 16² = 256 cm².'}
      ]},
{a:'trapezio',b:'rettangolo',aName:'Trapezio isoscele',bName:'Rettangolo',bridge:'stessa area',aLabels:['B = 26, b = 14','l = 10 cm'],bLabels:['b = 15 cm'],leftSteps:2,text:'Un trapezio isoscele ha le basi di 26 cm e 14 cm e i lati obliqui di 10 cm. Un rettangolo equivalente al trapezio ha la base di 15 cm. Determina il perimetro del rettangolo.',stages:['Trova la proiezione laterale del trapezio.','Con Pitagora ricava l’altezza e l’area.','Trasferisci l’area al rettangolo.','Ricava l’altezza del rettangolo.','Calcola il perimetro.'],helps:[
        {title:'Come puoi trovare l’altezza del trapezio?', text:'La differenza delle basi è 12 cm: in un trapezio isoscele si divide in due proiezioni da 6 cm.'},
        {title:'Quale dato ottieni dal trapezio?', text:'h = √(10² − 6²) = 8 cm; A = (26 + 14) × 8 : 2 = 160 cm².'},
        {title:'Che cosa significa equivalente?', text:'Il rettangolo ha la stessa area: 160 cm².'},
        {title:'Come trovi la dimensione mancante?', text:'h = A : b = 160 : 15 ≈ 10,67 cm.'},
        {title:'Mostrami la soluzione', text:'P = 2 × (15 + 10,67) ≈ 51,33 cm.'}
      ]},
{areaFocus:true,splitRectangle:true,a:'rombo',b:'rettangolo',aName:'Rombo',bName:'Rettangolo',bridge:'stessa area',aLabels:['D + d = 42','D − d = 18'],bLabels:['b = 2h'],leftSteps:2,text:'Le diagonali di un rombo hanno somma 42 cm e differenza 18 cm. Un rettangolo equivalente al rombo ha la base doppia dell’altezza. Determina il perimetro del rettangolo.',stages:['Ricava le due diagonali.','Calcola l’area del rombo.','Trasferisci l’area al rettangolo.','Dividi l’area tra i due quadrati e ricava h.','Trova il perimetro.'],helps:[
        {title:'Come ricavi le diagonali?', text:'Usa somma e differenza: D = (42 + 18) : 2 = 30 cm; d = (42 − 18) : 2 = 12 cm.'},
        {title:'Quale dato ottieni dal rombo?', text:'A = 30 × 12 : 2 = 180 cm².'},
        {title:'Che cosa passa al rettangolo?', text:'Essendo equivalente, anche il rettangolo ha area 180 cm².'},
        {title:'Come usi il rapporto tra le dimensioni?', text:'Il rettangolo è formato da due quadrati uguali: ciascuno ha area 180 : 2 = 90 cm². Con la formula inversa dell’area del quadrato, h = √90 ≈ 9,49 cm.'},
        {title:'Mostrami la soluzione', text:'P = 2(b + h) = 6√90 ≈ 56,92 cm.'}
      ]},
{a:'triangoloR',b:'rettangolo',aName:'Triangolo rettangolo',bName:'Rettangolo',bridge:'stessa area',aLabels:['c = 15 cm','i = 25 cm'],bLabels:['h = 10 cm'],leftSteps:2,text:'In un triangolo rettangolo un cateto misura 15 cm e l’ipotenusa 25 cm. Un rettangolo equivalente al triangolo ha l’altezza di 10 cm. Determina la sua diagonale.',stages:['Trova il secondo cateto.','Calcola l’area del triangolo.','Trasferisci l’area al rettangolo.','Trova la base del rettangolo.','Usa Pitagora sulla diagonale.'],helps:[
        {title:'Che cosa manca per l’area del triangolo?', text:'Serve il secondo cateto: puoi ricavarlo con Pitagora.'},
        {title:'Quale area ottieni?', text:'c₂ = √(25² − 15²) = 20 cm; A = 15 × 20 : 2 = 150 cm².'},
        {title:'Che cosa passa al rettangolo?', text:'Il rettangolo equivalente ha area 150 cm².'},
        {title:'Come trovi la base?', text:'b = 150 : 10 = 15 cm.'},
        {title:'Mostrami la soluzione', text:'d = √(15² + 10²) = √325 ≈ 18,03 cm.'}
      ]},
{a:'rettangolo',b:'triangolo',aName:'Rettangolo',bName:'Triangolo isoscele',bridge:'stesso perimetro',aLabels:['b = 3/2 h','P = 50 cm'],bLabels:['b = 15 cm'],leftSteps:2,text:'La base di un rettangolo è i 3/2 dell’altezza e il perimetro è 50 cm. Un triangolo isoscele ha lo stesso perimetro del rettangolo e la base misura 15 cm. Determina l’altezza e l’area del triangolo.',stages:['Usa il semiperimetro e il rapporto.','Ricava le dimensioni del rettangolo.','Trasferisci il perimetro al triangolo.','Trova i lati obliqui.','Usa Pitagora per l’altezza.','Calcola l’area.'],helps:[
        {title:'Come usi il rapporto nel rettangolo?', text:'Il semiperimetro è 25 cm. Rappresenta b = 3 UF e h = 2 UF: in tutto 5 UF.'},
        {title:'Quanto vale una UF?', text:'25 : 5 = 5 cm; quindi b = 15 cm e h = 10 cm. Il perimetro resta 50 cm.'},
        {title:'Che cosa passa al triangolo?', text:'Il triangolo ha lo stesso perimetro: 50 cm.'},
        {title:'Come trovi i lati obliqui?', text:'Tolti i 15 cm della base restano 35 cm, divisi tra due lati uguali: l = 17,5 cm.'},
        {title:'Come trovi l’altezza?', text:'Metà base è 7,5 cm: h = √(17,5² − 7,5²) = √250 ≈ 15,81 cm.'},
        {title:'Mostrami la soluzione', text:'A = 15 × 15,81 : 2 ≈ 118,59 cm².'}
      ]},
{a:'trapezioR',b:'quadrato',aName:'Trapezio rettangolo',bName:'Quadrato',bridge:'stessa area',aLabels:['B = 25, b = 16','l = 15 cm'],bLabels:['l ?'],leftSteps:2,text:'Un trapezio rettangolo ha le basi di 25 cm e 16 cm e il lato obliquo di 15 cm. Determina il perimetro di un quadrato equivalente al trapezio.',stages:['La differenza delle basi è una proiezione.','Trova l’altezza e l’area del trapezio.','Trasferisci l’area al quadrato.','Ricava il lato con una radice.','Calcola il perimetro.'],helps:[
        {title:'Come trovi l’altezza del trapezio?', text:'La differenza tra le basi è 25 − 16 = 9 cm: è il cateto orizzontale del triangolo laterale.'},
        {title:'Quale area ottieni?', text:'h = √(15² − 9²) = 12 cm; A = (25 + 16) × 12 : 2 = 246 cm².'},
        {title:'Che cosa passa al quadrato?', text:'Il quadrato equivalente ha area 246 cm².'},
        {title:'Come trovi il lato?', text:'l = √246 ≈ 15,68 cm.'},
        {title:'Mostrami la soluzione', text:'P = 4√246 ≈ 62,74 cm.'}
      ]},
{a:'quadrato',b:'triangoloR',aName:'Quadrato',bName:'Triangolo rettangolo',bridge:'stessa area',aLabels:['d = 20 cm'],bLabels:['c₁ = 16 cm'],leftSteps:2,text:'Un quadrato ha la diagonale di 20 cm. Un triangolo rettangolo equivalente al quadrato ha un cateto di 16 cm. Determina il perimetro del triangolo.',stages:['Usa la diagonale per trovare il lato.','Calcola l’area del quadrato.','Trasferisci l’area al triangolo.','Trova il secondo cateto.','Trova l’ipotenusa e il perimetro.'],helps:[
        {title:'Come ricavi il lato del quadrato?', text:'La diagonale divide il quadrato in due triangoli rettangoli isosceli: l² + l² = 20².'},
        {title:'Quale area ottieni?', text:'2l² = 400, quindi l² = 200: l’area del quadrato è proprio 200 cm².'},
        {title:'Che cosa passa al triangolo?', text:'Il triangolo equivalente ha area 200 cm².'},
        {title:'Come trovi l’altro cateto?', text:'200 = 16 × c₂ : 2, quindi c₂ = 25 cm.'},
        {title:'Mostrami la soluzione', text:'i = √(16² + 25²) = √881 ≈ 29,68 cm; P ≈ 16 + 25 + 29,68 = 70,68 cm.'}
      ]},
{a:'rombo',b:'quadrato',aName:'Rombo',bName:'Quadrato',bridge:'stesso perimetro',aLabels:['D = 30 cm','d = 16 cm'],bLabels:['l ?'],leftSteps:2,text:'Un rombo ha le diagonali di 30 cm e 16 cm. Determina l’area di un quadrato isoperimetrico al rombo.',stages:['Dimezza le diagonali del rombo.','Trova il lato e il perimetro.','Trasferisci il perimetro al quadrato.','Trova il lato del quadrato.','Calcola l’area.'],helps:[
        {title:'Come trovi il lato del rombo?', text:'Le semidiagonali misurano 15 cm e 8 cm e formano con il lato un triangolo rettangolo.'},
        {title:'Quale perimetro ottieni?', text:'l = √(15² + 8²) = 17 cm; P = 4 × 17 = 68 cm.'},
        {title:'Che cosa passa al quadrato?', text:'Il quadrato isoperimetrico ha P = 68 cm.'},
        {title:'Come trovi il suo lato?', text:'68 : 4 = 17 cm.'},
        {title:'Mostrami la soluzione', text:'A = 17² = 289 cm².'}
      ]},
{a:'triangolo',b:'rettangolo',aName:'Triangolo isoscele',bName:'Rettangolo',bridge:'stessa area',aLabels:['P = 64 cm','b = 24 cm'],bLabels:['h = 12 cm'],leftSteps:2,text:'Un triangolo isoscele ha il perimetro di 64 cm e la base di 24 cm. Un rettangolo equivalente al triangolo ha l’altezza di 12 cm. Determina il perimetro del rettangolo.',stages:['Trova i lati obliqui del triangolo.','Ricava altezza e area.','Trasferisci l’area al rettangolo.','Trova la base.','Calcola il perimetro.'],helps:[
        {title:'Come trovi i lati uguali?', text:'64 − 24 = 40 cm; i due lati obliqui misurano 20 cm ciascuno.'},
        {title:'Quale area ottieni?', text:'Metà base è 12 cm; h = √(20² − 12²) = 16 cm; A = 24 × 16 : 2 = 192 cm².'},
        {title:'Che cosa passa al rettangolo?', text:'Il rettangolo equivalente ha area 192 cm².'},
        {title:'Come trovi la base?', text:'b = 192 : 12 = 16 cm.'},
        {title:'Mostrami la soluzione', text:'P = 2 × (16 + 12) = 56 cm.'}
      ]},
{a:'rettangolo',b:'rombo',aName:'Rettangolo',bName:'Rombo',bridge:'stessa area',aLabels:['b + h = 34','b − h = 8'],bLabels:['D = 30 cm'],leftSteps:2,text:'La somma delle dimensioni di un rettangolo è 34 cm e la loro differenza è 8 cm. Un rombo equivalente al rettangolo ha una diagonale di 30 cm. Determina il perimetro del rombo.',stages:['Usa somma e differenza.','Calcola l’area del rettangolo.','Trasferisci l’area al rombo.','Trova la seconda diagonale.','Trova il lato con Pitagora.','Calcola il perimetro.'],helps:[
        {title:'Come trovi le dimensioni?', text:'b = (34 + 8) : 2 = 21 cm; h = (34 − 8) : 2 = 13 cm.'},
        {title:'Quale area ottieni?', text:'A = 21 × 13 = 273 cm².'},
        {title:'Che cosa passa al rombo?', text:'Il rombo equivalente ha area 273 cm².'},
        {title:'Come trovi l’altra diagonale?', text:'273 = 30 × d : 2, quindi d = 18,2 cm.'},
        {title:'Come trovi il lato?', text:'Usa le semidiagonali 15 e 9,1: l = √(15² + 9,1²) ≈ 17,54 cm.'},
        {title:'Mostrami la soluzione', text:'P ≈ 4 × 17,54 = 70,18 cm.'}
      ]},
{a:'trapezio',b:'quadrato',aName:'Trapezio isoscele',bName:'Quadrato',bridge:'stesso perimetro',aLabels:['B = 30, b = 18','h = 8 cm'],bLabels:['l ?'],leftSteps:2,text:'Un trapezio isoscele ha le basi di 30 cm e 18 cm e l’altezza di 8 cm. Determina l’area di un quadrato isoperimetrico al trapezio.',stages:['Trova la proiezione laterale.','Ricava lato obliquo e perimetro.','Trasferisci il perimetro al quadrato.','Trova il lato.','Calcola l’area.'],helps:[
        {title:'Come trovi il lato obliquo?', text:'La differenza delle basi è 12 cm, quindi ogni proiezione laterale è 6 cm.'},
        {title:'Quale perimetro ottieni?', text:'l = √(8² + 6²) = 10 cm; P = 30 + 18 + 20 = 68 cm.'},
        {title:'Che cosa passa al quadrato?', text:'Il quadrato isoperimetrico ha P = 68 cm.'},
        {title:'Come trovi il lato?', text:'68 : 4 = 17 cm.'},
        {title:'Mostrami la soluzione', text:'A = 17² = 289 cm².'}
      ]},
{a:'triangoloR',b:'rombo',aName:'Triangolo rettangolo',bName:'Rombo',bridge:'lato = ipotenusa',aLabels:['c₁ = 20','c₂ = 21'],bLabels:['D = 40 cm'],leftSteps:1,text:'Un triangolo rettangolo ha i cateti di 20 cm e 21 cm. Il lato di un rombo è congruente all’ipotenusa del triangolo. Sapendo che una diagonale del rombo misura 40 cm, determina la sua area.',stages:['Trova l’ipotenusa del triangolo.','Trasferiscila come lato del rombo.','Usa lato e semidiagonale.','Trova l’altra diagonale.','Calcola l’area.'],helps:[
        {title:'Quale misura serve dalla prima figura?', text:'i = √(20² + 21²) = 29 cm.'},
        {title:'Come viene usata nel rombo?', text:'Il lato del rombo è congruente all’ipotenusa: l = 29 cm.'},
        {title:'Che triangolo rettangolo trovi nel rombo?', text:'Metà della diagonale nota è 20 cm; il lato 29 cm è l’ipotenusa.'},
        {title:'Come trovi l’altra diagonale?', text:'d/2 = √(29² − 20²) = 21 cm, quindi d = 42 cm.'},
        {title:'Mostrami la soluzione', text:'A = 40 × 42 : 2 = 840 cm².'}
      ]},
{a:'rombo',b:'trapezio',aName:'Rombo',bName:'Trapezio isoscele',bridge:'stessa area',aLabels:['l = 13 cm','d = 10 cm'],bLabels:['b = 18, B = 30'],leftSteps:2,text:'Un rombo ha il lato di 13 cm e una diagonale di 10 cm. Un trapezio isoscele equivalente al rombo ha le basi di 18 cm e 30 cm. Determina il perimetro del trapezio.',stages:['Usa lato e semidiagonale.','Trova l’altra diagonale e l’area.','Trasferisci l’area al trapezio.','Ricava l’altezza.','Trova il lato obliquo.','Calcola il perimetro.'],helps:[
        {title:'Come trovi l’altra diagonale del rombo?', text:'Metà della diagonale nota è 5 cm; con ipotenusa 13, l’altra semidiagonale vale √(13² − 5²) = 12 cm.'},
        {title:'Quale area ottieni?', text:'L’altra diagonale è 24 cm; A = 10 × 24 : 2 = 120 cm².'},
        {title:'Che cosa passa al trapezio?', text:'Il trapezio equivalente ha area 120 cm².'},
        {title:'Come trovi la sua altezza?', text:'120 = (18 + 30) × h : 2, quindi h = 5 cm.'},
        {title:'Come trovi il lato obliquo?', text:'La proiezione è (30 − 18) : 2 = 6 cm; l = √(5² + 6²) = √61 ≈ 7,81 cm.'},
        {title:'Mostrami la soluzione', text:'P = 18 + 30 + 2√61 ≈ 63,62 cm.'}
      ]},
{a:'rettangolo',b:'triangoloR',aName:'Rettangolo',bName:'Triangolo rettangolo',bridge:'ipotenusa = diagonale',aLabels:['A = 300 cm²','b = h + 5'],bLabels:['c = 7 cm'],leftSteps:2,text:'Un rettangolo ha area 300 cm² e la base supera l’altezza di 5 cm. L’ipotenusa di un triangolo rettangolo è congruente alla diagonale del rettangolo e uno dei cateti misura 7 cm. Determina l’area del triangolo.',stages:['Trova le dimensioni del rettangolo.','Calcola la diagonale.','Trasferiscila come ipotenusa.','Trova il secondo cateto.','Calcola l’area.'],helps:[
        {title:'Come trovi le dimensioni del rettangolo?', text:'Cerchi due numeri con prodotto 300 e differenza 5: 20 cm e 15 cm.'},
        {title:'Quale misura devi trasferire?', text:'La diagonale è √(20² + 15²) = 25 cm.'},
        {title:'Come viene usata nel triangolo?', text:'L’ipotenusa del triangolo è congruente alla diagonale: i = 25 cm.'},
        {title:'Come trovi il cateto mancante?', text:'c₂ = √(25² − 7²) = 24 cm.'},
        {title:'Mostrami la soluzione', text:'A = 7 × 24 : 2 = 84 cm².'}
      ]},
{a:'quadrato',b:'trapezioR',aName:'Quadrato',bName:'Trapezio rettangolo',bridge:'stessa area',aLabels:['P = 64 cm'],bLabels:['b = 12, B = 20'],leftSteps:2,text:'Un quadrato ha il perimetro di 64 cm. Un trapezio rettangolo equivalente al quadrato ha le basi di 12 cm e 20 cm. La differenza tra le basi si trova dalla parte del lato obliquo. Determina il perimetro del trapezio.',stages:['Trova lato e area del quadrato.','Ottieni il dato-ponte.','Trasferisci l’area al trapezio.','Ricava l’altezza.','Usa la differenza delle basi per il lato obliquo.','Calcola il perimetro.'],helps:[
        {title:'Che cosa ricavi dal perimetro del quadrato?', text:'l = 64 : 4 = 16 cm.'},
        {title:'Quale area ottieni?', text:'A = 16² = 256 cm².'},
        {title:'Che cosa passa al trapezio?', text:'Il trapezio equivalente ha area 256 cm².'},
        {title:'Come trovi l’altezza?', text:'256 = (12 + 20) × h : 2, quindi h = 16 cm.'},
        {title:'Come trovi il lato obliquo?', text:'La differenza delle basi è 8 cm ed è la proiezione laterale: l = √(16² + 8²) = √320 ≈ 17,89 cm.'},
        {title:'Mostrami la soluzione', text:'P = 12 + 20 + 16 + 17,89 ≈ 65,89 cm.'}
      ]},
{a:'triangolo',b:'rombo',aName:'Triangolo isoscele',bName:'Rombo',bridge:'stesso perimetro',aLabels:['h = 12 cm','b = 10 cm'],bLabels:['d = 12 cm'],leftSteps:2,text:'Un triangolo isoscele ha l’altezza di 12 cm e la base di 10 cm. Un rombo è isoperimetrico al triangolo. Sapendo che la diagonale minore del rombo misura 12 cm, determina la sua area.',stages:['Trova il lato obliquo del triangolo.','Calcola il perimetro.','Trasferisci il perimetro al rombo.','Ricava il lato del rombo.','Trova l’altra diagonale.','Calcola l’area.'],helps:[
        {title:'Come trovi il lato del triangolo?', text:'Metà base è 5 cm: l = √(12² + 5²) = 13 cm.'},
        {title:'Quale perimetro ottieni?', text:'P = 10 + 13 + 13 = 36 cm.'},
        {title:'Che cosa passa al rombo?', text:'Il rombo isoperimetrico ha P = 36 cm.'},
        {title:'Come trovi il lato del rombo?', text:'l = 36 : 4 = 9 cm.'},
        {title:'Come trovi l’altra diagonale?', text:'Metà della diagonale minore è 6 cm; D/2 = √(9² − 6²) = √45, quindi D = 2√45 ≈ 13,42 cm.'},
        {title:'Mostrami la soluzione', text:'A = 12 × 13,42 : 2 ≈ 80,50 cm².'}
      ]},
{a:'trapezio',b:'rettangolo',aName:'Trapezio isoscele',bName:'Rettangolo',bridge:'stesso perimetro',aLabels:['B = 28, b = 16','h = 8 cm'],bLabels:['b = h + 10'],leftSteps:2,text:'Un trapezio isoscele ha le basi di 28 cm e 16 cm e l’altezza di 8 cm. Un rettangolo isoperimetrico al trapezio ha la base che supera l’altezza di 10 cm. Determina l’area del rettangolo.',stages:['Trova il lato obliquo del trapezio.','Calcola il perimetro.','Trasferisci il perimetro al rettangolo.','Usa semiperimetro e differenza.','Trova le dimensioni.','Calcola l’area.'],helps:[
        {title:'Come trovi il lato obliquo?', text:'La differenza delle basi è 12 cm: ogni proiezione è 6 cm. Con h = 8, il lato vale 10 cm.'},
        {title:'Quale perimetro ottieni?', text:'P = 28 + 16 + 10 + 10 = 64 cm.'},
        {title:'Che cosa passa al rettangolo?', text:'Il rettangolo isoperimetrico ha P = 64 cm, quindi semiperimetro 32 cm.'},
        {title:'Come usi la differenza tra base e altezza?', text:'b + h = 32 e b − h = 10.'},
        {title:'Quali sono le dimensioni?', text:'b = (32 + 10) : 2 = 21 cm; h = 11 cm.'},
        {title:'Mostrami la soluzione', text:'A = 21 × 11 = 231 cm².'}
      ]},
{a:'rombo',b:'triangolo',aName:'Rombo',bName:'Triangolo isoscele',bridge:'stessa area',aLabels:['d = 3/4 D','D + d = 42'],bLabels:['b = 21 cm'],leftSteps:2,text:'La diagonale minore di un rombo è i 3/4 della diagonale maggiore e la loro somma è 42 cm. Un triangolo isoscele equivalente al rombo ha la base di 21 cm. Determina il perimetro del triangolo.',stages:['Usa il rapporto 3:4 sulle diagonali.','Calcola l’area del rombo.','Trasferisci l’area al triangolo.','Ricava l’altezza.','Trova il lato obliquo.','Calcola il perimetro.'],helps:[
        {title:'Come trovi le diagonali?', text:'Rappresenta d = 3 UF e D = 4 UF: 7 UF = 42 cm, quindi 1 UF = 6 cm. Le diagonali sono 18 e 24 cm.'},
        {title:'Quale area ottieni?', text:'A = 18 × 24 : 2 = 216 cm².'},
        {title:'Che cosa passa al triangolo?', text:'Il triangolo equivalente ha area 216 cm².'},
        {title:'Come trovi l’altezza?', text:'216 = 21 × h : 2, quindi h = 432 : 21 ≈ 20,57 cm.'},
        {title:'Come trovi il lato obliquo?', text:'Metà base è 10,5 cm: l = √(10,5² + 20,57²) ≈ 23,10 cm.'},
        {title:'Mostrami la soluzione', text:'P ≈ 21 + 2 × 23,10 = 67,19 cm.'}
      ]},
{a:'triangoloR',b:'trapezio',aName:'Triangolo rettangolo',bName:'Trapezio isoscele',bridge:'stessa area',aLabels:['c₁ + c₂ = 42','c₁ − c₂ = 12'],bLabels:['b = 12, B = 30'],leftSteps:2,text:'La somma dei cateti di un triangolo rettangolo è 42 cm e la loro differenza è 12 cm. Un trapezio isoscele equivalente al triangolo ha le basi di 12 cm e 30 cm. Determina il perimetro del trapezio.',stages:['Usa somma e differenza sui cateti.','Calcola l’area del triangolo.','Trasferisci l’area al trapezio.','Ricava l’altezza.','Trova il lato obliquo.','Calcola il perimetro.'],helps:[
        {title:'Come trovi i cateti?', text:'c₁ = (42 + 12) : 2 = 27 cm; c₂ = (42 − 12) : 2 = 15 cm.'},
        {title:'Quale area ottieni?', text:'A = 27 × 15 : 2 = 202,5 cm².'},
        {title:'Che cosa passa al trapezio?', text:'Il trapezio equivalente ha area 202,5 cm².'},
        {title:'Come trovi l’altezza?', text:'202,5 = (12 + 30) × h : 2, quindi h = 405 : 42 ≈ 9,64 cm.'},
        {title:'Come trovi il lato obliquo?', text:'Ogni proiezione laterale è (30 − 12) : 2 = 9 cm; l = √(9² + 9,64²) ≈ 13,19 cm.'},
        {title:'Mostrami la soluzione', text:'P ≈ 12 + 30 + 2 × 13,19 = 68,38 cm.'}
      ]}
];

// I primi 20 sono i problemi storici: il n. 4 non richiede Pitagora, gli altri sì.
COMPLEX_PROBLEMS.forEach((p,i)=>p.strategies=i===3?['multi_step','figure_collegate']:['multi_step','figure_collegate','pitagora']);

// Nuovi problemi collegati per la classe seconda: nessuno richiede Pitagora.
COMPLEX_PROBLEMS.push(
{debugNew:true,strategies:['multi_step','figure_collegate'],a:'rettangolo',b:'parallelogramma',aName:'Rettangolo',bName:'Parallelogramma',bridge:'stessa area',aLabels:['b = 18 cm','h = 10 cm'],bLabels:['b = 15 cm'],leftSteps:2,text:'Un rettangolo ha base 18 cm e altezza 10 cm. Un parallelogramma equivalente ha la base di 15 cm. Determina l’altezza del parallelogramma.',stages:['Calcola l’area del rettangolo.','Trasferisci l’area al parallelogramma.','Usa la formula inversa dell’area.'],helps:[
        {title:'Da quale figura conviene partire?', text:'Calcola l’area del rettangolo.'},
        {title:'Quale dato ottieni?', text:'A = 18 × 10 = 180 cm².'},
        {title:'Che cosa passa al parallelogramma?', text:'Il parallelogramma equivalente ha area 180 cm².'},
        {title:'Mostrami la soluzione', text:'h = A : b = 180 : 15 = 12 cm.'}
      ]},
{debugNew:true,areaFocus:true,strategies:['multi_step','figure_collegate'],a:'rombo',b:'rettangolo',aName:'Rombo',bName:'Rettangolo',bridge:'stessa area',aLabels:['D = 24 cm','d = 10 cm'],bLabels:['b = 15 cm'],leftSteps:2,text:'Un rombo ha le diagonali di 24 cm e 10 cm. Un rettangolo equivalente ha la base di 15 cm. Determina l’altezza del rettangolo.',stages:['Calcola l’area del rombo.','Trasferisci l’area al rettangolo.','Ricava l’altezza.'],helps:[
        {title:'Quale dato puoi ricavare dal rombo?', text:'Calcola l’area usando le diagonali.'},
        {title:'Quale area ottieni?', text:'A = 24 × 10 : 2 = 120 cm².'},
        {title:'Che cosa passa al rettangolo?', text:'Il rettangolo equivalente ha area 120 cm².'},
        {title:'Mostrami la soluzione', text:'h = 120 : 15 = 8 cm.'}
      ]},
{debugNew:true,areaFocus:true,strategies:['multi_step','figure_collegate'],a:'trapezio',b:'triangolo',aName:'Trapezio',bName:'Triangolo',bridge:'stessa area',aLabels:['B = 20, b = 12','h = 8 cm'],bLabels:['b = 16 cm'],leftSteps:2,text:'Un trapezio ha le basi di 20 cm e 12 cm e l’altezza di 8 cm. Un triangolo equivalente ha la base di 16 cm. Determina l’altezza del triangolo.',stages:['Calcola l’area del trapezio.','Trasferisci l’area al triangolo.','Ricava l’altezza del triangolo.'],helps:[
        {title:'Quale dato puoi ottenere dal trapezio?', text:'Calcola la sua area.'},
        {title:'Quale area ottieni?', text:'A = (20 + 12) × 8 : 2 = 128 cm².'},
        {title:'Che cosa passa al triangolo?', text:'Il triangolo equivalente ha area 128 cm².'},
        {title:'Mostrami la soluzione', text:'h = 2A : b = 256 : 16 = 16 cm.'}
      ]},
{debugNew:true,strategies:['multi_step','figure_collegate'],a:'rettangolo',b:'triangolo',aName:'Rettangolo',bName:'Triangolo isoscele',bridge:'stesso perimetro',aLabels:['b = 14 cm','h = 8 cm'],bLabels:['b = 12 cm'],leftSteps:2,text:'Un rettangolo ha base 14 cm e altezza 8 cm. Un triangolo isoscele è isoperimetrico al rettangolo e ha la base di 12 cm. Determina la misura di ciascun lato obliquo del triangolo.',stages:['Calcola il perimetro del rettangolo.','Trasferisci il perimetro al triangolo.','Togli la base e dividi la parte restante tra i due lati uguali.'],helps:[
        {title:'Quale dato devi ricavare dal rettangolo?', text:'Calcola il suo perimetro.'},
        {title:'Quale perimetro ottieni?', text:'P = 2 × (14 + 8) = 44 cm.'},
        {title:'Che cosa passa al triangolo?', text:'Il triangolo isoperimetrico ha perimetro 44 cm.'},
        {title:'Mostrami la soluzione', text:'Tolti 12 cm della base restano 32 cm: ciascun lato obliquo misura 32 : 2 = 16 cm.'}
      ]},
{debugNew:true,strategies:['multi_step','figure_collegate'],a:'parallelogramma',b:'trapezio',aName:'Parallelogramma',bName:'Trapezio',bridge:'stessa area',aLabels:['b = 18 cm','h = 10 cm'],bLabels:['B = 22, b = 14'],leftSteps:2,text:'Un parallelogramma ha base 18 cm e altezza 10 cm. Un trapezio equivalente ha le basi di 22 cm e 14 cm. Determina l’altezza del trapezio.',stages:['Calcola l’area del parallelogramma.','Trasferisci l’area al trapezio.','Ricava l’altezza.'],helps:[
        {title:'Quale dato puoi ottenere dal parallelogramma?', text:'Calcola la sua area.'},
        {title:'Quale area ottieni?', text:'A = 18 × 10 = 180 cm².'},
        {title:'Che cosa passa al trapezio?', text:'Il trapezio equivalente ha area 180 cm².'},
        {title:'Mostrami la soluzione', text:'h = 2A : (B + b) = 360 : 36 = 10 cm.'}
      ]},
{debugNew:true,forceSecondOutline:true,strategies:['multi_step','figure_collegate'],a:'rombo',b:'parallelogramma',aName:'Rombo',bName:'Parallelogramma',bridge:'stesso perimetro',aLabels:['l = 9 cm'],bLabels:['l = 8 cm'],leftSteps:2,text:'Un rombo ha il lato di 9 cm. Un parallelogramma isoperimetrico ha il lato obliquo di 8 cm. Determina la base del parallelogramma.',stages:['Calcola il perimetro del rombo.','Trasferisci il perimetro al parallelogramma.','Usa il semiperimetro per trovare la base.'],helps:[
        {title:'Quale dato puoi ottenere dal rombo?', text:'Calcola il suo perimetro.'},
        {title:'Quale perimetro ottieni?', text:'P = 4 × 9 = 36 cm.'},
        {title:'Che cosa passa al parallelogramma?', text:'Il parallelogramma ha lo stesso perimetro: 36 cm.'},
        {title:'Mostrami la soluzione', text:'Il semiperimetro è 18 cm: b = 18 − 8 = 10 cm.'}
      ]},
{debugNew:true,strategies:['multi_step','figure_collegate'],a:'triangolo',b:'rettangolo',aName:'Triangolo',bName:'Rettangolo',bridge:'stessa area',aLabels:['b = 18 cm','h = 12 cm'],bLabels:['b = 9 cm'],leftSteps:2,text:'Un triangolo ha base 18 cm e altezza 12 cm. Un rettangolo equivalente ha la base di 9 cm. Determina l’altezza del rettangolo.',stages:['Calcola l’area del triangolo.','Trasferisci l’area al rettangolo.','Ricava l’altezza.'],helps:[
        {title:'Quale dato puoi ottenere dal triangolo?', text:'Calcola la sua area.'},
        {title:'Quale area ottieni?', text:'A = 18 × 12 : 2 = 108 cm².'},
        {title:'Che cosa passa al rettangolo?', text:'Il rettangolo equivalente ha area 108 cm².'},
        {title:'Mostrami la soluzione', text:'h = 108 : 9 = 12 cm.'}
      ]},
{debugNew:true,strategies:['multi_step','figure_collegate'],a:'trapezio',b:'rettangolo',aName:'Trapezio',bName:'Rettangolo',bridge:'stessa area',aLabels:['B = 18, b = 10','h = 6 cm'],bLabels:['b = 7 cm'],leftSteps:2,text:'Un trapezio ha le basi di 18 cm e 10 cm e l’altezza di 6 cm. Un rettangolo equivalente ha la base di 7 cm. Determina il perimetro del rettangolo.',stages:['Calcola l’area del trapezio.','Trasferisci l’area al rettangolo.','Trova l’altezza e poi il perimetro.'],helps:[
        {title:'Quale dato puoi ottenere dal trapezio?', text:'Calcola la sua area.'},
        {title:'Quale area ottieni?', text:'A = (18 + 10) × 6 : 2 = 84 cm².'},
        {title:'Che cosa passa al rettangolo?', text:'Il rettangolo equivalente ha area 84 cm².'},
        {title:'Come trovi l’altezza?', text:'h = 84 : 7 = 12 cm.'},
        {title:'Mostrami la soluzione', text:'P = 2 × (7 + 12) = 38 cm.'}
      ]}
);

// v0.10.4 — scaffolding: un ostacolo cognitivo significativo per hint.
// Ogni vecchio hint resta semanticamente al suo posto; se contiene più calcoli, viene spezzato.
function splitLinkedDetail(text){
  let parts=[String(text)];
  const splitOnce=(arr,re)=>arr.flatMap(x=>{
    const m=x.match(re); if(!m)return [x];
    return [x.slice(0,m.index).trim(),x.slice(m.index+m[0].length).trim()].filter(Boolean);
  });
  parts=splitOnce(parts,/;\s*/);
  // Se dopo un primo risultato ne viene calcolato subito un altro, separalo.
  let again=true;
  while(again){
    again=false;
    for(let i=0;i<parts.length;i++){
      const x=parts[i];
      const m=x.match(/\s+e\s+(?=(?:b|h|l|d|D|c[₁₂12]?|P|A)\s*(?:=|≈))/);
      if(m){parts.splice(i,1,x.slice(0,m.index).trim(),x.slice(m.index+m[0].length).trim());again=true;break;}
    }
  }
  return parts.filter(Boolean);
}
function linkedClauseTitle(clause,fallback){
  const c=String(clause).trim();
  if(/^A\s*=/.test(c)||/area\s*=/.test(c))return 'Quale area ottieni?';
  if(/^P\s*=/.test(c)||/perimetro\s*=/.test(c))return 'Ora puoi trovare il perimetro?';
  if(/^h\s*=/.test(c)||/^h\s*≈/.test(c))return 'Ora puoi trovare l’altezza?';
  if(/^b\s*=/.test(c)||/^b\s*≈/.test(c))return 'E la base?';
  if(/^[dD]\s*=/.test(c))return 'E l’altra diagonale?';
  if(/^l\s*=/.test(c)||/^l\s*≈/.test(c))return 'Ora puoi trovare il lato?';
  if(/^c[₁₂12]?\s*=/.test(c))return 'Ora puoi trovare il cateto?';
  return fallback||'Qual è il passo successivo?';
}
function refineLinkedScaffolding(p){
  const final=p.helps[p.helps.length-1];
  const source=p.helps.slice(0,-1);
  const refined=[];
  let newLeftSteps=p.leftSteps;
  source.forEach((h,oldIndex)=>{
    // Il vecchio hint in posizione leftSteps era quello del ponte.
    if(oldIndex===p.leftSteps)newLeftSteps=refined.length;
    const parts=splitLinkedDetail(h.text);
    parts.forEach((part,j)=>refined.push({title:j===0?h.title:linkedClauseTitle(part,'Qual è il passo successivo?'),text:part}));
  });
  refined.push(final);
  p.helps=refined;
  p.leftSteps=newLeftSteps;
}
COMPLEX_PROBLEMS.forEach(refineLinkedScaffolding);


export const COMPLEX_FAMILIES={ linkedComplex: {figures:['collegate'],strategies:['multi_step','figure_collegate'],generate(){
  const allowed=COMPLEX_PROBLEMS.map((p,i)=>[p,i]).filter(([p])=>state.schoolClass===3||!p.strategies.includes('pitagora')).map(([,i])=>i);
  let pool=allowed.filter(i=>!COMPLEX_USED.includes(i));
  if(!pool.length){COMPLEX_USED.length=0;pool=allowed;}
  const i=rand(pool);COMPLEX_USED.push(i);return linkedProblem(COMPLEX_PROBLEMS[i]);
}} };
