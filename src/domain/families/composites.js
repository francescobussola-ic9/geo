import { pickVariant } from './shared.js';

// Figure composte — disegni proporzionali e aiuti progressivi.
// Le chiavi esportate rimangono invariate per non alterare catalogo e logging.
const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n*100)/100).replace('.', ',');
const sq = n => n*n;
const cartesian = (...sets) => sets.reduce((acc, set) => acc.flatMap(row => set.map(x => [...row,x])), [[]]);
const VARIANTS = {
  rectRect: [[10,6,4,4],[12,7,5,5],[14,8,6,4],[15,9,5,6],[16,10,6,5],[18,10,8,6]],
  squareTri: [[6,4],[8,3],[10,12],[16,6]], // semibase, altezza e lato obliquo formano terne pitagoriche
  rectTri: [[6,8,4],[8,10,3],[8,12,6],[10,14,12],[12,16,5],[16,18,6]],
  squareTrap: [[12,6,4],[16,10,4],[20,12,3]], // semidifferenza, altezza, lato obliquo: terne
  rectTrap: [[10,7,6,4],[12,8,6,4],[14,9,8,3],[16,10,10,4],[18,11,12,4],[20,12,14,4]],
  triTrap: [[6,4,10,4],[8,3,14,3],[8,6,14,4],[10,12,20,12],[12,5,22,4],[16,6,22,3]],
  rectRhomb: [[10,7,6],[10,8,8],[13,8,5],[13,9,12],[15,10,9],[17,10,8]]
};

function model(kind, v) {
  const m={kind,v};
  if(kind==='rectRect'){
    const [w1,h1,w2,h2]=v;
    Object.assign(m,{A1:w1*h1,A2:w2*h2,P:2*(w1+h1+w2+h2-h2),name:'due rettangoli',
      desc:`rettangoli ${w1} × ${h1} cm e ${w2} × ${h2} cm`,join:'I due rettangoli sono affiancati e condividono interamente il lato verticale del rettangolo più piccolo.',base:w2,height:h2});
  } else if(kind==='squareTri'||kind==='rectTri'){
    const [b,z,t]=v,hr=kind==='squareTri'?b:z,ht=kind==='squareTri'?z:t,l=Math.hypot(b/2,ht);
    Object.assign(m,{b,hr,ht,l,A1:b*hr,A2:b*ht/2,P:b+2*hr+2*l,
      name:kind==='squareTri'?'un quadrato e un triangolo isoscele':'un rettangolo e un triangolo isoscele',
      desc:`${kind==='squareTri'?`quadrato di lato ${b}`:`rettangolo ${b} × ${hr}`} cm; triangolo di altezza ${ht} cm${kind==='rectTri'?` e lati obliqui di ${fmt(l)} cm`:''}`,
      join:'Il triangolo è costruito esternamente su un lato della prima figura e ne condivide interamente la base.',base:b,height:ht});
  } else if(kind==='squareTrap'||kind==='rectTrap'){
    const [B,z,t,u]=v,hr=kind==='squareTrap'?B:z,b=kind==='squareTrap'?z:t,ht=kind==='squareTrap'?t:u,l=Math.hypot((B-b)/2,ht);
    Object.assign(m,{B,b,hr,ht,l,A1:B*hr,A2:(B+b)*ht/2,P:B+2*hr+b+2*l,
      name:kind==='squareTrap'?'un quadrato e un trapezio isoscele':'un rettangolo e un trapezio isoscele',
      desc:`${kind==='squareTrap'?`quadrato di lato ${B}`:`rettangolo ${B} × ${hr}`} cm; trapezio con basi ${B} cm e ${b} cm e altezza ${ht} cm`,
      join:'La base maggiore del trapezio coincide interamente con il lato superiore della prima figura.',base:B+b,height:ht});
  } else if(kind==='triTrap'){
    const [bt,ht,B,hr]=v;
    Object.assign(m,{bt,ht,B,hr,A1:bt*ht/2,A2:(B+bt)*hr/2,
      name:'un triangolo isoscele e un trapezio isoscele',desc:`triangolo con base ${bt} cm e altezza ${ht} cm; trapezio con basi ${B} cm e ${bt} cm`,
      join:'La base del triangolo coincide interamente con la base minore del trapezio. Le figure sono da parti opposte del lato comune.',base:B+bt,height:hr});
  } else if(kind==='rectRhomb'){
    const [s,hr,ht]=v;
    Object.assign(m,{s,hr,ht,A1:s*hr,A2:s*ht,name:'un rettangolo e un rombo',
      desc:`rettangolo ${s} × ${hr} cm; rombo di lato ${s} cm`,
      join:'Un lato del rombo coincide con il lato superiore del rettangolo. Le figure sono da parti opposte del lato comune.',base:s,height:ht});
  }
  m.total=m.A1+m.A2;
  return m;
}

function geometry(m){
  const {kind,v}=m;
  let A=[],B=[],share=[],alt=null,foot=null,measure=[];
  const poly=(...pts)=>pts;
  if(kind==='rectRect'){
    const [w1,h1,w2,h2]=v;
    A=poly([0,0],[w1,0],[w1,h1],[0,h1]);
    B=poly([w1,h1-h2],[w1+w2,h1-h2],[w1+w2,h1],[w1,h1]);
    share=[[w1,h1-h2],[w1,h1]];
    measure=[[w1/2,h1+1.5,`${w1} cm`],[-1.3,h1/2,`${h1} cm`],[w1+w2/2,h1+1.5,`${w2} cm`],[w1+w2+1.6,h1-h2/2,`${h2} cm`]];
  } else if(kind==='squareTri'||kind==='rectTri'){
    const {b,hr,ht}=m;
    A=poly([0,ht],[b,ht],[b,ht+hr],[0,ht+hr]);
    B=poly([0,ht],[b/2,0],[b,ht]);share=[[0,ht],[b,ht]];
    alt=[[b/2,0],[b/2,ht]];foot=[b/2,ht];
    measure=[[b/2,ht+hr+1.7,`${b} cm`],[-1.6,ht+hr/2,`${hr} cm`],[b/2+1.5,ht/2,`h = ${fmt(ht)} cm`]];
    if(kind==='rectTri')measure.push([b+2.2,ht/2,`${fmt(m.l)} cm`]);
  } else if(kind==='squareTrap'||kind==='rectTrap'){
    const {B:bigger,b,hr,ht}=m,offset=(bigger-b)/2;
    A=poly([0,ht],[bigger,ht],[bigger,ht+hr],[0,ht+hr]);
    B=poly([0,ht],[offset,0],[offset+b,0],[bigger,ht]);share=[[0,ht],[bigger,ht]];
    alt=[[offset,0],[offset,ht]];foot=[offset,ht];
    measure=[[bigger/2,ht+hr+1.7,`${bigger} cm`],[-1.7,ht+hr/2,`${hr} cm`],[bigger/2,-1.7,`${b} cm`],[offset+1.9,ht/2,`h = ${fmt(ht)} cm`]];
  } else if(kind==='triTrap'){
    const {bt,ht,B:big,hr}=m,offset=(big-bt)/2;
    A=poly([offset,ht],[offset+bt/2,0],[offset+bt,ht]);
    B=poly([offset,ht],[offset+bt,ht],[big,ht+hr],[0,ht+hr]);
    share=[[offset,ht],[offset+bt,ht]];
    alt=[[offset,ht],[offset,ht+hr]];foot=[offset,ht+hr];
    measure=[[offset+bt/2,ht+1.5,`${bt} cm`],[offset+bt/2+1.5,ht/2,`${ht} cm`],[big/2,ht+hr+1.7,`${big} cm`],[offset+1.7,ht+hr/2,`h = ${fmt(hr)} cm`]];
  } else if(kind==='rectRhomb'){
    const {s,hr,ht}=m,shift=Math.sqrt(Math.max(0,s*s-ht*ht));
    A=poly([0,ht],[s,ht],[s,ht+hr],[0,ht+hr]);
    B=poly([0,ht],[shift,0],[s+shift,0],[s,ht]);share=[[0,ht],[s,ht]];
    alt=[[shift,0],[shift,ht]];foot=[shift,ht];
    measure=[[s/2,ht+hr+1.7,`${s} cm`],[-1.7,ht+hr/2,`${hr} cm`],[s+shift/2+1.7,ht/2,`lato ${s} cm`],[shift+1.7,ht/2,`h = ${fmt(ht)} cm`]];
  }
  return {A,B,share,alt,foot,measure};
}

function diagram(m, task, steps){
  const g=geometry(m), all=[...g.A,...g.B],xs=all.map(p=>p[0]),ys=all.map(p=>p[1]);
  const loX=Math.min(...xs),hiX=Math.max(...xs),loY=Math.min(...ys),hiY=Math.max(...ys);
  const scale=Math.min(350/Math.max(1,hiX-loX),215/Math.max(1,hiY-loY));
  const X=x=>260+(x-(loX+hiX)/2)*scale,Y=y=>167+(y-(loY+hiY)/2)*scale;
  const pts=p=>p.map(q=>`${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`).join(' ');
  const line=(a,b,extra='')=>`<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" ${extra}/>`;
  const txt=(x,y,s,cls='')=>`<text x="${x}" y="${y}" text-anchor="middle" class="${cls}">${s}</text>`;
  const unknown=task==='inverse';
  // Posizioniamo le etichette delle altezze solo quando i relativi segmenti sono visibili.
  let labels=g.measure.filter(p=>!p[2].startsWith('h ='))
    .map(([x,y,s])=>txt(Math.max(17,Math.min(503,X(x))),Math.max(19,Math.min(317,Y(y))),s)).join('');
  const hLabel=g.measure.find(p=>p[2].startsWith('h ='));
  const heightLabel=hLabel ? txt( Math.max(48, X(loX)-55), Y(hLabel[1]), unknown ? 'h = ?' : hLabel[2], 'label-aux' ) : '';
  let heightSVG='';
  if(g.alt){
    const [a,b]=g.alt;
    const side=kindIsUp(m.kind)?1:-1;
    const size=7;
    heightSVG=line(a,b,'class="aux" stroke-dasharray="7 5" stroke-width="2.6"');
    // Un angolo retto nel punto di intersezione con la base.
    const fx=X(g.foot[0]),fy=Y(g.foot[1]);
    heightSVG+=`<path d="M${fx} ${fy-side*size} h${size} v${side*size}" fill="none" class="aux" stroke-width="2"/>`+heightLabel;
  }
  const width1=task==='perimeter'?'stroke-width="5"':'stroke-width="3"';
  const shell=`<polygon data-geo="partA" points="${pts(g.A)}" fill="none" stroke="currentColor" ${width1}/><polygon data-geo="partB" points="${pts(g.B)}" fill="none" stroke="currentColor" ${width1}/>`;
  const [a,b]=g.share;
  const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const marker=`${line(a,b,'class="focus-strong" stroke-width="5"')}`;
  const area1=`<polygon points="${pts(g.A)}" class="geo-area-fill" fill="#76a8e6" fill-opacity=".15" stroke="none"/>`;
  const area2=`<polygon points="${pts(g.B)}" class="geo-area-fill" fill="#ebad62" fill-opacity=".18" stroke="none"/>`;
  const [pA,pB]=[g.A,g.B];
  const sceneTexts=steps.map((s,i)=>`<g data-v="${i+1}" opacity="0">${i===0?marker:''}${i===1?heightSVG:''}${i===2&&task!=='perimeter'?area1+area2:''}</g>`).join('');
  // A ogni scena la sua annotazione: l'interfaccia mostra cumulativamente i livelli.
  // Le note sottostanti restano visibili solo alla scena corrente.
  return `<svg viewBox="0 0 520 365" aria-label="Disegno proporzionale di figura composta"><g class="geo-base" stroke-linejoin="round">${shell}</g><g class="geo-labels" fill="currentColor" font-size="15">${labels}</g><g fill="currentColor" class="geo-labels" font-size="15">${sceneTexts}</g></svg>`;
}
function kindIsUp(kind){return kind!=='triTrap';}

function guided(kind, task){
  const m=model(kind,pickVariant(`comp_${kind}_${task}`,VARIANTS[kind]));
  const {A1,A2,total}=m, guides=[];
  const add=(title,text,note)=>guides.push({title,text,note});
  const joined=m.join;
  let text='';
  if(task==='area'){
    text=`Una figura composta è formata da ${m.name}. ${joined} Le misure sono: ${m.desc}. Calcola l’area totale.`;
    add('Cosa riconosco nella figura?', 'Osserva quali figure semplici compongono la sagoma. Quale segmento appartiene a entrambe?', 'Individua il confine comune');
    add('Quali misure mi servono?', 'Per calcolare un’area servono le dimensioni proprie di ciascuna figura. Osserva la base e l’altezza del triangolo, oppure i lati dei rettangoli.', 'Osserva le misure utili');
    add('Come posso procedere?',kind==='rectRect'?'Calcola l’area dei due rettangoli separatamente.':'Calcola l’area del rettangolo e quella del triangolo isoscele separatamente.', 'Considera le due aree');
    add('Posso verificare i calcoli?',kind==='rectRect'?`Le aree parziali sono ${fmt(A1)} cm² e ${fmt(A2)} cm².`:`A₁ = ${fmt(m.b)} × ${fmt(m.hr)} = ${fmt(A1)} cm²; A₂ = (${fmt(m.b)} × ${fmt(m.ht)}) : 2 = ${fmt(A2)} cm².`, 'Confronta i risultati');
    add('Mostrami la soluzione',`Area totale = ${fmt(A1)} + ${fmt(A2)} = ${fmt(total)} cm².`, 'Risultato');
  } else if(task==='perimeter'){
    // Lati obliqui non forniti: il percorso richiede interpretazione del disegno e Pitagora.
    if(kind==='squareTri'){
      text=`Una figura è formata da un quadrato di lato ${m.b} cm e da un triangolo isoscele esterno di altezza ${m.ht} cm, la cui base coincide con un lato del quadrato. Calcola il perimetro esterno della figura. I lati obliqui del triangolo non sono dati.`;
    } else {
      text=`Una figura è formata da un quadrato di lato ${m.B} cm e da un trapezio isoscele esterno di basi ${m.B} cm e ${m.b} cm e altezza ${m.ht} cm. La base maggiore coincide interamente con un lato del quadrato. Calcola il perimetro esterno della figura. I lati obliqui del trapezio non sono dati.`;
    }
    add('Che cosa conta nel contorno?', 'Ripercorri con lo sguardo il bordo esterno della figura. Il segmento in comune è interno o esterno?', 'Evidenzia il lato comune');
    add('Quali segmenti mancano?', 'Per conoscere il contorno completo servono anche i lati obliqui. Come potresti costruire un triangolo rettangolo utile?', 'Osserva le altezze');
    if(kind==='squareTri'){
      add('Che cosa posso ricavare?',`L’altezza del triangolo isoscele divide la base di ${m.b} cm in due parti uguali. Considera una metà della base e l’altezza.`, 'Dividi mentalmente la base');
      add('Quanto misura il lato obliquo?',`Applica Pitagora: l = √[(${fmt(m.b/2)})² + (${fmt(m.ht)})²] = ${fmt(m.l)} cm.`, 'Calcola il lato obliquo');
      add('Mostrami la soluzione',`P = 3 × ${fmt(m.b)} + 2 × ${fmt(m.l)} = ${fmt(m.P)} cm. Il lato condiviso non si conta.`, 'Risultato');
    } else {
      add('Quale tratto orizzontale ottengo?',`In un trapezio isoscele, la differenza delle basi si divide in due parti uguali: (${m.B} − ${m.b}) : 2 = ${fmt((m.B-m.b)/2)} cm.`, 'Ricava la proiezione');
      add('Quanto misura il lato obliquo?',`Applica Pitagora: l = √[${fmt((m.B-m.b)/2)}² + ${m.ht}²] = ${fmt(m.l)} cm.`, 'Calcola il lato obliquo');
      add('Mostrami la soluzione',`P = 3 × ${m.B} + ${m.b} + 2 × ${fmt(m.l)} = ${fmt(m.P)} cm.`, 'Risultato');
    }
  } else {
    text=`L’area totale di una figura formata da ${m.name} è ${fmt(total)} cm². ${joined} La parte nota è ${kind==='triTrap'?`un triangolo di base ${m.bt} cm e altezza ${m.ht} cm`:kind==='rectRhomb'?`un rettangolo ${m.s} × ${m.hr} cm`:`un rettangolo ${m.B} × ${m.hr} cm`}. ${kind==='rectTrap'?`Il trapezio ha basi ${m.B} cm e ${m.b} cm.`:kind==='triTrap'?`Il trapezio ha basi ${m.B} cm e ${m.bt} cm.`:`Il rombo ha lato ${m.s} cm.`} Trova l’altezza della seconda figura.`;
    add('Quale parte devo studiare?', 'Osserva le due parti e individua quella con l’altezza incognita. Qual è il confine condiviso?', 'Distingui le figure');
    add('Dove si trova l’altezza?', 'Osserva il segmento perpendicolare alla base della figura di cui cerchi l’altezza. Non confonderlo con un lato obliquo.', 'Individua l’altezza');
    add('Da quale area posso partire?',`La parte di cui conosci tutte le dimensioni ha area ${kind==='triTrap'?`(${m.bt} × ${m.ht}) : 2`:`${kind==='rectRhomb'?m.s:m.B} × ${m.hr}`}. Calcolala prima di procedere.`, 'Considera la prima area');
    add('Come ricavo l’area che manca?',`Sottrai dall’area totale quella della parte nota: ${fmt(total)} − ${fmt(A1)} = ${fmt(A2)} cm².`, 'Ricava l’area cercata');
    add('Quale relazione uso ora?',kind==='rectRhomb'?`Per il rombo, A = lato × altezza. Qui A = ${fmt(A2)} cm² e lato = ${m.s} cm.`:`Per il trapezio, A = (B + b) × h : 2. Qui A = ${fmt(A2)} cm² e la somma delle basi è ${fmt(m.base)} cm.`, 'Imposta la formula inversa');
    add('Mostrami la soluzione',kind==='rectRhomb'?`h = ${fmt(A2)} : ${m.s} = ${fmt(m.height)} cm.`:`h = (2 × ${fmt(A2)}) : ${fmt(m.base)} = ${fmt(m.height)} cm.`, 'Risultato');
  }
  const steps=guides.map(g=>g.note);
  return {text,svg:diagram(m,task,steps),notes:['Osserva la figura e confrontala con i dati del problema.',...steps],
    helps:guides.map((g,i)=>({title:g.title,text:g.text,scene:i+1})),scenes:{}};
}

function difference(){
  const [W,H,w,h]=pickVariant('compositeDifference',cartesian([12,14,16,18],[9,10,12,14],[4,5,6,7],[3,4,5]).filter(([W,H,w,h])=>w<=W/2&&h<=H/2));
  const A=W*H-w*h,s=Math.min(300/W,210/H),x=100,y=48;
  const right=x+W*s,bottom=y+H*s,notch=x+(W-w)*s,ny=y+h*s;
  const svg=`<svg viewBox="0 0 520 365" aria-label="Rettangolo con un angolo rettangolare rimosso"><path data-geo="shape" d="M${x} ${y} H${notch} V${ny} H${right} V${bottom} H${x} Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><g fill="currentColor" font-size="16"><text x="${x+W*s/2}" y="${bottom+24}" text-anchor="middle">${W} cm</text><text x="${x-12}" y="${y+H*s/2}" text-anchor="end">${H} cm</text><text x="${(notch+right)/2}" y="${ny+18}" text-anchor="middle">${w} cm</text><text x="${notch-8}" y="${(ny+y)/2}" text-anchor="end">${h} cm</text></g><g data-v="1" opacity="0"><rect x="${x}" y="${y}" width="${W*s}" height="${H*s}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="7 5"/></g><g data-v="2" opacity="0"><rect x="${notch}" y="${y}" width="${w*s}" height="${h*s}" fill="#ebad62" fill-opacity=".20" stroke="currentColor" stroke-width="2" stroke-dasharray="5 4"/></g><g data-v="3" opacity="0"><text x="260" y="337" text-anchor="middle" fill="currentColor" font-size="17">Area rimasta = area esterna − area tolta</text></g></svg>`;
  const helps=[
    {title:'Che cosa osservo?',text:'La figura è una parte di un rettangolo più grande. Quale figura completa potresti immaginare?',scene:1},
    {title:'Quale zona non c’è?',text:'Individua il rettangolo mancante nell’angolo. Le sue dimensioni sono indicate nel disegno.',scene:2},
    {title:'Come posso procedere?',text:'Calcola l’area del rettangolo completo e sottrai l’area della parte tolta.',scene:3},
    {title:'Quali aree ottengo?',text:`Area esterna = ${W} × ${H} = ${W*H} cm². Area mancante = ${w} × ${h} = ${w*h} cm².`,scene:3},
    {title:'Mostrami la soluzione',text:`Area rimasta = ${W*H} − ${w*h} = ${A} cm².`,scene:3}
  ];
  return {text:`Da un rettangolo di ${W} × ${H} cm è stato rimosso nell’angolo in alto a destra un rettangolo di ${w} × ${h} cm. Calcola l’area della figura rimasta.`,svg,helps,
    notes:['Osserva la figura: quali parti riesci a riconoscere?','Immagina il rettangolo completo.','Individua la parte mancante.','Confronta le aree.'],scenes:{}};
}

export const COMPOSITE_FAMILIES={
  compositeDifference:{figures:['composta'],strategies:['scomposizione','differenza_aree'],generate:difference},
  composite_sumAreas:{figures:['composta'],strategies:['figure_composte','somma_aree'],generate:()=>guided('rectTri','area')},
  composite_externalPerimeter:{figures:['composta'],strategies:['figure_composte','perimetro_lato_comune'],generate:()=>guided('squareTri','perimeter')},
  composite_inverseArea:{figures:['composta'],strategies:['figure_composte','area_totale_sottrazione_formula_inversa'],generate:()=>guided('rectTrap','inverse')},
  composite_twoRectanglesArea:{figures:['composta'],strategies:['figure_composte','scomposizione_rettangoli'],generate:()=>guided('rectRect','area')},
  composite_trapezoidPerimeter:{figures:['composta'],strategies:['figure_composte','perimetro_trapezio_lato_comune'],generate:()=>guided('squareTrap','perimeter')},
  composite_twoStageInverse:{figures:['composta'],strategies:['figure_composte','area_prima_figura_area_seconda_inversa'],generate:()=>guided('triTrap','inverse')},
  composite_rhombusInverse:{figures:['composta'],strategies:['figure_composte','area_totale_area_rombo_altezza'],generate:()=>guided('rectRhomb','inverse')}
};
