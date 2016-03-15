'use strict';
const map = require('./map');
const code = require('./code');

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
