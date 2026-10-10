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

function trapezoidUfGeometry(m,n){
  const maxW=330,s=maxW/n,B=n*s,b=m*s,cx=260,y1=95,y2=260,shift=-22;
  return {bx1:cx-b/2+shift,bx2:cx+b/2+shift,Bx1:cx-B/2,Bx2:cx+B/2,y1,y2};
}

export const TRAPEZOID_FAMILIES={
trapezoid:{
    figures:['trapezio'], strategies:['differenza_basi','proiezione','pitagora','area'],
    generate(){
      const [h,p,l,small]=pickVariant('trapezoid',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12,14].map(s=>[...t,s])).filter(([h,p,l,s])=>p<=12));
      const big=small+2*p, A=(big+small)*h/2;
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
        {title:'Da dove posso iniziare?', text:'Per calcolare l’area manca l’altezza: tracciala.', scene:1},
        {title:'Come uso le due basi?', text:`La parte della base maggiore che resta fuori dalla base minore misura ${big} − ${small} = ${2*p} cm.`, scene:2},
        {title:'Come trovo il cateto?', text:`Essendo il trapezio isoscele, i due segmenti laterali sono uguali: ${2*p} : 2 = ${p} cm.`, scene:3},
        {title:'Sono ancora bloccato/a', text:`Concentrati sul triangolo rettangolo a sinistra: ipotenusa ${l} cm, un cateto ${p} cm e l’altro cateto è h.`, scene:4},
        {title:'Mostrami la soluzione', text:`h = √(${l}² − ${p}²) = ${h} cm; A = (${big} + ${small}) × ${h} : 2 = ${A} cm².`, scene:5}
      ],
      scenes:{
        2:{highlight:['left-projection','right-projection']},
        3:{highlight:['left-projection','right-projection']},
        4:{
          keep:['left-leg','left-projection','left-height','left-right-angle','height-label','left-leg-label','left-projection-label'],
          highlight:['left-leg','left-projection'],
          aux:['left-height'],
          labels:['left-leg-label','left-projection-label']
        },
        5:{dim:['height-label']}
      }};
    }
  },
rightTrapezoid:{
    figures:['trapezio'], strategies:['differenza_basi','proiezione','pitagora','area'],
    generate(){
      const [h,p,l,small]=pickVariant('rightTrapezoid',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12,14].map(s=>[...t,s])).filter(([h,p])=>p<=15)),big=small+p,A=(big+small)*h/2;
      const s=Math.min(350/big,160/h),x=85,yB=265,yT=yB-h*s,xTR=x+small*s,xR=x+big*s;
      return {text:`Un trapezio rettangolo ha le basi di ${big} cm e ${small} cm e il lato obliquo di ${l} cm. Calcola l’area.`,notes:['Osserva il trapezio rettangolo.',`La differenza tra le basi è la proiezione del lato obliquo.`,`Concentrati sul triangolo rettangolo a destra.`,`L’altezza misura ${h} cm.`],
      svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="left" x1="${x}" y1="${yB}" x2="${x}" y2="${yT}"/><line data-geo="top" x1="${x}" y1="${yT}" x2="${xTR}" y2="${yT}"/><line data-geo="leg" x1="${xTR}" y1="${yT}" x2="${xR}" y2="${yB}"/><line data-geo="base-main" x1="${x}" y1="${yB}" x2="${xTR}" y2="${yB}"/><line data-geo="projection" x1="${xTR}" y1="${yB}" x2="${xR}" y2="${yB}"/></g><text x="${(x+xTR)/2}" y="${yT-18}" text-anchor="middle">${small} cm</text><text x="${(x+xR)/2}" y="310" text-anchor="middle">${big} cm</text><text data-geo="leg-label" x="${(xTR+xR)/2+25}" y="${(yT+yB)/2}">${l} cm</text>
      <g data-v="1" opacity="0"><line data-geo="height" class="aux" x1="${xTR}" y1="${yT}" x2="${xTR}" y2="${yB}" stroke-width="4" stroke-dasharray="8 6"/><text data-geo="p-label" class="label-focus" x="${(xTR+xR)/2}" y="${yB+27}" text-anchor="middle">${p} cm</text><text data-geo="h-label" class="label-aux" x="${xTR-16}" y="${(yT+yB)/2}" text-anchor="end">h ?</text></g><g data-v="3" opacity="0"><text class="label-aux" x="260" y="340" text-anchor="middle">h = ${h} cm → A = ${A} cm²</text></g></svg>`,
      helps:[
        {title:'Come uso le basi?', text:`La loro differenza è ${big}−${small}=${p} cm.`, scene:1},
        {title:'Dove guardo ora?', text:`Osserva il triangolo rettangolo formato da proiezione, altezza e lato obliquo.`, scene:2},
        {title:'Come trovo h?', text:`h=√(${l}²−${p}²)=${h} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`A=(${big}+${small})×${h}:2=${A} cm².`, scene:3}
      ],
      scenes:{2:{keep:['leg','projection','height','leg-label','p-label','h-label'],highlight:['leg','projection'],aux:['height']}}};
    }
  },
isoTrapBasesHeight:{
    figures:['trapezio'], strategies:['differenza_basi','proiezione','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('isoTrapBasesHeight',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s])).filter(([h,p])=>p<=12)); const big=small+2*p,P=big+small+2*l;
      return {text:`Un trapezio isoscele ha basi ${big} cm e ${small} cm e altezza ${h} cm. Calcola il perimetro.`,notes:['Per il perimetro manca il lato obliquo.','La differenza delle basi si divide in due proiezioni uguali.','Con altezza e proiezione ottieni un triangolo rettangolo.'],svg:`<svg viewBox="0 0 520 350"><path d="M70 265 L450 265 L380 85 L140 85 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="310" text-anchor="middle">B=${big}; b=${small}; h=${h}</text><g data-v="1" opacity="0"><line class="aux" x1="140" y1="85" x2="140" y2="265" stroke-width="4" stroke-dasharray="8 6"/><text class="label-focus" x="105" y="288" text-anchor="middle">${p}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="340" text-anchor="middle">l=√(${h}²+${p}²)=${l} → P=${P}</text></g></svg>`,helps:[
        {title:'Come trovo il lato obliquo?', text:`Calcola prima (B−b):2 = (${big}−${small}):2 = ${p} cm.`, scene:1},
        {title:'Quale figura compare?', text:`Altezza ${h} e proiezione ${p} sono i cateti di un triangolo rettangolo.`, scene:1},
        {title:'Mostrami la soluzione', text:`l=√(${h}²+${p}²)=${l} cm; P=${big}+${small}+2×${l}=${P} cm.`, scene:2}
      ]};
    }
  },
isoTrapAreaBases:{
    figures:['trapezio'], strategies:['formula_inversa','area','differenza_basi','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('isoTrapAreaBases',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s])).filter(([h,p])=>p<=12)); const big=small+2*p,A=(big+small)*h/2,P=big+small+2*l;
      return {text:`Un trapezio isoscele ha area ${A} cm² e basi ${big} cm e ${small} cm. Calcola altezza e perimetro.`,notes:['Prima ricava l’altezza con la formula inversa dell’area.','Poi trova la proiezione del lato obliquo.','Usa Pitagora per il lato.'],svg:`<svg viewBox="0 0 520 350"><path d="M70 265 L450 265 L380 85 L140 85 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="310" text-anchor="middle">A=${A} · B=${big} · b=${small}</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="338" text-anchor="middle">h=2A:(B+b)=${h} cm</text></g></svg>`,helps:[
        {title:'Quale formula inversa serve?', text:`h=2A:(B+b).`, scene:1},
        {title:'Come trovo il lato?', text:`La proiezione è (${big}−${small}):2=${p} cm; usa Pitagora con h=${h}.`, scene:1},
        {title:'Mostrami la soluzione', text:`h=${h} cm; l=${l} cm; P=${P} cm.`, scene:1}
      ]};
    }
  },
rightTrapBasesHeight:{
    figures:['trapezio'], strategies:['differenza_basi','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('rightTrapBasesHeight',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s]))); const big=small+p,P=big+small+h+l;
      return {text:`Un trapezio rettangolo ha basi ${big} cm e ${small} cm e altezza ${h} cm. Calcola il perimetro.`,notes:['Manca il lato obliquo.','La differenza delle basi è un cateto del triangolo rettangolo laterale.','Usa Pitagora.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L90 80 L360 80 L440 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="315" text-anchor="middle">B=${big}; b=${small}; h=${h}</text><g data-v="1" opacity="0"><text class="label-focus" x="400" y="295" text-anchor="middle">B−b=${p}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="345" text-anchor="middle">l=${l} → P=${P}</text></g></svg>`,helps:[
        {title:'Come trovo la proiezione?', text:`${big}−${small}=${p} cm.`, scene:1},
        {title:'Come trovo il lato obliquo?', text:`l=√(${h}²+${p}²)=${l} cm.`, scene:2},
        {title:'Mostrami la soluzione', text:`P=${big}+${small}+${h}+${l}=${P} cm.`, scene:2}
      ]};
    }
  },
rightTrapAreaBases:{
    figures:['trapezio'], strategies:['formula_inversa','area','differenza_basi','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('rightTrapAreaBases',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s]))); const big=small+p,A=(big+small)*h/2,P=big+small+h+l;
      return {text:`Un trapezio rettangolo ha area ${A} cm² e basi ${big} cm e ${small} cm. Calcola altezza e perimetro.`,notes:['Ricava l’altezza dalla formula inversa dell’area.','La differenza delle basi dà il cateto orizzontale.','Poi trova il lato obliquo.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L90 80 L360 80 L440 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="315" text-anchor="middle">A=${A} · B=${big} · b=${small}</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="345" text-anchor="middle">h=2A:(B+b)=${h}</text></g></svg>`,helps:[
        {title:'Come trovo h?', text:`h=2A:(B+b)=${h} cm.`, scene:1},
        {title:'E il lato obliquo?', text:`B−b=${p}; l=√(${h}²+${p}²)=${l} cm.`, scene:1},
        {title:'Mostrami la soluzione', text:`h=${h} cm; l=${l} cm; P=${P} cm.`, scene:1}
      ]};
    }
  },
trapezoidBasesSumRatio:{
    figures:['trapezio'],strategies:['somma','rapporto','UF','area'],
    generate(){
      const [m,n,u,h]=pickVariant('trapezoidBasesSumRatio',[[2,3,4,8],[3,4,3,10],[3,5,3,8],[4,5,2,12],[4,7,2,10],[5,6,2,8],[5,7,2,12],[6,7,2,10]]),small=m*u,big=n*u,sum=small+big,A=sum*h/2,total=m+n;
      return {debugNew:true,text:`La somma delle basi di un trapezio è ${sum} cm. La base minore è i ${m}/${n} della base maggiore. L’altezza misura ${h} cm. Calcola l’area.`,notes:['Rappresenta le due basi con UF della stessa lunghezza.','La somma delle basi corrisponde alla somma delle UF.','Ricava le due basi.','Poi torna alla formula dell’area.'],svg:`<svg viewBox="0 0 520 370">${(()=>{const q=trapezoidUfGeometry(m,n);return `<path d="M${q.Bx1} ${q.y2} L${q.bx1} ${q.y1} L${q.bx2} ${q.y1} L${q.Bx2} ${q.y2} Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="300" text-anchor="middle">B = ${n} UF</text><text x="${(q.bx1+q.bx2)/2}" y="70" text-anchor="middle">b = ${m} UF</text><g data-v="1" opacity="0"><line x1="${q.bx1}" y1="${q.y1}" x2="${q.bx2}" y2="${q.y1}" stroke="#46a6dc" stroke-width="7"/><line x1="${q.Bx1}" y1="${q.y2}" x2="${q.Bx2}" y2="${q.y2}" stroke="#2f9e83" stroke-width="7"/>${ufTicks(q.bx1,q.y1,q.bx2,q.y1,m,'#46a6dc')}${ufTicks(q.Bx1,q.y2,q.Bx2,q.y2,n,'#2f9e83')}</g>`})()}<g data-v="2" opacity="0"><text class="label-unit" x="260" y="340" text-anchor="middle">${m}+${n}=${total} UF = ${sum} cm</text></g></svg>`,helps:[
        {title:'Come rappresento le basi?', text:`b=${m} UF e B=${n} UF.`, scene:1},
        {title:'Quante UF formano la loro somma?', text:`${m}+${n}=${total} UF.`, scene:2},
        {title:'Quanto vale una UF?', text:`${sum}:${total}=${u} cm, quindi b=${small} cm e B=${big} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`A=(${big}+${small})×${h}:2=${A} cm².`, scene:3}
      ]};
    }
  },
trapezoidBasesDifferenceRatio:{
    figures:['trapezio'],strategies:['differenza','rapporto','UF','area'],
    generate(){
      const [m,n,u,h]=pickVariant('trapezoidBasesDifferenceRatio',[[2,3,4,8],[3,4,3,10],[3,5,3,8],[4,5,2,12],[4,7,2,10],[5,6,2,8],[5,7,2,12],[6,7,2,10]]),small=m*u,big=n*u,diff=big-small,A=(big+small)*h/2,parts=n-m;
      return {debugNew:true,text:`La base maggiore di un trapezio supera la base minore di ${diff} cm. La base minore è i ${m}/${n} della base maggiore. L’altezza misura ${h} cm. Calcola l’area.`,notes:['Rappresenta le due basi con UF.','La differenza corrisponde alle UF che la base maggiore ha in più.','Trova una UF e quindi le basi.','Usa infine l’altezza data.'],svg:`<svg viewBox="0 0 520 370">${(()=>{const q=trapezoidUfGeometry(m,n);return `<path d="M${q.Bx1} ${q.y2} L${q.bx1} ${q.y1} L${q.bx2} ${q.y1} L${q.Bx2} ${q.y2} Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="300" text-anchor="middle">B = ${n} UF</text><text x="${(q.bx1+q.bx2)/2}" y="70" text-anchor="middle">b = ${m} UF</text><g data-v="1" opacity="0"><line x1="${q.bx1}" y1="${q.y1}" x2="${q.bx2}" y2="${q.y1}" stroke="#46a6dc" stroke-width="7"/><line x1="${q.Bx1}" y1="${q.y2}" x2="${q.Bx2}" y2="${q.y2}" stroke="#2f9e83" stroke-width="7"/>${ufTicks(q.bx1,q.y1,q.bx2,q.y1,m,'#46a6dc')}${ufTicks(q.Bx1,q.y2,q.Bx2,q.y2,n,'#2f9e83')}</g>`})()}<g data-v="2" opacity="0"><text class="label-unit" x="260" y="340" text-anchor="middle">differenza = ${n}−${m} = ${parts} UF</text></g></svg>`,helps:[
        {title:'Come rappresento il rapporto?', text:`b=${m} UF e B=${n} UF.`, scene:1},
        {title:'A quante UF corrisponde la differenza?', text:`${n}−${m}=${parts} UF, che valgono ${diff} cm.`, scene:2},
        {title:'Quanto vale una UF?', text:`${diff}:${parts}=${u} cm, quindi b=${small} cm e B=${big} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`A=(${big}+${small})×${h}:2=${A} cm².`, scene:3}
      ]};
    }
  }
};
