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

app.general.status = function( cb ) {
  talk( {method: 'GET', path: '/general/status.html'}, function( err, res ) {
    if( err ) { return cb(err) }
    var result = {model: null, status: null, message: null, ink:{}}
    
    res.data.replace(/<div id="modelName"><h1>([^<]+)<\/h1>/, function(s,t) {
      result.model = t
    })
    
    res.data.replace(/<div id="moni_data"><span class="moni ([^\"]+)">([^<]+)<\/span><\/div>/, function(s,t,m) {
      result.status = t
      result.message = m
    })
    
    res.data.replace(/<img src="\.\.\/common\/images\/(\w+)\.gif" alt="([^\"]+)" class="tonerremain" height="(\d+)px"/g, function(s,c,s,p) {
      var percent = Math.round( p * 1.7857142857 )
      result.ink[c] = percent
    })
    
    res.data.replace(/<li class="(contact|location)">[^<]+<span class="spacer">:<\/span>([^<]+)<\/li>/g, function(s,t,v) {
      result[t] = v
    })
    
    cb( null, result )
  })
}

app.general.information = function( cb ) {
  talk( {method:'GET', path:'/etc/mnt_info.csv'}, function( err, res ) {
    if( err ) { return cb(err) }
    
    var data = res.data.replace(/\""{0}/g, '')
    data = data.split('\n')
    
    var one = data[0].split(',')
    var two = data[1].split(',')
    var result = {}
    
    for( var i=0; i < one.length; i++ ) {
      var val = two[i].trim()
      var key = one[i].trim().replace(/(.+)/, function(s,t) {
        return t.toLowerCase().replace(' ', '_').replace('.', '')
      })
    
      if( key != '' && val != '' ) {
        result[ key ] = val.match(/^\d+$/) ? val *1 : val
      }
    }
    
    cb( null, result )
  })
}

app.general.sleep = function( set, cb ) {
  if( ! cb ) {
    talk({method:'GET', path:'/general/sleep.html'}, function( err, res ) {
      if( err ) { return cb(err) }
      var result = {presets:[]}
      var value = null
      
      res.data.replace(/<select id="B15" name="B15" >(.+)<\/select>/, function(s,sel) {
        sel.replace(/<option value="(\d+)"( selected="selected")?>(\d+)&#32;Mins<\/option>/g, function(s,a,b,c) {
          result.presets.push( {key: a, minutes: c *1} )
          if( b ) {
            result.value = {key: a, minutes: c *1}
          }
        })
      })
      
      set( null, result )
    })
  } else {
    var form = {
      pageid: 5,
      postif_registration_reject: 1,
      B15: set
    }
    
    talk({method:'POST', path:'/general/sleep.html', query:form}, function( err, res ) {
      if( err ) { return cb(err) }
      if( !!~res.data.indexOf('<div class="postSuccess">') ) {
        cb( null, true )
      } else {
        cb( new Error('post failed') )
      }
    })
  }
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
