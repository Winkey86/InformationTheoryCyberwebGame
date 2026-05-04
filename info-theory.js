/* ============================================================
   Information theory math — pure functions
   ============================================================ */

const log2 = (x) => Math.log2(x);
const safeLog2 = (x) => (x > 0 ? Math.log2(x) : 0);

// Shannon entropy of a probability distribution (array of numbers, will be normalized)
function entropy(probs) {
  const total = probs.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let H = 0;
  for (const p of probs) {
    if (p <= 0) continue;
    const q = p / total;
    H -= q * Math.log2(q);
  }
  return H;
}

// Marginalize joint matrix P[i][j] (rows = X, cols = Y)
function marginalsX(P) {
  return P.map(row => row.reduce((a, b) => a + b, 0));
}
function marginalsY(P) {
  if (!P.length) return [];
  return P[0].map((_, j) => P.reduce((a, row) => a + row[j], 0));
}

// Normalize joint matrix to sum to 1
function normalizeJoint(P) {
  const total = P.flat().reduce((a, b) => a + b, 0);
  if (total <= 0) return P.map(r => r.map(_ => 0));
  return P.map(row => row.map(v => v / total));
}

function jointEntropy(P) {
  let H = 0;
  for (const row of P)
    for (const p of row)
      if (p > 0) H -= p * Math.log2(p);
  return H;
}

// Mutual information I(X;Y) = H(X) + H(Y) - H(X,Y)
function mutualInformation(Pin) {
  const P = normalizeJoint(Pin);
  const px = marginalsX(P);
  const py = marginalsY(P);
  const Hx = entropy(px);
  const Hy = entropy(py);
  const Hxy = jointEntropy(P);
  const I = Math.max(0, Hx + Hy - Hxy);
  // Conditional entropies
  const Hx_y = Math.max(0, Hxy - Hy);
  const Hy_x = Math.max(0, Hxy - Hx);
  // Normalized MI (uncertainty coefficient style symmetric)
  const NMI = (Hx + Hy) > 0 ? (2 * I) / (Hx + Hy) : 0;
  return { Hx, Hy, Hxy, I, Hx_y, Hy_x, NMI, px, py };
}

window.InfoTheory = { entropy, mutualInformation, normalizeJoint, marginalsX, marginalsY, jointEntropy };
