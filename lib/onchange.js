/**
 * Calls `handler` every time `state` changes.
 * Will call handler (synchronously) immediately after called
 * and then, per `options.interval` (default 1sec) will emit
 * another call to `handler` in case the state chaged.
 * `state` can be a function (which returns the current state) or an object.
 */
module.exports = function(state, options, handler) {
	if (!handler) handler = options;
	if (!handler) throw new Error('handler is required');

	var stateFn = null;
	if (typeof state !== "function") stateFn = function() { return state; }
	else stateFn = state;

	options = options || { };
	options.interval = options.interval || 1000;

	var current = null;
	var running = true;
	(function _monitor() {
		if (!running) return;

		var next = JSON.stringify(stateFn());

		if (current !== next) {
			handler();
			current = next;
		}

		setTimeout(_monitor, options.interval);
	})();

	function stop() { running = false; }

	return {
		close: stop,
		stop: stop,
	};
};
