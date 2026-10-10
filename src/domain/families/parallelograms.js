import { pickVariant } from './shared.js';
const PYTHAGOREAN_VARIANTS=[
  [3,4,5],[4,3,5],[6,8,10],[8,6,10],
  [5,12,13],[12,5,13],[8,15,17],[15,8,17],
  [9,12,15],[12,9,15]
];

function parallelogramSvg({b,h,side=null,topText='',bottomText='',heightText='',showHeightAt=1,finalText='',extraSvg='',viewHeight=350,finalAt=3}){
  const scale=Math.min(300/b,165/h), W=b*scale, H=h*scale, O=Math.min(72,Math.max(38,(side||6)*4));
  const x=82,y=70;
  return `<svg viewBox="0 0 520 ${viewHeight}" aria-label="Parallelogramma">
    <g class="geo-base">
      <line data-geo="base" x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}"/>
      <line data-geo="right-side" x1="${x+W}" y1="${y+H}" x2="${x+W+O}" y2="${y}"/>
      <line data-geo="top" x1="${x+W+O}" y1="${y}" x2="${x+O}" y2="${y}"/>
      <line data-geo="left-side" x1="${x+O}" y1="${y}" x2="${x}" y2="${y+H}"/>
    </g>
    ${topText?`<text x="260" y="38" text-anchor="middle">${topText}</text>`:''}
    ${bottomText?`<text data-geo="base-label" x="${x+W/2}" y="${Math.min(315,y+H+34)}" text-anchor="middle">${bottomText}</text>`:''}
    ${side?`<text data-geo="side-label" x="${x+W+O+15}" y="${y+H/2}" text-anchor="start">l = ${side} cm</text>`:''}
    <g data-v="${showHeightAt}" opacity="0">
      <line data-geo="height" class="aux" x1="${x+O}" y1="${y}" x2="${x+O}" y2="${y+H}" stroke-width="4" stroke-dasharray="8 6"/>
      <path data-geo="right-angle" class="aux" d="M${x+O} ${y+H-14} H${x+O+14} V${y+H}" fill="none" stroke-width="3"/>
      ${heightText?`<text data-geo="h-label" class="label-aux" x="${x+O+18}" y="${y+H/2}">${heightText}</text>`:''}
    </g>
    ${extraSvg}
    ${finalText?`<g data-v="${finalAt}" opacity="0"><text class="label-focus" x="260" y="${viewHeight-12}" text-anchor="middle">${finalText}</text></g>`:''}
  </svg>`;
}


function ufBar(x,y,count,unit,{showLabel=true,extraClass=''}={}){
  // Barra UF realmente suddivisa: ogni confine tra unità è marcato da una tacca.
  const x2=x+count*unit;
  const ticks=Array.from({length:count+1},(_,i)=>
    `<line class="uf-tick ${extraClass}" x1="${x+i*unit}" y1="${y-8}" x2="${x+i*unit}" y2="${y+8}"/>`
  ).join('');
  return `<g class="uf-bar ${extraClass}"><line x1="${x}" y1="${y}" x2="${x2}" y2="${y}"/>${ticks}${showLabel?`<text class="label-unit" x="${(x+x2)/2}" y="${y-18}" text-anchor="middle">${count} UF</text>`:''}</g>`;
}


export const PARALLELOGRAM_FAMILIES={
parallelogramArea:{
    figures:['parallelogramma'], strategies:['perimetro','relazioni','area'],
    make(){
      const [b,l,k]=pickVariant('parallelogramArea',[[12,8,2],[15,9,3],[16,10,2],[18,11,3],[20,13,2],[14,8,2]]); const h=b/k,P=2*(b+l),A=b*h;
      const x=85,y=85,W=300,H=170,O=75;
      return {text:`Un parallelogramma ha perimetro ${P} cm e lato obliquo ${l} cm. La base è ${k} volte l’altezza relativa ad essa. Calcola l’area.`,notes:['Dal perimetro ricava prima la base.','La relazione tra base e altezza permette di trovare l’altezza.','Solo alla fine usa A = b × h.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="base" x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}"/><line data-geo="right-side" x1="${x+W}" y1="${y+H}" x2="${x+W+O}" y2="${y}"/><line data-geo="top" x1="${x+W+O}" y1="${y}" x2="${x+O}" y2="${y}"/><line data-geo="left-side" x1="${x+O}" y1="${y}" x2="${x}" y2="${y+H}"/></g><text x="260" y="38" text-anchor="middle">P = ${P} cm</text><text x="${x+W+O+14}" y="${y+H/2}" text-anchor="start">l = ${l} cm</text><text x="${x+W/2}" y="${y+H+35}" text-anchor="middle">b ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b + l = ${P}:2 = ${P/2} cm</text></g><g data-v="2" opacity="0"><text class="label-focus" x="260" y="340" text-anchor="middle">b = ${b} cm; h = b:${k} = ${h} cm</text><line data-geo="height" class="aux" x1="${x+O}" y1="${y}" x2="${x+O}" y2="${y+H}" stroke-width="4" stroke-dasharray="8 6"/></g></svg>`,helps:[
        {title:'Quale informazione posso ottenere subito?', text:`Il perimetro comprende due basi e due lati obliqui: il semiperimetro è ${P}:2=${P/2} cm.`, scene:1},
        {title:'Come uso il lato già noto?', text:`Nel semiperimetro vale b+l=${P/2}. Con l=${l} cm puoi ricavare la misura che manca.`, scene:1},
        {title:'Come collego la nuova misura all’altezza?', text:`Ora usa la relazione b=${k}h: l’altezza è la base divisa per ${k}.`, scene:2},
        {title:'Quali misure servono per l’area?', text:'Metti a fuoco base e altezza perpendicolare: sono le due misure che entrano nella formula dell’area.', scene:2},
        {title:'Mostrami la soluzione', text:`b=${b} cm; h=${h} cm; A=${b}×${h}=${A} cm².`, scene:2}
      ],scenes:{1:{highlight:['base']},2:{dim:['left-side','right-side'],highlight:['base'],aux:['height']}}};
    }
  },
parallelogramHeightFromArea:{
    figures:['parallelogramma'], strategies:['perimetro','formula_inversa','area','altezza'],
    make(){
      const [b,l,h]=pickVariant('parallelogramHeightFromArea',[[12,8,7],[15,9,8],[16,10,9],[18,11,10],[20,13,12],[14,8,9]]); const A=b*h,P=2*(b+l);
      const x=85,y=85,W=300,H=170,O=75;
      return {text:`Un parallelogramma ha perimetro ${P} cm, lato obliquo ${l} cm e area ${A} cm². Calcola la base e l’altezza relativa alla base.`,notes:['Il perimetro permette di ricavare la base.','Poi l’area permette di ricavare l’altezza con una formula inversa.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="base" x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}"/><line data-geo="right-side" x1="${x+W}" y1="${y+H}" x2="${x+W+O}" y2="${y}"/><line data-geo="top" x1="${x+W+O}" y1="${y}" x2="${x+O}" y2="${y}"/><line data-geo="left-side" x1="${x+O}" y1="${y}" x2="${x}" y2="${y+H}"/></g><text x="260" y="38" text-anchor="middle">P = ${P} cm; A = ${A} cm²</text><text x="${x+W+O+14}" y="${y+H/2}">l = ${l} cm</text><text x="${x+W/2}" y="${y+H+35}" text-anchor="middle">b ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b + l = ${P}:2 = ${P/2} cm → b = ${b} cm</text></g><g data-v="2" opacity="0"><line data-geo="height" class="aux" x1="${x+O}" y1="${y}" x2="${x+O}" y2="${y+H}" stroke-width="4" stroke-dasharray="8 6"/><text class="label-aux" x="${x+O+18}" y="${y+H/2}">h ?</text><text class="label-focus" x="260" y="340" text-anchor="middle">h = A:b = ${A}:${b} = ${h} cm</text></g></svg>`,helps:[
        {title:'Che cosa posso ricavare dal perimetro?', text:`Il semiperimetro è ${P}:2=${P/2} cm e corrisponde alla somma di base e lato obliquo.`, scene:1},
        {title:'Come uso il lato già noto?', text:`Con b+l=${P/2} e l=${l} cm puoi ricavare la base.`, scene:1},
        {title:'Quale misura manca ancora?', text:`Per usare A=b×h conosci già A e b: resta da determinare l’altezza perpendicolare.`, scene:2},
        {title:'Come posso ricavarla?', text:`Dalla formula dell’area: h=A:b=${A}:${b}=${h} cm.`, scene:2},
        {title:'Mostrami la soluzione', text:`b=${b} cm; h=${h} cm.`, scene:2}
      ],scenes:{1:{highlight:['base']},2:{dim:['left-side','right-side'],highlight:['base'],aux:['height']}}};
    }
  },
parallelogramPerimeterRelation:{
    figures:['parallelogramma'], strategies:['perimetro','differenza','area'],
    generate(){
      const [side,d,h]=pickVariant('parallelogramPerimeterRelation',[[7,4,6],[8,5,7],[9,6,8],[10,5,8],[11,6,9],[12,7,10]]); const b=side+d,P=2*(b+side),A=b*h;
      const scale=Math.min(300/b,165/h),W=b*scale,H=h*scale,O=Math.min(70,side*4),x=90,y=72;
      return {text:`Un parallelogramma ha perimetro ${P} cm. La base supera il lato obliquo di ${d} cm. L’altezza relativa alla base misura ${h} cm. Calcola l’area.`,notes:['Dal perimetro ricava prima la somma di base e lato.','Usa poi la differenza tra base e lato.','L’altezza è già nota: dopo aver trovato la base puoi calcolare l’area.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="base" x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}"/><line data-geo="right-side" x1="${x+W}" y1="${y+H}" x2="${x+W+O}" y2="${y}"/><line data-geo="top" x1="${x+W+O}" y1="${y}" x2="${x+O}" y2="${y}"/><line data-geo="left-side" x1="${x+O}" y1="${y}" x2="${x}" y2="${y+H}"/></g><text x="260" y="38" text-anchor="middle">P = ${P} cm</text><text x="${x+W/2}" y="${y+H+35}" text-anchor="middle">b ?</text><text x="${x+W+O+15}" y="${y+H/2}" text-anchor="start">l ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b + l = P : 2 = ${P/2} cm</text></g><g data-v="2" opacity="0"><text class="label-focus" x="260" y="340" text-anchor="middle">l = ${side} cm → b = ${b} cm</text></g><g data-v="3" opacity="0"><line data-geo="height" class="aux" x1="${x+O}" y1="${y}" x2="${x+O}" y2="${y+H}" stroke-width="4" stroke-dasharray="8 6"/><text class="label-aux" x="${x+O+18}" y="${y+H/2}">h = ${h} cm</text></g></svg>`,helps:[
        {title:'Che cosa rappresenta metà del perimetro?', text:`Il semiperimetro è ${P}:2=${P/2} cm: è la somma di base e lato obliquo.`, scene:1},
        {title:'Come entra in gioco la differenza?', text:`Sai che una misura supera l’altra di ${d} cm. Rappresenta quindi due parti uguali più un tratto di ${d} cm.`, scene:1},
        {title:'Come ricavo le due misure?', text:`Togli la differenza ${d} dalla somma ${P/2}; ciò che resta è formato da due parti uguali.`, scene:2},
        {title:'Quale delle misure trovate serve adesso?', text:'Per l’area usa la base insieme all’altezza perpendicolare già fornita.', scene:3},
        {title:'Mostrami la soluzione', text:`l=${side} cm; b=${b} cm; A=${b}×${h}=${A} cm².`, scene:3}
      ]};
    }
  },
parallelogramBaseFromAreaPerimeter:{
    figures:['parallelogramma'],strategies:['formula_inversa','area','perimetro'],
    generate(){
      const [b,h,l]=pickVariant('parallelogramBaseFromAreaPerimeter',[[12,7,8],[15,8,9],[16,9,10],[18,10,11],[20,12,13],[14,9,8]]),A=b*h,P=2*(b+l);
      return {text:`Un parallelogramma ha area ${A} cm², altezza ${h} cm e lato obliquo ${l} cm. Calcola il perimetro.`,notes:['Per il perimetro manca la base.','Ricava la base dalla formula dell’area.','Ora base e lato obliquo sono noti.'],svg:parallelogramSvg({b,h,side:l,topText:`A = ${A} cm²`,bottomText:'b ?',heightText:`h = ${h} cm`,showHeightAt:1,finalText:`b = ${b} cm → P = ${P} cm`}),helps:[
        {title:'Che cosa ti serve per calcolare il perimetro?', text:'Osserva i lati del parallelogramma: una delle due misure è già indicata, l’altra no.', scene:1},
        {title:'Quali dati possono aiutarti a trovare la misura che manca?', text:`Metti a fuoco area e altezza: A=${A} cm² e h=${h} cm. Il lato obliquo non serve in questo passaggio.`, scene:1},
        {title:'Quale relazione lega questi dati?', text:'L’area del parallelogramma è data da base × altezza. Usa questa relazione senza ancora tornare al perimetro.', scene:2},
        {title:'Ora puoi ricavare la misura che manca', text:`b=A:h=${A}:${h}=${b} cm.`, scene:2},
        {title:'Torna alla domanda iniziale', text:'Ora conosci entrambe le misure dei lati necessarie per il perimetro.', scene:3},
        {title:'Mostrami la soluzione', text:`P=2×(${b}+${l})=${P} cm.`, scene:3}
      ],scenes:{1:{highlight:['base'],aux:['height','right-angle']}}};
    }
  },
parallelogramRatioPerimeter:{
    figures:['parallelogramma'],strategies:['perimetro','rapporto','UF','area'],
    generate(){
      const [m,n,u,h]=pickVariant('parallelogramRatioPerimeter',[[3,2,4,7],[4,3,3,8],[5,3,3,9],[5,4,4,10],[3,2,6,11],[4,3,5,12]]),b=m*u,l=n*u,P=2*(b+l),semi=P/2,total=m+n,A=b*h;
      const unit=Math.min(42,270/total),barX=112;
      const ufModel=`<g data-v="2" opacity="0"><text x="82" y="365" text-anchor="end">base</text>${ufBar(barX,360,m,unit)}<text x="82" y="420" text-anchor="end">lato</text>${ufBar(barX,415,n,unit)}</g>
        <g data-v="3" opacity="0"><text class="label-unit" x="400" y="392" text-anchor="middle">${m} UF + ${n} UF = ${total} UF</text></g>
        <g data-v="4" opacity="0"><text class="label-focus" x="260" y="458" text-anchor="middle">${semi} : ${total} = ${u} cm = 1 UF</text></g>
        <g data-v="5" opacity="0"><text class="label-aux" x="260" y="492" text-anchor="middle">base = ${m} UF = ${b} cm</text></g>`;
      return {text:`Un parallelogramma ha perimetro ${P} cm. La base e il lato obliquo sono nel rapporto ${m}:${n}. L’altezza relativa alla base misura ${h} cm. Calcola l’area.`,notes:['Il semiperimetro è la somma di base e lato.','Rappresenta il rapporto con UF tutte della stessa lunghezza.','Conta le UF complessive e trova il valore di una UF.','Ricava la base, poi torna al parallelogramma per l’area.'],svg:parallelogramSvg({b,h,topText:`P = ${P} cm`,bottomText:'b ?',heightText:`h = ${h} cm`,showHeightAt:6,extraSvg:ufModel,viewHeight:540,finalAt:7,finalText:`b = ${b} cm → A = ${A} cm²`}),helps:[
        {title:'Che cosa rappresenta metà del perimetro?', text:`Il semiperimetro è ${P} : 2 = ${semi} cm e corrisponde a base + lato obliquo.`, scene:1},
        {title:'Come rappresento il rapporto?', text:`Usa UF della stessa lunghezza: ${m} UF per la base e ${n} UF per il lato obliquo.`, scene:2},
        {title:'Quante UF ci sono in tutto?', text:`Conta le parti delle due barre: ${m} + ${n} = ${total} UF.`, scene:3},
        {title:'Quanto vale una UF?', text:`Le ${total} UF valgono ${semi} cm: ${semi} : ${total} = ${u} cm.`, scene:4},
        {title:'Ora puoi trovare la base?', text:`La base corrisponde a ${m} UF. Usa il valore di una UF che hai appena trovato.`, scene:5},
        {title:'Hai ciò che serve per l’area?', text:`Torna al parallelogramma: ora conosci la base (${b} cm) e l’altezza (${h} cm).`, scene:6},
        {title:'Mostrami la soluzione', text:`b=${m}×${u}=${b} cm; A=${b}×${h}=${A} cm².`, scene:7}
      ],scenes:{6:{highlight:['base'],aux:['height','right-angle']}}};
    }
  },
parallelogramSideFromPerimeter:{
    figures:['parallelogramma'],strategies:['perimetro','formula_inversa','area'],
    generate(){
      const [b,l,h]=pickVariant('parallelogramSideFromPerimeter',[[12,7,6],[14,8,7],[15,9,8],[16,10,9],[18,11,10],[20,12,11]]),P=2*(b+l),A=b*h;
      return {text:`Un parallelogramma ha perimetro ${P} cm, base ${b} cm e altezza relativa alla base ${h} cm. Calcola il lato obliquo e l’area.`,notes:['Dal perimetro puoi ricavare il semiperimetro.','Il semiperimetro è base + lato obliquo.','Per l’area, invece, servono base e altezza.'],svg:parallelogramSvg({b,h,topText:`P = ${P} cm`,bottomText:`b = ${b} cm`,heightText:`h = ${h} cm`,showHeightAt:3,extraSvg:`<g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">semiperimetro = ${P/2} cm</text></g><g data-v="2" opacity="0"><text class="label-focus" x="260" y="340" text-anchor="middle">b + l = ${P/2} cm</text></g>`,finalText:`l = ${l} cm; A = ${A} cm²`}),helps:[
        {title:'Che cosa posso ricavare dal perimetro?', text:`Il semiperimetro è ${P}:2=${P/2} cm. Osserva quali due lati consecutivi ne formano una metà.`, scene:1},
        {title:'Come uso il semiperimetro e la base?', text:`Il semiperimetro è formato da una base e da un lato obliquo: b+l=${P/2} cm. La base misura già ${b} cm: quale misura manca?`, scene:2},
        {title:'Per la seconda richiesta servono le stesse misure?', text:'Ora guarda la seconda richiesta: per l’area quali delle misure indicate nella figura sono necessarie?', scene:3},
        {title:'Mostrami la soluzione', text:`l=${P/2}−${b}=${l} cm; A=${b}×${h}=${A} cm².`, scene:3}
      ],scenes:{1:{highlight:['base','right-side']},2:{highlight:['base','right-side']},3:{dim:['left-side','right-side'],highlight:['base'],aux:['height','right-angle']}}};
    }
  },
parallelogramSidePythagoras:{
    figures:['parallelogramma'],strategies:['proiezione','pitagora','perimetro'],
    generate(){
      const [h,p,l,b]=pickVariant('parallelogramSidePythagoras',PYTHAGOREAN_VARIANTS.flatMap(t=>[14,16,18,20].map(b=>[...t,b])).filter(([h,p,l,b])=>p<b)),P=2*(b+l);
      return {debugNew:true,text:`Un parallelogramma ha base ${b} cm, altezza ${h} cm e la proiezione del lato obliquo sulla base misura ${p} cm. Calcola il perimetro.`,notes:['Per il perimetro manca il lato obliquo.','Altezza, proiezione e lato obliquo formano un triangolo rettangolo.','Trova il lato e poi torna al perimetro.'],svg:`<svg viewBox="0 0 520 350"><path d="M100 260 L170 80 L420 80 L350 260 Z" fill="none" stroke="currentColor" stroke-width="5"/><line class="aux" x1="170" y1="80" x2="170" y2="260" stroke-width="4" stroke-dasharray="8 6"/><text x="260" y="305" text-anchor="middle">b = ${b} cm</text><text x="185" y="170">h = ${h} cm</text><text x="135" y="285" text-anchor="middle">p = ${p} cm</text><g data-v="1" opacity="0"><line x1="100" y1="260" x2="170" y2="80" stroke="#ff654a" stroke-width="7"/></g><g data-v="2" opacity="0"><line x1="100" y1="260" x2="170" y2="260" stroke="#2f9e83" stroke-width="7"/><line x1="170" y1="80" x2="170" y2="260" stroke="#46a6dc" stroke-width="5" stroke-dasharray="8 6"/><path d="M170 242 H152 V260" fill="none" stroke="#46a6dc" stroke-width="4"/></g></svg>`,helps:[
        {title:'Che cosa manca per il perimetro?', text:'Serve la misura del lato obliquo.', scene:1},
        {title:'Quale triangolo puoi usare?', text:'Il lato obliquo è l’ipotenusa del triangolo con cateti altezza e proiezione.', scene:2},
        {title:'Quanto misura il lato?', text:`l=√(${h}²+${p}²)=${l} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`P=2×(${b}+${l})=${P} cm.`, scene:3}
      ]};
    }
  },
parallelogramDiagonalPythagoras:{
    figures:['parallelogramma'],strategies:['differenza_segmenti','proiezione','pitagora','diagonale'],
    generate(){
      const [h,q,d,p]=pickVariant('parallelogramDiagonalPythagoras',[[12,5,13,4],[12,9,15,5],[8,15,17,5],[15,8,17,4],[9,12,15,5],[5,12,13,4],[6,8,10,4],[8,6,10,4]]),b=p+q;
      return {debugNew:true,text:`Un parallelogramma ha base ${b} cm e altezza ${h} cm. La proiezione del lato obliquo sulla base misura ${p} cm. Calcola la diagonale minore.`,notes:['Osserva dove cade l’altezza sulla base.','Per il triangolo della diagonale serve il tratto di base rimasto.','Sottrai la proiezione dalla base.','Poi applica Pitagora.'],svg:`<svg viewBox="0 0 520 350"><path d="M100 260 L170 80 L420 80 L350 260 Z" fill="none" stroke="currentColor" stroke-width="5"/><line class="aux" x1="170" y1="80" x2="170" y2="260" stroke-width="4" stroke-dasharray="8 6"/><text x="260" y="305" text-anchor="middle">b = ${b} cm</text><text x="185" y="170">h = ${h} cm</text><text x="135" y="285" text-anchor="middle">p = ${p} cm</text><g data-v="1" opacity="0"><line x1="170" y1="80" x2="350" y2="260" stroke="#46a6dc" stroke-width="5"/></g><g data-v="2" opacity="0"><line x1="170" y1="260" x2="350" y2="260" stroke="#ff654a" stroke-width="7"/><text class="label-focus" x="270" y="335" text-anchor="middle">${b}−${p}=${q} cm</text></g><g data-v="3" opacity="0"><line x1="170" y1="80" x2="350" y2="260" stroke="#46a6dc" stroke-width="6"/><line x1="170" y1="80" x2="170" y2="260" stroke="#2f9e83" stroke-width="5" stroke-dasharray="8 6"/><line x1="170" y1="260" x2="350" y2="260" stroke="#ff654a" stroke-width="7"/><path d="M170 242 H188 V260" fill="none" stroke="#2f9e83" stroke-width="4"/></g></svg>`,helps:[
        {title:'Quale tratto serve per costruire il triangolo della diagonale?', text:'Guarda la parte di base compresa tra il piede dell’altezza e il vertice opposto.', scene:1},
        {title:'Quanto misura quel tratto?', text:`${b}−${p}=${q} cm.`, scene:2},
        {title:'Ora che cosa puoi fare?', text:'La diagonale minore è l’ipotenusa del triangolo rettangolo con cateti altezza e tratto di base.', scene:3},
        {title:'Mostrami la soluzione', text:`d=√(${h}²+${q}²)=${d} cm.`, scene:3}
      ]};
    }
  }
};
