// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

fw.main(function(pg){
	var tmpl = pg.tmpl;

	// init content and navi
	var $content = $('#content').html(tmpl.main());
	var $settings = $content.children('.settings');
	$content.find('.settings_navi').children().click(function(){
		var section = $(this).attr('for');
		var $section = $settings.children('[section='+section+']');
		$settings.prop('scrollTop', $section.prop('offsetTop')-20);
	});

	// load data
	var updateForm = function(form){
		var $form = $(form);
		$form.find('input,select,textarea').prop('disabled', true);
		pg.rpc('settings:get', $form.find('[name=_key]').val(), function(err, res){
			$form.find('input,select,textarea').prop('disabled', false);
			if(err) $form.find('.error').html(tmpl.error(err));
			else {
				for(var k in res)
					$form.find('[name='+k+']').val(res[k]);
			}
		}, function(){
			$form.find('.error').html(tmpl.error({ timeout: true }));
		});
	};
	$content.find('form').each(function(){
		updateForm(this);
	});

	// form submit
	$content.find('form').each(function(){
		var $form = $(this);
		pg.form(this, function(){
			$form.find('.error').html('');
			$form.find('.submit').prop('disabled', true);
		}, function(err){
			$form.find('.submit').prop('disabled', false);
			if(err) $form.find('.error').html(tmpl.error(err));
			else $form.find('.error').html(tmpl.error({ updated: true }));
		}, function(){
			$form.find('.submit').prop('disabled', false);
			$form.find('.error').html(tmpl.error({ timeout: true }));
		});
	});

	// test email
	$content.find('.email_test').click(function(){
		var $this = $(this);
		var $form = $this.closest('form');
		var form = $form[0];
		$this.prop('disabled', true);
		var args = {};
		for(var i=0; i<form.elements.length; i++)
			if(form.elements[i].name)
				args[form.elements[i].name] = form.elements[i].value;
		$form.find('.error').html('');
		$this.prop('disabled', true);
		pg.rpc('settings:testEmail', args, function(err, to){
			$this.prop('disabled', false);
			if(err) $form.find('.error').html(tmpl.error(err));
			else $form.find('.error').html(tmpl.sentEmail({to: to}));
		}, function(){
			$this.prop('disabled', false);
			$form.find('.error').html(tmpl.error({ timeout: true }));
		});
	});
});