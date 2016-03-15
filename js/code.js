'use strict';
const utils = require('./utils');

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

      const pattern = new RegExp('(AddStaticVehicle(?:Ex)?|CreateDynamicObject)\\(([0-9., +-]*)\\)', 'gm');
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
