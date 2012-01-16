var xp = require('express');
var statestream = require('..');
var testCase = require('nodeunit').testCase;
var request = require('request');

exports.test = testCase({
	setUp: function(cb) {
		this.app = xp.createServer();

		var state = { foo: 1, goo: 1, nochange: 1234 };

		this.app.use('/mystate', statestream(state, {interval: 100, newline: false, pretty: false }));

		this.timer = setInterval(function() {
			state.foo++;
			state.goo = state.goo * 2;
			state.nochange = 1234;
			if (state.foo > 100) state.dont = { exists: { 
				statc: ['now', 'i', 'exist'], 
				val: state.foo 
			} };
		}, 5);


		return this.app.listen(8888, cb);
	},

	tearDown: function(cb) {
		this.app.close();
		clearInterval(this.timer);
		return cb();
	},

	theTest: function(test) {

		var requests = [
			{ r: request('http://localhost:8888/mystate'), exp: 20 },
			{ r: request('http://localhost:8888/mystate/foo'), exp: 20 },
			{ r: request('http://localhost:8888/mystate/goo'), exp: 20 },
			{ r: request('http://localhost:8888/mystate/nochange'), exp: 1 },
			{ r: request('http://localhost:8888/mystate/dont/exists'), exp: 15 },
		];

		function print() {
			console.log('--');
			requests.forEach(function(req) {
				console.log(req.r.uri.href, ":", req.chunks && req.chunks);
			})
		}

		requests.forEach(function(req) {
			req.chunks = [];
			req.r.on('data', function(data) {
				req.chunks.push(data.toString());
				print();
			});
		})

		function abort() {
			requests.forEach(function(req) {
				req.r.req.abort();
			});
		}

		setTimeout(function() {
			abort();

			requests.forEach(function(req) {
				var count = req.chunks ? req.chunks.length : 0;
				var cond = Math.abs(req.exp - count) < 5;
				console.log(req.r.href + ': ' + req.exp + "/" + count);
				test.ok(cond, req.r.uri.href + " expecting " + req.exp + " actual " + count);
			});

			test.done();
		}, 2000);
	},
	
});

