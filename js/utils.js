'use strict';

// find center of mass and area
exports.findCOM = function(polygon) {
  let Cx = 0, Cy = 0, A = 0;
  for(let j = 0; j < polygon.length; j++) {
    const i = (j === 0 ? polygon.length - 1 : j - 1);
    const a = polygon[i], b = polygon[j];

    const k = (a[0] * b[1] - a[1] * b[0]);
    A  += k;
    Cx += (a[0] + b[0]) * k;
    Cy += (a[1] + b[1]) * k;
  }

  A  /= 2;
  Cx /= 6 * A;
  Cy /= 6 * A;

  // 0 = center X
  // 1 = center Y
  // 2 = unsigned area
  // 3 = signed area
  return [ Cx, Cy, Math.abs(A), A ];
};

// figure out if a point is contained in a polygon
exports.containsPoint = function(polygon, x, y) {
  // pick a random line
  const lang = 2 * Math.PI * Math.random();
  const lx = Math.cos(lang), ly = Math.sin(lang);

  let c = [ 0, 0 ];

  // count how many times each edge of the polygon intersets the line,
  // on the positive and negative side relative to the point in question
  for(let j = 0; j < polygon.length; j++) {
    const i = (j === 0 ? polygon.length - 1 : j - 1);
    const a = polygon[i], b = polygon[j];

    // we need these constants for calcuation
    const rx = b[0] - a[0], ry = b[1] - a[1];
    const kx = a[0] - x, ky = a[1] - y;

    // ensure that the lines aren't parallel
    const d = rx * ly - ry * lx;
    if(d === 0) {
      console.warn('Parallel line occurred');
      continue;
    }

    const s = -ry / d * kx + rx / d * ky;
    const t = -ly / d * kx + lx / d * ky;

    if(t < 0 || t > 1) // not intersecting
      continue;

    if(s < 0)
      c[0]++;
    else
      c[1]++;
  }

  // contained if c[0] and c[1] are both odd
  if(c[0] % 2 === 1 && c[1] % 2 === 1) {
    return true;
  }

  return false;
};

// log various messages
exports.log = function(message) {
  const logEl = document.getElementById('log-output');
  logEl.value += message + '\n';
  logEl.scrollTop = logEl.scrollHeight;
};
exports.clearLog = function() {
  const logEl = document.getElementById('log-output');
  logEl.value = '';
};

// save file
exports.saveFile = function(file, filename) {
  const url = URL.createObjectURL(file);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};
