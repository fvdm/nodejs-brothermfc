/*
Name:         brothermfc
Description:  Access Brother MFC web UI details with node.js
Author:       Franklin van de Meent (https://frankl.in)
Feedback:     https://github.com/fvdm/nodejs-brothermfc/issues
Source:       https://github.com/fvdm/nodejs-brothermfc
License:      Unlicense / Public Domain (see LICENSE file)
*/

var app = {
  settings: {
    hostname: null,
    port: 80
  },
  general:{}
}

// ! module
module.exports = function( setup ) {
  var props = Object.keys(setup)
  for( var i=0; i < props.length; i++ ) {
    var key = props[i]
    app.settings[key] = setup[key]
  }
  return app
}
