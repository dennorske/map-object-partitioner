'use strict';
(function() {
  const map = document.getElementById('map');
  const ctx = map.getContext('2d');

  const imageMap = new Image();
  const IMAGE_WIDTH  = 6000;
  const IMAGE_HEIGHT = 6000;

  // center coordinates and zoom
  let cx = 0, cy = 0, z = 0.1;

  const at = function(mouseX, mouseY) {
    const x = (mouseX - map.width / 2) / z + cx;
    const y = (mouseY - map.height / 2) / z + cy;
    return [ x, y ];
  };

  const update = function() {
    const WIDTH = map.width;
    const HEIGHT = map.height;

    // ensure that we don't go outside of map bounds
    if(z < Math.min(WIDTH / IMAGE_WIDTH, HEIGHT / IMAGE_HEIGHT))
      z = Math.min(WIDTH / IMAGE_WIDTH, HEIGHT / IMAGE_HEIGHT);
    if(cx - WIDTH / 2 / z < -IMAGE_WIDTH / 2)
      cx = -IMAGE_WIDTH / 2 + WIDTH / 2 / z;
    if(cx + WIDTH / 2 / z > IMAGE_WIDTH / 2)
      cx = IMAGE_WIDTH / 2 - WIDTH / 2 / z;
    if(cy - HEIGHT / 2 / z < -IMAGE_HEIGHT / 2)
      cy = -IMAGE_HEIGHT / 2 + HEIGHT / 2 / z;
    if(cy + HEIGHT / 2 / z > IMAGE_HEIGHT / 2)
      cy = IMAGE_HEIGHT / 2 - HEIGHT / 2 / z;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // find rectangle of source image
    const sx = IMAGE_WIDTH / 2 + cx - WIDTH / 2 / z;
    const sy = IMAGE_HEIGHT / 2 + cy - HEIGHT / 2 / z;
    const sw = WIDTH / z;
    const sh = HEIGHT / z;

    // draw image
    ctx.drawImage(imageMap, sx, sy, sw, sh, 0, 0, WIDTH, HEIGHT);
  };

  const NONE = Symbol('NONE');
  const DRAG = Symbol('DRAG');

  // drag
  let mode = NONE;
  let lastX, lastY;
  map.addEventListener('mousedown', function(e) {
    if(e.button === 0 && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      mode = DRAG;
    }
    lastX = e.offsetX; lastY = e.offsetY;
  });
  map.addEventListener('mousemove', function(e) {
    const dx = e.offsetX - lastX, dy = e.offsetY - lastY;
    lastX = e.offsetX; lastY = e.offsetY;

    switch(mode) {
      case DRAG:
        cx -= dx / z;
        cy -= dy / z;
        update();
        break;
    }
  });
  map.addEventListener('mouseup', function(e) {
    mode = NONE;
  });

  // zoom
  map.addEventListener('wheel', function(e) {
    e.preventDefault();
    let zoomScale = Math.pow(2, -e.deltaY / 200);

    let mp = at(e.offsetX, e.offsetY);
    let mx = mp[0], my = mp[1];

    cx = (cx - mx) / zoomScale + mx;
    cy = (cy - my) / zoomScale + my;
    z *= zoomScale;

    update();
  });

  // load image
  imageMap.onload = function() { update(); };
  imageMap.src = 'SanAndreas-TerrainMap.jpg';

  update();
  window.update = update;
})();
