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
