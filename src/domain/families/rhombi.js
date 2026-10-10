import { pickVariant } from './shared.js';
const PYTHAGOREAN_VARIANTS=[
  [3,4,5],[4,3,5],[6,8,10],[8,6,10],
  [5,12,13],[12,5,13],[8,15,17],[15,8,17],
  [9,12,15],[12,9,15]
];

function ufTicks(x1,y1,x2,y2,count,color='#2f9e83',len=12){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
  return Array.from({length:Math.max(0,count-1)},(_,i)=>{const t=(i+1)/count,x=x1+dx*t,y=y1+dy*t;return `<line x1="${x-nx*len/2}" y1="${y-ny*len/2}" x2="${x+nx*len/2}" y2="${y+ny*len/2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;}).join('');
}

function rhombusUfGeometry(m,n){
  // Un'unica scala s per entrambe le diagonali: 1 UF ha sempre la stessa lunghezza.
  // La figura viene ridotta quando serve, senza deformare il rapporto tra D e d.
  const maxD=300,maxd=220,s=Math.min(maxD/n,maxd/m),D=n*s,d=m*s,cx=260,cy=180;
  return {lx:cx-D/2,rx:cx+D/2,ty:cy-d/2,by:cy+d/2,cx,cy,s};
}
function rhombusUfTicks(q,m,n){
  // Le tacche delle due diagonali usano la stessa scala geometrica q.s.
  // Nel punto d'incrocio una normale tacca della diagonale verticale si confonderebbe
  // con la diagonale orizzontale: il piccolo cerchio rende visibile anche quel confine di UF.
  const horizontal=ufTicks(q.lx,q.cy,q.rx,q.cy,n,'#2f9e83');
  const vertical=ufTicks(q.cx,q.ty,q.cx,q.by,m,'#46a6dc');
  const verticalHasCenter=m%2===0?`<circle cx="${q.cx}" cy="${q.cy}" r="7" fill="#fffdf8" stroke="#46a6dc" stroke-width="3"/>`:'';
  return horizontal+vertical+verticalHasCenter;
}

// --- v0.11: famiglie aggiuntive per la distinzione classe seconda / classe terza.

export const RHOMBUS_FAMILIES={
rhombusDiagonals:{
    figures:['rombo'], strategies:['diagonali','pitagora','perimetro'],
    generate(){
      const [a,b,l]=pickVariant('rhombusDiagonals',PYTHAGOREAN_VARIANTS),D=2*b,d=2*a,A=D*d/2,P=4*l;
      const cx=260,cy=165,L=150,S=105;
      return {text:`Un rombo ha diagonale maggiore ${D} cm e diagonale minore ${d} cm. Calcola l’area e il perimetro.`,
      notes:['Osserva il rombo.','Le diagonali sono perpendicolari e si tagliano a metà.','Ora conosci le due semidiagonali.','Concentrati su uno dei quattro triangoli rettangoli.','Usa Pitagora per trovare il lato.'],
      svg:`<svg viewBox="0 0 520 370"><g class="geo-base"><line data-geo="side1" x1="${cx}" y1="${cy-S}" x2="${cx+L}" y2="${cy}"/><line data-geo="side2" x1="${cx+L}" y1="${cy}" x2="${cx}" y2="${cy+S}"/><line data-geo="side3" x1="${cx}" y1="${cy+S}" x2="${cx-L}" y2="${cy}"/><line data-geo="side4" x1="${cx-L}" y1="${cy}" x2="${cx}" y2="${cy-S}"/></g>
      <text x="95" y="326">D = ${D} cm</text><text x="315" y="326">d = ${d} cm</text>
      <g data-v="1" opacity="0"><line data-geo="D-left" class="aux" x1="${cx-L}" y1="${cy}" x2="${cx}" y2="${cy}"/><line data-geo="D-right" class="aux" x1="${cx}" y1="${cy}" x2="${cx+L}" y2="${cy}"/><line data-geo="d-top" class="aux" x1="${cx}" y1="${cy-S}" x2="${cx}" y2="${cy}"/><line data-geo="d-bottom" class="aux" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy+S}"/><path data-geo="right-angle" class="aux" d="M${cx} ${cy-13} H${cx+13} V${cy}" fill="none" stroke-width="3"/></g>
      <g data-v="2" opacity="0"><text data-geo="b-label" class="label-aux" x="${cx+L/2}" y="${cy-12}" text-anchor="middle">D/2 = ${b} cm</text><text data-geo="a-label" class="label-aux" x="${cx+16}" y="${cy-S/2}" text-anchor="start">d/2 = ${a} cm</text></g>
      <g data-v="4" opacity="0"><text class="label-focus" x="260" y="360" text-anchor="middle">l = √(${a}² + ${b}²) = ${l} cm</text></g></svg>`,
      helps:[
        {title:'Che cosa mostrano le diagonali?', text:'Osserva il loro incrocio: sono perpendicolari e ciascuna viene divisa in due parti uguali.', scene:1},
        {title:'Quanto misurano le semidiagonali?', text:`D/2 = ${b} cm e d/2 = ${a} cm.`, scene:2},
        {title:'Dove posso usare questi dati?', text:'Concentrati su un solo quarto del rombo: compare un triangolo rettangolo.', scene:3},
        {title:'Quale relazione posso usare?', text:`Nel triangolo evidenziato i cateti misurano ${a} cm e ${b} cm: puoi usare Pitagora.`, scene:4},
        {title:'Mostrami la soluzione', text:`l=√(${a}²+${b}²)=${l} cm; A=${D}×${d}:2=${A} cm²; P=4×${l}=${P} cm.`, scene:4}
      ],
      scenes:{3:{keep:['side1','D-right','d-top','right-angle','b-label','a-label'],highlight:['side1'],aux:['D-right','d-top','right-angle']},4:{keep:['side1','D-right','d-top','right-angle','b-label','a-label'],highlight:['side1'],aux:['D-right','d-top','right-angle']}}};
    }
  },
rhombusAreaDiagonal:{
    figures:['rombo'], strategies:['formula_inversa','diagonali','pitagora','perimetro'],
    generate(){
      const [a,b,l]=pickVariant('rhombusAreaDiagonal',PYTHAGOREAN_VARIANTS),D=2*b,d=2*a,A=D*d/2,P=4*l;
      return {text:`Un rombo ha area ${A} cm² e diagonale maggiore ${D} cm. Calcola l’altra diagonale e il perimetro.`,notes:['Prima ricava la diagonale mancante.','Ora entrambe le diagonali sono note.','Ricorda: si dimezzano e sono perpendicolari.','Isola un triangolo rettangolo.','Usa Pitagora per il lato.'],
      svg:`<svg viewBox="0 0 520 375"><g class="geo-base"><line data-geo="side1" x1="260" y1="55" x2="440" y2="165"/><line data-geo="side2" x1="440" y1="165" x2="260" y2="275"/><line data-geo="side3" x1="260" y1="275" x2="80" y2="165"/><line data-geo="side4" x1="80" y1="165" x2="260" y2="55"/></g><text x="100" y="320">A = ${A} cm²</text><text x="315" y="320">D = ${D} cm</text>
      <g data-v="1" opacity="0"><text data-geo="d-result" class="label-focus" x="260" y="355" text-anchor="middle">d = 2A : D = ${d} cm</text></g>
      <g data-v="2" opacity="0"><line data-geo="D-left" class="aux" x1="80" y1="165" x2="260" y2="165"/><line data-geo="D-right" class="aux" x1="260" y1="165" x2="440" y2="165"/><line data-geo="d-top" class="aux" x1="260" y1="55" x2="260" y2="165"/><line data-geo="d-bottom" class="aux" x1="260" y1="165" x2="260" y2="275"/><path data-geo="right-angle" class="aux" d="M260 152 H273 V165" fill="none" stroke-width="3"/></g>
      <g data-v="3" opacity="0"><text data-geo="halfD-label" class="label-aux" x="350" y="150" text-anchor="middle">D/2 = ${b} cm</text><text data-geo="halfd-label" class="label-aux" x="276" y="110">d/2 = ${a} cm</text></g></svg>`,
      helps:[
        {title:'Come trovo la diagonale mancante?', text:'Parti dalla formula A = D × d : 2 e isolane la diagonale incognita.', scene:1},
        {title:'Che cosa posso osservare ora?', text:'Ora conosci entrambe le diagonali: mostrale sul rombo.', scene:2},
        {title:'Quale proprietà mi serve?', text:'Le diagonali del rombo si dimezzano e sono perpendicolari.', scene:3},
        {title:'Dove posso usare questi dati?', text:'Concentrati su un quarto del rombo: compare un triangolo rettangolo.', scene:4},
        {title:'Mostrami la soluzione', text:`d=2×${A}:${D}=${d} cm; l=√(${a}²+${b}²)=${l} cm; P=4×${l}=${P} cm.`, scene:4}
      ],
      scenes:{4:{keep:['side1','D-right','d-top','right-angle','halfD-label','halfd-label'],highlight:['side1'],aux:['D-right','d-top','right-angle']}}};
    }
  },
rhombusSideDiagonal:{
    figures:['rombo'], strategies:['pitagora','diagonali','area'],
    generate(){
      const [a,b,l]=pickVariant('rhombusSideDiagonal',PYTHAGOREAN_VARIANTS),D=2*b,d=2*a,A=D*d/2;
      return {text:`Un rombo ha lato ${l} cm e diagonale maggiore ${D} cm. Calcola l’altra diagonale e l’area.`,notes:['Osserva la diagonale nota.','La diagonale viene dimezzata e incontra l’altra ad angolo retto.','Concentrati su un quarto del rombo.','Pitagora dà una semidiagonale.','Ricorda: hai trovato solo metà della diagonale.'],
      svg:`<svg viewBox="0 0 520 375"><g class="geo-base"><line data-geo="side1" x1="260" y1="55" x2="440" y2="165"/><line data-geo="side2" x1="440" y1="165" x2="260" y2="275"/><line data-geo="side3" x1="260" y1="275" x2="80" y2="165"/><line data-geo="side4" x1="80" y1="165" x2="260" y2="55"/></g><text x="105" y="320">l = ${l} cm</text><text x="315" y="320">D = ${D} cm</text>
      <g data-v="1" opacity="0"><line data-geo="D-right" class="aux" x1="260" y1="165" x2="440" y2="165"/><line data-geo="d-top" class="aux" x1="260" y1="55" x2="260" y2="165"/><path data-geo="right-angle" class="aux" d="M260 152 H273 V165" fill="none" stroke-width="3"/><text data-geo="halfD-label" class="label-aux" x="350" y="150" text-anchor="middle">D/2 = ${b} cm</text><text data-geo="unknown-half" class="label-aux" x="276" y="110">d/2 ?</text></g>
      <g data-v="3" opacity="0"><text data-geo="half-result" class="label-focus" x="260" y="350" text-anchor="middle">d/2 = ${a} cm</text></g><g data-v="4" opacity="0"><text data-geo="full-result" class="label-focus" x="260" y="372" text-anchor="middle">d = 2 × ${a} = ${d} cm</text></g></svg>`,
      helps:[
        {title:'Che cosa succede alla diagonale nota?', text:'La diagonale viene dimezzata; le due diagonali si incontrano ad angolo retto.', scene:1},
        {title:'Dove posso usare lato e semidiagonale?', text:'Concentrati su un quarto del rombo: hai un triangolo rettangolo.', scene:2},
        {title:'Come trovo la semidiagonale?', text:`Hai ipotenusa ${l} cm e un cateto D/2=${b} cm: usa Pitagora inverso.`, scene:3},
        {title:'Ho trovato tutta la diagonale?', text:'No: il valore trovato è d/2. Per ottenere d devi raddoppiarlo.', scene:4},
        {title:'Mostrami la soluzione', text:`d/2=√(${l}²−${b}²)=${a} cm; d=${d} cm; A=${D}×${d}:2=${A} cm².`, scene:4}
      ],
      scenes:{2:{keep:['side1','D-right','d-top','right-angle','halfD-label','unknown-half'],highlight:['side1'],aux:['D-right','d-top','right-angle']},3:{keep:['side1','D-right','d-top','right-angle','halfD-label','unknown-half'],highlight:['side1'],aux:['D-right','d-top','right-angle']}}};
    }
  },
rhombusDiagonalsSumRatio:{
    figures:['rombo'],strategies:['diagonali','somma','rapporto','UF','area'],
    generate(){
      const [m,n,u]=pickVariant('rhombusDiagonalsSumRatio',[[2,3,4],[3,4,3],[3,5,3],[4,5,2],[4,7,2],[5,6,2],[5,7,2],[6,7,2]]),d=m*u,D=n*u,sum=d+D,A=D*d/2,total=m+n;
      return {debugNew:true,text:`La somma delle diagonali di un rombo è ${sum} cm. La diagonale minore è i ${m}/${n} della maggiore. Calcola l’area.`,notes:['Rappresenta le diagonali con UF.','La loro somma corrisponde a tutte le UF.','Trova il valore di una UF e quindi le diagonali.','Ora puoi calcolare l’area.'],svg:`<svg viewBox="0 0 520 370">${(()=>{const q=rhombusUfGeometry(m,n);return `<path d="M${q.cx} ${q.ty} L${q.rx} ${q.cy} L${q.cx} ${q.by} L${q.lx} ${q.cy} Z" fill="none" stroke="currentColor" stroke-width="5"/><line x1="${q.lx}" y1="${q.cy}" x2="${q.rx}" y2="${q.cy}" class="aux"/><line x1="${q.cx}" y1="${q.ty}" x2="${q.cx}" y2="${q.by}" class="aux"/><text x="260" y="345" text-anchor="middle">d = ${m} UF; D = ${n} UF</text><g data-v="1" opacity="0"><line x1="${q.lx}" y1="${q.cy}" x2="${q.rx}" y2="${q.cy}" stroke="#2f9e83" stroke-width="5"/><line x1="${q.cx}" y1="${q.ty}" x2="${q.cx}" y2="${q.by}" stroke="#46a6dc" stroke-width="5"/>${rhombusUfTicks(q,m,n)}</g>`})()}<g data-v="2" opacity="0"><text class="label-unit" x="260" y="25" text-anchor="middle">${total} UF = ${sum} cm</text></g></svg>`,helps:[
        {title:'Come rappresento le diagonali?', text:`d=${m} UF e D=${n} UF.`, scene:1},
        {title:'Quante UF formano la somma?', text:`${m}+${n}=${total} UF.`, scene:2},
        {title:'Quanto vale una UF?', text:`${sum}:${total}=${u} cm: d=${d} cm e D=${D} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`A=${D}×${d}:2=${A} cm².`, scene:3}
      ]};
    }
  },
rhombusDiagonalsDifferenceRatio:{
    figures:['rombo'],strategies:['diagonali','differenza','rapporto','UF','area'],
    generate(){
      const [m,n,u]=pickVariant('rhombusDiagonalsDifferenceRatio',[[2,3,4],[3,4,3],[3,5,3],[4,5,2],[4,7,2],[5,6,2],[5,7,2],[6,7,2]]),d=m*u,D=n*u,diff=D-d,A=D*d/2,parts=n-m;
      return {debugNew:true,text:`La diagonale maggiore di un rombo supera la diagonale minore di ${diff} cm. La diagonale minore è i ${m}/${n} della maggiore. Calcola l’area.`,notes:['Rappresenta le diagonali con UF.','La differenza è formata dalle UF che avanzano nella diagonale maggiore.','Trova una UF e quindi le diagonali.','Calcola infine l’area.'],svg:`<svg viewBox="0 0 520 370">${(()=>{const q=rhombusUfGeometry(m,n);return `<path d="M${q.cx} ${q.ty} L${q.rx} ${q.cy} L${q.cx} ${q.by} L${q.lx} ${q.cy} Z" fill="none" stroke="currentColor" stroke-width="5"/><line x1="${q.lx}" y1="${q.cy}" x2="${q.rx}" y2="${q.cy}" class="aux"/><line x1="${q.cx}" y1="${q.ty}" x2="${q.cx}" y2="${q.by}" class="aux"/><text x="260" y="345" text-anchor="middle">d = ${m} UF; D = ${n} UF</text><g data-v="1" opacity="0"><line x1="${q.lx}" y1="${q.cy}" x2="${q.rx}" y2="${q.cy}" stroke="#2f9e83" stroke-width="5"/><line x1="${q.cx}" y1="${q.ty}" x2="${q.cx}" y2="${q.by}" stroke="#46a6dc" stroke-width="5"/>${rhombusUfTicks(q,m,n)}</g>`})()}<g data-v="2" opacity="0"><text class="label-unit" x="260" y="25" text-anchor="middle">${n}−${m}=${parts} UF = ${diff} cm</text></g></svg>`,helps:[
        {title:'Come rappresento il rapporto?', text:`d=${m} UF e D=${n} UF.`, scene:1},
        {title:'A quante UF corrisponde la differenza?', text:`${n}−${m}=${parts} UF.`, scene:2},
        {title:'Quanto vale una UF?', text:`${diff}:${parts}=${u} cm: d=${d} cm e D=${D} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`A=${D}×${d}:2=${A} cm².`, scene:3}
      ]};
    }
  }
};
