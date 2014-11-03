brothermfc
==========

Access Brother MFC web UI details with node.js


Installation
------------

`npm install git+https://github.com/fvdm/nodejs-brothermfc`


Usage
-----

```js
var brother = require('brothermfc')({hostname: 'myprinter.lan'})

brother.status( function( err, data ) {
  console.log( err || data )
})
```

### Output

```js
{ model: 'MFC-J4710DW',
  status: 'moniOk',
  message: 'Gereed',
  ink: { magenta: 100, cyan: 100, yellow: 100, black: 91 },
  contact: 'Franklin',
  location: 'Here' }
```
