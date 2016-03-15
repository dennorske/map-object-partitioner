'use strict';
const map = require('./map');
const code = require('./code');

const MODE_NONE = 0;
const MODE_DOWN = 1;
const MODE_DRAG_MAP = 2;

const updateCoordinates = function(mx, my) {
  if(mx == null || my == null) {
    document.getElementById('coordinates').textContent = '???';
  } else {
    const p = map.at(mx, my);
    document.getElementById('coordinates').textContent = p[0].toFixed(1) + ',' + p[1].toFixed(1);
  }
};

let lastX, lastY, dragMode;
map.canvas.addEventListener('mouseenter', function(e) {
  updateCoordinates(e.offsetX, e.offsetY);
});
map.canvas.addEventListener('mouseleave', function(e) {
  updateCoordinates(null, null);
});
map.canvas.addEventListener('mousedown', function(e) {
  updateCoordinates(e.offsetX, e.offsetY);
  lastX = e.offsetX; lastY = e.offsetY;

  e.preventDefault();
  dragMode = MODE_DOWN;
});
map.canvas.addEventListener('mousemove', function(e) {
  updateCoordinates(e.offsetX, e.offsetY);

  const dx = e.offsetX - lastX, dy = e.offsetY - lastY;
  lastX = e.offsetX; lastY = e.offsetY;

  switch(dragMode) {
    case MODE_DOWN:
      dragMode = MODE_DRAG_MAP;
      map.move(dx, dy);
      break;

    case MODE_DRAG_MAP:
      map.move(dx, dy);
      break;
  }
});
map.canvas.addEventListener('mouseup', function(e) {
  updateCoordinates(e.offsetX, e.offsetY);
  dragMode = MODE_NONE;
});

map.canvas.addEventListener('wheel', function(e) {
  e.preventDefault();
  const scale = Math.pow(2, e.deltaY / 200);
  const mp = map.at(e.offsetX, e.offsetY);
  map.zoom(scale, mp[0], mp[1]);
});

document.getElementById('load-btn').addEventListener('click', function(e) {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if(file == null) return;

  // parse file
  code.parseFile(file)
    .then((objects) => {
      map.updateObjects(objects);
    })
    .catch((error) => {
      console.error(error.stack || error);
    });
});
