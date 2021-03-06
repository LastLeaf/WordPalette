// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var tmpl = fw.tmpl('list.tmpl');

module.exports = function(conn, args, childRes, next){
	childRes.title = tmpl.title(conn, {
		tag: true,
		keyword: 'tag?'
	});
	childRes.content = tmpl.index(conn, {
		tag: true,
		keyword: 'tag?'
	});
	next(childRes);
};