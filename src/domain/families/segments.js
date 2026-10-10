import { pickVariant } from './shared.js';

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


export const SEGMENT_FAMILIES={
segmentsSum:{
    figures:['segmenti'],strategies:['segmenti','somma','multiplo','UF'],
    generate(){
      const [m,u,context]=pickVariant('segmentsSum',[[2,9,'segments'],[3,8,'segments'],[4,6,'rectangle'],[5,5,'segments'],[2,13,'rectangle'],[3,11,'segments'],[4,8,'rectangle'],[5,7,'segments']]);
      const short=u,long=m*u,sum=short+long;
      const text=context==='rectangle'?`La somma della base e dell’altezza di un rettangolo è ${sum} cm. La base è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} dell’altezza. Calcola le due dimensioni.`:`La somma di due segmenti è ${sum} cm e il maggiore è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} del minore. Trova la lunghezza dei due segmenti.`;
      return {text,notes:['Rappresenta il segmento minore con 1 UF.','Il maggiore contiene più UF uguali.','La somma corrisponde alla somma di tutte le UF.'],svg:segmentRelationSvg('sum',m,u,sum,short,long,context),helps:[
        {title:'Come rappresento la relazione?', text:`Se il minore vale 1 UF, il maggiore vale ${m} UF.`, scene:1},
        {title:'Quante UF formano la somma?', text:`In tutto ci sono 1+${m}=${m+1} UF, che corrispondono a ${sum} cm.`, scene:2},
        {title:'Quanto vale una UF?', text:`${sum}:${m+1}=${u} cm. Ora puoi ricavare entrambi i segmenti.`, scene:3},
        {title:'Mostrami la soluzione', text:`Minore = ${u} cm; maggiore = ${m}×${u}=${long} cm.`, scene:3}
      ]};
    }
  },
segmentsDifference:{
    figures:['segmenti'],strategies:['segmenti','differenza','multiplo','UF'],
    generate(){
      const [m,u,context]=pickVariant('segmentsDifference',[[2,11,'segments'],[3,7,'rectangle'],[4,6,'segments'],[5,5,'rectangle'],[2,14,'rectangle'],[3,9,'segments'],[4,8,'rectangle'],[5,6,'segments']]);
      const short=u,long=m*u,diff=long-short;
      const text=context==='rectangle'?`La base di un rettangolo è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} dell’altezza e la supera di ${diff} cm. Calcola le due dimensioni.`:`La differenza tra due segmenti è ${diff} cm e il maggiore è ${m===2?'il doppio':m===3?'il triplo':m===4?'il quadruplo':m+' volte'} del minore. Trova la lunghezza dei due segmenti.`;
      return {text,notes:['Rappresenta il minore con 1 UF e il maggiore con più UF.','La differenza non corrisponde a tutte le UF del maggiore.','Conta soltanto le UF che avanzano.'],svg:segmentRelationSvg('diff',m,u,diff,short,long,context),helps:[
        {title:'Come rappresento i due segmenti?', text:`Minore = 1 UF; maggiore = ${m} UF.`, scene:1},
        {title:'A quante UF corrisponde la differenza?', text:`Togliendo 1 UF del minore dalle ${m} UF del maggiore, avanzano ${m-1} UF.`, scene:2},
        {title:'Quanto vale una UF?', text:`${diff}:${m-1}=${u} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`Minore = ${u} cm; maggiore = ${m}×${u}=${long} cm.`, scene:3}
      ]};
    }
  },
segmentsSumDifference:{
    figures:['segmenti'],strategies:['segmenti','somma_e_differenza'],
    generate(){
      const [short,d,context]=pickVariant('segmentsSumDifference',[[7,4,'segments'],[8,6,'rectangle'],[9,8,'segments'],[11,6,'rectangle'],[12,10,'segments'],[14,8,'rectangle'],[15,12,'segments'],[18,10,'rectangle']]);
      const long=short+d,sum=long+short;
      const text=context==='rectangle'?`La somma della base e dell’altezza di un rettangolo è ${sum} cm e la loro differenza è ${d} cm. Calcola le due dimensioni.`:`La somma di due segmenti è ${sum} cm e la loro differenza è ${d} cm. Calcola la lunghezza dei due segmenti.`;
      return {text,notes:['Rappresenta due segmenti incogniti, uno più lungo dell’altro.','La parte in più è la differenza.','Togliendo la differenza dalla somma restano due parti uguali.'],svg:segmentSumDiffSvg(short,long,sum,d,context),helps:[
        {title:'Dove si trova la differenza?', text:`È soltanto la parte di ${d} cm che il segmento maggiore ha in più.`, scene:1},
        {title:'Come posso rendere uguali i due segmenti?', text:`Togli la differenza dalla somma: ${sum}−${d}=${2*short} cm.`, scene:2},
        {title:'E adesso?', text:`I ${2*short} cm rimasti sono due parti uguali: ${2*short}:2=${short} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`Minore = ${short} cm; maggiore = ${short}+${d}=${long} cm.`, scene:3}
      ]};
    }
  }
};
