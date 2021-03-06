brothermfc
==========

Access Brother MFC web UI details with node.js

[![npm](https://img.shields.io/npm/v/brothermfc.svg?maxAge=3600)](https://github.com/fvdm/nodejs-brothermfc/blob/master/CHANGELOG.md)
[![Build Status](https://travis-ci.org/fvdm/nodejs-brothermfc.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-brothermfc)
[![Dependency Status](https://gemnasium.com/badges/github.com/fvdm/nodejs-brothermfc.svg)](https://gemnasium.com/github.com/fvdm/nodejs-brothermfc#runtime-dependencies)
[![Coverage Status](https://coveralls.io/repos/github/fvdm/nodejs-brothermfc/badge.svg?branch=master)](https://coveralls.io/github/fvdm/nodejs-brothermfc?branch=master)


Example
-------

```js
var brother = require ('brothermfc') ({
  hostname: 'myprinter.lan'
});

brother.current (function (err, data) {
  console.log (err || data);
});
```


Installation
------------

Normal: `npm install brothermfc`

Development: `npm install fvdm/nodejs-brothermfc`


Configuration
-------------

param    | type   | required | default | description
:--------|:-------|:---------|:--------|:------------------------------------------
hostname | string | yes      |         | Printer hostname or IP
port     | number | no       | 80      | Printer web UI port
protocol | string | no       | http    | Printer web UI protocol, `http` or `https`
prefix   | string | no       |         | Printer web UI prefix
ippPort  | number | no       | 631     | Printer IPP service port
timeout  | number | no       | 5000    | Web require time out in ms, 1000 = 1 sec


#### Example

```js
var brother = require ('brothermfc') ({
  hostname: 'printer.lan',
  protocol: 'https'
});
```


current
-------
**( callback )**

Get current information, like display text and ink levels, directly
from the IPP interface. This is the most accurate information compared
to the `general.status` method which is a calculation.

**Note:** this method may also work with other models and brands.


param    | type     | required | description
:--------|:---------|:---------|:-----------
callback | function | yes      | see Usage.


#### Example

```js
brother.current (callback);
```

#### Output

```js
{ state: 'idle',
  stateReasons: 'none',
  jobs: 0,
  uptime: 613845,
  uptimeDate: Tue Nov 18 2014 03:47:22 GMT+0100 (CET),
  ink: {
    magenta: 100,
    cyan: 100,
    yellow: 98,
    black: 86
  }
}
```


property     | description
:------------|:--------------------------------------
state        | short status message
stateReasons | more descriptive status message
jobs         | print tasks running and queued
uptime       | seconds since last boot
uptimeDate   | `Date` object from `uptime`
ink          | inklevels in %, colors depend in model


general.status
--------------
**( callback )**

Get basic status details, like display text and ink levels.

**Note:** `ink` levels are less accurate then the `.current` method.


param    | type     | required | description
:--------|:---------|:---------|:-----------
callback | function | yes      | see Usage.


#### Example

```js
brother.general.status (callback);
```


#### Output

```js
{ model: 'MFC-J4710DW',
  status: 'moniOk',
  message: 'Gereed',
  ink: { magenta: 100, cyan: 100, yellow: 100, black: 91 },
  contact: 'Franklin',
  location: 'Here' }
```


general.information
-------------------
**( callback )**

Get information specific to the device, i.e. IP-address and serialnumber.

param    | type     | required | description
:--------|:---------|:---------|:-----------
callback | function | yes      | see Usage.

```js
brother.general.information (callback);
```


#### Output

```js
{ node_name: 'BRA123BC456DE78',
  model_name: 'Brother MFC-J4710DW',
  location: 'Here',
  contact: 'Franklin',
  ip_address: '192.168.1.158',
  serial_no: 'A12345B678',
  firmware_version: 'H',
  page_counter: 26 }
```


general.sleep
-------------
**( [preset], callback )**

Get or change the device's sleep timeout.

param    | type     | required | description
:--------|:---------|:---------|:-----------
preset   | number   | no       | Preset number corresponding to minutes
callback | function | yes      | see [Example](#example)


### Get

```js
brother.general.sleep (callback);
```


#### Output

```js
{
  presets: {
    1: 2,
    2: 3,
    3: 5,
    4: 10,
    5: 30,
    6: 60
  ],
  value: {
    key: 4, minutes: 10
  }
}
```

The `presets` property are the predefined minutes you can choose from.
The `value` property is the current setting.


### Change

```js
// set to key `5` = 30 minutes
brother.general.sleep (5, callback);
```


#### Output

* OK: `data` is `true` (boolean)
* Fail: `err` is `Error: POST failed` with `err.error`


License
-------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>


Author
------

[Franklin van de Meent](https://frankl.in)

[![Buy me a coffee](https://frankl.in/u/kofi/kofi-readme.png)](https://ko-fi.com/franklin)
