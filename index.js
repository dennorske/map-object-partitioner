/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const map = __webpack_require__(1);
	const code = __webpack_require__(3);
	
	const MODE_NONE = 0;
	const MODE_DOWN = 1;
	const MODE_DRAG_MAP = 2;
	
	let nextAreaId = 0;
	
	const updateCoordinates = function(mx, my) {
	  if(mx == null || my == null) {
	    document.getElementById('coordinates').textContent = '???';
	  } else {
	    const p = map.at(mx, my);
	    document.getElementById('coordinates').textContent = p[0].toFixed(1) + ',' + p[1].toFixed(1);
	
	    if(map.currentArea.length > 1) {
	      map.currentArea[map.currentArea.length - 1] = p;
	      map.updateView();
	    }
	  }
	};
	
	window.addEventListener('keydown', function(e) {
	  switch(e.keyCode) {
	    case 27: // ESC
	      // cancel current polygon
	      e.preventDefault();
	      map.currentArea.length = 0;
	      map.updateView();
	      break;
	  }
	});
	
	let lastX, lastY, dragMode, ignoreDrag = null;
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
	  if(e.buttons === 1) {
	    if(ignoreDrag != null)
	      clearTimeout(ignoreDrag);
	    ignoreDrag = setTimeout(() => (ignoreDrag = null), 25);
	    dragMode = MODE_DOWN;
	  } else if(e.buttons === 2) {
	    if(e.shiftKey) { // cancel last point
	      if(map.currentArea.length <= 2) {
	        map.currentArea.length = 0;
	      } else {
	        map.currentArea.splice(map.currentArea.length - 2, 1);
	      }
	    } else { // cancel polygon
	      if(map.currentArea.length > 3) {
	        const newArea = [];
	        let x0, x1, y0, y1; // bounds
	        for(let i = 0; i < map.currentArea.length - 1; i++) {
	          const pt = map.currentArea[i];
	          newArea.push(pt);
	
	          if(x0 == null || pt[0] < x0)
	            x0 = pt[0];
	          if(x1 == null || pt[0] > x1)
	            x1 = pt[0];
	          if(y0 == null || pt[1] < y0)
	            y0 = pt[1];
	          if(y1 == null || pt[1] > y1)
	            y1 = pt[1];
	        }
	
	        const id = nextAreaId++;
	        newArea.id = id;
	        map.areas.push(newArea);
	
	        // add element to polygon list
	        const li = document.createElement('li');
	
	        const link = document.createElement('a');
	        link.href = '#';
	        link.onclick = function(e) {
	          e.preventDefault();
	          map.zoomRect(x0, x1, y0, y1);
	        };
	        link.textContent = 'Polygon #' + id;
	
	        const deleteLink = document.createElement('a');
	        deleteLink.href = '#';
	        deleteLink.onclick = function(e) {
	          e.preventDefault();
	          li.parentNode.removeChild(li);
	
	          const index = map.areas.indexOf(newArea);
	          if(index >= 0) {
	            map.areas.splice(index, 1);
	            map.updateView();
	          }
	        };
	        deleteLink.textContent = '(X)';
	
	        li.appendChild(link);
	        li.appendChild(document.createTextNode(' '));
	        li.appendChild(deleteLink);
	        document.getElementById('polygon-list').appendChild(li);
	      }
	      map.currentArea.length = 0;
	    }
	  }
	});
	map.canvas.addEventListener('mousemove', function(e) {
	  updateCoordinates(e.offsetX, e.offsetY);
	
	  const dx = e.offsetX - lastX, dy = e.offsetY - lastY;
	  lastX = e.offsetX; lastY = e.offsetY;
	
	  if(ignoreDrag != null)
	    return;
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
	  if(ignoreDrag != null) {
	    clearTimeout(ignoreDrag);
	    ignoreDrag = null;
	  }
	  dragMode = MODE_NONE;
	});
	map.canvas.addEventListener('dblclick', function(e) {
	  updateCoordinates(e.offsetX, e.offsetY);
	
	  const p = map.at(e.offsetX, e.offsetY);
	  if(map.currentArea.length <= 1) {
	    map.currentArea.length = 0;
	    map.currentArea[0] = p;
	    map.currentArea[1] = p;
	    map.updateView();
	  } else {
	    map.currentArea.push(p);
	  }
	});
	map.canvas.addEventListener('contextmenu', function(e) {
	  e.preventDefault();
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
	
	document.getElementById('zoom-out-btn').addEventListener('click', function(e) {
	  map.zoomRect(-3000, 3000, -3000, 3000);
	});
	
	document.getElementById('update-btn').addEventListener('click', function(e) {
	  // get objects and polygons
	  const objects = map.objects;
	  const areas = map.areas;
	
	  // sort objects
	  code.sortObjects(objects, areas)
	    .then((result) => {
	      map.updateView();
	    })
	    .catch((error) => {
	      console.error(error.stack || error);
	    });
	});
	
	document.getElementById('save-btn').addEventListener('click', function(e) {
	  // get objects and polygons
	  const objects = map.objects;
	
	  // save objects to file
	  code.saveObjects(objects)
	    .then((result) => {
	    })
	    .catch((error) => {
	      console.error(error.stack || error);
	    });
	});
	
	document.getElementById('hide-valid').addEventListener('change', function(e) {
	  map.hideValid = e.target.checked;
	  map.updateView();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	const utils = __webpack_require__(2);
	
	const ZOOM_MAX = 4;
	
	// get map canvas
	const map = exports.canvas = document.getElementById('map');
	const ctx = map.getContext('2d');
	
	// TODO: ensure that (ctx != null)
	
	// map image
	const mapImage = new Image();
	
	// should hide objects in valid polygon?
	
	// in-world objects
	let objects = exports.objects = [ ];
	
	// areas
	let areas = exports.areas = [ ];
	let currentArea = exports.currentArea = [];
	
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
	  objects = exports.objects = newObjects;
	  updateView();
	};
	
	let nextUpdate = null;
	const doUpdate = function() {
	  nextUpdate = null;
	
	  // for convenience, define WIDTH/2 and HEIGHT/2
	  const w = map.width / 2;
	  const h = map.height / 2;
	
	  // calculate bounds
	  const x0 = view.x - w / view.z;
	  const x1 = view.x + w / view.z;
	  const y0 = view.y - h / view.z;
	  const y1 = view.y + h / view.z;
	
	  // draw map image
	  ctx.clearRect(0, 0, map.width, map.height);
	  ctx.drawImage(mapImage, 3000 + x0, 3000 - y1, x1 - x0, y1 - y0, 0, 0, map.width, map.height);
	
	  // draw objects
	  const styles = {
	    'AddStaticVehicle': 'rgba(255,0,0,1)',
	    'AddStaticVehicleEx': 'rgba(0,255,0,1)',
	    'CreateObject': 'rgba(255,128,0,1)',
	    'CreateDynamicObject': 'rgba(255,255,0,1)',
	    'undefined': 'gray',
	    'undefined:hide': 'gray',
	  };
	  for(let i = 0; i < objects.length; i++) {
	    const obj = objects[i];
	
	    if(obj.x < x0 || obj.x > x1 || obj.y < y0 || obj.y > y1)
	      continue;
	
	    const p = where(obj.x, obj.y);
	
	    let dotSize = 4 * Math.sqrt(view.z);
	    let hide = false;
	    if(obj.areas != null && obj.areas.length === 1) {
	      dotSize = 2 * Math.sqrt(view.z);
	      hide = true;
	    }
	
	    if(hide && exports.hideValid)
	      continue;
	
	    ctx.fillStyle = styles[obj.type + (hide ? ':hide' : '')];
	    ctx.beginPath();
	    ctx.arc(p[0], p[1], dotSize, 0, 2 * Math.PI);
	    ctx.fill();
	  }
	
	  // draw areas
	  for(let j = 0; j < areas.length; j++) {
	    const area = areas[j];
	
	    ctx.fillStyle = 'rgba(0,0,255,0.1)';
	    ctx.strokeStyle = 'rgb(0,0,255)';
	    ctx.lineWidth = 1;
	    ctx.beginPath();
	    for(let i = 0; i < area.length; i++) {
	      const mp = area[i];
	      const pt = where(mp[0], mp[1]);
	
	      if(i === 0)
	        ctx.moveTo(pt[0], pt[1]);
	      else
	        ctx.lineTo(pt[0], pt[1]);
	    }
	    ctx.closePath();
	    ctx.fill();
	    ctx.stroke();
	
	    // find center of mass and area
	    const C = utils.findCOM(area);
	    const pt = where(C[0], C[1]);
	
	    const fontSize = Math.sqrt(C[2]) / 5 * view.z;
	    ctx.font = (fontSize | 0) + 'px sans-serif';
	    ctx.fillStyle = 'rgb(0,128,255)';
	    ctx.textAlign = 'center';
	    ctx.textBaseline = 'center';
	    ctx.fillText(area.id, pt[0], pt[1]);
	  }
	
	  // draw current area
	  if(currentArea.length > 1) {
	    ctx.fillStyle = 'rgba(0,0,255,0.1)';
	    ctx.strokeStyle = 'rgb(0,0,255)';
	    ctx.lineWidth = 3;
	    ctx.beginPath();
	    for(let i = 0; i < currentArea.length; i++) {
	      const mp = currentArea[i];
	      const pt = where(mp[0], mp[1]);
	
	      if(i === 0)
	        ctx.moveTo(pt[0], pt[1]);
	      else
	        ctx.lineTo(pt[0], pt[1]);
	    }
	    ctx.fill();
	    ctx.stroke();
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
	
	  if(view.z / scale > ZOOM_MAX)
	    scale = view.z / ZOOM_MAX;
	
	  view.x = (view.x - fx) * scale + fx;
	  view.y = (view.y - fy) * scale + fy;
	  view.z /= scale;
	
	  updateView();
	};
	
	// zoom rectangle into view
	const zoomRect = exports.zoomRect = function(x0, x1, y0, y1) {
	  view.x = (x0 + x1) / 2;
	  view.y = (y0 + y1) / 2;
	  view.z = 1 / Math.max((x1 - x0) / map.width, (y1 - y0) / map.height);
	
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


/***/ },
/* 2 */
/***/ function(module, exports) {

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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const utils = __webpack_require__(2);
	
	// read code from file
	exports.parseFile = function(file) {
	  return new Promise(function(resolve, reject) {
	    const reader = new FileReader();
	
	    reader.onerror = function(e) {
	      reject(e);
	    };
	
	    reader.onload = function() {
	      resolve(reader.result);
	    };
	    utils.log('Reading file...');
	    reader.readAsText(file);
	  })
	    .then((text) => {
	      utils.log('Parsing file...');
	
	      const pattern = new RegExp('(AddStaticVehicle(?:Ex)?|Create(?:Dynamic)?Object)\\(([0-9., +-]*)\\)', 'gm');
	      let m;
	
	      const objects = [];
	      while((m = pattern.exec(text)) != null) {
	        const func = m[1];
	        const args = m[2].split(',').map((x) => parseFloat(x));
	
	        const obj = {
	          line: m[0], type: func };
	        switch(func) {
	          case 'AddStaticVehicle':
	          case 'AddStaticVehicleEx':
	          case 'CreateObject':
	          case 'CreateDynamicObject':
	            obj.id = args[0];
	            obj.x = args[1];
	            obj.y = args[2];
	            break;
	        }
	
	        objects.push(obj);
	      }
	
	      utils.log('Loaded ' + objects.length + ' objects');
	
	      return objects;
	    });
	};
	
	// sort objects by area
	exports.sortObjects = function(objects, areas) {
	  // TODO: maybe do this in own thread?
	  return new Promise(function(resolve, reject) {
	    utils.log('Sorting objects...');
	
	    let noPolygon = 0, overlappingPolygons = 0;
	
	    for(let i = 0; i < objects.length; i++) {
	      const obj = objects[i];
	
	      obj.areas = [];
	      for(let j = 0; j < areas.length; j++) {
	        if(utils.containsPoint(areas[j], obj.x, obj.y)) {
	          obj.areas.push(areas[j].id);
	        }
	      }
	
	      if(obj.areas.length === 0)
	        noPolygon++;
	      else if(obj.areas.length > 1)
	        overlappingPolygons++;
	    }
	
	    utils.log('Done!');
	    utils.log('Total objects: ' + objects.length);
	    utils.log('  Covered by no polygon:  ' + noPolygon);
	    utils.log('  Covered by two or more: ' + overlappingPolygons);
	
	    resolve();
	  });
	};
	
	// save objects
	const sortXY = function(a, b) {
	  if(a.x < b.x) return -1;
	  if(a.x > b.x) return 1;
	  if(a.y < b.y) return -1;
	  if(a.y > b.y) return 1;
	  if(a.z < b.z) return -1;
	  if(a.z > b.z) return 1;
	  return 0;
	};
	exports.saveObjects = function(objects) {
	  return new Promise(function(resolve, reject) {
	    utils.log('Generating file...');
	
	    const NONE = Symbol('NONE');
	
	    const sorted = { [NONE]: [] };
	
	    for(let i = 0; i < objects.length; i++) {
	      const obj = objects[i];
	
	      let key;
	      if(obj.areas == null || obj.areas.length === 0) {
	        key = NONE;
	      } else {
	        key = obj.areas[0];
	      }
	
	      if(!Object.prototype.hasOwnProperty.call(sorted, key))
	        sorted[key] = [];
	      sorted[key].push(obj);
	    }
	
	    const lines = [];
	
	    // sort and write out uncategorized objects
	    if(sorted[NONE].length > 0) {
	      sorted[NONE].sort(sortXY);
	
	      lines.push('/**');
	      lines.push(' * Uncategorized: ' + sorted[NONE].length);
	      lines.push('**/');
	      lines.push('');
	
	      for(let i = 0; i < sorted[NONE].length; i++) {
	        const obj = sorted[NONE][i];
	        lines.push(obj.line + ';');
	      }
	
	      lines.push('');
	      lines.push('');
	    }
	
	    // sort areas
	    const keys = Object.getOwnPropertyNames(sorted);
	    for(let j = 0; j < keys.length; j++) {
	      const key = keys[j];
	      const list = sorted[key];
	
	      list.sort(sortXY);
	
	      lines.push('/**');
	      lines.push(' * Area #' + key + ': ' + list.length);
	      lines.push('**/');
	      lines.push('');
	
	      for(let i = 0; i < list.length; i++) {
	        const obj = list[i];
	        lines.push(obj.line + ';');
	      }
	
	      lines.push('');
	      lines.push('');
	    }
	
	    utils.log('Done, downloading in browser');
	
	    const blob = new Blob([ lines.join('\n') ], { type: 'text/plain' });
	    utils.saveFile(blob, 'sorted.txt');
	  });
	};


/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map