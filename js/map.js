'use strict';

// get map canvas
const map = exports.canvas = document.getElementById('map');
const ctx = map.getContext('2d');

// TODO: ensure that (ctx != null)

// map image
const mapImage = new Image();

// in-world objects
let objects = [];

// center of view
const view = {
  // center of view
  x: 0,
  y: 0,
  // zoom level
  z: 0.1,
};

// update world objects
const updateObjects = exports.updateObjects = function(newObjects) {
  objects = newObjects;
};

let nextUpdate = null;
const doUpdate = function() {
  nextUpdate = null;

  // for convenience, define WIDTH/2 and HEIGHT/2
  const w = map.width / 2;
  const h = map.height / 2;

  // ensure we don't look outside the map
  if(view.z < Math.min(w / 3000, h / 3000))
    view.z = Math.min(w / 3000, h / 3000);
  if(view.z > 1)
    view.z = 1;
  if(view.x - w / view.z < -3000)
    view.x = -3000 + w / view.z;
  if(view.x + w / view.z > 3000)
    view.x = 3000 - w / view.z;
  if(view.y - h / view.z < -3000)
    view.y = -3000 + h / view.z;
  if(view.y + h / view.z > 3000)
    view.y = 3000 - h / view.z;

  // find which part of map image to show
  const sx = 3000 + view.x - w / view.z;
  const sy = 3000 + view.y - h / view.z;
  const sw = map.width / view.z;
  const sh = map.height / view.z;

  // draw map image
  ctx.clearRect(0, 0, map.width, map.height);
  ctx.drawImage(mapImage, sx, sy, sw, sh, 0, 0, map.width, map.height);
};

// update map view
const updateView = exports.updateView = function() {
  if(nextUpdate == null)
    nextUpdate = requestAnimationFrame(doUpdate);
};

// get coordinates of position on canvas
const at = exports.at = function(mx, my) {
  const px = (mx - map.width / 2) / view.z + view.x;
  const py = (my - map.height / 2) / view.z + view.y;
  return [ px, py ];
};

// zoom, optionally fixing a point
const zoom = exports.zoom = function(scale, fx, fy) {
  if(fx == null || fy == null) {
    fx = view.x; fy = view.y;
  }

  const zMax = 1;
  const zMin = Math.min(map.width / 6000, map.height / 6000);
  if(view.z / scale > zMax)
    scale = view.z / zMax;
  if(view.z / scale < zMin)
    scale = view.z / zMin;

  view.x = (view.x - fx) * scale + fx;
  view.y = (view.y - fy) * scale + fy;
  view.z /= scale;

  updateView();
};

// move map
const move = exports.move = function(dx, dy) {
  view.x -= dx / view.z;
  view.y -= dy / view.z;

  updateView();
};

// load map image
mapImage.onload = () => updateView();
mapImage.src = 'SanAndreas-TerrainMap.jpg';
