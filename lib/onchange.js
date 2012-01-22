/**
 * Calls `handler` every time `state` changes.
 * Will call handler (synchronously) immediately after called
 * and then, per `options.interval` (default 1sec) will emit
 * another call to `handler` in case the state chaged.
 * `state` can be an async function passed a callback `function(err, newState)` or an object.
 */
module.exports = function(state, options, handler) {
	if (!handler) handler = options;
	if (!handler) throw new Error('handler is required');

	var stateFn = null;
	if (typeof state !== "function") stateFn = function(cb) { return cb(null, state); }
	else stateFn = state;

	options = options || { };
	options.interval = options.interval || 1000;

	var current = null;
	var running = true;
	(function _monitor() {
		if (!running) return;
		
		console.log('calling statefn', stateFn);
		return stateFn(function(err, newState) {
			if (!err) {
				var next = JSON.stringify(newState);

				if (current !== next) {
					handler();
					current = next;
				}
			}
			else {
				console.error('Error when retrieving state:', err);
			}

			return setTimeout(_monitor, options.interval);
		});
	})();

	function stop() { running = false; }

	return {
		close: stop,
		stop: stop,
	};
};
