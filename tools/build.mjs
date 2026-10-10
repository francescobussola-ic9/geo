import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(here);
const srcRoot=path.join(root,'src');

// Ordine topologico: ogni modulo compare dopo quelli che importa.
const files=[
  'core/state.js',
  'domain/families/shared.js',
  'domain/families/rectangles.js',
  'domain/families/triangles.js',
  'domain/families/trapezoids.js',
  'domain/families/rhombi.js',
  'domain/families/parallelograms.js',
  'domain/families/segments.js',
  'domain/families/composites.js',
  'domain/families/complex.js',
  'domain/families.js',
  'domain/catalog.js',
  'services/telemetry.js',
  'ui/app-ui.js',
  'main.js'
];

const norm=p=>p.replaceAll('\\','/');
function resolveImport(fromFile,spec){
  const base=path.posix.dirname(norm(fromFile));
  let resolved=path.posix.normalize(path.posix.join(base,spec));
  if(!resolved.endsWith('.js')) resolved+='.js';
  return resolved;
}

function compileModule(file){
  let code=fs.readFileSync(path.join(srcRoot,file),'utf8');
  const exports=new Set();
  for(const m of code.matchAll(/^export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)) exports.add(m[1]);
  for(const m of code.matchAll(/^export\s*\{([^}]+)\}\s*;?/gm)){
    for(const part of m[1].split(',')){
      const bits=part.trim().split(/\s+as\s+/);
      if(bits[0]) exports.add((bits[1]||bits[0]).trim());
    }
  }
  code=code.replace(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/gm,(_,names,spec)=>{
    const dep=resolveImport(file,spec);
    return `const { ${names.trim()} } = __mods[${JSON.stringify(dep)}];`;
  });
  code=code.replace(/^export\s+(?=(?:const|let|var|function|class)\b)/gm,'');
  code=code.replace(/^export\s*\{[^}]+\}\s*;?\s*$/gm,'');
  return `// ===== ${file} =====\n__mods[${JSON.stringify(file)}] = (() => {\n${code}\nreturn { ${[...exports].join(', ')} };\n})();`;
}

const banner=`// GEØ — bundle OFFLINE generato automaticamente da src/.\n// Non modificare direttamente questo file. Eseguire: node tools/build.mjs\n\nconst __mods = Object.create(null);\n`;
const out=banner+files.map(compileModule).join('\n\n')+'\n';
fs.writeFileSync(path.join(root,'app-offline.js'),out);
console.log(`Creato app-offline.js (${out.length} caratteri) da ${files.length} moduli isolati.`);
