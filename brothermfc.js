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

// ! Communication
function talk( props, callback ) {
  // ! prevent multiple callbacks
  var complete = false
  function doCallback( err, data ) {
    if( !complete ) {
      complete = true
      callback( err, data || null )
    }
  }
  
  // ! build request
  var query = require('querystring').stringify( props.query )
  var body = props.body || null
  
  var options = {
    host: props.hostname || app.settings.hostname,
    port: props.port || app.settings.port || 80,
    path: props.path,
    method: props.method || 'GET',
    headers: {}
  }

  // ! custom request headers
  if( props.headers && props.headers instanceof Object ) {
    options.headers = props.headers
  }
  
  // ! querystring and body
  if( options.method == 'GET' && query ) {
    options.path +'?'+ query
  }
  
  if( options.method !== 'GET' ) {
    if( !body && query ) {
      body = query
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      options.headers['Content-Length'] = body.length
    } else if( body && query ) {
      options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/x-www-form-urlencoded'
      options.headers['Content-Length'] = body.length
      options.path += '?'+ query
    }
  }
  
  // ! request
  var protocol = app.settings.protocol == 'https' || props.protocol == 'https' ? 'https' : 'http'
  var request = require( protocol ).request( options )
  
  // ! response
  request.on('response', function( response ) {
    var data = ''
    var error = null
    
    response.on('data', function(ch) { data += ch })
    response.on('close', function() { doCallback( new Error('request closed') ) })
    
    // ! response process
    response.on('end', function() {
      var res = {
        code: response.statusCode,
        headers: response.headers,
        data: data.trim()
      }
      
      if( response.statusCode >= 300 ) {
        error = new Error('HTTP error')
        error.code = res.code
      }
      
      doCallback( error, res )
    })
  })
  
  // ! request error
  request.on('error', function( error ) {
    var err = new Error('request failed')
    err.error = error
    doCallback( err )
  })
  
  // ! request end
  if( options.method == 'GET' ) {
    request.end()
  } else {
    request.end( body )
  }
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
