const rand = a => a[Math.floor(Math.random()*a.length)];
const gcd=(a,b)=>b?gcd(b,a%b):a;

// Banche numeriche condivise: mantengono i problemi vari ma didatticamente controllati.
// pickVariant evita, quando possibile, di riproporre subito la stessa istanza con “Provane uno simile”.
const lastVariantByFamily={};
function pickVariant(family, variants){
  if(!variants.length) throw new Error(`Nessuna variante disponibile per ${family}`);
  const last=lastVariantByFamily[family];
  const pool=variants.length>1 ? variants.filter(v=>JSON.stringify(v)!==last) : variants;
  const chosen=rand(pool.length?pool:variants);
  lastVariantByFamily[family]=JSON.stringify(chosen);
  return chosen;
}
const cartesian=(...lists)=>lists.reduce((acc,list)=>acc.flatMap(a=>list.map(v=>[...a,v])),[[]]);

// [altezza/cateto verticale, proiezione/cateto orizzontale, ipotenusa]
// Tutte producono risultati interi e rapporti grafici adatti allo schermo.
const PYTHAGOREAN_VARIANTS=[
  [3,4,5],[4,3,5],[6,8,10],[8,6,10],
  [5,12,13],[12,5,13],[8,15,17],[15,8,17],
  [9,12,15],[12,9,15]
];

const FAMILIES={
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
        ['Da dove posso iniziare?',`Il semiperimetro è ${P} : 2 = ${semi} cm. Una base e un’altezza insieme formano il semiperimetro.`,1],
        ['Come uso la differenza?',`Osserva direttamente i lati: la base è lunga come l’altezza più un tratto di ${d} cm.`,2],
        ['Come trovo i lati?',`Togli ${d} dal semiperimetro: ${semi} − ${d} = ${2*h}. Restano due parti uguali, quindi h = ${h} cm e b = ${b} cm.`,3],
        ['Mostrami la soluzione',`h = ${h} cm, b = ${b} cm; A = ${b} × ${h} = ${A} cm².`,3]
      ]};
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
        ['Come rappresento il rapporto?',`Usa la stessa unità di lunghezza: base = ${m} UF, altezza = ${n} UF.`,1],
        ['Come uso l’area?',`Prolunga le divisioni: ottieni ${m} × ${n} = ${UQ} UQ. Ogni UQ è un quadrato di lato 1 UF.`,2],
        ['Quanto vale una UF?',`1 UQ vale ${A} : ${UQ} = ${uqa} cm². Poiché è un quadrato, 1 UF = √${uqa} = ${u} cm.`,3],
        ['Mostrami la soluzione',`1 UF = ${u} cm; base = ${m} × ${u} = ${b} cm; altezza = ${n} × ${u} = ${h} cm.`,4]
      ]};
    }
  },
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
        ['Da dove posso iniziare?','Per calcolare l’area manca l’altezza: tracciala.',1],
        ['Come uso le due basi?',`La parte della base maggiore che resta fuori dalla base minore misura ${big} − ${small} = ${2*p} cm.`,2],
        ['Come trovo il cateto?',`Essendo il trapezio isoscele, i due segmenti laterali sono uguali: ${2*p} : 2 = ${p} cm.`,3],
        ['Sono ancora bloccato/a',`Concentrati sul triangolo rettangolo a sinistra: ipotenusa ${l} cm, un cateto ${p} cm e l’altro cateto è h.`,4],
        ['Mostrami la soluzione',`h = √(${l}² − ${p}²) = ${h} cm; A = (${big} + ${small}) × ${h} : 2 = ${A} cm².`,5]
      ]};
    }
  },
  perimeterRatio:{
    figures:['rettangolo'], strategies:['perimetro','rapporto','UF'],
    generate(){
      const [m,n,u]=pickVariant('perimeterRatio',cartesian([[2,3],[3,4],[3,5],[4,5]],[2,3,4,5]).map(([ratio,u])=>[...ratio,u]));
      const b=n*u,h=m*u,P=2*(b+h),semi=P/2,total=m+n;
      const W=300,H=W*m/n,x=110,y=65,bottom=y+H,cell=W/n;
      return {text:`Un rettangolo ha il perimetro di ${P} cm. La base è i ${n}/${m} dell’altezza. Calcola l’area.`,
      notes:['Osserva il rapporto tra i lati.',`Il semiperimetro misura ${semi} cm.`,`Base e altezza possono essere viste come ${n} UF e ${m} UF.`,`In tutto sono ${total} UF: una UF misura ${u} cm.`,`Quindi b = ${b} cm e h = ${h} cm.`],
      svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect data-geo="shape" x="${x}" y="${y}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="5"/></g>
      <text data-geo="b-label" x="260" y="${bottom+34}" text-anchor="middle">b ?</text><text data-geo="h-label" x="${x-24}" y="${y+H/2}" text-anchor="end">h ?</text>
      <g data-v="1" opacity="0"><text class="label-aux" x="260" y="35" text-anchor="middle">b + h = ${semi} cm</text></g>
      <g data-v="2" opacity="0">${Array.from({length:n},(_,i)=>`<line class="unit" x1="${x+i*cell}" y1="${bottom+8}" x2="${x+(i+1)*cell}" y2="${bottom+8}" stroke-width="5"/>`).join('')}<text class="label-unit" x="260" y="${bottom+58}" text-anchor="middle">b = ${n} UF · h = ${m} UF</text></g>
      <g data-v="3" opacity="0"><text class="label-focus" x="260" y="${bottom+88}" text-anchor="middle">${semi} : ${total} = ${u} cm = 1 UF</text></g></svg>`,
      helps:[['Da dove parto?',`Calcola il semiperimetro: ${P} : 2 = ${semi} cm.`,1],['Come uso il rapporto?',`Rappresenta b con ${n} UF e h con ${m} UF.`,2],['Quanto vale una UF?',`${semi} : ${total} = ${u} cm.`,3],['Mostrami la soluzione',`b=${b} cm, h=${h} cm; A=${b*h} cm².`,3]]};
    }
  },
  triangleIsoPythagoras:{
    figures:['triangolo'], strategies:['altezza','pitagora','area'],
    generate(){
      const [h,p,l]=pickVariant('triangleIsoPythagoras',PYTHAGOREAN_VARIANTS), base=2*p,A=base*h/2;
      const s=Math.min(280/base,190/h),cx=260,yB=270,yT=yB-h*s,xL=cx-p*s,xR=cx+p*s;
      return {text:`Un triangolo isoscele ha la base di ${base} cm e i lati obliqui di ${l} cm. Calcola l’area.`,
      notes:['Osserva la figura.',`Per l’area serve l’altezza.`,`L’altezza divide la base in due parti uguali di ${p} cm.`,`Concentrati sul triangolo rettangolo evidenziato.`,`Ora conosci l’altezza: ${h} cm.`],
      svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="left-leg" x1="${xL}" y1="${yB}" x2="260" y2="${yT}"/><line data-geo="right-leg" x1="260" y1="${yT}" x2="${xR}" y2="${yB}"/><line data-geo="base-left" x1="${xL}" y1="${yB}" x2="260" y2="${yB}"/><line data-geo="base-right" x1="260" y1="${yB}" x2="${xR}" y2="${yB}"/></g><text data-geo="base-label" x="260" y="310" text-anchor="middle">${base} cm</text><text data-geo="left-label" x="${(xL+260)/2-25}" y="${(yB+yT)/2}">${l} cm</text><text data-geo="right-label" x="${(xR+260)/2+12}" y="${(yB+yT)/2}">${l} cm</text>
      <g data-v="1" opacity="0"><line data-geo="height" class="aux" x1="260" y1="${yT}" x2="260" y2="${yB}" stroke-width="4" stroke-dasharray="8 6"/><path data-geo="right-angle" class="aux" d="M260 ${yB-14} H274 V${yB}" fill="none" stroke-width="3"/><text data-geo="h-label" class="label-aux" x="278" y="${(yT+yB)/2}">h ?</text></g>
      <g data-v="2" opacity="0"><text data-geo="half-label" class="label-focus" x="${(xL+260)/2}" y="${yB+28}" text-anchor="middle">${p} cm</text></g>
      <g data-v="4" opacity="0"><text class="label-aux" x="260" y="340" text-anchor="middle">h = ${h} cm → A = ${A} cm²</text></g></svg>`,
      helps:[['Cosa mi manca?',`Per calcolare l’area traccia l’altezza.`,1],['Cosa succede alla base?',`Nel triangolo isoscele l’altezza la divide a metà: ${base}:2=${p} cm.`,2],['Sono ancora bloccato/a',`Osserva il triangolo rettangolo: ipotenusa ${l}, cateto ${p}, h incognita.`,3],['Mostrami la soluzione',`h=√(${l}²−${p}²)=${h} cm; A=${base}×${h}:2=${A} cm².`,4]],
      scenes:{3:{keep:['left-leg','base-left','height','right-angle','h-label','left-label','half-label'],highlight:['left-leg','base-left'],aux:['height']}}};
    }
  },
  rhombusDiagonals:{
    figures:['rombo'], strategies:['diagonali','pitagora','perimetro'],
    generate(){
      const [a,b,l]=pickVariant('rhombusDiagonals',PYTHAGOREAN_VARIANTS),D=2*b,d=2*a,A=D*d/2,P=4*l;
      const sx=12,sy=12,cx=260,cy=165,L=b*sx,S=a*sy;
      return {text:`Un rombo ha le diagonali di ${D} cm e ${d} cm. Calcola l’area e il perimetro.`,notes:['Osserva il rombo.',`Le diagonali si tagliano a metà e sono perpendicolari.`,`Considera uno dei quattro triangoli rettangoli.`,`Il lato del rombo misura ${l} cm.`],
      svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="side1" x1="${cx}" y1="${cy-S}" x2="${cx+L}" y2="${cy}"/><line data-geo="side2" x1="${cx+L}" y1="${cy}" x2="${cx}" y2="${cy+S}"/><line data-geo="side3" x1="${cx}" y1="${cy+S}" x2="${cx-L}" y2="${cy}"/><line data-geo="side4" x1="${cx-L}" y1="${cy}" x2="${cx}" y2="${cy-S}"/></g><text x="260" y="330" text-anchor="middle">D = ${D} cm · d = ${d} cm</text>
      <g data-v="1" opacity="0"><line data-geo="halfD-left" class="aux" x1="${cx-L}" y1="${cy}" x2="${cx}" y2="${cy}"/><line data-geo="halfD-right" class="aux" x1="${cx}" y1="${cy}" x2="${cx+L}" y2="${cy}"/><line data-geo="halfd-top" class="aux" x1="${cx}" y1="${cy-S}" x2="${cx}" y2="${cy}"/><line data-geo="halfd-bottom" class="aux" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy+S}"/><path data-geo="right-angle" class="aux" d="M${cx} ${cy-13} H${cx+13} V${cy}" fill="none" stroke-width="3"/><text class="label-aux" x="${cx+L/2}" y="${cy-12}" text-anchor="middle">${b}</text><text class="label-aux" x="${cx+16}" y="${cy-S/2}" text-anchor="start">${a}</text></g>
      <g data-v="3" opacity="0"><text class="label-focus" x="260" y="305" text-anchor="middle">l = √(${a}² + ${b}²) = ${l} cm</text></g></svg>`,
      helps:[['Cosa so sulle diagonali?','Nel rombo le diagonali sono perpendicolari e si dimezzano a vicenda.',1],['Come trovo il lato?',`Usa un triangolo rettangolo con cateti ${a} cm e ${b} cm.`,2],['E poi?',`Con Pitagora il lato misura ${l} cm.`,3],['Mostrami la soluzione',`A=${D}×${d}:2=${A} cm²; P=4×${l}=${P} cm.`,3]],
      scenes:{2:{keep:['side1','halfD-right','halfd-top','right-angle'],highlight:['side1'],aux:['halfD-right','halfd-top']}}};
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
      helps:[['Come uso le basi?',`La loro differenza è ${big}−${small}=${p} cm.`,1],['Dove guardo ora?',`Osserva il triangolo rettangolo formato da proiezione, altezza e lato obliquo.`,2],['Come trovo h?',`h=√(${l}²−${p}²)=${h} cm.`,3],['Mostrami la soluzione',`A=(${big}+${small})×${h}:2=${A} cm².`,3]],
      scenes:{2:{keep:['leg','projection','height','leg-label','p-label','h-label'],highlight:['leg','projection'],aux:['height']}}};
    }
  },
  compositeDifference:{
    figures:['composta'], strategies:['scomposizione','differenza_aree'],
    generate(){
      const [W,H,w,h]=pickVariant('compositeDifference',cartesian([12,14,16,18],[9,10,12,14],[4,5,6,7],[3,4,5]).filter(([W,H,w,h])=>w<=W/2 && h<=H/2)),A=W*H-w*h;
      const s=Math.min(300/W,210/H),x=105,y=55,cutX=x+(W-w)*s,cutY=y+h*s;
      return {text:`Da un rettangolo di ${W} cm × ${H} cm è stato tolto, nell’angolo in alto a destra, un rettangolo di ${w} cm × ${h} cm. Calcola l’area della figura rimasta.`,notes:['Osserva la figura composta.','Puoi partire da una figura più semplice: il rettangolo esterno.','La parte mancante va sottratta.','Ora confronta le due aree.'],
      svg:`<svg viewBox="0 0 520 350"><path data-geo="shape" d="M${x} ${y} H${cutX} V${cutY} H${x+W*s} V${y+H*s} H${x} Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><text x="260" y="315" text-anchor="middle">rettangolo esterno: ${W} × ${H} cm</text><g data-v="1" opacity="0"><rect data-geo="outer" x="${x}" y="${y}" width="${W*s}" height="${H*s}" fill="none" class="aux" stroke-width="4" stroke-dasharray="8 6"/></g><g data-v="2" opacity="0"><rect data-geo="cut" x="${cutX}" y="${y}" width="${w*s}" height="${h*s}" fill="rgba(255,104,75,.10)" class="focus" stroke-width="5"/><text class="label-focus" x="${cutX+w*s/2}" y="${y+h*s/2}" text-anchor="middle">${w}×${h}</text></g><g data-v="3" opacity="0"><text class="label-aux" x="260" y="342" text-anchor="middle">${W*H} − ${w*h} = ${A} cm²</text></g></svg>`,
      helps:[['Da quale figura parto?',`Immagina il rettangolo esterno completo: area ${W}×${H}.`,1],['Che cosa devo togliere?',`Il rettangolo mancante misura ${w}×${h} cm.`,2],['Come combino le aree?',`Sottrai l’area mancante dall’area esterna.`,3],['Mostrami la soluzione',`${W*H}−${w*h}=${A} cm².`,3]]};
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
  svg.querySelectorAll('.dimmed,.focus-hidden,.geo-highlight,.geo-aux-highlight,.geo-label-highlight,.geo-unit-highlight').forEach(el=>el.classList.remove('dimmed','focus-hidden','geo-highlight','geo-aux-highlight','geo-label-highlight','geo-unit-highlight'));
  svg.querySelectorAll('[data-v]').forEach(g=>g.setAttribute('opacity','0'));
  if(state.openHelp===null)return;
  const step=state.instance.helps[state.openHelp][2];
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
    (scene.highlight||[]).forEach(id=>q(id)?.classList.add('geo-highlight'));
    (scene.aux||[]).forEach(id=>q(id)?.classList.add('geo-aux-highlight'));
    (scene.unit||[]).forEach(id=>q(id)?.classList.add('geo-unit-highlight'));
    (scene.labels||[]).forEach(id=>q(id)?.classList.add('geo-label-highlight'));
  }

  if(state.family==='perimeterDiff'){
    const q=id=>svg.querySelector(`[data-geo=\"${id}\"]`);
    if(step===1){
      // Mostra il semiperimetro sulla figura stessa: base + altezza.
      q('height')?.classList.add('geo-aux-highlight');
      q('base-h')?.classList.add('geo-highlight');
      q('base-d')?.classList.add('geo-highlight');
      q('top')?.classList.add('dimmed'); q('right')?.classList.add('dimmed');
    }
    if(step>=2){
      // Focus selettivo: h arancione; b = h arancione + d verde.
      q('top')?.classList.add('dimmed'); q('right')?.classList.add('dimmed');
      q('height')?.classList.add('geo-highlight');
      q('base-h')?.classList.add('geo-highlight');
      q('base-d')?.classList.add('geo-unit-highlight');
      q('height-label')?.classList.add('focus-hidden');
      q('base-label')?.classList.add('focus-hidden');
    }
    return;
  }

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
