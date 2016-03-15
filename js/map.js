'use strict';

const ZOOM_MAX = 4;

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
  updateView();
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
  if(view.z > ZOOM_MAX)
    view.z = ZOOM_MAX;
  if(view.x - w / view.z < -3000)
    view.x = -3000 + w / view.z;
  if(view.x + w / view.z > 3000)
    view.x = 3000 - w / view.z;
  if(view.y - h / view.z < -3000)
    view.y = -3000 + h / view.z;
  if(view.y + h / view.z > 3000)
    view.y = 3000 - h / view.z;

  // calculate bounds
  const x0 = view.x - w / view.z;
  const x1 = view.x + w / view.z;
  const y0 = view.y - h / view.z;
  const y1 = view.y + h / view.z;

  // draw map image
  ctx.clearRect(0, 0, map.width, map.height);
  ctx.drawImage(mapImage, 3000 + x0, 3000 - y1, x1 - x0, y1 - y0, 0, 0, map.width, map.height);

  // draw objects
  const dotSize = 3 * Math.sqrt(view.z);
  const styles = {
    'AddStaticVehicle': '#ff0000',
    'AddStaticVehicleEx': '#00ff00',
    'CreateDynamicObject': '#ffff00',
    'undefined': 'gray',
  };
  for(let i = 0; i < objects.length; i++) {
    const obj = objects[i];

    if(obj.x < x0 || obj.x > x1 || obj.y < y0 || obj.y > y1)
      continue;

    const p = where(obj.x, obj.y);

    ctx.fillStyle = styles[obj.type];
    ctx.beginPath();
    ctx.arc(p[0], p[1], dotSize, 0, 2 * Math.PI);
    ctx.fill();
  }
};

// update map view
const updateView = exports.updateView = function() {
  if(nextUpdate == null)
    nextUpdate = requestAnimationFrame(doUpdate);
};

// get coordinates of position on canvas
const at = exports.at = function(mx, my) {
  const px = (mx - map.width / 2) / view.z + view.x;
  const py = -(my - map.height / 2) / view.z + view.y;
  return [ px, py ];
};

// get canvas position of coordinate
const where = exports.where = function(px, py) {
  const cx = (px - view.x) * view.z + map.width / 2;
  const cy = -(py - view.y) * view.z + map.height / 2;
  return [ cx, cy ];
};

// zoom, optionally fixing a point
const zoom = exports.zoom = function(scale, fx, fy) {
  if(fx == null || fy == null) {
    fx = view.x; fy = view.y;
  }

  const zMin = Math.min(map.width / 6000, map.height / 6000);
  if(view.z / scale > ZOOM_MAX)
    scale = view.z / ZOOM_MAX;
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
  view.y += dy / view.z;

  updateView();
};

// load map image
mapImage.onload = () => updateView();
mapImage.src = 'SanAndreas-TerrainMap.jpg';
