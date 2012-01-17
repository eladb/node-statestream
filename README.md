# statestream

Really simple way to create HTTP streams of state and not just events.

```bash
$ npm install statestream
```

How to use?

```js
var statestream = require('statestream');
var xp = require('express');

var mystate = { can: { be: { a: 'very complex state' } } };
xp.get('/mystate', statestream(mystate));
```

Now, GET requests to /mystate will not be terminated and every time `mystate` will be updated,
the updated object will be sent (entirely) to the client.

## API ##

### statestream(state, [options]) ###

Returns a `function(req, res)` that will handle HTTP requests in the following way:
 
 1. The URL pathname is used to define the path within the object you wish to subscribe to (e.g. `foo/goo` will return 
    `state.foo.goo` or `null` if not found).
 2. It will return an `application/json` response with the current contents of `state` 
 3. It will maintain an open connection to the client.
 4. It will write the contents of this object to the response stream when the object changes.

`state` can either be an object or a synchronous function that returns the object to stream.
`options.interval` defines the interval (in ms) for monitoring the state object (or the result of the function) for changes.

### statestream.onchange(state, [options], callback) ###

A lower-level function that calls `callback` whenever `state` changes (`state` can also be a function).

### statestream.objpath(obj, path) ###

Returns the sub-objects addressed by `path` in `obj`.

## Example (w/ express) ##

This example shows how to use __statestream__ as an express middleware.
It can also be used with `connect` or just inside a regular http handler.

### Server

```js
var xp = require('express');
var statestream = require('statestream');

var app = xp.createServer();
var state = { foo: 1, goo: 1 };

app.use('/mystate', statestream(state));

setInterval(function() {
	state.foo++;
	state.goo = state.goo * 2;
}, 500);

console.log('Listening on port', 5000);
console.log('Now curl http://localhost:5000/mystate');

app.listen(5000);
```

### Client

```bash
$ curl http://localhost:5000/mystate
{
  "foo": 34,
  "goo": 8589934592
}
{
  "foo": 36,
  "goo": 34359738368
}
{
  "foo": 38,
  "goo": 137438953472
}
^C

$ curl http://localhost:5000/mystate/foo     # yes, you can also access sub-objects using url paths
84
86
88
^C
```

# LICENSE

MIT