export const FIGURES=[
 ['segmenti','Segmenti','<path d="M22 38 H128 M22 76 H94"/>'],
 ['triangolo','Triangoli','<path d="M25 82 L75 18 L125 82 Z"/>'],
 ['rettangolo','Rettangoli','<rect x="25" y="27" width="100" height="58"/>'],
 ['trapezio','Trapezi','<path d="M22 84 L128 84 L105 25 L45 25 Z"/>'],
 ['rombo','Rombi','<path d="M75 14 L130 55 L75 96 L20 55 Z"/>'],
 ['parallelogramma','Parallelogrammi','<path d="M38 25 L130 25 L112 85 L20 85 Z"/>'],
 ['composta','Figure composte','<path d="M20 24 H92 V48 H130 V92 H58 V68 H20 Z"/>'],
 ['collegate','Figure collegate','<path d="M18 34 H62 V78 H18 Z M88 34 H132 V78 H88 Z M64 56 H84 M78 50 L86 56 L78 62"/>']
];

function frac(top, bottom){
  return `<span class="mfrac">
    <span>${top}</span>
    <span>${bottom}</span>
  </span>`;
}

function root(value){
  return `<span class="mroot">
    <span class="radical">√</span>
    <span class="radicand">${value}</span>
  </span>`;
}

function formulas(...items){
  return items.map(x => `<div class="formula-row">${x}</div>`).join('');
}

export const FORMULAS=[
  ['Triangolo',
    formulas(
      `A = ${frac('b · h','2')}`,
      `P = a + b + c`
    ),
    formulas(
      `b = ${frac('2A','h')}`,
      `h = ${frac('2A','b')}`
    )
  ],
  ['Rettangolo',
    formulas(
      `A = b · h`,
      `P = 2(b + h)`
    ),
    formulas(
      `b = ${frac('A','h')}`,
      `h = ${frac('A','b')}`
    )
  ],
  ['Parallelogramma',
    formulas(
      `A = b · h`
    ),
    formulas(
      `b = ${frac('A','h')}`,
      `h = ${frac('A','b')}`
    )
  ],
  ['Trapezio',
    formulas(
      `A = ${frac('(B + b) · h','2')}`
    ),
    formulas(
      `h = ${frac('2A','B + b')}`,
      `B = ${frac('2A','h')} − b`,
      `b = ${frac('2A','h')} − B`
    )
  ],
  ['Rombo',
    formulas(
      `A = ${frac('D · d','2')}`,
      `P = 4l`
    ),
    formulas(
      `D = ${frac('2A','d')}`,
      `d = ${frac('2A','D')}`,
      `l = ${frac('P','4')}`
    )
  ],
  ['Quadrato',
    formulas(
      `A = l²`,
      `P = 4l`
    ),
    formulas(
      `l = ${root('A')}`,
      `l = ${frac('P','4')}`
    )
  ],
  ['Pitagora',
    formulas(
      `i² = c₁² + c₂²`
    ),
    formulas(
      `i = ${root('c₁² + c₂²')}`,
      `c₁ = ${root('i² − c₂²')}`,
      `c₂ = ${root('i² − c₁²')}`
    )
  ]
];
