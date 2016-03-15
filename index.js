/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const map = __webpack_require__(1);
	const code = __webpack_require__(2);

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


/***/ },
/* 1 */
/***/ function(module, exports) {

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
	  ctx.drawImage(mapImage, 3000 + x0, 3000 + y0, x1 - x0, y1 - y0, 0, 0, map.width, map.height);

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
	  const py = (my - map.height / 2) / view.z + view.y;
	  return [ px, py ];
	};

	// get canvas position of coordinate
	const where = exports.where = function(px, py) {
	  const cx = (px - view.x) * view.z + map.width / 2;
	  const cy = (py - view.y) * view.z + map.height / 2;
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
	  view.y -= dy / view.z;

	  updateView();
	};

	// load map image
	mapImage.onload = () => updateView();
	mapImage.src = 'SanAndreas-TerrainMap.jpg';


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	// read code from file
	exports.parseFile = function(file) {
	  return new Promise(function(resolve, reject) {
	    const reader = new FileReader();

	    reader.onerror = function(e) {
	      reject(e);
	    };

	    reader.onload = function() {
	      console.log('read file');
	      resolve(reader.result);
	    };

	    console.log('reading file...');
	    reader.readAsText(file);
	  })
	    .then((text) => {
	      const pattern = new RegExp('(AddStaticVehicle(?:Ex)?|CreateDynamicObject)\\(([0-9., +-]*)\\)', 'gm');
	      let m;

	      const objects = [];
	      while((m = pattern.exec(text)) != null) {
	        const func = m[1];
	        const args = m[2].split(',').map((x) => parseFloat(x));

	        const obj = { line: m[0], type: func };
	        switch(func) {
	          case 'AddStaticVehicle':
	          case 'AddStaticVehicleEx':
	          case 'CreateDynamicObject':
	            obj.id = args[0];
	            obj.x = args[1];
	            obj.y = args[2];
	            break;
	        }

	        objects.push(obj);
	      }

	      console.log('Loaded ' + objects.length + ' objects');

	      return objects;
	    });
	};


/***/ }
/******/ ]);