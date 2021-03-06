// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

(function(){
	var drivers = {};
	wp.registerDriver = function(id, options){
		drivers[id] = options;
	};
	wp.listDrivers = function(){
		var r = [];
		for(var k in drivers)
			r.push({
				id: k,
				name: drivers[k].name
			});
		r.sort(function(a, b){
			return (drivers[b.id].priority || 0) - (drivers[a.id].priority || 0);
		});
		return r;
	};
	wp.driverEditor = function(id, div, data){
		if(drivers[id] && drivers[id].editor)
			return drivers[id].editor(div, data);
	};
})();