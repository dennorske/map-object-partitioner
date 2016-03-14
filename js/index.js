'use strict';
const map = require('./map');

const SPACE_KEY = 32;
let keys = {};

const MODE_NONE = 0;
const MODE_DRAG_MAP = 1;

window.addEventListener('keydown', function(e) {
  switch(e.keyCode) {
    case SPACE_KEY:
      e.preventDefault();
      keys[e.keyCode] = true;
      break;
  }
});

window.addEventListener('keyup', function(e) {
  switch(e.keyCode) {
    case SPACE_KEY:
      e.preventDefault();
      keys[e.keyCode] = true;
      break;
  }
});

let lastX, lastY, dragMode;
map.canvas.addEventListener('mousedown', function(e) {
  lastX = e.offsetX; lastY = e.offsetY;

  e.preventDefault();
  if(keys[SPACE_KEY]) {
    dragMode = MODE_DRAG_MAP;
  } else {
    dragMode = MODE_NONE;
  }
});
map.canvas.addEventListener('mousemove', function(e) {
  const dx = e.offsetX - lastX, dy = e.offsetY - lastY;
  lastX = e.offsetX; lastY = e.offsetY;

  switch(dragMode) {
    case MODE_DRAG_MAP:
      map.move(dx, dy);
      break;
  }
});
map.canvas.addEventListener('mouseup', function(e) {
  dragMode = MODE_NONE;
});

map.canvas.addEventListener('wheel', function(e) {
  e.preventDefault();
  const scale = Math.pow(2, e.deltaY / 200);
  const mp = map.at(e.offsetX, e.offsetY);
  map.zoom(scale, mp[0], mp[1]);
});
