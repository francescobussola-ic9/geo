import { pickVariant } from './shared.js';
const gcd=(a,b)=>b?gcd(b,a%b):a;
const cartesian=(...lists)=>lists.reduce((acc,list)=>acc.flatMap(a=>list.map(v=>[...a,v])),[[]]);
const PYTHAGOREAN_VARIANTS=[
  [3,4,5],[4,3,5],[6,8,10],[8,6,10],
  [5,12,13],[12,5,13],[8,15,17],[15,8,17],
  [9,12,15],[12,9,15]
];

function ufTicks(x1,y1,x2,y2,count,color='#2f9e83',len=12){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
  return Array.from({length:Math.max(0,count-1)},(_,i)=>{const t=(i+1)/count,x=x1+dx*t,y=y1+dy*t;return `<line x1="${x-nx*len/2}" y1="${y-ny*len/2}" x2="${x+nx*len/2}" y2="${y+ny*len/2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;}).join('');
}

function ufBar(x,y,count,unit,{showLabel=true,extraClass=''}={}){
  // Barra UF realmente suddivisa: ogni confine tra unità è marcato da una tacca.
  const x2=x+count*unit;
  const ticks=Array.from({length:count+1},(_,i)=>
    `<line class="uf-tick ${extraClass}" x1="${x+i*unit}" y1="${y-8}" x2="${x+i*unit}" y2="${y+8}"/>`
  ).join('');
  return `<g class="uf-bar ${extraClass}"><line x1="${x}" y1="${y}" x2="${x2}" y2="${y}"/>${ticks}${showLabel?`<text class="label-unit" x="${(x+x2)/2}" y="${y-18}" text-anchor="middle">${count} UF</text>`:''}</g>`;
}


export const RECTANGLE_FAMILIES={
perimeterDiff:{
    figures:['rettangolo'], strategies:['perimetro','differenza','area'],
    generate(){
      const [h,d]=pickVariant('perimeterDiff',cartesian([6,7,8,9,10,11,12],[3,4,5,6,7]));
      const b=h+d, P=2*(b+h), A=b*h, semi=P/2;

      // Una sola figura, nessuna barra ridisegnata: la relazione b = h + d
      // viene letta direttamente sui lati del rettangolo.
      const maxW=330, maxH=190;
      const scale=Math.min(maxW/b,maxH/h);
      const W=b*scale, H=h*scale, hPart=h*scale, dPart=d*scale;
      const x=260-W/2, y=78, right=x+W, bottom=y+H;
      const split=x+hPart;

      return {text:`Un rettangolo ha il perimetro di ${P} cm. La base supera l’altezza di ${d} cm. Calcola l’area.`,
      notes:[
        'Osserva i dati e prova a decidere da dove partire.',
        `Il semiperimetro è ${semi} cm: una base e un’altezza insieme misurano ${semi} cm.`,
        `Guarda gli stessi lati: h è il tratto arancione; la base è lo stesso tratto più ${d} cm.`,
        `Tolti i ${d} cm in più, restano due lunghezze uguali: ciascuna misura ${h} cm.`
      ],
      svg:`<svg viewBox="0 0 520 350" aria-label="Rettangolo con relazione tra base e altezza evidenziata direttamente sui lati">
        <g class="geo-base">
          <line data-geo="top" x1="${x}" y1="${y}" x2="${right}" y2="${y}"/>
          <line data-geo="right" x1="${right}" y1="${y}" x2="${right}" y2="${bottom}"/>
          <line data-geo="height" x1="${x}" y1="${y}" x2="${x}" y2="${bottom}"/>
          <line data-geo="base-h" x1="${x}" y1="${bottom}" x2="${split}" y2="${bottom}"/>
          <line data-geo="base-d" x1="${split}" y1="${bottom}" x2="${right}" y2="${bottom}"/>
        </g>

        <text data-geo="height-label" x="${x-22}" y="${y+H/2+7}" text-anchor="end">h ?</text>
        <text data-geo="base-label" x="${x+W/2}" y="${Math.min(325,bottom+36)}" text-anchor="middle">b ?</text>

        <g data-v="1" opacity="0">
          <text x="260" y="42" text-anchor="middle">b + h = ${semi} cm</text>
        </g>

        <g data-v="2" opacity="0">
          <line data-geo="split-mark" class="unit" x1="${split}" y1="${bottom-10}" x2="${split}" y2="${bottom+10}" stroke-width="3"/>
          <text data-geo="height-h" class="label-focus" x="${x-18}" y="${y+H/2+7}" text-anchor="end">h</text>
          <text data-geo="base-h-label" class="label-focus" x="${x+hPart/2}" y="${bottom-14}" text-anchor="middle">h</text>
          <text data-geo="base-d-label" class="label-unit" x="${split+dPart/2}" y="${bottom-14}" text-anchor="middle">${d}</text>
        </g>

        <g data-v="3" opacity="0">
          <rect x="92" y="292" width="336" height="46" rx="18" fill="var(--paper, #fffdf8)" opacity="0.96"/>
          <text class="label-aux" x="260" y="312" text-anchor="middle">${semi} − ${d} = ${2*h}</text>
          <text class="label-focus" x="260" y="334" text-anchor="middle">${2*h} : 2 = ${h} cm → h = ${h} cm, b = ${b} cm</text>
        </g>
      </svg>`,
      helps:[
        {title:'Da dove posso iniziare?', text:`Il semiperimetro è ${P} : 2 = ${semi} cm. Una base e un’altezza insieme formano il semiperimetro.`, scene:1},
        {title:'Come uso la differenza?', text:`Osserva direttamente i lati: la base è lunga come l’altezza più un tratto di ${d} cm.`, scene:2},
        {title:'Come trovo i lati?', text:`Togli ${d} dal semiperimetro: ${semi} − ${d} = ${2*h}. Restano due parti uguali, quindi h = ${h} cm e b = ${b} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`h = ${h} cm, b = ${b} cm; A = ${b} × ${h} = ${A} cm².`, scene:3}
      ],
      scenes:{
        1:{dim:['top','right'],highlight:['base-h','base-d'],aux:['height']},
        2:{dim:['top','right'],hide:['height-label','base-label'],highlight:['height','base-h'],unit:['base-d']},
        3:{dim:['top','right'],hide:['height-label','base-label'],highlight:['height','base-h'],unit:['base-d']}
      }};
    }
  },
areaRatio:{
    figures:['rettangolo'], strategies:['area','rapporto','UF','UQ'],
    generate(){
      const [m,n,u]=pickVariant('areaRatio',cartesian([[2,3],[3,4],[3,5],[4,5]],[2,3,4,5]).map(([ratio,u])=>[...ratio,u]));
      const b=m*u,h=n*u,A=b*h,UQ=m*n,uqa=u*u;

      // Una UF ha SEMPRE la stessa lunghezza grafica in orizzontale e verticale.
      // Di conseguenza ogni UQ è un vero quadrato di lato 1 UF.
      const cell=Math.min(64,260/n,250/m);
      const W=m*cell,H=n*cell,cx=225,x0=cx-W/2,y0=35,y1=y0+H;
      const vLines=Array.from({length:m-1},(_,i)=>{
        const x=x0+cell*(i+1); return `<line class="unit" x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke-width="3"/>`;
      }).join('');
      const hLines=Array.from({length:n-1},(_,i)=>{
        const y=y0+cell*(i+1); return `<line class="unit" x1="${x0}" y1="${y}" x2="${x0+W}" y2="${y}" stroke-width="3"/>`;
      }).join('');
      const bottomTicks=Array.from({length:m},(_,i)=>{
        const xa=x0+i*cell, xb=xa+cell, mid=(xa+xb)/2;
        return `<line class="unit" x1="${xa}" y1="${y1+8}" x2="${xb}" y2="${y1+8}" stroke-width="4"/><line class="unit" x1="${xa}" y1="${y1+3}" x2="${xa}" y2="${y1+13}" stroke-width="3"/>${i===m-1?`<line class="unit" x1="${xb}" y1="${y1+3}" x2="${xb}" y2="${y1+13}" stroke-width="3"/>`:''}<text class="label-unit uf-small" x="${mid}" y="${y1+31}" text-anchor="middle">UF</text>`;
      }).join('');
      const leftTicks=Array.from({length:n},(_,i)=>{
        const ya=y0+i*cell, yb=ya+cell, mid=(ya+yb)/2;
        return `<line class="unit" x1="${x0-8}" y1="${ya}" x2="${x0-8}" y2="${yb}" stroke-width="4"/><line class="unit" x1="${x0-13}" y1="${ya}" x2="${x0-3}" y2="${ya}" stroke-width="3"/>${i===n-1?`<line class="unit" x1="${x0-13}" y1="${yb}" x2="${x0-3}" y2="${yb}" stroke-width="3"/>`:''}`;
      }).join('');
      const sampleX=x0+cell/2,sampleY=y0+cell/2;

      return {text:`Un rettangolo ha area ${A} cm². La base è i ${m}/${n} dell’altezza. Calcola le dimensioni.`,
      notes:[
        'Osserva il rapporto tra base e altezza.',
        `Rappresentiamo la base con ${m} UF e l’altezza con ${n} UF: ogni UF ha la stessa lunghezza.`,
        `Le UF costruiscono una griglia di ${m} × ${n} = ${UQ} UQ, tutte quadrate.`,
        `Se ${UQ} UQ valgono ${A} cm², una UQ vale ${uqa} cm². Il suo lato, cioè 1 UF, misura ${u} cm.`,
        `Quindi la base misura ${b} cm e l’altezza ${h} cm.`
      ],
      svg:`<svg viewBox="0 0 520 350" aria-label="Rettangolo costruito con unità frazionarie uguali e unità quadrate">
        <rect x="${x0}" y="${y0}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="5"/>
        <g data-v="1" opacity="0">
          ${bottomTicks}${leftTicks}
          <text class="label-unit" x="${x0-28}" y="${y0+H/2}" text-anchor="end">${n} UF</text>
          <text class="label-unit" x="${cx}" y="${Math.min(342,y1+55)}" text-anchor="middle">base = ${m} UF</text>
        </g>
        <g data-v="2" opacity="0">
          ${vLines}${hLines}
          <text class="label-unit" x="405" y="125" text-anchor="middle">${m} × ${n} = ${UQ} UQ</text>
          <text x="405" y="153" text-anchor="middle">${UQ} UQ = ${A} cm²</text>
        </g>
        <g data-v="3" opacity="0">
          <rect class="uq-focus" x="${x0}" y="${y0}" width="${cell}" height="${cell}" fill="none" stroke-width="6"/>
          <text class="label-focus" x="405" y="205" text-anchor="middle">1 UQ = ${uqa} cm²</text>
          <text class="label-focus" x="405" y="235" text-anchor="middle">1 UF = √${uqa} = ${u} cm</text>
          <text class="uq-one" x="${sampleX}" y="${sampleY+7}" text-anchor="middle">1 UQ</text>
        </g>
        <g data-v="4" opacity="0">
          <text class="label-aux" x="405" y="285" text-anchor="middle">b = ${m} × ${u} = ${b} cm</text>
          <text class="label-aux" x="405" y="315" text-anchor="middle">h = ${n} × ${u} = ${h} cm</text>
        </g>
      </svg>`,
      helps:[
        {title:'Come rappresento il rapporto?', text:`Usa la stessa unità di lunghezza: base = ${m} UF, altezza = ${n} UF.`, scene:1},
        {title:'Come uso l’area?', text:`Prolunga le divisioni: ottieni ${m} × ${n} = ${UQ} UQ. Ogni UQ è un quadrato di lato 1 UF.`, scene:2},
        {title:'Quanto vale una UF?', text:`1 UQ vale ${A} : ${UQ} = ${uqa} cm². Poiché è un quadrato, 1 UF = √${uqa} = ${u} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`1 UF = ${u} cm; base = ${m} × ${u} = ${b} cm; altezza = ${n} × ${u} = ${h} cm.`, scene:4}
      ]};
    }
  },
perimeterRatio:{
    figures:['rettangolo'], strategies:['perimetro','rapporto','UF'],
    generate(){
      const [m,n,u]=pickVariant('perimeterRatio',cartesian([[2,3],[3,4],[3,5],[4,5]],[2,3,4,5]).map(([ratio,u])=>[...ratio,u]));
      const b=n*u,h=m*u,P=2*(b+h),semi=P/2,total=m+n;
      const W=260,H=W*m/n,x=130,y=45,bottom=y+H,unit=Math.min(42,260/total),barX=110;
      return {text:`Un rettangolo ha il perimetro di ${P} cm. La base è i ${n}/${m} dell’altezza. Calcola l’area.`,
      notes:['Il semiperimetro è la somma di base e altezza.','Il rapporto si può rappresentare con UF tutte della stessa lunghezza.','Conta le UF complessive, poi trova il valore di una UF.','Ricava le dimensioni e infine l’area.'],
      svg:`<svg viewBox="0 0 520 465" aria-label="Rettangolo e modello a unità frazionarie"><g class="geo-base"><rect data-geo="shape" x="${x}" y="${y}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="5"/></g>
      <text data-geo="b-label" x="260" y="${bottom+28}" text-anchor="middle">b ?</text><text data-geo="h-label" x="${x-24}" y="${y+H/2}" text-anchor="end">h ?</text>
      <g data-v="1" opacity="0"><text class="label-aux" x="260" y="${bottom+58}" text-anchor="middle">b + h = ${semi} cm</text></g>
      <g data-v="2" opacity="0"><text x="82" y="${bottom+105}" text-anchor="end">base</text>${ufBar(barX,bottom+100,n,unit)}<text x="82" y="${bottom+155}" text-anchor="end">altezza</text>${ufBar(barX,bottom+150,m,unit)}</g>
      <g data-v="3" opacity="0"><text class="label-unit" x="390" y="${bottom+128}" text-anchor="middle">${n} UF + ${m} UF = ${total} UF</text></g>
      <g data-v="4" opacity="0"><text class="label-focus" x="260" y="${bottom+198}" text-anchor="middle">${semi} : ${total} = ${u} cm = 1 UF</text></g>
      <g data-v="5" opacity="0"><text class="label-aux" x="260" y="${bottom+232}" text-anchor="middle">b = ${b} cm; h = ${h} cm</text></g></svg>`,
      helps:[
        {title:'Che cosa rappresenta metà del perimetro?', text:`Il semiperimetro è ${P} : 2 = ${semi} cm. In un rettangolo corrisponde a base + altezza.`, scene:1},
        {title:'Come rappresento il rapporto?', text:`Usa UF della stessa lunghezza: ${n} UF per la base e ${m} UF per l’altezza.`, scene:2},
        {title:'Quante UF ci sono in tutto?', text:`Conta le parti delle due barre: ${n} + ${m} = ${total} UF.`, scene:3},
        {title:'Quanto vale una UF?', text:`Le ${total} UF valgono ${semi} cm: ${semi} : ${total} = ${u} cm.`, scene:4},
        {title:'Ora puoi trovare le dimensioni?', text:`La base corrisponde a ${n} UF e l’altezza a ${m} UF.`, scene:5},
        {title:'Mostrami la soluzione', text:`b=${b} cm, h=${h} cm; A=${b}×${h}=${b*h} cm².`, scene:5}
      ]};
    }
  },
rectDiffKnownSide:{
    figures:['rettangolo'], strategies:['differenza','perimetro','area'],
    generate(){
      const [h,d]=pickVariant('rectDiffKnownSide',cartesian([6,8,10,12],[3,4,5,6])); const b=h+d,P=2*(b+h),A=b*h;
      const W=280,H=W*h/b,x=120,y=65;
      return {text:`La base di un rettangolo supera l’altezza di ${d} cm. L’altezza misura ${h} cm. Calcola perimetro e area.`,notes:['Individua sul disegno la differenza tra i lati.',`La base è l’altezza più ${d} cm.`,`Ora conosci entrambe le dimensioni.`],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect data-geo="shape" x="${x}" y="${y}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="${x-20}" y="${y+H/2}" text-anchor="end">${h} cm</text><text x="260" y="${y+H+35}" text-anchor="middle">b ?</text><g data-v="1" opacity="0"><line x1="${x}" y1="${y}" x2="${x}" y2="${y+H}" stroke="#ff654a" stroke-width="7"/><line x1="${x}" y1="${y+H}" x2="${x+H}" y2="${y+H}" stroke="#ff654a" stroke-width="7"/><line x1="${x+H}" y1="${y+H}" x2="${x+W}" y2="${y+H}" stroke="#2f9e83" stroke-width="7"/><text class="label-focus" x="260" y="${y+H+68}" text-anchor="middle">b = ${h} + ${d} = ${b} cm</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="${y+H+98}" text-anchor="middle">P = ${P} cm; A = ${A} cm²</text></g></svg>`,helps:[
        {title:'Come uso la differenza?', text:`La base è ${h}+${d}=${b} cm.`, scene:1},
        {title:'E adesso?', text:`Conosci b e h: puoi applicare direttamente perimetro e area.`, scene:2},
        {title:'Mostrami la soluzione', text:`P=2×(${b}+${h})=${P} cm; A=${b}×${h}=${A} cm².`, scene:2}
      ]};
    }
  },
rectDiffFromAreaSide:{
    figures:['rettangolo'], strategies:['formula_inversa','area','differenza','perimetro'],
    generate(){
      const [h,d]=pickVariant('rectDiffFromAreaSide',cartesian([5,6,8,10],[2,3,4,5])); const b=h+d,A=b*h,P=2*(b+h);
      return {text:`Un rettangolo ha area ${A} cm² e altezza ${h} cm. Di quanti centimetri la base supera l’altezza? Calcola anche il perimetro.`,notes:['Prima ricava la base dall’area.','Confronta poi le due dimensioni.','Infine calcola il perimetro.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect data-geo="shape" x="110" y="70" width="300" height="170" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="90" y="160" text-anchor="end">h=${h}</text><text x="260" y="275" text-anchor="middle">A=${A} cm²; b ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b = A : h = ${A} : ${h} = ${b}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="342" text-anchor="middle">b−h=${d} cm · P=${P} cm</text></g></svg>`,helps:[
        {title:'Quale lato posso ricavare?', text:`Usa la formula inversa dell’area: b=A:h.`, scene:1},
        {title:'Come trovo la differenza?', text:`${b}−${h}=${d} cm.`, scene:2},
        {title:'Mostrami la soluzione', text:`b=${b} cm; differenza=${d} cm; P=2×(${b}+${h})=${P} cm.`, scene:2}
      ]};
    }
  },
rectRatioKnownHeight:{
    figures:['rettangolo'], strategies:['rapporto','frazione','area'],
    generate(){
      const [m,n,h]=pickVariant('rectRatioKnownHeight',[[2,3,12],[3,4,12],[3,5,15],[4,5,20]]); const b=h*m/n,A=b*h,P=2*(b+h),s=45,W=m*s,H=n*s,x=260-W/2,y=40;
      return {text:`In un rettangolo la base è i ${m}/${n} dell’altezza. L’altezza misura ${h} cm. Calcola base, area e perimetro.`,notes:['Qui non serve ricavare il valore di una UF dall’area.','Calcola direttamente la frazione dell’altezza.','Poi usa le formule di area e perimetro.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="${x}" y="${y}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="${x-24}" y="${y+H/2}" text-anchor="end">${h} cm</text><text x="260" y="${y+H+35}" text-anchor="middle">b = ${m}/${n} di h</text><g data-v="1" opacity="0"><line x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}" stroke="#2f9e83" stroke-width="7"/>${ufTicks(x,y+H,x+W,y+H,m,'#2f9e83')}<line x1="${x}" y1="${y}" x2="${x}" y2="${y+H}" stroke="#46a6dc" stroke-width="7"/>${ufTicks(x,y,x,y+H,n,'#46a6dc')}<text class="label-unit" x="260" y="${y+H+65}" text-anchor="middle">b = ${m} UF; h = ${n} UF</text></g><g data-v="2" opacity="0"><text class="label-focus" x="260" y="${y+H+95}" text-anchor="middle">b=${h}×${m}:${n}=${b} cm</text></g></svg>`,helps:[
        {title:'Come uso la frazione?', text:`Rappresenta la base con ${m} UF e l’altezza con ${n} UF: ogni UF ha la stessa lunghezza.`, scene:1},
        {title:'Ora cosa conosco?', text:`Calcola i ${m}/${n} di ${h}: b=${h}×${m}:${n}=${b} cm.`, scene:2},
        {title:'Mostrami la soluzione', text:`b=${b} cm; A=${A} cm²; P=${P} cm.`, scene:2}
      ]};
    }
  },
rectRatioFromDimensions:{
    figures:['rettangolo'], strategies:['rapporto','riduzione_frazione','area'],
    generate(){
      const [m,n,u]=pickVariant('rectRatioFromDimensions',cartesian([[2,3],[3,4],[3,5],[4,5]],[2,3,4]).map(([r,u])=>[...r,u])); const b=m*u,h=n*u,A=b*h,g=gcd(b,h);
      return {text:`Un rettangolo misura ${b} cm × ${h} cm. Esprimi la base come frazione dell’altezza e calcola l’area.`,notes:['Confronta le due dimensioni.','Scrivi b/h e riduci la frazione ai minimi termini.','Poi calcola l’area.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="120" y="60" width="280" height="190" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="260" y="285" text-anchor="middle">b=${b} cm · h=${h} cm</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="320" text-anchor="middle">b/h = ${b}/${h} = ${b/g}/${h/g}</text></g></svg>`,helps:[
        {title:'Come trovo il rapporto?', text:`Scrivi ${b}/${h} e semplifica.`, scene:1},
        {title:'Che cosa significa?', text:`La base è i ${b/g}/${h/g} dell’altezza.`, scene:1},
        {title:'Mostrami la soluzione', text:`b/h=${b/g}/${h/g}; A=${b}×${h}=${A} cm².`, scene:1}
      ]};
    }
  },
rectPerimeterKnownBase:{
    figures:['rettangolo'], strategies:['perimetro','formula_inversa','rapporto'],
    generate(){
      const [b,h]=pickVariant('rectPerimeterKnownBase',[[12,8],[15,10],[16,12],[20,12],[20,16]]); const P=2*(b+h),g=gcd(b,h);
      return {text:`Un rettangolo ha perimetro ${P} cm e base ${b} cm. Calcola l’altezza ed esprimi il rapporto base : altezza ai minimi termini.`,notes:['Dal perimetro ricava prima il semiperimetro.','Togli la base per ottenere l’altezza.','Solo alla fine confronta i due lati.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="110" y="65" width="300" height="180" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="260" y="282" text-anchor="middle">P=${P} cm; b=${b} cm</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b+h=${P/2} → h=${h}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="345" text-anchor="middle">b:h=${b/g}:${h/g}</text></g></svg>`,helps:[
        {title:'Da dove parto?', text:`Il semiperimetro è ${P}:2=${P/2} cm.`, scene:1},
        {title:'Come trovo h?', text:`${P/2}−${b}=${h} cm.`, scene:1},
        {title:'Come scrivo il rapporto?', text:`Riduci ${b}:${h} dividendo per ${g}.`, scene:2},
        {title:'Mostrami la soluzione', text:`h=${h} cm; b:h=${b/g}:${h/g}.`, scene:2}
      ]};
    }
  },
rectPerimeterDiffRatio:{
    figures:['rettangolo'], strategies:['perimetro','differenza','rapporto'],
    generate(){
      const [h,d]=pickVariant('rectPerimeterDiffRatio',[[6,3],[8,4],[9,6],[10,5],[12,6]]); const b=h+d,P=2*(b+h),g=gcd(b,h);
      return {text:`Un rettangolo ha perimetro ${P} cm e la base supera l’altezza di ${d} cm. Dopo aver trovato i lati, esprimi il rapporto base : altezza ai minimi termini.`,notes:['Risolvi prima la relazione tra somma e differenza.','Poi confronta i due lati ottenuti.','Il rapporto va ridotto ai minimi termini.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="110" y="65" width="300" height="180" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="260" y="282" text-anchor="middle">P=${P}; b−h=${d}</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b+h=${P/2}; h=(${P/2}−${d}):2=${h}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="345" text-anchor="middle">b:h=${b/g}:${h/g}</text></g></svg>`,helps:[
        {title:'Come trovo i lati?', text:`Dal semiperimetro ${P/2} togli la differenza ${d}, poi dividi per 2.`, scene:1},
        {title:'E la base?', text:`b=${h}+${d}=${b} cm.`, scene:1},
        {title:'Come ottengo il rapporto?', text:`Riduci ${b}:${h} dividendo per ${g}.`, scene:2},
        {title:'Mostrami la soluzione', text:`b=${b}, h=${h}; rapporto=${b/g}:${h/g}.`, scene:2}
      ]};
    }
  },
rectDiagonalFromPerimeterSide:{
    figures:['rettangolo'],strategies:['perimetro','pitagora','diagonale'],
    generate(){
      const [h,b,d]=pickVariant('rectDiagonalFromPerimeterSide',PYTHAGOREAN_VARIANTS),P=2*(b+h);
      return {debugNew:true,text:`Un rettangolo ha il perimetro di ${P} cm e l’altezza di ${h} cm. Calcola la diagonale.`,notes:['Dal perimetro puoi ricavare il semiperimetro.','Con il semiperimetro e l’altezza trova la base.','Ora base, altezza e diagonale formano un triangolo rettangolo.'],svg:`<svg viewBox="0 0 520 350"><rect x="110" y="65" width="300" height="190" fill="none" stroke="currentColor" stroke-width="5"/><text x="90" y="165" text-anchor="end">h = ${h} cm</text><text x="260" y="300" text-anchor="middle">P = ${P} cm</text><g data-v="1" opacity="0"><line x1="110" y1="255" x2="410" y2="255" stroke="#ff654a" stroke-width="7"/><line x1="110" y1="65" x2="110" y2="255" stroke="#ff654a" stroke-width="7"/></g><g data-v="2" opacity="0"><text class="label-focus" x="260" y="335" text-anchor="middle">b = ${P/2}−${h}=${b} cm</text></g><g data-v="3" opacity="0"><line class="aux" x1="110" y1="65" x2="410" y2="255" stroke-width="4"/><path d="M110 237 H128 V255" fill="none" stroke="#46a6dc" stroke-width="4"/></g></svg>`,helps:[
        {title:'Che cosa puoi ricavare dal perimetro?', text:`Il semiperimetro è ${P}:2=${P/2} cm.`, scene:1},
        {title:'Come trovi la base?', text:`b=${P/2}−${h}=${b} cm.`, scene:2},
        {title:'Ora quale figura puoi osservare?', text:'La diagonale è l’ipotenusa del triangolo rettangolo formato da base e altezza.', scene:3},
        {title:'Mostrami la soluzione', text:`d=√(${b}²+${h}²)=${d} cm.`, scene:3}
      ]};
    }
  },
rectDiagonalFromSumRatio:{
    figures:['rettangolo'],strategies:['somma','rapporto','UF','pitagora','diagonale'],
    generate(){
      const [h,b,d]=pickVariant('rectDiagonalFromSumRatio',PYTHAGOREAN_VARIANTS.filter(([h,b])=>h!==b)),g=gcd(h,b),m=h/g,n=b/g,u=g,sum=h+b,total=m+n,s=18,w=n*s,hh=m*s,x=260-w/2,y=310-hh;
      return {debugNew:true,text:`La somma della base e dell’altezza di un rettangolo è ${sum} cm. L’altezza è i ${m}/${n} della base. Calcola la diagonale.`,notes:['Rappresenta altezza e base con UF.','La somma delle UF corrisponde alla somma delle dimensioni.','Trova base e altezza.','Poi usa il triangolo rettangolo formato dalla diagonale.'],svg:`<svg viewBox="0 0 520 410"><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="350" text-anchor="middle">h = ${m} UF; b = ${n} UF</text><g data-v="1" opacity="0"><line x1="${x}" y1="310" x2="${x+w}" y2="310" stroke="#2f9e83" stroke-width="7"/>${ufTicks(x,310,x+w,310,n)}<line x1="${x}" y1="${y}" x2="${x}" y2="310" stroke="#46a6dc" stroke-width="7"/>${ufTicks(x,y,x,310,m,'#46a6dc')}</g><g data-v="2" opacity="0"><text class="label-unit" x="260" y="385" text-anchor="middle">${total} UF = ${sum} cm → 1 UF = ${u} cm</text></g><g data-v="3" opacity="0"><line class="aux" x1="${x}" y1="310" x2="${x+w}" y2="${y}" stroke-width="4"/></g></svg>`,helps:[
        {title:'Come rappresento il rapporto?', text:`h=${m} UF e b=${n} UF.`, scene:1},
        {title:'Quanto vale una UF?', text:`${m}+${n}=${total} UF; ${sum}:${total}=${u} cm.`, scene:2},
        {title:'Quali sono le dimensioni?', text:`h=${h} cm e b=${b} cm. Ora la diagonale è l’ipotenusa.`, scene:3},
        {title:'Mostrami la soluzione', text:`d=√(${b}²+${h}²)=${d} cm.`, scene:3}
      ]};
    }
  }
};
