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
      <g data-v="2" opacity="0">${Array.from({length:n},(_,i)=>`<line class="unit" x1="${x+i*cell}" y1="${bottom+8}" x2="${x+(i+1)*cell}" y2="${bottom+8}" stroke-width="5"/>`).join('')}<text class="label-unit" x="260" y="${bottom+58}" text-anchor="middle">b = ${n} UF; h = ${m} UF</text></g>
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
      const cx=260,cy=165,L=150,S=105;
      return {text:`Un rombo ha diagonale maggiore ${D} cm e diagonale minore ${d} cm. Calcola l’area e il perimetro.`,
      notes:['Osserva il rombo.','Le diagonali sono perpendicolari e si tagliano a metà.','Ora conosci le due semidiagonali.','Concentrati su uno dei quattro triangoli rettangoli.','Usa Pitagora per trovare il lato.'],
      svg:`<svg viewBox="0 0 520 370"><g class="geo-base"><line data-geo="side1" x1="${cx}" y1="${cy-S}" x2="${cx+L}" y2="${cy}"/><line data-geo="side2" x1="${cx+L}" y1="${cy}" x2="${cx}" y2="${cy+S}"/><line data-geo="side3" x1="${cx}" y1="${cy+S}" x2="${cx-L}" y2="${cy}"/><line data-geo="side4" x1="${cx-L}" y1="${cy}" x2="${cx}" y2="${cy-S}"/></g>
      <text x="95" y="326">D = ${D} cm</text><text x="315" y="326">d = ${d} cm</text>
      <g data-v="1" opacity="0"><line data-geo="D-left" class="aux" x1="${cx-L}" y1="${cy}" x2="${cx}" y2="${cy}"/><line data-geo="D-right" class="aux" x1="${cx}" y1="${cy}" x2="${cx+L}" y2="${cy}"/><line data-geo="d-top" class="aux" x1="${cx}" y1="${cy-S}" x2="${cx}" y2="${cy}"/><line data-geo="d-bottom" class="aux" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy+S}"/><path data-geo="right-angle" class="aux" d="M${cx} ${cy-13} H${cx+13} V${cy}" fill="none" stroke-width="3"/></g>
      <g data-v="2" opacity="0"><text data-geo="b-label" class="label-aux" x="${cx+L/2}" y="${cy-12}" text-anchor="middle">D/2 = ${b} cm</text><text data-geo="a-label" class="label-aux" x="${cx+16}" y="${cy-S/2}" text-anchor="start">d/2 = ${a} cm</text></g>
      <g data-v="4" opacity="0"><text class="label-focus" x="260" y="360" text-anchor="middle">l = √(${a}² + ${b}²) = ${l} cm</text></g></svg>`,
      helps:[['Che cosa mostrano le diagonali?','Osserva il loro incrocio: sono perpendicolari e ciascuna viene divisa in due parti uguali.',1],['Quanto misurano le semidiagonali?',`D/2 = ${b} cm e d/2 = ${a} cm.`,2],['Dove posso usare questi dati?','Concentrati su un solo quarto del rombo: compare un triangolo rettangolo.',3],['Quale relazione posso usare?',`Nel triangolo evidenziato i cateti misurano ${a} cm e ${b} cm: puoi usare Pitagora.`,4],['Mostrami la soluzione',`l=√(${a}²+${b}²)=${l} cm; A=${D}×${d}:2=${A} cm²; P=4×${l}=${P} cm.`,4]],
      scenes:{3:{keep:['side1','D-right','d-top','right-angle','b-label','a-label'],highlight:['side1'],aux:['D-right','d-top','right-angle']},4:{keep:['side1','D-right','d-top','right-angle','b-label','a-label'],highlight:['side1'],aux:['D-right','d-top','right-angle']}}};
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

// --- v0.5: tipologie cognitive aggiuntive ---
// Ogni tipologia cambia il percorso matematico, non soltanto i numeri.
Object.assign(FAMILIES, {
  rectDiffKnownSide:{
    figures:['rettangolo'], strategies:['differenza','perimetro','area'],
    generate(){
      const [h,d]=pickVariant('rectDiffKnownSide',cartesian([6,8,10,12],[3,4,5,6])); const b=h+d,P=2*(b+h),A=b*h;
      const W=280,H=W*h/b,x=120,y=65;
      return {text:`La base di un rettangolo supera l’altezza di ${d} cm. L’altezza misura ${h} cm. Calcola perimetro e area.`,notes:['Individua sul disegno la differenza tra i lati.',`La base è l’altezza più ${d} cm.`,`Ora conosci entrambe le dimensioni.`],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect data-geo="shape" x="${x}" y="${y}" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="${x-20}" y="${y+H/2}" text-anchor="end">${h} cm</text><text x="260" y="${y+H+35}" text-anchor="middle">b ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="${y+H+68}" text-anchor="middle">b = ${h} + ${d} = ${b} cm</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="${y+H+98}" text-anchor="middle">P = ${P} cm; A = ${A} cm²</text></g></svg>`,helps:[['Come uso la differenza?',`La base è ${h}+${d}=${b} cm.`,1],['E adesso?',`Conosci b e h: puoi applicare direttamente perimetro e area.`,2],['Mostrami la soluzione',`P=2×(${b}+${h})=${P} cm; A=${b}×${h}=${A} cm².`,2]]};
    }
  },
  rectDiffFromAreaSide:{
    figures:['rettangolo'], strategies:['formula_inversa','area','differenza','perimetro'],
    generate(){
      const [h,d]=pickVariant('rectDiffFromAreaSide',cartesian([5,6,8,10],[2,3,4,5])); const b=h+d,A=b*h,P=2*(b+h);
      return {text:`Un rettangolo ha area ${A} cm² e altezza ${h} cm. Di quanti centimetri la base supera l’altezza? Calcola anche il perimetro.`,notes:['Prima ricava la base dall’area.','Confronta poi le due dimensioni.','Infine calcola il perimetro.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect data-geo="shape" x="110" y="70" width="300" height="170" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="90" y="160" text-anchor="end">h=${h}</text><text x="260" y="275" text-anchor="middle">A=${A} cm²; b ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b = A : h = ${A} : ${h} = ${b}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="342" text-anchor="middle">b−h=${d} cm · P=${P} cm</text></g></svg>`,helps:[['Quale lato posso ricavare?',`Usa la formula inversa dell’area: b=A:h.`,1],['Come trovo la differenza?',`${b}−${h}=${d} cm.`,2],['Mostrami la soluzione',`b=${b} cm; differenza=${d} cm; P=2×(${b}+${h})=${P} cm.`,2]]};
    }
  },
  rectRatioKnownHeight:{
    figures:['rettangolo'], strategies:['rapporto','frazione','area'],
    generate(){
      const [m,n,h]=pickVariant('rectRatioKnownHeight',[[2,3,12],[3,4,12],[3,5,15],[4,5,20]]); const b=h*m/n,A=b*h,P=2*(b+h);
      return {text:`In un rettangolo la base è i ${m}/${n} dell’altezza. L’altezza misura ${h} cm. Calcola base, area e perimetro.`,notes:['Qui non serve ricavare il valore di una UF dall’area.','Calcola direttamente la frazione dell’altezza.','Poi usa le formule di area e perimetro.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="120" y="60" width="280" height="190" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="95" y="160" text-anchor="end">${h} cm</text><text x="260" y="285" text-anchor="middle">b = ${m}/${n} di h</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="320" text-anchor="middle">b=${h}×${m}:${n}=${b} cm</text></g></svg>`,helps:[['Come uso la frazione?',`Calcola i ${m}/${n} di ${h}.`,1],['Ora cosa conosco?','Hai entrambe le dimensioni: usa le formule dirette.',1],['Mostrami la soluzione',`b=${b} cm; A=${A} cm²; P=${P} cm.`,1]]};
    }
  },
  rectRatioFromDimensions:{
    figures:['rettangolo'], strategies:['rapporto','riduzione_frazione','area'],
    generate(){
      const [m,n,u]=pickVariant('rectRatioFromDimensions',cartesian([[2,3],[3,4],[3,5],[4,5]],[2,3,4]).map(([r,u])=>[...r,u])); const b=m*u,h=n*u,A=b*h,g=gcd(b,h);
      return {text:`Un rettangolo misura ${b} cm × ${h} cm. Esprimi la base come frazione dell’altezza e calcola l’area.`,notes:['Confronta le due dimensioni.','Scrivi b/h e riduci la frazione ai minimi termini.','Poi calcola l’area.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="120" y="60" width="280" height="190" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="260" y="285" text-anchor="middle">b=${b} cm · h=${h} cm</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="320" text-anchor="middle">b/h = ${b}/${h} = ${b/g}/${h/g}</text></g></svg>`,helps:[['Come trovo il rapporto?',`Scrivi ${b}/${h} e semplifica.`,1],['Che cosa significa?',`La base è i ${b/g}/${h/g} dell’altezza.`,1],['Mostrami la soluzione',`b/h=${b/g}/${h/g}; A=${b}×${h}=${A} cm².`,1]]};
    }
  },
  isoTrapBasesHeight:{
    figures:['trapezio'], strategies:['differenza_basi','proiezione','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('isoTrapBasesHeight',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s])).filter(([h,p])=>p<=12)); const big=small+2*p,P=big+small+2*l;
      return {text:`Un trapezio isoscele ha basi ${big} cm e ${small} cm e altezza ${h} cm. Calcola il perimetro.`,notes:['Per il perimetro manca il lato obliquo.','La differenza delle basi si divide in due proiezioni uguali.','Con altezza e proiezione ottieni un triangolo rettangolo.'],svg:`<svg viewBox="0 0 520 350"><path d="M70 265 L450 265 L380 85 L140 85 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="310" text-anchor="middle">B=${big}; b=${small}; h=${h}</text><g data-v="1" opacity="0"><line class="aux" x1="140" y1="85" x2="140" y2="265" stroke-width="4" stroke-dasharray="8 6"/><text class="label-focus" x="105" y="288" text-anchor="middle">${p}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="340" text-anchor="middle">l=√(${h}²+${p}²)=${l} → P=${P}</text></g></svg>`,helps:[['Come trovo il lato obliquo?',`Calcola prima (B−b):2 = (${big}−${small}):2 = ${p} cm.`,1],['Quale figura compare?',`Altezza ${h} e proiezione ${p} sono i cateti di un triangolo rettangolo.`,1],['Mostrami la soluzione',`l=√(${h}²+${p}²)=${l} cm; P=${big}+${small}+2×${l}=${P} cm.`,2]]};
    }
  },
  isoTrapAreaBases:{
    figures:['trapezio'], strategies:['formula_inversa','area','differenza_basi','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('isoTrapAreaBases',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s])).filter(([h,p])=>p<=12)); const big=small+2*p,A=(big+small)*h/2,P=big+small+2*l;
      return {text:`Un trapezio isoscele ha area ${A} cm² e basi ${big} cm e ${small} cm. Calcola altezza e perimetro.`,notes:['Prima ricava l’altezza con la formula inversa dell’area.','Poi trova la proiezione del lato obliquo.','Usa Pitagora per il lato.'],svg:`<svg viewBox="0 0 520 350"><path d="M70 265 L450 265 L380 85 L140 85 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="310" text-anchor="middle">A=${A} · B=${big} · b=${small}</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="338" text-anchor="middle">h=2A:(B+b)=${h} cm</text></g></svg>`,helps:[['Quale formula inversa serve?',`h=2A:(B+b).`,1],['Come trovo il lato?',`La proiezione è (${big}−${small}):2=${p} cm; usa Pitagora con h=${h}.`,1],['Mostrami la soluzione',`h=${h} cm; l=${l} cm; P=${P} cm.`,1]]};
    }
  },
  triangleIsoBaseArea:{
    figures:['triangolo'], strategies:['formula_inversa','area','pitagora','perimetro'],
    generate(){
      const [h,p,l]=pickVariant('triangleIsoBaseArea',PYTHAGOREAN_VARIANTS); const base=2*p,A=base*h/2,P=base+2*l;
      return {text:`Un triangolo isoscele ha base ${base} cm e area ${A} cm². Calcola il perimetro.`,notes:['Per il perimetro manca il lato obliquo.','Dall’area puoi ricavare l’altezza.','L’altezza dimezza la base e crea un triangolo rettangolo.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L260 65 L430 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="310" text-anchor="middle">b=${base} cm · A=${A} cm²</text><g data-v="1" opacity="0"><line class="aux" x1="260" y1="65" x2="260" y2="270" stroke-width="4" stroke-dasharray="8 6"/><text class="label-focus" x="278" y="170">h=${h}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="340" text-anchor="middle">l=√(${h}²+${p}²)=${l} → P=${P}</text></g></svg>`,helps:[['Come ricavo l’altezza?',`h=2A:b = 2×${A}:${base}=${h} cm.`,1],['Come trovo il lato?',`La semibase è ${p} cm: usa Pitagora con ${h} e ${p}.`,2],['Mostrami la soluzione',`l=${l} cm; P=${base}+2×${l}=${P} cm.`,2]]};
    }
  },
  triangleIsoSideHeight:{
    figures:['triangolo'], strategies:['pitagora','base','perimetro','area'],
    generate(){
      const [h,p,l]=pickVariant('triangleIsoSideHeight',PYTHAGOREAN_VARIANTS); const base=2*p,A=base*h/2,P=base+2*l;
      return {text:`Un triangolo isoscele ha lati obliqui di ${l} cm e altezza ${h} cm. Calcola base, perimetro e area.`,notes:['L’altezza divide il triangolo in due triangoli rettangoli.','Conosci ipotenusa e un cateto: ricava la semibase.','Raddoppia la semibase.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L260 65 L430 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><line class="aux" x1="260" y1="65" x2="260" y2="270" stroke-width="4" stroke-dasharray="8 6"/><text x="285" y="165">h=${h}</text><text x="150" y="165">l=${l}</text><g data-v="1" opacity="0"><text class="label-focus" x="175" y="295" text-anchor="middle">b/2=√(${l}²−${h}²)=${p}</text></g></svg>`,helps:[['Dove applico Pitagora?',`Su metà triangolo: ipotenusa ${l}, cateto ${h}, semibase incognita.`,1],['Come ottengo la base?',`La semibase è ${p} cm, quindi b=${2*p} cm.`,1],['Mostrami la soluzione',`b=${base} cm; P=${P} cm; A=${A} cm².`,1]]};
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
      helps:[['Come trovo la diagonale mancante?','Parti dalla formula A = D × d : 2 e isolane la diagonale incognita.',1],['Che cosa posso osservare ora?','Ora conosci entrambe le diagonali: mostrale sul rombo.',2],['Quale proprietà mi serve?','Le diagonali del rombo si dimezzano e sono perpendicolari.',3],['Dove posso usare questi dati?','Concentrati su un quarto del rombo: compare un triangolo rettangolo.',4],['Mostrami la soluzione',`d=2×${A}:${D}=${d} cm; l=√(${a}²+${b}²)=${l} cm; P=4×${l}=${P} cm.`,4]],
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
      helps:[['Che cosa succede alla diagonale nota?','La diagonale viene dimezzata; le due diagonali si incontrano ad angolo retto.',1],['Dove posso usare lato e semidiagonale?','Concentrati su un quarto del rombo: hai un triangolo rettangolo.',2],['Come trovo la semidiagonale?',`Hai ipotenusa ${l} cm e un cateto D/2=${b} cm: usa Pitagora inverso.`,3],['Ho trovato tutta la diagonale?','No: il valore trovato è d/2. Per ottenere d devi raddoppiarlo.',4],['Mostrami la soluzione',`d/2=√(${l}²−${b}²)=${a} cm; d=${d} cm; A=${D}×${d}:2=${A} cm².`,4]],
      scenes:{2:{keep:['side1','D-right','d-top','right-angle','halfD-label','unknown-half'],highlight:['side1'],aux:['D-right','d-top','right-angle']},3:{keep:['side1','D-right','d-top','right-angle','halfD-label','unknown-half'],highlight:['side1'],aux:['D-right','d-top','right-angle']}}};
    }
  },
  rightTrapBasesHeight:{
    figures:['trapezio'], strategies:['differenza_basi','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('rightTrapBasesHeight',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s]))); const big=small+p,P=big+small+h+l;
      return {text:`Un trapezio rettangolo ha basi ${big} cm e ${small} cm e altezza ${h} cm. Calcola il perimetro.`,notes:['Manca il lato obliquo.','La differenza delle basi è un cateto del triangolo rettangolo laterale.','Usa Pitagora.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L90 80 L360 80 L440 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="315" text-anchor="middle">B=${big}; b=${small}; h=${h}</text><g data-v="1" opacity="0"><text class="label-focus" x="400" y="295" text-anchor="middle">B−b=${p}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="345" text-anchor="middle">l=${l} → P=${P}</text></g></svg>`,helps:[['Come trovo la proiezione?',`${big}−${small}=${p} cm.`,1],['Come trovo il lato obliquo?',`l=√(${h}²+${p}²)=${l} cm.`,2],['Mostrami la soluzione',`P=${big}+${small}+${h}+${l}=${P} cm.`,2]]};
    }
  },
  rightTrapAreaBases:{
    figures:['trapezio'], strategies:['formula_inversa','area','differenza_basi','pitagora','perimetro'],
    generate(){
      const [h,p,l,small]=pickVariant('rightTrapAreaBases',PYTHAGOREAN_VARIANTS.flatMap(t=>[8,10,12].map(s=>[...t,s]))); const big=small+p,A=(big+small)*h/2,P=big+small+h+l;
      return {text:`Un trapezio rettangolo ha area ${A} cm² e basi ${big} cm e ${small} cm. Calcola altezza e perimetro.`,notes:['Ricava l’altezza dalla formula inversa dell’area.','La differenza delle basi dà il cateto orizzontale.','Poi trova il lato obliquo.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L90 80 L360 80 L440 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="315" text-anchor="middle">A=${A} · B=${big} · b=${small}</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="345" text-anchor="middle">h=2A:(B+b)=${h}</text></g></svg>`,helps:[['Come trovo h?',`h=2A:(B+b)=${h} cm.`,1],['E il lato obliquo?',`B−b=${p}; l=√(${h}²+${p}²)=${l} cm.`,1],['Mostrami la soluzione',`h=${h} cm; l=${l} cm; P=${P} cm.`,1]]};
    }
  },
  compositeFindCut:{
    figures:['composta'], strategies:['differenza_aree','formula_inversa'],
    generate(){
      const [W,H,w,h]=pickVariant('compositeFindCut',[[14,10,4,3],[16,12,6,4],[18,12,6,5],[20,14,8,5]]); const outer=W*H,remain=outer-w*h;
      return {text:`Una figura si ottiene togliendo da un rettangolo di ${W} cm × ${H} cm un rettangolo largo ${w} cm. L’area rimasta è ${remain} cm². Quanto è alto il rettangolo tolto?`,notes:['Calcola l’area del rettangolo esterno.','La differenza tra area esterna e area rimasta è l’area del ritaglio.','Con area e base del ritaglio ricava la sua altezza.'],svg:`<svg viewBox="0 0 520 350"><rect x="100" y="55" width="320" height="220" fill="none" stroke="currentColor" stroke-width="5"/><rect x="320" y="55" width="100" height="80" fill="none" class="focus" stroke-width="5"/><text x="260" y="315" text-anchor="middle">esterno ${W}×${H} · rimane ${remain} cm²</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="345" text-anchor="middle">A ritaglio=${outer}−${remain}=${w*h}</text></g></svg>`,helps:[['Quanto vale l’area tolta?',`${W}×${H}−${remain}=${w*h} cm².`,1],['Come trovo l’altezza?',`h=A:b = ${w*h}:${w}=${h} cm.`,1],['Mostrami la soluzione',`Il rettangolo tolto è ${w}×${h} cm.`,1]]};
    }
  },
  compositeFindOuter:{
    figures:['composta'], strategies:['somma_aree','formula_inversa'],
    generate(){
      const [W,H,w,h]=pickVariant('compositeFindOuter',[[14,10,4,3],[16,12,6,4],[18,12,6,5],[20,14,8,5]]); const remain=W*H-w*h;
      return {text:`Da un rettangolo alto ${H} cm è stato tolto un rettangolo di ${w} cm × ${h} cm. La figura rimasta ha area ${remain} cm². Quanto era larga la figura rettangolare iniziale?`,notes:['Ricostruisci prima l’area del rettangolo intero.','Somma area rimasta e area tolta.','Poi usa A=b×h al contrario.'],svg:`<svg viewBox="0 0 520 350"><rect x="100" y="55" width="320" height="220" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="8 6"/><rect x="320" y="55" width="100" height="80" fill="none" class="focus" stroke-width="5"/><text x="260" y="315" text-anchor="middle">h esterna=${H} · area rimasta=${remain}</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="345" text-anchor="middle">A intera=${remain}+${w*h}=${W*H}</text></g></svg>`,helps:[['Come ricostruisco l’area intera?',`Somma ${remain}+${w*h}=${W*H} cm².`,1],['Come trovo la larghezza?',`b=A:h=${W*H}:${H}=${W} cm.`,1],['Mostrami la soluzione',`La larghezza iniziale era ${W} cm.`,1]]};
    }
  },
  rectPerimeterKnownBase:{
    figures:['rettangolo'], strategies:['perimetro','formula_inversa','rapporto'],
    generate(){
      const [b,h]=pickVariant('rectPerimeterKnownBase',[[12,8],[15,10],[16,12],[20,12],[20,16]]); const P=2*(b+h),g=gcd(b,h);
      return {text:`Un rettangolo ha perimetro ${P} cm e base ${b} cm. Calcola l’altezza ed esprimi il rapporto base : altezza ai minimi termini.`,notes:['Dal perimetro ricava prima il semiperimetro.','Togli la base per ottenere l’altezza.','Solo alla fine confronta i due lati.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="110" y="65" width="300" height="180" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="260" y="282" text-anchor="middle">P=${P} cm; b=${b} cm</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b+h=${P/2} → h=${h}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="345" text-anchor="middle">b:h=${b/g}:${h/g}</text></g></svg>`,helps:[['Da dove parto?',`Il semiperimetro è ${P}:2=${P/2} cm.`,1],['Come trovo h?',`${P/2}−${b}=${h} cm.`,1],['Come scrivo il rapporto?',`Riduci ${b}:${h} dividendo per ${g}.`,2],['Mostrami la soluzione',`h=${h} cm; b:h=${b/g}:${h/g}.`,2]]};
    }
  },
  rectPerimeterDiffRatio:{
    figures:['rettangolo'], strategies:['perimetro','differenza','rapporto'],
    generate(){
      const [h,d]=pickVariant('rectPerimeterDiffRatio',[[6,3],[8,4],[9,6],[10,5],[12,6]]); const b=h+d,P=2*(b+h),g=gcd(b,h);
      return {text:`Un rettangolo ha perimetro ${P} cm e la base supera l’altezza di ${d} cm. Dopo aver trovato i lati, esprimi il rapporto base : altezza ai minimi termini.`,notes:['Risolvi prima la relazione tra somma e differenza.','Poi confronta i due lati ottenuti.','Il rapporto va ridotto ai minimi termini.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><rect x="110" y="65" width="300" height="180" fill="none" stroke="currentColor" stroke-width="5"/></g><text x="260" y="282" text-anchor="middle">P=${P}; b−h=${d}</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b+h=${P/2}; h=(${P/2}−${d}):2=${h}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="345" text-anchor="middle">b:h=${b/g}:${h/g}</text></g></svg>`,helps:[['Come trovo i lati?',`Dal semiperimetro ${P/2} togli la differenza ${d}, poi dividi per 2.`,1],['E la base?',`b=${h}+${d}=${b} cm.`,1],['Come ottengo il rapporto?',`Riduci ${b}:${h} dividendo per ${g}.`,2],['Mostrami la soluzione',`b=${b}, h=${h}; rapporto=${b/g}:${h/g}.`,2]]};
    }
  }

});


// --- Figure composte v0.6.1 -----------------------------------------------
// Ogni struttura possiede un vero segmento condiviso. Gli aiuti evidenziano
// quell'oggetto SVG: nessuna linea ausiliaria disegnata a coordinate arbitrarie.
delete FAMILIES.compositeDifference;
delete FAMILIES.compositeFindCut;
delete FAMILIES.compositeFindOuter;

const COMPOSITE_VARIANTS={
  rectRect:[[10,6,4,4],[12,7,5,5],[14,8,6,4],[15,9,5,6],[16,10,6,5],[18,10,8,6]],
  squareTri:[[6,4],[8,3],[8,6],[10,12],[12,5],[16,6]],                 // [base condivisa, h triangolo]
  rectTri:[[6,8,4],[8,10,3],[8,12,6],[10,14,12],[12,16,5],[16,18,6]], // [base, h rett, h tri]
  squareTrap:[[10,6,4],[12,6,4],[14,8,3],[16,10,4],[18,8,4],[20,12,4]], // [B condivisa,b,h]
  rectTrap:[[10,7,6,4],[12,8,6,4],[14,9,8,3],[16,10,10,4],[18,11,12,4],[20,12,14,4]],
  triTrap:[[6,4,10,4],[8,3,14,3],[8,6,14,4],[10,12,20,12],[12,5,22,4],[16,6,22,3]], // [b tri,h tri,B trap,h trap]
  rectRhomb:[[10,7,6],[10,8,8],[13,8,5],[13,9,12],[15,10,9],[17,10,8]] // [lato condiviso,h rett,h rombo]
};
const fmt=n=>Number.isInteger(n)?String(n):String(Math.round(n*100)/100).replace('.',',');

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
  return {text,notes:['Osserva la sagoma come un’unica figura.',help1,help2,solution],svg:compSvg(kind,v,task,task==='perimeter'?'Questo è il lato comune':task==='inverse'?'Separa qui le due aree':'Qui si incontrano le due figure'),helps:[['Come posso scomporla?',help1,1],['Qual è il passo successivo?',help2,1],['Mostrami la soluzione',solution,1]],scenes:{}};
}

// --- v0.7: prima libreria Parallelogrammi ---
Object.assign(FAMILIES, {
  parallelogramArea:{
    figures:['parallelogramma'], strategies:['perimetro','relazioni','area'],
    make(){
      const [b,l,k]=pickVariant('parallelogramArea',[[12,8,2],[15,9,3],[16,10,2],[18,11,3],[20,13,2],[14,8,2]]); const h=b/k,P=2*(b+l),A=b*h;
      const x=85,y=85,W=300,H=170,O=75;
      return {text:`Un parallelogramma ha perimetro ${P} cm e lato obliquo ${l} cm. La base è ${k} volte l’altezza relativa ad essa. Calcola l’area.`,notes:['Dal perimetro ricava prima la base.','La relazione tra base e altezza permette di trovare l’altezza.','Solo alla fine usa A = b × h.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="base" x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}"/><line data-geo="right-side" x1="${x+W}" y1="${y+H}" x2="${x+W+O}" y2="${y}"/><line data-geo="top" x1="${x+W+O}" y1="${y}" x2="${x+O}" y2="${y}"/><line data-geo="left-side" x1="${x+O}" y1="${y}" x2="${x}" y2="${y+H}"/></g><text x="260" y="38" text-anchor="middle">P = ${P} cm</text><text x="${x+W+O+14}" y="${y+H/2}" text-anchor="start">l = ${l} cm</text><text x="${x+W/2}" y="${y+H+35}" text-anchor="middle">b ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b + l = ${P}:2 = ${P/2} cm</text></g><g data-v="2" opacity="0"><text class="label-focus" x="260" y="340" text-anchor="middle">b = ${b} cm; h = b:${k} = ${h} cm</text><line data-geo="height" class="aux" x1="${x+O}" y1="${y}" x2="${x+O}" y2="${y+H}" stroke-width="4" stroke-dasharray="8 6"/></g></svg>`,helps:[['Quale informazione posso ottenere subito?',`Il perimetro comprende due basi e due lati obliqui: il semiperimetro è ${P}:2=${P/2} cm.`,1],['Come uso il lato già noto?',`Nel semiperimetro vale b+l=${P/2}. Con l=${l} cm puoi ricavare la misura che manca.`,1],['Come collego la nuova misura all’altezza?',`Ora usa la relazione b=${k}h: l’altezza è la base divisa per ${k}.`,2],['Quali misure servono per l’area?','Metti a fuoco base e altezza perpendicolare: sono le due misure che entrano nella formula dell’area.',2],['Mostrami la soluzione',`b=${b} cm; h=${h} cm; A=${b}×${h}=${A} cm².`,2]],scenes:{1:{highlight:['base']},2:{dim:['left-side','right-side'],highlight:['base'],aux:['height']}}};
    }
  },
  parallelogramHeightFromArea:{
    figures:['parallelogramma'], strategies:['perimetro','formula_inversa','area','altezza'],
    make(){
      const [b,l,h]=pickVariant('parallelogramHeightFromArea',[[12,8,7],[15,9,8],[16,10,9],[18,11,10],[20,13,12],[14,8,9]]); const A=b*h,P=2*(b+l);
      const x=85,y=85,W=300,H=170,O=75;
      return {text:`Un parallelogramma ha perimetro ${P} cm, lato obliquo ${l} cm e area ${A} cm². Calcola la base e l’altezza relativa alla base.`,notes:['Il perimetro permette di ricavare la base.','Poi l’area permette di ricavare l’altezza con una formula inversa.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="base" x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}"/><line data-geo="right-side" x1="${x+W}" y1="${y+H}" x2="${x+W+O}" y2="${y}"/><line data-geo="top" x1="${x+W+O}" y1="${y}" x2="${x+O}" y2="${y}"/><line data-geo="left-side" x1="${x+O}" y1="${y}" x2="${x}" y2="${y+H}"/></g><text x="260" y="38" text-anchor="middle">P = ${P} cm; A = ${A} cm²</text><text x="${x+W+O+14}" y="${y+H/2}">l = ${l} cm</text><text x="${x+W/2}" y="${y+H+35}" text-anchor="middle">b ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b + l = ${P}:2 = ${P/2} cm → b = ${b} cm</text></g><g data-v="2" opacity="0"><line data-geo="height" class="aux" x1="${x+O}" y1="${y}" x2="${x+O}" y2="${y+H}" stroke-width="4" stroke-dasharray="8 6"/><text class="label-aux" x="${x+O+18}" y="${y+H/2}">h ?</text><text class="label-focus" x="260" y="340" text-anchor="middle">h = A:b = ${A}:${b} = ${h} cm</text></g></svg>`,helps:[['Che cosa posso ricavare dal perimetro?',`Il semiperimetro è ${P}:2=${P/2} cm e corrisponde alla somma di base e lato obliquo.`,1],['Come uso il lato già noto?',`Con b+l=${P/2} e l=${l} cm puoi ricavare la base.`,1],['Quale misura manca ancora?',`Per usare A=b×h conosci già A e b: resta da determinare l’altezza perpendicolare.`,2],['Come posso ricavarla?',`Dalla formula dell’area: h=A:b=${A}:${b}=${h} cm.`,2],['Mostrami la soluzione',`b=${b} cm; h=${h} cm.`,2]],scenes:{1:{highlight:['base']},2:{dim:['left-side','right-side'],highlight:['base'],aux:['height']}}};
    }
  },
  parallelogramPerimeterRelation:{
    figures:['parallelogramma'], strategies:['perimetro','differenza','area'],
    generate(){
      const [side,d,h]=pickVariant('parallelogramPerimeterRelation',[[7,4,6],[8,5,7],[9,6,8],[10,5,8],[11,6,9],[12,7,10]]); const b=side+d,P=2*(b+side),A=b*h;
      const scale=Math.min(300/b,165/h),W=b*scale,H=h*scale,O=Math.min(70,side*4),x=90,y=72;
      return {text:`Un parallelogramma ha perimetro ${P} cm. La base supera il lato obliquo di ${d} cm. L’altezza relativa alla base misura ${h} cm. Calcola l’area.`,notes:['Dal perimetro ricava prima la somma di base e lato.','Usa poi la differenza tra base e lato.','L’altezza è già nota: dopo aver trovato la base puoi calcolare l’area.'],svg:`<svg viewBox="0 0 520 350"><g class="geo-base"><line data-geo="base" x1="${x}" y1="${y+H}" x2="${x+W}" y2="${y+H}"/><line data-geo="right-side" x1="${x+W}" y1="${y+H}" x2="${x+W+O}" y2="${y}"/><line data-geo="top" x1="${x+W+O}" y1="${y}" x2="${x+O}" y2="${y}"/><line data-geo="left-side" x1="${x+O}" y1="${y}" x2="${x}" y2="${y+H}"/></g><text x="260" y="38" text-anchor="middle">P = ${P} cm</text><text x="${x+W/2}" y="${y+H+35}" text-anchor="middle">b ?</text><text x="${x+W+O+15}" y="${y+H/2}" text-anchor="start">l ?</text><g data-v="1" opacity="0"><text class="label-focus" x="260" y="315" text-anchor="middle">b + l = P : 2 = ${P/2} cm</text></g><g data-v="2" opacity="0"><text class="label-focus" x="260" y="340" text-anchor="middle">l = ${side} cm → b = ${b} cm</text></g><g data-v="3" opacity="0"><line data-geo="height" class="aux" x1="${x+O}" y1="${y}" x2="${x+O}" y2="${y+H}" stroke-width="4" stroke-dasharray="8 6"/><text class="label-aux" x="${x+O+18}" y="${y+H/2}">h = ${h} cm</text></g></svg>`,helps:[['Che cosa rappresenta metà del perimetro?',`Il semiperimetro è ${P}:2=${P/2} cm: è la somma di base e lato obliquo.`,1],['Come entra in gioco la differenza?',`Sai che una misura supera l’altra di ${d} cm. Rappresenta quindi due parti uguali più un tratto di ${d} cm.`,1],['Come ricavo le due misure?',`Togli la differenza ${d} dalla somma ${P/2}; ciò che resta è formato da due parti uguali.`,2],['Quale delle misure trovate serve adesso?','Per l’area usa la base insieme all’altezza perpendicolare già fornita.',3],['Mostrami la soluzione',`l=${side} cm; b=${b} cm; A=${b}×${h}=${A} cm².`,3]]};
    }
  }
});


// --- v0.8: espansione Parallelogrammi + sezione Segmenti ---
function parallelogramSvg({b,h,side=null,topText='',bottomText='',heightText='',showHeightAt=1,finalText=''}){
  const scale=Math.min(300/b,165/h), W=b*scale, H=h*scale, O=Math.min(72,Math.max(38,(side||6)*4));
  const x=82,y=70;
  return `<svg viewBox="0 0 520 350" aria-label="Parallelogramma">
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
    ${finalText?`<g data-v="3" opacity="0"><text class="label-focus" x="260" y="338" text-anchor="middle">${finalText}</text></g>`:''}
  </svg>`;
}

Object.assign(FAMILIES,{
  parallelogramBaseFromAreaPerimeter:{
    figures:['parallelogramma'],strategies:['formula_inversa','area','perimetro'],
    generate(){
      const [b,h,l]=pickVariant('parallelogramBaseFromAreaPerimeter',[[12,7,8],[15,8,9],[16,9,10],[18,10,11],[20,12,13],[14,9,8]]),A=b*h,P=2*(b+l);
      return {text:`Un parallelogramma ha area ${A} cm², altezza ${h} cm e lato obliquo ${l} cm. Calcola il perimetro.`,notes:['Per il perimetro manca la base.','Ricava la base dalla formula dell’area.','Ora base e lato obliquo sono noti.'],svg:parallelogramSvg({b,h,side:l,topText:`A = ${A} cm²`,bottomText:'b ?',heightText:`h = ${h} cm`,showHeightAt:1,finalText:`b = ${b} cm → P = ${P} cm`}),helps:[['Che cosa ti serve per calcolare il perimetro?','Osserva i lati del parallelogramma: una delle due misure è già indicata, l’altra no.',1],['Quali dati possono aiutarti a trovare la misura che manca?',`Metti a fuoco area e altezza: A=${A} cm² e h=${h} cm. Il lato obliquo non serve in questo passaggio.`,1],['Quale relazione lega questi dati?','L’area del parallelogramma è data da base × altezza. Usa questa relazione senza ancora tornare al perimetro.',2],['Ora puoi ricavare la misura che manca',`b=A:h=${A}:${h}=${b} cm.`,2],['Torna alla domanda iniziale','Ora conosci entrambe le misure dei lati necessarie per il perimetro.',3],['Mostrami la soluzione',`P=2×(${b}+${l})=${P} cm.`,3]],scenes:{1:{highlight:['base'],aux:['height','right-angle']}}};
    }
  },
  parallelogramRatioPerimeter:{
    figures:['parallelogramma'],strategies:['perimetro','rapporto','UF','area'],
    generate(){
      const [m,n,u,h]=pickVariant('parallelogramRatioPerimeter',[[3,2,4,7],[4,3,3,8],[5,3,3,9],[5,4,4,10],[3,2,6,11],[4,3,5,12]]),b=m*u,l=n*u,P=2*(b+l),A=b*h;
      return {text:`Un parallelogramma ha perimetro ${P} cm. La base e il lato obliquo sono nel rapporto ${m}:${n}. L’altezza relativa alla base misura ${h} cm. Calcola l’area.`,notes:['Il semiperimetro è la somma di base e lato.','Rappresenta base e lato con unità frazionarie.','Trovata la base, usa l’altezza per l’area.'],svg:parallelogramSvg({b,h,topText:`P = ${P} cm`,bottomText:'b ?',heightText:`h = ${h} cm`,showHeightAt:2,finalText:`b = ${b} cm → A = ${A} cm²`}),helps:[['Che cosa rappresenta metà del perimetro?',`Il semiperimetro è ${P}:2=${P/2} cm e corrisponde alla somma dei due lati diversi.`,1],['Come posso rappresentare il rapporto?',`Rappresenta base e lato con ${m} UF e ${n} UF: in tutto sono ${m+n} UF.`,1],['Quanto vale una UF?',`Le ${m+n} UF valgono ${P/2} cm: una UF vale ${P/2}:${m+n}=${u} cm.`,2],['Quale misura ti serve per proseguire?',`La base corrisponde a ${m} UF, quindi misura ${b} cm. Ora mettila in relazione con l’altezza già nota.`,2],['Mostrami la soluzione',`b=${b} cm; A=${b}×${h}=${A} cm².`,3]],scenes:{2:{highlight:['base'],aux:['height','right-angle']}}};
    }
  },
  parallelogramSideFromPerimeter:{
    figures:['parallelogramma'],strategies:['perimetro','formula_inversa','area'],
    generate(){
      const [b,l,h]=pickVariant('parallelogramSideFromPerimeter',[[12,7,6],[14,8,7],[15,9,8],[16,10,9],[18,11,10],[20,12,11]]),P=2*(b+l),A=b*h;
      return {text:`Un parallelogramma ha perimetro ${P} cm, base ${b} cm e altezza relativa alla base ${h} cm. Calcola il lato obliquo e l’area.`,notes:['Dal perimetro puoi ricavare il semiperimetro.','Il semiperimetro è base + lato obliquo.','Per l’area, invece, servono base e altezza.'],svg:parallelogramSvg({b,h,topText:`P = ${P} cm`,bottomText:`b = ${b} cm`,heightText:`h = ${h} cm`,showHeightAt:2,finalText:`l = ${l} cm; A = ${A} cm²`}),helps:[['Che cosa posso ricavare dal perimetro?',`Il semiperimetro è ${P}:2=${P/2} cm e corrisponde a base + lato obliquo.`,1],['Come uso la base già nota?',`Dal semiperimetro puoi sottrarre la base di ${b} cm per ottenere l’altra misura.`,2],['Per la seconda richiesta servono le stesse misure?','No. Per l’area osserva base e altezza perpendicolare; il lato obliquo può essere messo da parte.',2],['Mostrami la soluzione',`l=${l} cm; A=${b}×${h}=${A} cm².`,3]],scenes:{2:{dim:['left-side','right-side'],highlight:['base'],aux:['height','right-angle']}}};
    }
  }
});

function ufBar(x,y,count,unit,{showLabel=true,extraClass=''}={}){
  // Barra UF realmente suddivisa: ogni confine tra unità è marcato da una tacca.
  const x2=x+count*unit;
  const ticks=Array.from({length:count+1},(_,i)=>
    `<line class="uf-tick ${extraClass}" x1="${x+i*unit}" y1="${y-8}" x2="${x+i*unit}" y2="${y+8}"/>`
  ).join('');
  return `<g class="uf-bar ${extraClass}"><line x1="${x}" y1="${y}" x2="${x2}" y2="${y}"/>${ticks}${showLabel?`<text class="label-unit" x="${(x+x2)/2}" y="${y-18}" text-anchor="middle">${count} UF</text>`:''}</g>`;
}

function segmentRelationSvg(kind,m,u,total,short,long,context){
  // 1 UF mantiene la stessa lunghezza fisica e le tacche ne rendono visibili i confini.
  const unit=Math.min(58,300/m), x=110;
  const equation=kind==='sum'?`${1+m} UF = ${total} cm`:`${m-1} UF = ${total} cm`;
  const final=`1 UF = ${u} cm  →  ${short} cm e ${long} cm`;
  const relationLabel=m===2?'doppia':m===3?'tripla':m===4?'quadrupla':`${m} volte l’altezza`;
  const difference = kind==='diff'
    ? `<g data-v="1" opacity="0">${ufBar(x+unit,225,m-1,unit,{showLabel:false,extraClass:'difference-bar'})}<text class="label-unit" x="${x+(m+1)*unit/2}" y="197" text-anchor="middle">differenza = ${m-1} UF</text></g>` : '';

  const bars=`<g class="segment-model">
    <text x="${x-22}" y="131" text-anchor="end">minore</text>
    ${ufBar(x,125,1,unit)}
    <text x="${x-22}" y="231" text-anchor="end">maggiore</text>
    <g data-v="1" opacity="0">${ufBar(x,225,m,unit)}</g>
    ${difference}
  </g>`;

  if(context==='rectangle'){
    // Il rettangolo dà il contesto; il modello a segmenti è separato nello spazio sottostante.
    // Evitiamo di sovrapporre etichette, figura e barre UF.
    const rw=240, rh=82, rx=140, ry=34;
    return `<svg viewBox="0 0 520 420" aria-label="Rettangolo e modello a segmenti in unità frazionarie">
      <g class="geo-base"><rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="none" stroke="currentColor" stroke-width="5"/></g>
      <text x="260" y="24" text-anchor="middle">base ${relationLabel} dell’altezza</text>
      <text x="260" y="145" text-anchor="middle">b ?</text><text x="${rx-18}" y="${ry+rh/2+6}" text-anchor="end">h ?</text>
      <g transform="translate(0,70)">${bars}</g>
      <g data-v="2" opacity="0"><text class="label-focus" x="260" y="365" text-anchor="middle">${equation}</text></g>
      <g data-v="3" opacity="0"><text class="label-aux" x="260" y="402" text-anchor="middle">${final}</text></g>
    </svg>`;
  }
  return `<svg viewBox="0 0 520 350" aria-label="Rappresentazione in unità frazionarie di due segmenti">${bars}<g data-v="2" opacity="0"><text class="label-focus" x="260" y="292" text-anchor="middle">${equation}</text></g><g data-v="3" opacity="0"><text class="label-aux" x="260" y="330" text-anchor="middle">${final}</text></g></svg>`;
}

function segmentSumDiffSvg(short,long,sum,diff,context){
  const x=105, scale=Math.min(270/long,16), A=long*scale, B=short*scale;
  const y1=context==='rectangle'?205:115, y2=context==='rectangle'?285:220;
  const rect=context==='rectangle'?`<g class="geo-base"><rect x="145" y="42" width="230" height="92" fill="none" stroke="currentColor" stroke-width="5"/></g>
    <text x="260" y="25" text-anchor="middle">b + h = ${sum} cm</text>
    <text x="260" y="162" text-anchor="middle">b − h = ${diff} cm</text>`:'';
  const bottom=context==='rectangle'?410:340;
  return `<svg viewBox="0 0 520 ${context==='rectangle'?430:350}" aria-label="Problema di somma e differenza">${rect}
    <g class="geo-base"><line data-geo="long" x1="${x}" y1="${y1}" x2="${x+A}" y2="${y1}"/><line data-geo="short" x1="${x}" y1="${y2}" x2="${x+B}" y2="${y2}"/></g>
    <text x="${x-18}" y="${y1+6}" text-anchor="end">maggiore</text><text x="${x-18}" y="${y2+6}" text-anchor="end">minore</text>
    <g data-v="1" opacity="0"><line class="difference-segment" x1="${x+B}" y1="${y1}" x2="${x+A}" y2="${y1}"/><line class="difference-cap" x1="${x+B}" y1="${y1-9}" x2="${x+B}" y2="${y1+9}"/><line class="difference-cap" x1="${x+A}" y1="${y1-9}" x2="${x+A}" y2="${y1+9}"/><text class="label-unit" x="${x+(A+B)/2}" y="${y1-20}" text-anchor="middle">differenza = ${diff} cm</text></g>
    <g data-v="2" opacity="0"><text class="label-focus" x="260" y="${bottom-30}" text-anchor="middle">${sum} − ${diff} = ${2*short} cm</text><text class="label-focus" x="260" y="${bottom-5}" text-anchor="middle">restano due parti uguali</text></g>
    <g data-v="3" opacity="0"><text class="label-aux" x="260" y="${bottom+22}" text-anchor="middle">${short} cm e ${long} cm</text></g>
  </svg>`;
}

Object.assign(FAMILIES,{
  segmentsSum:{
    figures:['segmenti'],strategies:['segmenti','somma','multiplo','UF'],
    generate(){
      const [m,u,context]=pickVariant('segmentsSum',[[2,9,'segments'],[3,8,'segments'],[4,6,'rectangle'],[5,5,'segments'],[2,13,'rectangle'],[3,11,'segments'],[4,8,'rectangle'],[5,7,'segments']]);
      const short=u,long=m*u,sum=short+long;
      const text=context==='rectangle'?`La somma della base e dell’altezza di un rettangolo è ${sum} cm. La base è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} dell’altezza. Calcola le due dimensioni.`:`La somma di due segmenti è ${sum} cm e il maggiore è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} del minore. Trova la lunghezza dei due segmenti.`;
      return {text,notes:['Rappresenta il segmento minore con 1 UF.','Il maggiore contiene più UF uguali.','La somma corrisponde alla somma di tutte le UF.'],svg:segmentRelationSvg('sum',m,u,sum,short,long,context),helps:[['Come rappresento la relazione?',`Se il minore vale 1 UF, il maggiore vale ${m} UF.`,1],['Quante UF formano la somma?',`In tutto ci sono 1+${m}=${m+1} UF, che corrispondono a ${sum} cm.`,2],['Quanto vale una UF?',`${sum}:${m+1}=${u} cm. Ora puoi ricavare entrambi i segmenti.`,3],['Mostrami la soluzione',`Minore = ${u} cm; maggiore = ${m}×${u}=${long} cm.`,3]]};
    }
  },
  segmentsDifference:{
    figures:['segmenti'],strategies:['segmenti','differenza','multiplo','UF'],
    generate(){
      const [m,u,context]=pickVariant('segmentsDifference',[[2,11,'segments'],[3,7,'rectangle'],[4,6,'segments'],[5,5,'rectangle'],[2,14,'rectangle'],[3,9,'segments'],[4,8,'rectangle'],[5,6,'segments']]);
      const short=u,long=m*u,diff=long-short;
      const text=context==='rectangle'?`La base di un rettangolo è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} dell’altezza e la supera di ${diff} cm. Calcola le due dimensioni.`:`La differenza tra due segmenti è ${diff} cm e il maggiore è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} del minore. Trova la lunghezza dei due segmenti.`;
      return {text,notes:['Rappresenta il minore con 1 UF e il maggiore con più UF.','La differenza non corrisponde a tutte le UF del maggiore.','Conta soltanto le UF che avanzano.'],svg:segmentRelationSvg('diff',m,u,diff,short,long,context),helps:[['Come rappresento i due segmenti?',`Minore = 1 UF; maggiore = ${m} UF.`,1],['A quante UF corrisponde la differenza?',`Togliendo 1 UF del minore dalle ${m} UF del maggiore, avanzano ${m-1} UF.`,2],['Quanto vale una UF?',`${diff}:${m-1}=${u} cm.`,3],['Mostrami la soluzione',`Minore = ${u} cm; maggiore = ${m}×${u}=${long} cm.`,3]]};
    }
  },
  segmentsSumDifference:{
    figures:['segmenti'],strategies:['segmenti','somma_e_differenza'],
    generate(){
      const [short,d,context]=pickVariant('segmentsSumDifference',[[7,4,'segments'],[8,6,'rectangle'],[9,8,'segments'],[11,6,'rectangle'],[12,10,'segments'],[14,8,'rectangle'],[15,12,'segments'],[18,10,'rectangle']]);
      const long=short+d,sum=long+short;
      const text=context==='rectangle'?`La somma della base e dell’altezza di un rettangolo è ${sum} cm e la loro differenza è ${d} cm. Calcola le due dimensioni.`:`La somma di due segmenti è ${sum} cm e la loro differenza è ${d} cm. Calcola la lunghezza dei due segmenti.`;
      return {text,notes:['Rappresenta due segmenti incogniti, uno più lungo dell’altro.','La parte in più è la differenza.','Togliendo la differenza dalla somma restano due parti uguali.'],svg:segmentSumDiffSvg(short,long,sum,d,context),helps:[['Dove si trova la differenza?',`È soltanto la parte di ${d} cm che il segmento maggiore ha in più.`,1],['Come posso rendere uguali i due segmenti?',`Togli la differenza dalla somma: ${sum}−${d}=${2*short} cm.`,2],['E adesso?',`I ${2*short} cm rimasti sono due parti uguali: ${2*short}:2=${short} cm.`,3],['Mostrami la soluzione',`Minore = ${short} cm; maggiore = ${short}+${d}=${long} cm.`,3]]};
    }
  }
});

// --- v0.9: figure composte organizzate per STRATEGIA, non per prodotto cartesiano figura × consegna.
// Le coppie di figure sono esempi rappresentativi; una nuova sagoma non crea automaticamente
// una nuova tipologia cognitiva.
const COMPOSITE_FAMILIES=[
  ['composite_sumAreas','rectTri','area','somma_aree'],
  ['composite_externalPerimeter','squareTri','perimeter','perimetro_lato_comune'],
  ['composite_inverseArea','rectTrap','inverse','area_totale_sottrazione_formula_inversa'],
  ['composite_twoRectanglesArea','rectRect','area','scomposizione_rettangoli'],
  ['composite_trapezoidPerimeter','squareTrap','perimeter','perimetro_trapezio_lato_comune'],
  ['composite_twoStageInverse','triTrap','inverse','area_prima_figura_area_seconda_inversa'],
  ['composite_rhombusInverse','rectRhomb','inverse','area_totale_area_rombo_altezza']
];
for(const [id,kind,task,strategy] of COMPOSITE_FAMILIES){
  FAMILIES[id]={figures:['composta'],strategies:['figure_composte',strategy],generate:()=>compositeProblem(kind,task)};
}

const FIGURES=[
 ['segmenti','Segmenti','<path d="M22 38 H128 M22 76 H94"/>'],
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
function renderProblem(){state.view='problem';const x=state.instance;const label=FIGURES.find(f=>f[0]===state.entryFigure)?.[1]||'';app.innerHTML=shell(`<div class="problem-head"><div><div class="eyebrow">${label}</div><div class="status">Il tipo di strategia resta nascosto: scegli tu come procedere.</div></div><button id="homeTop" class="secondary">← Home</button></div><section class="card"><b>Problema</b><p>${x.text}</p></section><section class="grid"><div class="diagram">${x.svg}<div class="note">${state.openHelp===null ? (x.notes?.[0]||'Osserva la figura e prova a decidere da dove partire.') : (x.notes?.[x.helps[state.openHelp][2]]||x.helps[state.openHelp][1])}</div></div><div class="helps">${x.helps.map((h,i)=>`<div><button class="help-btn ${state.openHelp===i?'open':''}" data-help="${i}"><span>${i+1} — ${h[0]}</span><span class="chev">▾</span></button><div class="help-text ${state.openHelp===i?'':'hidden'}" data-text="${i}">${h[1]}</div></div>`).join('')}</div></section><div class="end-actions"><button id="similar" class="primary">Provane uno simile</button><button id="different" class="secondary" ${familyKeysFor(state.entryFigure).length < 2 ? 'disabled title="Non ci sono ancora altri tipi di problema per questa figura"' : ''}>Provane uno diverso</button><button id="home" class="secondary">Torna alla home</button></div>`,'<button id="form" class="tool-btn">📐 Formulario</button>');bindProblem();applyVisual();}
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
