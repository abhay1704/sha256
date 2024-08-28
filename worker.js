importScripts("sha256.js");

self.onmessage = function (e) {
  const { hash: realHash } = e.data;
  const start = new Date();

  let i = 0;
  while (i < Math.pow(10, 9)) {
    const guess = i.toString();
    const hash = sha256(guess);
    if (i % 1000 === 0) {
      self.postMessage({ inProgress: true, progress: i });
    }
    if (realHash === hash) {
      const end = new Date();
      const timeTaken = (end - start) / 1000;
      self.postMessage({ success: true, iterations: i, timeTaken });
      break;
    }
    i++;
  }

  if (i === Math.pow(10, 9)) self.postMessage({ success: false });
};
