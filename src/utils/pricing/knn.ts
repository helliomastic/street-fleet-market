// KNN-based price suggestion utility for car listings
// Focused on client-side usage with lightweight math (no external deps)

export type CarSample = {
  make: string;
  model: string;
  year: number;
  condition: string; // new | like_new | excellent | good | fair | poor
  fuel_type?: string;
  description?: string;
  price: number;
};

export type QueryInput = {
  make?: string;
  model?: string;
  year?: number | string;
  condition?: string;
  fuelType?: string;
  description?: string;
};

export type KnnResult = {
  suggestedPrice: number | null;
  neighbors: Array<CarSample & { distance: number }>;
  confidence: number; // 0..1
};

const conditionOrder: Record<string, number> = {
  poor: 0,
  fair: 1,
  good: 2,
  excellent: 3,
  like_new: 4,
  new: 5,
};

function conditionScore(c?: string): number {
  if (!c) return 2; // default mid
  return conditionOrder[c] ?? 2;
}

function toYear(n?: number | string): number | null {
  if (n === undefined || n === null || n === "") return null;
  const parsed = typeof n === "string" ? parseInt(n, 10) : n;
  return Number.isFinite(parsed) ? parsed : null;
}

function computeYearRange(data: CarSample[]): { min: number; max: number } | null {
  const years = data.map((d) => d.year).filter((y) => Number.isFinite(y));
  if (!years.length) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
}

// --- Simple text similarity (cosine over token frequency) ---
const STOPWORDS = new Set([
  "the","and","a","an","to","of","in","on","for","is","it","this","that","with","as","by","at","from","are","was","be","or","we","you","your","our","car","vehicle"
]);

function normalizeText(s?: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(s?: string): string[] {
  const norm = normalizeText(s);
  if (!norm) return [];
  return norm
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function termFreq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  tokens.forEach((t) => m.set(t, (m.get(t) || 0) + 1));
  return m;
}

function cosineSim(aText?: string, bText?: string): number {
  const aToks = tokenize(aText);
  const bToks = tokenize(bText);
  if (aToks.length === 0 || bToks.length === 0) return 0;
  const aMap = termFreq(aToks);
  const bMap = termFreq(bToks);
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;
  aMap.forEach((av, k) => {
    aNorm += av * av;
    const bv = bMap.get(k) || 0;
    dot += av * bv;
  });
  bMap.forEach((bv) => {
    bNorm += bv * bv;
  });
  if (aNorm === 0 || bNorm === 0) return 0;
  return dot / (Math.sqrt(aNorm) * Math.sqrt(bNorm));
}

// Weighted distance. Smaller is more similar.
function distance(a: CarSample, b: CarSample, yearRange: { min: number; max: number } | null) {
  const weights = {
    make: 1.0,
    model: 1.5,
    fuel: 0.5,
    year: 1.0,
    condition: 0.75,
    description: 0.6,
  };

  let d = 0;

  // Categorical mismatches add fixed penalties
  if (a.make && b.make && a.make.toLowerCase() !== b.make.toLowerCase()) d += weights.make;
  if (a.model && b.model && a.model.toLowerCase() !== b.model.toLowerCase()) d += weights.model;
  if (a.fuel_type && b.fuel_type && a.fuel_type.toLowerCase() !== b.fuel_type.toLowerCase()) d += weights.fuel;

  // Year normalized difference
  if (Number.isFinite(a.year) && Number.isFinite(b.year)) {
    const range = yearRange ? Math.max(1, yearRange.max - yearRange.min) : 20; // fallback
    d += (weights.year * Math.abs(a.year - b.year)) / range;
  }

  // Condition ordinal difference (0..5)
  const ca = conditionScore(a.condition);
  const cb = conditionScore(b.condition);
  d += (weights.condition * Math.abs(ca - cb)) / 5;

  // Description similarity (cosine). Higher similarity -> smaller distance
  if (a.description && b.description) {
    const sim = cosineSim(a.description, b.description); // 0..1
    d += weights.description * (1 - sim);
  }

  return d;
}

function roundToNearest(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function suggestPriceKNN(query: QueryInput, dataset: CarSample[], k = 5, roundStep = 1000): KnnResult {
  const qYear = toYear(query.year);
  const q: CarSample = {
    make: (query.make || "").trim(),
    model: (query.model || "").trim(),
    year: qYear ?? NaN,
    condition: (query.condition || "") as string,
    fuel_type: (query.fuelType || "") as string,
    description: (query.description || "") as string,
    price: NaN,
  };

  const valid = dataset.filter((d) => Number.isFinite(d.price) && d.price > 0);
  if (!valid.length || !q.make || !q.model || !Number.isFinite(q.year)) {
    return { suggestedPrice: null, neighbors: [], confidence: 0 };
  }

  const yearRange = computeYearRange(valid);

  const scored = valid.map((d) => ({
    ...d,
    distance: distance(q, d, yearRange),
  }));

  // Sort by distance ascending
  scored.sort((a, b) => a.distance - b.distance);

  const neighbors = scored.slice(0, Math.max(1, Math.min(k, scored.length)));

  // Inverse-distance weighted average
  const eps = 1e-6;
  let wSum = 0;
  let px = 0;
  neighbors.forEach((n) => {
    const w = 1 / (eps + n.distance);
    wSum += w;
    px += w * n.price;
  });

  if (wSum === 0) {
    return { suggestedPrice: null, neighbors: [], confidence: 0 };
  }

  const raw = px / wSum;
  const suggested = roundToNearest(raw, roundStep);

  // Confidence: lower average distance -> higher confidence
  const avgDist = neighbors.reduce((s, n) => s + n.distance, 0) / neighbors.length;
  const conf = Math.max(0, Math.min(1, 1 - avgDist / 3)); // heuristic scaling

  return {
    suggestedPrice: suggested,
    neighbors,
    confidence: conf,
  };
}
