# brothermfc

Access Brother MFC web UI details with node.js

[![npm](https://img.shields.io/npm/v/brothermfc.svg?maxAge=3600)](https://github.com/fvdm/nodejs-brothermfc/blob/master/CHANGELOG.md)
[![Build Status](https://github.com/fvdm/nodejs-brothermfc/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/fvdm/nodejs-brothermfc/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/fvdm/nodejs-brothermfc/badge.svg?branch=master)](https://coveralls.io/github/fvdm/nodejs-brothermfc?branch=master)


## Usage

```js
const BrotherMFC = require ('brothermfc');
const brother = new BrotherMFC ({
  url: 'http://myprinter.lan',
});

brother.current()
  .then (console.log)
  .catch (console.error)
;
```


## Installation

`npm install brothermfc`


## Configuration

param     | type   | default | description
:---------|:-------|:--------|:------------------------------------------
url       | string |         | Base URL, ie. `http://printer:1234`
[ippPort] | number | 631     | IPP service port
[timeout] | number | 5000    | Request time out in ms


## current
**( )**

Get current information, like display text and ink levels, directly
from the IPP interface. This is the most accurate information compared
to the `general.status` method which is a calculation.

**Note:** this method may also work with other models and brands.


### Example

```js
brother.current()
  .then (console.log)
  .catch (console.error)
;
```

### Output

```js
{
  state: 'idle',
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
ink          | inklevels in %, colors depend on model


## generalStatus
**( )**

Get basic status details, like display text and ink levels.

**Note:** `ink` levels are less accurate then the `.current` method.


### Example

```js
brother.generalStatus()
  .then (console.log)
  .catch (console.error)
;
```


### Output

```js
{
  model: 'MFC-J4710DW',
  status: 'moniOk',
  message: 'Gereed',
  ink: {
    magenta: 100,
    cyan: 100,
    yellow: 100,
    black: 91
  },
  contact: 'Franklin',
  location: 'Here'
}
```


## generalInformation
**( )**

Get information specific to the device, i.e. IP-address and serialnumber.


```js
brother.generalInformation()
  .then (console.log)
  .catch (console.error)
;
```


### Output

```js
{
  node_name: 'BRA123BC456DE78',
  model_name: 'Brother MFC-J4710DW',
  location: 'Here',
  contact: 'Franklin',
  ip_address: '192.168.1.158',
  serial_no: 'A12345B678',
  firmware_version: 'H',
  page_counter: 26
}
```


## License

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

For more information, please refer to <https://unlicense.org>


## Author

[Franklin](https://fvdm.com)
| [![Buy me a coffee](https://fvdm.com/donating)
