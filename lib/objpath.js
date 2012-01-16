// returns the sub-object within `obj` that corresponds to `path`
// where `path` is given in /file/system/path/notation (or url notation).
module.exports = function(obj, path) {
	if (path && path[0] === '/') path = path.substring(1);
	if (!path) return obj;
	
	path = path.split('/');

	function _recurse(obj, path) {
		if (path.length === 0) return obj;
		var top = path.shift();
		if (!obj[top]) return null;
		else return _recurse(obj[top], path);
	}

	return _recurse(obj, path);
}