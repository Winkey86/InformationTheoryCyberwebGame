/* ============================================================
   Pure-JS DES + Triple DES (EDE) implementation
   Original implementation. Block: 8 bytes. Modes: ECB, CBC.
   API:
     TripleDES.encrypt(textOrBytes, key24, {mode, iv, asHex}) -> hex string
     TripleDES.decrypt(hexInput, key24, {mode, iv}) -> string
     TripleDES.singleEncryptBlock(block8, key8) / singleDecryptBlock
   ============================================================ */

(function () {
  // ---------- DES tables (standard FIPS 46-3) ----------
  const PC1 = [
    57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,
    63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4
  ];
  const PC2 = [
    14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,
    41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32
  ];
  const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];
  const IP = [
    58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,
    57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7
  ];
  const FP = [
    40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,
    36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25
  ];
  const E = [
    32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,
    16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1
  ];
  const P = [
    16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25
  ];
  const S = [
    [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,
     4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
    [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,
     0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
    [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,
     13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
    [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,
     10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
    [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,
     4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
    [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,
     9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
    [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,
     1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
    [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,
     7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]
  ];

  // ---------- bit helpers ----------
  const toBits = (bytes) => {
    const bits = new Uint8Array(bytes.length * 8);
    for (let i = 0; i < bytes.length; i++)
      for (let b = 0; b < 8; b++)
        bits[i*8 + b] = (bytes[i] >> (7 - b)) & 1;
    return bits;
  };
  const fromBits = (bits) => {
    const out = new Uint8Array(bits.length / 8);
    for (let i = 0; i < out.length; i++) {
      let v = 0;
      for (let b = 0; b < 8; b++) v = (v << 1) | bits[i*8 + b];
      out[i] = v;
    }
    return out;
  };
  const permute = (bits, table) => {
    const out = new Uint8Array(table.length);
    for (let i = 0; i < table.length; i++) out[i] = bits[table[i] - 1];
    return out;
  };
  const xor = (a, b) => {
    const out = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
    return out;
  };
  const rotLeft = (bits, n) => {
    const out = new Uint8Array(bits.length);
    for (let i = 0; i < bits.length; i++) out[i] = bits[(i + n) % bits.length];
    return out;
  };

  // ---------- key schedule ----------
  function keySchedule(key8) {
    const bits = toBits(key8);
    const pc1 = permute(bits, PC1);
    let C = pc1.slice(0, 28);
    let D = pc1.slice(28);
    const subkeys = [];
    for (let i = 0; i < 16; i++) {
      C = rotLeft(C, SHIFTS[i]);
      D = rotLeft(D, SHIFTS[i]);
      const CD = new Uint8Array(56);
      CD.set(C); CD.set(D, 28);
      subkeys.push(permute(CD, PC2));
    }
    return subkeys;
  }

  // ---------- f-function ----------
  function f(R, K) {
    const expanded = permute(R, E);
    const xored = xor(expanded, K);
    const out = new Uint8Array(32);
    for (let s = 0; s < 8; s++) {
      const chunk = xored.slice(s*6, s*6+6);
      const row = (chunk[0] << 1) | chunk[5];
      const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
      const v = S[s][row*16 + col];
      for (let b = 0; b < 4; b++) out[s*4 + b] = (v >> (3 - b)) & 1;
    }
    return permute(out, P);
  }

  // ---------- DES on 8-byte block ----------
  function desBlock(block8, key8, decrypt) {
    let bits = toBits(block8);
    bits = permute(bits, IP);
    let L = bits.slice(0, 32);
    let R = bits.slice(32);
    let subkeys = keySchedule(key8);
    if (decrypt) subkeys = subkeys.slice().reverse();
    for (let i = 0; i < 16; i++) {
      const newR = xor(L, f(R, subkeys[i]));
      L = R; R = newR;
    }
    const merged = new Uint8Array(64);
    merged.set(R); merged.set(L, 32);
    return fromBits(permute(merged, FP));
  }

  // ---------- 3DES (EDE) on 8-byte block ----------
  function tdesBlock(block8, k1, k2, k3, decrypt) {
    if (decrypt) {
      // Decrypt: D(K1) -> E(K2) -> D(K3)
      const a = desBlock(block8, k3, true);
      const b = desBlock(a, k2, false);
      return desBlock(b, k1, true);
    }
    // Encrypt: E(K1) -> D(K2) -> E(K3)
    const a = desBlock(block8, k1, false);
    const b = desBlock(a, k2, true);
    return desBlock(b, k3, false);
  }

  // ---------- padding (PKCS#7) ----------
  function pkcs7Pad(bytes) {
    const padLen = 8 - (bytes.length % 8);
    const out = new Uint8Array(bytes.length + padLen);
    out.set(bytes);
    for (let i = bytes.length; i < out.length; i++) out[i] = padLen;
    return out;
  }
  function pkcs7Unpad(bytes) {
    if (!bytes.length) return bytes;
    const padLen = bytes[bytes.length - 1];
    if (padLen < 1 || padLen > 8) throw new Error('Bad padding');
    for (let i = bytes.length - padLen; i < bytes.length; i++)
      if (bytes[i] !== padLen) throw new Error('Bad padding');
    return bytes.slice(0, bytes.length - padLen);
  }

  // ---------- helpers ----------
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  function strToBytes(s) { return enc.encode(s); }
  function bytesToStr(b) { return dec.decode(b); }
  function bytesToHex(b) {
    return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
  }
  function hexToBytes(hex) {
    hex = hex.replace(/[^0-9a-fA-F]/g, '');
    if (hex.length % 2) throw new Error('Bad hex length');
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++)
      out[i] = parseInt(hex.substr(i*2, 2), 16);
    return out;
  }

  // Normalize a key. Accepts:
  //   - hex string (48 chars) → 24 bytes
  //   - raw string → utf8 bytes, padded/extended to 24
  function normalizeKey(input) {
    if (input instanceof Uint8Array) {
      if (input.length === 24) return input;
      const out = new Uint8Array(24);
      for (let i = 0; i < 24; i++) out[i] = input[i % input.length] || 0;
      return out;
    }
    const s = String(input);
    // try hex first if 48 hex chars
    if (/^[0-9a-fA-F]{48}$/.test(s.trim())) return hexToBytes(s.trim());
    let bytes = strToBytes(s);
    if (bytes.length === 0) bytes = strToBytes('default-key');
    const out = new Uint8Array(24);
    for (let i = 0; i < 24; i++) out[i] = bytes[i % bytes.length];
    return out;
  }

  // ---------- public API ----------
  function encryptText(text, key, opts = {}) {
    const { mode = 'CBC', iv = '00000000' } = opts;
    const k = normalizeKey(key);
    const k1 = k.slice(0,8), k2 = k.slice(8,16), k3 = k.slice(16,24);
    let bytes = typeof text === 'string' ? strToBytes(text) : text;
    bytes = pkcs7Pad(bytes);
    const ivBytes = normalizeIv(iv);
    let prev = ivBytes;
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i += 8) {
      let block = bytes.slice(i, i + 8);
      if (mode === 'CBC') block = xor(block, prev);
      const enc = tdesBlock(block, k1, k2, k3, false);
      out.set(enc, i);
      if (mode === 'CBC') prev = enc;
    }
    return bytesToHex(out);
  }
  function decryptText(hexInput, key, opts = {}) {
    const unpadded = decryptBytes(hexInput, key, opts);
    try { return bytesToStr(unpadded); }
    catch { return bytesToHex(unpadded); }
  }
  function decryptBytes(hexInput, key, opts = {}) {
    const { mode = 'CBC', iv = '00000000' } = opts;
    const k = normalizeKey(key);
    const k1 = k.slice(0,8), k2 = k.slice(8,16), k3 = k.slice(16,24);
    const bytes = hexToBytes(hexInput);
    const ivBytes = normalizeIv(iv);
    let prev = ivBytes;
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i += 8) {
      const block = bytes.slice(i, i + 8);
      let dec = tdesBlock(block, k1, k2, k3, true);
      if (mode === 'CBC') dec = xor(dec, prev);
      out.set(dec, i);
      if (mode === 'CBC') prev = block;
    }
    return pkcs7Unpad(out);
  }
  function normalizeIv(iv) {
    if (iv instanceof Uint8Array) {
      const out = new Uint8Array(8);
      for (let i = 0; i < 8; i++) out[i] = iv[i] || 0;
      return out;
    }
    const s = String(iv);
    if (/^[0-9a-fA-F]{16}$/.test(s.trim())) return hexToBytes(s.trim());
    const bytes = strToBytes(s);
    const out = new Uint8Array(8);
    for (let i = 0; i < 8; i++) out[i] = bytes[i % Math.max(1, bytes.length)] || 0;
    return out;
  }

  // single block low-level (for visualization)
  function encryptOneBlockSteps(block8, key24) {
    const k = normalizeKey(key24);
    const k1 = k.slice(0,8), k2 = k.slice(8,16), k3 = k.slice(16,24);
    const a = desBlock(block8, k1, false);
    const b = desBlock(a, k2, true);
    const c = desBlock(b, k3, false);
    return { input: block8, afterE1: a, afterD2: b, afterE3: c, k1, k2, k3 };
  }

  window.TripleDES = {
    encryptText,
    decryptText,
    decryptBytes,
    encryptOneBlockSteps,
    bytesToHex,
    hexToBytes,
    strToBytes,
    bytesToStr,
    normalizeKey,
    normalizeIv,
  };
})();
