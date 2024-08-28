const nRounds = 64;
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function applyPadding(msg) {
  let bitLen = msg.length * 8; // Length in bits
  msg = [...msg]
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");

  // Append '1' bit
  msg += "1";

  // Calculate the amount of '0' bits to pad (448 mod 512 - current length mod 512)
  // lenght = (padding + msg.len)%512 + 64 = 0
  let padLen = (448 - ((bitLen + 1) % 512) + 512) % 512;
  msg += "0".repeat(padLen);

  // Append original length as 64-bit binary string
  let lenBinary = bitLen.toString(2).padStart(64, "0");
  msg += lenBinary;

  // Split the message into 512-bit (64-byte) chunks
  return [...msg.match(/.{512}/g)];
}

function rotr(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function shr(x, n) {
  return (x >>> n) >>> 0;
}

function sigma0(x) {
  return (rotr(x, 7) ^ rotr(x, 18) ^ shr(x, 3)) >>> 0;
}

function sigma1(x) {
  return (rotr(x, 17) ^ rotr(x, 19) ^ shr(x, 10)) >>> 0;
}

function Sigma0(x) {
  return (rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22)) >>> 0;
}

function Sigma1(x) {
  return (rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25)) >>> 0;
}

function choice(e, f, g) {
  return ((e & f) ^ (~e & g)) >>> 0;
}

function majority(a, b, c) {
  return ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
}

function sha256(message) {
  const paddedMsg = applyPadding(message);
  let [a, b, c, d, e, f, g, h] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];

  for (let chunk of paddedMsg) {
    let W = new Array(64);
    for (let i = 0; i < 16; i++) {
      W[i] = parseInt(chunk.slice(i * 32, (i + 1) * 32), 2);
    }
    for (let i = 16; i < 64; i++) {
      W[i] =
        (sigma1(W[i - 2]) + W[i - 7] + sigma0(W[i - 15]) + W[i - 16]) >>> 0;
    }

    let [A, B, C, D, E, F, G, H] = [a, b, c, d, e, f, g, h];

    for (let i = 0; i < 64; i++) {
      const T1 = (H + Sigma1(E) + choice(E, F, G) + K[i] + W[i]) >>> 0;
      const T2 = (Sigma0(A) + majority(A, B, C)) >>> 0;

      H = G;
      G = F;
      F = E;
      E = (D + T1) >>> 0;
      D = C;
      C = B;
      B = A;
      A = (T1 + T2) >>> 0;
    }

    // Compression function
    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
    e = (e + E) >>> 0;
    f = (f + F) >>> 0;
    g = (g + G) >>> 0;
    h = (h + H) >>> 0;
  }

  return [a, b, c, d, e, f, g, h]
    .map((x) => x.toString(16).padStart(8, "0"))
    .join("");
}
