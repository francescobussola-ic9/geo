// Comportamento globale: evita di riproporre immediatamente la stessa variante della stessa famiglia.
const lastVariantByFamily = {};
const rand = a => a[Math.floor(Math.random() * a.length)];

export function pickVariant(family, variants) {
  if (!variants.length) throw new Error(`Nessuna variante disponibile per ${family}`);
  const last = lastVariantByFamily[family];
  const pool = variants.length > 1 ? variants.filter(v => JSON.stringify(v) !== last) : variants;
  const chosen = rand(pool.length ? pool : variants);
  lastVariantByFamily[family] = JSON.stringify(chosen);
  return chosen;
}
