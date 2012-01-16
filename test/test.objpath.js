var objpath = require('..').objpath;

var obj = {
	a: 12,
	b: [ 44, 55 ],
	c: { this: { is: { awesome: 'yeah!' } } },
	d: { big: [ 1, 2 ], one: [ { and: 'even' }, 'bigger' ] },
};

exports.all = function(test) {
	test.deepEqual(objpath(obj), obj);
	test.deepEqual(objpath(obj, "/"), obj);
	test.deepEqual(objpath(obj, ""), obj);
	test.done();
}

exports.firstLevel = function(test) {
	test.deepEqual(objpath(obj, "/a"), 12);
	test.done();
};

exports.noRoot = function(test) {
	test.deepEqual(objpath(obj, "b"), [ 44, 55 ]);
	test.done();
};

exports.subtree = function(test) {
	test.deepEqual(objpath(obj, "/c/this/is"), { 'awesome': 'yeah!' });	
	test.deepEqual(objpath(obj, "/c/this/is/awesome"), 'yeah!');
	test.done();
}
