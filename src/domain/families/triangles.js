import { pickVariant } from './shared.js';
const gcd=(a,b)=>b?gcd(b,a%b):a;
const PYTHAGOREAN_VARIANTS=[
  [3,4,5],[4,3,5],[6,8,10],[8,6,10],
  [5,12,13],[12,5,13],[8,15,17],[15,8,17],
  [9,12,15],[12,9,15]
];

function ufTicks(x1,y1,x2,y2,count,color='#2f9e83',len=12){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
  return Array.from({length:Math.max(0,count-1)},(_,i)=>{const t=(i+1)/count,x=x1+dx*t,y=y1+dy*t;return `<line x1="${x-nx*len/2}" y1="${y-ny*len/2}" x2="${x+nx*len/2}" y2="${y+ny*len/2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;}).join('');
}
function triangleUfGeometry(m,n){
  const maxW=300,maxH=205,s=Math.min(maxW/m,maxH/Math.sqrt(Math.max(.01,n*n-m*m/4))),w=m*s,side=n*s,h=Math.sqrt(Math.max(1,side*side-w*w/4)),x1=260-w/2,x2=260+w/2,y=270,yt=y-h;
  return {x1,x2,y,yt};
}

export const TRIANGLE_FAMILIES={
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
      helps:[
        {title:'Cosa mi manca?', text:`Per calcolare l’area traccia l’altezza.`, scene:1},
        {title:'Cosa succede alla base?', text:`Nel triangolo isoscele l’altezza la divide a metà: ${base}:2=${p} cm.`, scene:2},
        {title:'Sono ancora bloccato/a', text:`Osserva il triangolo rettangolo: ipotenusa ${l}, cateto ${p}, h incognita.`, scene:3},
        {title:'Mostrami la soluzione', text:`h=√(${l}²−${p}²)=${h} cm; A=${base}×${h}:2=${A} cm².`, scene:4}
      ],
      scenes:{3:{keep:['left-leg','base-left','height','right-angle','h-label','left-label','half-label'],highlight:['left-leg','base-left'],aux:['height']}}};
    }
  },
triangleIsoBaseArea:{
    figures:['triangolo'], strategies:['formula_inversa','area','pitagora','perimetro'],
    generate(){
      const [h,p,l]=pickVariant('triangleIsoBaseArea',PYTHAGOREAN_VARIANTS); const base=2*p,A=base*h/2,P=base+2*l;
      return {text:`Un triangolo isoscele ha base ${base} cm e area ${A} cm². Calcola il perimetro.`,notes:['Per il perimetro manca il lato obliquo.','Dall’area puoi ricavare l’altezza.','L’altezza dimezza la base e crea un triangolo rettangolo.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L260 65 L430 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="310" text-anchor="middle">b=${base} cm · A=${A} cm²</text><g data-v="1" opacity="0"><line class="aux" x1="260" y1="65" x2="260" y2="270" stroke-width="4" stroke-dasharray="8 6"/><text class="label-focus" x="278" y="170">h=${h}</text></g><g data-v="2" opacity="0"><text class="label-aux" x="260" y="340" text-anchor="middle">l=√(${h}²+${p}²)=${l} → P=${P}</text></g></svg>`,helps:[
        {title:'Come ricavo l’altezza?', text:`h=2A:b = 2×${A}:${base}=${h} cm.`, scene:1},
        {title:'Come trovo il lato?', text:`La semibase è ${p} cm: usa Pitagora con ${h} e ${p}.`, scene:2},
        {title:'Mostrami la soluzione', text:`l=${l} cm; P=${base}+2×${l}=${P} cm.`, scene:2}
      ]};
    }
  },
triangleIsoSideHeight:{
    figures:['triangolo'], strategies:['pitagora','base','perimetro','area'],
    generate(){
      const [h,p,l]=pickVariant('triangleIsoSideHeight',PYTHAGOREAN_VARIANTS); const base=2*p,A=base*h/2,P=base+2*l;
      return {text:`Un triangolo isoscele ha lati obliqui di ${l} cm e altezza ${h} cm. Calcola base, perimetro e area.`,notes:['L’altezza divide il triangolo in due triangoli rettangoli.','Conosci ipotenusa e un cateto: ricava la semibase.','Raddoppia la semibase.'],svg:`<svg viewBox="0 0 520 350"><path d="M90 270 L260 65 L430 270 Z" fill="none" stroke="currentColor" stroke-width="5"/><line class="aux" x1="260" y1="65" x2="260" y2="270" stroke-width="4" stroke-dasharray="8 6"/><text x="285" y="165">h=${h}</text><text x="150" y="165">l=${l}</text><g data-v="1" opacity="0"><text class="label-focus" x="175" y="295" text-anchor="middle">b/2=√(${l}²−${h}²)=${p}</text></g></svg>`,helps:[
        {title:'Dove applico Pitagora?', text:`Su metà triangolo: ipotenusa ${l}, cateto ${h}, semibase incognita.`, scene:1},
        {title:'Come ottengo la base?', text:`La semibase è ${p} cm, quindi b=${2*p} cm.`, scene:1},
        {title:'Mostrami la soluzione', text:`b=${base} cm; P=${P} cm; A=${A} cm².`, scene:1}
      ]};
    }
  },
triangleIsoPerimeterRatio:{
    figures:['triangolo'],strategies:['perimetro','rapporto','UF','area'],
    generate(){
      const [h,p,side]=pickVariant('triangleIsoPerimeterRatio',PYTHAGOREAN_VARIANTS.filter(([h,p,l])=>{const g=gcd(2*p,l);return (2*p+2*l)/g<=36;})),base=2*p,g=gcd(base,side),m=base/g,n=side/g,u=g,P=base+2*side,A=base*h/2,total=m+2*n;
      return {debugNew:true,text:`Un triangolo isoscele ha il perimetro di ${P} cm. La base è i ${m}/${n} del lato obliquo. Sapendo che l’altezza misura ${h} cm, calcola l’area.`,notes:['Rappresenta base e lato obliquo con UF della stessa lunghezza.','Nel perimetro il lato obliquo compare due volte.','Trova il valore di una UF, poi la base.','Ora puoi usare base e altezza per l’area.'],svg:(()=>{const q=triangleUfGeometry(m,n);return `<svg viewBox="0 0 520 380"><path d="M${q.x1} ${q.y} L260 ${q.yt} L${q.x2} ${q.y} Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="305" text-anchor="middle">b = ${m} UF</text><text x="${q.x1-8}" y="${(q.y+q.yt)/2}" text-anchor="end">l = ${n} UF</text><text x="${q.x2+8}" y="${(q.y+q.yt)/2}" text-anchor="start">l = ${n} UF</text><g data-v="1" opacity="0"><line x1="${q.x1}" y1="${q.y}" x2="260" y2="${q.yt}" stroke="#2f9e83" stroke-width="7"/><line x1="260" y1="${q.yt}" x2="${q.x2}" y2="${q.y}" stroke="#2f9e83" stroke-width="7"/><line x1="${q.x1}" y1="${q.y}" x2="${q.x2}" y2="${q.y}" stroke="#46a6dc" stroke-width="7"/>${ufTicks(q.x1,q.y,260,q.yt,n)}${ufTicks(260,q.yt,q.x2,q.y,n)}${ufTicks(q.x1,q.y,q.x2,q.y,m,'#46a6dc')}</g>`})()+`<g data-v="2" opacity="0"><text class="label-unit" x="260" y="340" text-anchor="middle">${m} + ${n} + ${n} = ${total} UF</text></g><g data-v="3" opacity="0"><text class="label-focus" x="260" y="370" text-anchor="middle">1 UF = ${P} : ${total} = ${u} cm → b = ${base} cm</text></g></svg>`,helps:[
        {title:'Come rappresento il rapporto?', text:`Base = ${m} UF; ciascun lato obliquo = ${n} UF.`, scene:1},
        {title:'Quante UF formano il perimetro?', text:`${m}+${n}+${n}=${total} UF.`, scene:2},
        {title:'Quanto vale una UF?', text:`${P}:${total}=${u} cm, quindi b=${m}×${u}=${base} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`A=${base}×${h}:2=${A} cm².`, scene:3}
      ]};
    }
  },
triangleIsoSumRatio:{
    figures:['triangolo'],strategies:['somma','rapporto','UF','perimetro','area'],
    generate(){
      const [h,p,side]=pickVariant('triangleIsoSumRatio',PYTHAGOREAN_VARIANTS.filter(([h,p,l])=>{const g=gcd(2*p,l);return (2*p+l)/g<=30;})),base=2*p,g=gcd(base,side),m=base/g,n=side/g,u=g,sum=base+side,P=base+2*side,A=base*h/2,total=m+n;
      return {debugNew:true,text:`La somma della base e di un lato obliquo di un triangolo isoscele è ${sum} cm. La base è i ${m}/${n} del lato obliquo. L’altezza misura ${h} cm. Calcola il perimetro e l’area.`,notes:['La somma riguarda una base e un solo lato obliquo.','Rappresenta le due misure con UF.','Trova una UF e quindi le due lunghezze.','Ricorda che nel perimetro i lati obliqui sono due.'],svg:(()=>{const q=triangleUfGeometry(m,n);return `<svg viewBox="0 0 520 380"><path d="M${q.x1} ${q.y} L260 ${q.yt} L${q.x2} ${q.y} Z" fill="none" stroke="currentColor" stroke-width="5"/><text x="260" y="305" text-anchor="middle">b = ${m} UF</text><text x="${q.x1-8}" y="${(q.y+q.yt)/2}" text-anchor="end">l = ${n} UF</text><g data-v="1" opacity="0"><line x1="${q.x1}" y1="${q.y}" x2="260" y2="${q.yt}" stroke="#2f9e83" stroke-width="7"/><line x1="${q.x1}" y1="${q.y}" x2="${q.x2}" y2="${q.y}" stroke="#46a6dc" stroke-width="7"/>${ufTicks(q.x1,q.y,260,q.yt,n)}${ufTicks(q.x1,q.y,q.x2,q.y,m,'#46a6dc')}</g>`})()+`<g data-v="2" opacity="0"><text class="label-unit" x="260" y="340" text-anchor="middle">${m} + ${n} = ${total} UF = ${sum} cm</text></g><g data-v="3" opacity="0"><text class="label-focus" x="260" y="370" text-anchor="middle">b = ${base} cm; l = ${side} cm</text></g></svg>`,helps:[
        {title:'Quali grandezze devi rappresentare?', text:`Base = ${m} UF e lato obliquo = ${n} UF.`, scene:1},
        {title:'Quante UF corrispondono alla somma?', text:`${m}+${n}=${total} UF, che valgono ${sum} cm.`, scene:2},
        {title:'Quanto vale una UF?', text:`${sum}:${total}=${u} cm: b=${base} cm e l=${side} cm.`, scene:3},
        {title:'Mostrami la soluzione', text:`P=${base}+2×${side}=${P} cm; A=${base}×${h}:2=${A} cm².`, scene:3}
      ]};
    }
  }
};
