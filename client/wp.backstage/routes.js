// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

var fs = require('fs');
var path = require('path');

if(fw.db) {
	// list drivers
	var drivers = {
		parent: 'backstage',
		lib: [],
		main: [],
		tmpl: [],
		style: []
	};
	var dirs = fs.readdirSync(__dirname + '/drivers');
	for(var i=dirs.length-1; i>=0; i--) {
		var dir = dirs[i];
		if(!fs.statSync(__dirname + '/drivers/' + dir).isDirectory())
			continue;
		var files = fs.readdirSync(__dirname + '/drivers/' + dir);
		for(var j=files.length-1; j>=0; j--) {
			var file = files[j];
			var ext = path.extname(file);
			if(ext === '.js') {
				if(file === 'main.js')
					drivers.main.unshift('drivers/' + dir + '/' + file);
				else
					drivers.lib.unshift('drivers/' + dir + '/' + file);
			}
			if(ext === '.stylus' || ext === '.css') {
				if(file === 'main.stylus' || file === 'main.css')
					drivers.style.push('drivers/' + dir + '/' + file);
				else
					drivers.style.unshift('drivers/' + dir + '/' + file);
			}
			if(ext === '.tmpl') {
				if(file === 'main.tmpl')
					drivers.tmpl.push('drivers/' + dir + '/' + file);
				else
					drivers.tmpl.unshift('drivers/' + dir + '/' + file);
			}
		}
	}
	// generate routes
	module.exports = {
		backstage: {
			parent: 'global',
			lib: ['/lib/jquery.js', 'table_builder', 'driver_manager'],
			main: 'main',
			tmpl: 'main',
			style: 'main.css',
		},
		drivers: drivers,
		'./': {
			redirect: 'home',
		},
		'./home': {
			parent: 'backstage',
			main: 'home',
			tmpl: 'home',
			style: 'home.css',
		},
		'./stat': {
			parent: 'backstage',
			main: 'stat',
			tmpl: 'stat',
		},
		'./posts': {
			parent: 'backstage',
			main: 'posts',
			tmpl: 'posts',
		},
		'./post': {
			parent: 'drivers',
			main: 'create',
			tmpl: 'create',
			style: 'create.css',
		},
		'./post/*': {
			parent: 'drivers',
			main: 'edit',
			tmpl: 'edit',
			style: 'edit.css',
		},
		'./comments': {
			parent: 'backstage',
			main: 'comments',
			tmpl: 'comments',
		},
		'./uploads': {
			parent: 'backstage',
			main: 'uploads',
			tmpl: 'uploads',
		},
		'./users': {
			parent: 'backstage',
			main: 'users',
			tmpl: 'users',
		},
		'./user/:id': {
			parent: 'backstage',
			main: 'users',
			tmpl: 'users',
		},
		'./settings': {
			parent: 'backstage',
			main: 'settings',
			tmpl: 'settings',
			style: 'settings.css'
		},
	};
}