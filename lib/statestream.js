var onchange = require('./onchange');
var objpath = require('./objpath');
var urlparser = require('url');

/**
 * Returns an HTTP handler which streams changes in `state` to any HTTP request.
 * It will emit the current state of `state` immediately and then will start monitoring
 * this object in `options.interval` milliseconds interval. Any change will be written
 * to the HTTP stream.
 * `options.newline` (default true) will emit a '\n' after every update.
 * `options.pretty` (default true) will pretty-print the json with `stringify(, true, 2)`.
 * `state` can ba function that returns the current state or a literal.
 */
module.exports = function(state, options) {
	options = options || { };
	options.interval = options.interval || 1000;
	options.newline = ('newline' in options) ? options.newline : true;
	options.pretty = ('pretty' in options) ? options.pretty : true;

	var statefn = state;
	if (typeof state !== 'function') statefn = function(cb) { return cb(null, state); };

	return function(req, res) {
		var url = urlparser.parse(req.url);
		res.writeHead(203, { 'content-type': 'application/json '});
		
		function current(cb) {
			return statefn(function(err, s) {
				var newstate = objpath(s, url.pathname);
				return cb(null, newstate);
			});
		}

		var onch = onchange(current, { interval: options.interval }, function() {
			return current(function(err, val) {
				if (!val) return;

				if (options.pretty) res.write(JSON.stringify(val, true, 2));
				else res.write(JSON.stringify(val));
				if (options.newline) res.write('\n');
				return res.emit('drain');
			})
		});

		req.on('close', function() {
			onch.close();
		});
	};
};