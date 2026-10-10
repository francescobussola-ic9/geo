import { pickVariant } from './shared.js';
const fmt=value=>Number.isInteger(value)?String(value):String(Math.round(value*100)/100).replace('.',',');

const COMPOSITE_VARIANTS={
  rectRect:[[10,6,4,4],[12,7,5,5],[14,8,6,4],[15,9,5,6],[16,10,6,5],[18,10,8,6]],
  squareTri:[[6,4],[8,3],[8,6],[10,12],[12,5],[16,6]],                 // [base condivisa, h triangolo]
  rectTri:[[6,8,4],[8,10,3],[8,12,6],[10,14,12],[12,16,5],[16,18,6]], // [base, h rett, h tri]
  squareTrap:[[10,6,4],[12,6,4],[14,8,3],[16,10,4],[18,8,4],[20,12,4]], // [B condivisa,b,h]
  rectTrap:[[10,7,6,4],[12,8,6,4],[14,9,8,3],[16,10,10,4],[18,11,12,4],[20,12,14,4]],
  triTrap:[[6,4,10,4],[8,3,14,3],[8,6,14,4],[10,12,20,12],[12,5,22,4],[16,6,22,3]], // [b tri,h tri,B trap,h trap]
  rectRhomb:[[10,7,6],[10,8,8],[13,8,5],[13,9,12],[15,10,9],[17,10,8]] // [lato condiviso,h rett,h rombo]
};

function compSvg(kind,d,task='area',stepText=''){
  let shapes='', shared='', labels='';
  const unknown = task==='inverse';
  if(kind==='rectRect'){
    const [w1,h1,w2,h2]=d;
    shapes='<path data-geo="partA" d="M95 270 V105 H270 V270 Z"/><path data-geo="partB" d="M270 270 V165 H425 V270 Z"/>';
    shared='<line data-geo="shared" class="focus-strong" x1="270" y1="270" x2="270" y2="165"/>';
    labels=`<text x="180" y="300" text-anchor="middle">${w1} cm</text><text x="78" y="190" text-anchor="end">${h1} cm</text><text x="348" y="300" text-anchor="middle">${w2} cm</text><text x="438" y="220">${unknown?'h ?':h2+' cm'}</text>`;
  }
  if(kind==='squareTri'||kind==='rectTri'){
    const b=d[0], hr=kind==='squareTri'?b:d[1], ht=kind==='squareTri'?d[1]:d[2], l=Math.hypot(b/2,ht);
    shapes='<rect data-geo="partA" x="145" y="150" width="230" height="145"/><path data-geo="partB" d="M145 150 L260 55 L375 150 Z"/>';
    shared='<line data-geo="shared" class="focus-strong" x1="145" y1="150" x2="375" y2="150"/>';
    labels=`<text x="260" y="320" text-anchor="middle">${b} cm</text><text x="125" y="225" text-anchor="end">${hr} cm</text><text x="225" y="105" text-anchor="end">h ${unknown?'?':ht+' cm'}</text><text x="315" y="103">${fmt(l)} cm</text>`;
  }
  if(kind==='squareTrap'||kind==='rectTrap'){
    const B=d[0], hr=kind==='squareTrap'?B:d[1], b=kind==='squareTrap'?d[1]:d[2], ht=kind==='squareTrap'?d[2]:d[3], l=Math.hypot((B-b)/2,ht);
    shapes='<rect data-geo="partA" x="125" y="175" width="270" height="120"/><path data-geo="partB" d="M125 175 L175 70 H345 L395 175 Z"/>';
    shared='<line data-geo="shared" class="focus-strong" x1="125" y1="175" x2="395" y2="175"/>';
    labels=`<text x="260" y="320" text-anchor="middle">${B} cm</text><text x="105" y="238" text-anchor="end">${hr} cm</text><text x="260" y="55" text-anchor="middle">${b} cm</text><text x="260" y="125" text-anchor="middle">h ${unknown?'?':ht+' cm'}</text><text x="370" y="120">${fmt(l)} cm</text>`;
  }
  if(kind==='triTrap'){
    const [bT,hT,B,hR]=d, lT=Math.hypot(bT/2,hT), lR=Math.hypot((B-bT)/2,hR);
    shapes='<path data-geo="partA" d="M175 115 L260 45 L345 115 Z"/><path data-geo="partB" d="M175 115 L120 285 H400 L345 115 Z"/>';
    shared='<line data-geo="shared" class="focus-strong" x1="175" y1="115" x2="345" y2="115"/>';
    labels=`<text x="260" y="140" text-anchor="middle">${bT} cm</text><text x="220" y="77" text-anchor="end">h ${hT} cm</text><text x="305" y="70">${fmt(lT)} cm</text><text x="260" y="315" text-anchor="middle">${B} cm</text><text x="260" y="215" text-anchor="middle">h ${unknown?'?':hR+' cm'}</text><text x="385" y="205">${fmt(lR)} cm</text>`;
  }
  if(kind==='rectRhomb'){
    const [s,hr,hR]=d;
    shapes='<rect data-geo="partA" x="145" y="175" width="230" height="120"/><path data-geo="partB" d="M145 175 L205 70 H435 L375 175 Z"/>';
    shared='<line data-geo="shared" class="focus-strong" x1="145" y1="175" x2="375" y2="175"/>';
    labels=`<text x="260" y="320" text-anchor="middle">${s} cm</text><text x="125" y="238" text-anchor="end">${hr} cm</text><text x="320" y="55" text-anchor="middle">lato ${s} cm</text><text x="270" y="125">h ${unknown?'?':hR+' cm'}</text>`;
  }
  return `<svg viewBox="0 0 520 365" aria-label="Figura composta da due figure geometriche"><g class="geo-base" fill="none" stroke="currentColor" stroke-width="5">${shapes}</g><g class="geo-labels" fill="currentColor" stroke="none" font-size="18">${labels}</g><g data-v="1" opacity="0">${shared}<text class="label-focus" x="260" y="352" text-anchor="middle">${stepText}</text></g></svg>`;
}
function compositeProblem(kind,task){
  const key=`comp_${kind}_${task}`, v=pickVariant(key,COMPOSITE_VARIANTS[kind]);
  let names='',A1=0,A2=0,P=0,text='',inverse='',invAnswer='',labels='';
  if(kind==='rectRect'){
    const [w1,h1,w2,h2]=v,shared=Math.min(h1,h2); names='rettangolo + rettangolo';A1=w1*h1;A2=w2*h2;P=2*(w1+h1)+2*(w2+h2)-2*shared;labels=`${w1}×${h1} e ${w2}×${h2}`;
    inverse=`L’area totale è ${A1+A2} cm². Il primo rettangolo misura ${w1}×${h1} cm e il secondo ha base ${w2} cm. Trova l’altezza del secondo rettangolo.`;invAnswer=`A₂=${A2} cm²; h₂=${A2}:${w2}=${h2} cm.`;
  }
  if(kind==='squareTri'||kind==='rectTri'){
    const b=v[0],hr=kind==='squareTri'?b:v[1],ht=kind==='squareTri'?v[1]:v[2],l=Math.hypot(b/2,ht);names=kind==='squareTri'?'quadrato + triangolo isoscele':'rettangolo + triangolo isoscele';A1=b*hr;A2=b*ht/2;P=b+2*hr+2*l;labels=`${kind==='squareTri'?`quadrato lato ${b}`:`rettangolo ${b}×${hr}`}; triangolo altezza ${ht}, lati ${fmt(l)}`;
    inverse=`L’area totale è ${A1+A2} cm². ${kind==='squareTri'?`Il quadrato ha lato ${b}`:`Il rettangolo misura ${b}×${hr}`} cm. Trova l’altezza del triangolo isoscele sovrastante.`;invAnswer=`A△=${A2} cm²; h=2A:b=${ht} cm.`;
  }
  if(kind==='squareTrap'||kind==='rectTrap'){
    const B=v[0],hr=kind==='squareTrap'?B:v[1],b=kind==='squareTrap'?v[1]:v[2],ht=kind==='squareTrap'?v[2]:v[3],l=Math.hypot((B-b)/2,ht);names=kind==='squareTrap'?'quadrato + trapezio isoscele':'rettangolo + trapezio isoscele';A1=B*hr;A2=(B+b)*ht/2;P=B+2*hr+b+2*l;labels=`${kind==='squareTrap'?`quadrato lato ${B}`:`rettangolo ${B}×${hr}`}; trapezio basi ${B} e ${b}, altezza ${ht}, lati obliqui ${fmt(l)}`;
    inverse=`L’area totale è ${A1+A2} cm². ${kind==='squareTrap'?`Il quadrato ha lato ${B}`:`Il rettangolo misura ${B}×${hr}`} cm e il trapezio ha basi ${B} cm e ${b} cm. Trova l’altezza del trapezio.`;invAnswer=`A trapezio=${A2} cm²; h=2A:(B+b)=${ht} cm.`;
  }
  if(kind==='triTrap'){
    const [bT,hT,B,hR]=v,lT=Math.hypot(bT/2,hT),lR=Math.hypot((B-bT)/2,hR);names='triangolo isoscele + trapezio isoscele';A1=bT*hT/2;A2=(B+bT)*hR/2;P=B+2*lR+2*lT;labels=`triangolo base ${bT}, altezza ${hT}, lati ${fmt(lT)}; trapezio basi ${B} e ${bT}, altezza ${hR}, lati ${fmt(lR)}`;
    inverse=`L’area totale è ${A1+A2} cm². Il triangolo ha base ${bT} cm e altezza ${hT} cm; il trapezio ha basi ${B} cm e ${bT} cm. Trova l’altezza del trapezio.`;invAnswer=`A trapezio=${A2} cm²; h=2A:(B+b)=${hR} cm.`;
  }
  if(kind==='rectRhomb'){
    const [s,hr,hR]=v;names='rettangolo + rombo';A1=s*hr;A2=s*hR;P=4*s+2*hr;labels=`rettangolo ${s}×${hr}; rombo lato ${s}, altezza ${hR}`;
    inverse=`L’area totale è ${A1+A2} cm². Il rettangolo misura ${s}×${hr} cm. Il rombo condivide con esso un lato di ${s} cm. Trova l’altezza del rombo.`;invAnswer=`A rombo=${A2} cm²; h=A:b=${hR} cm.`;
  }
  const total=A1+A2;
  const joins={
    rectRect:'I due rettangoli sono affiancati e condividono interamente il lato verticale del rettangolo più piccolo.',
    squareTri:'Il triangolo è costruito esternamente su un lato del quadrato e la sua base coincide interamente con quel lato.',
    rectTri:'Il triangolo è costruito esternamente sul lato del rettangolo lungo quanto la sua base e la base del triangolo coincide interamente con quel lato.',
    squareTrap:'Il trapezio è costruito esternamente su un lato del quadrato e la sua base maggiore coincide interamente con quel lato.',
    rectTrap:'Il trapezio è costruito esternamente sul lato del rettangolo lungo quanto la sua base maggiore, che coincide interamente con quel lato.',
    triTrap:'La base del triangolo coincide interamente con la base minore del trapezio; le due figure si trovano da parti opposte del segmento comune.',
    rectRhomb:'Un lato del rombo coincide interamente con il lato del rettangolo della stessa lunghezza; le due figure si trovano da parti opposte del segmento comune.'
  };
  if(task==='area') text=`Una figura composta è formata da ${names}. ${joins[kind]} Le misure sono: ${labels}. Calcola l’area totale.`;
  if(task==='perimeter') text=`Una figura composta è formata da ${names}. ${joins[kind]} Le misure sono: ${labels}. Calcola il perimetro esterno della figura.`;
  if(task==='inverse') text=`${inverse} ${joins[kind]}`;
  const help1=task==='perimeter'?'Il segmento evidenziato è comune alle due figure ed è interno: non appartiene al perimetro.':'Individua le due figure semplici: il segmento evidenziato è quello che condividono.';
  const help2=task==='area'?`Calcola separatamente le aree: A₁=${fmt(A1)} cm² e A₂=${fmt(A2)} cm².`:task==='perimeter'?'Segui soltanto il contorno esterno: il segmento evidenziato non va contato.':`Sottrai dall’area totale l’area della parte di cui conosci già tutte le misure.`;
  const solution=task==='area'?`A=${fmt(A1)}+${fmt(A2)}=${fmt(total)} cm².`:task==='perimeter'?`Il perimetro esterno misura ${fmt(P)} cm.`:invAnswer;
  return {text,notes:['Osserva la sagoma come un’unica figura.',help1,help2,solution],svg:compSvg(kind,v,task,task==='perimeter'?'Questo è il lato comune':task==='inverse'?'Separa qui le due aree':'Qui si incontrano le due figure'),helps:[
        {title:'Come posso scomporla?', text:help1, scene:1},
        {title:'Qual è il passo successivo?', text:help2, scene:1},
        {title:'Mostrami la soluzione', text:solution, scene:1}
      ],scenes:{}};
}

// --- v0.7: prima libreria Parallelogrammi ---

export const COMPOSITE_FAMILIES={
compositeDifference:{
    figures:['composta'], strategies:['scomposizione','differenza_aree'],
    generate(){
      const [W,H,w,h]=pickVariant('compositeDifference',cartesian([12,14,16,18],[9,10,12,14],[4,5,6,7],[3,4,5]).filter(([W,H,w,h])=>w<=W/2 && h<=H/2)),A=W*H-w*h;
      const s=Math.min(300/W,210/H),x=105,y=55,cutX=x+(W-w)*s,cutY=y+h*s;
      return {text:`Da un rettangolo di ${W} cm × ${H} cm è stato tolto, nell’angolo in alto a destra, un rettangolo di ${w} cm × ${h} cm. Calcola l’area della figura rimasta.`,notes:['Osserva la figura composta.','Puoi partire da una figura più semplice: il rettangolo esterno.','La parte mancante va sottratta.','Ora confronta le due aree.'],
      svg:`<svg viewBox="0 0 520 350"><path data-geo="shape" d="M${x} ${y} H${cutX} V${cutY} H${x+W*s} V${y+H*s} H${x} Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><text x="260" y="315" text-anchor="middle">rettangolo esterno: ${W} × ${H} cm</text><g data-v="1" opacity="0"><rect data-geo="outer" x="${x}" y="${y}" width="${W*s}" height="${H*s}" fill="none" class="aux" stroke-width="4" stroke-dasharray="8 6"/></g><g data-v="2" opacity="0"><rect data-geo="cut" x="${cutX}" y="${y}" width="${w*s}" height="${h*s}" fill="rgba(255,104,75,.10)" class="focus" stroke-width="5"/><text class="label-focus" x="${cutX+w*s/2}" y="${y+h*s/2}" text-anchor="middle">${w}×${h}</text></g><g data-v="3" opacity="0"><text class="label-aux" x="260" y="342" text-anchor="middle">${W*H} − ${w*h} = ${A} cm²</text></g></svg>`,
      helps:[
        {title:'Da quale figura parto?', text:`Immagina il rettangolo esterno completo: area ${W}×${H}.`, scene:1},
        {title:'Che cosa devo togliere?', text:`Il rettangolo mancante misura ${w}×${h} cm.`, scene:2},
        {title:'Come combino le aree?', text:`Sottrai l’area mancante dall’area esterna.`, scene:3},
        {title:'Mostrami la soluzione', text:`${W*H}−${w*h}=${A} cm².`, scene:3}
      ]};
    }
  },
composite_sumAreas:{figures:['composta'],strategies:['figure_composte','somma_aree'],generate:()=>compositeProblem('rectTri','area')},
composite_externalPerimeter:{figures:['composta'],strategies:['figure_composte','perimetro_lato_comune'],generate:()=>compositeProblem('squareTri','perimeter')},
composite_inverseArea:{figures:['composta'],strategies:['figure_composte','area_totale_sottrazione_formula_inversa'],generate:()=>compositeProblem('rectTrap','inverse')},
composite_twoRectanglesArea:{figures:['composta'],strategies:['figure_composte','scomposizione_rettangoli'],generate:()=>compositeProblem('rectRect','area')},
composite_trapezoidPerimeter:{figures:['composta'],strategies:['figure_composte','perimetro_trapezio_lato_comune'],generate:()=>compositeProblem('squareTrap','perimeter')},
composite_twoStageInverse:{figures:['composta'],strategies:['figure_composte','area_prima_figura_area_seconda_inversa'],generate:()=>compositeProblem('triTrap','inverse')},
composite_rhombusInverse:{figures:['composta'],strategies:['figure_composte','area_totale_area_rombo_altezza'],generate:()=>compositeProblem('rectRhomb','inverse')}
};
