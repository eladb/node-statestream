var xp = require('express');
var statestream = require('..');

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