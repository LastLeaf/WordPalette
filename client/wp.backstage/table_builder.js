// Copyright 2014 LastLeaf, LICENSE: github.lastleaf.me/MIT
'use strict';

wp.tableBuilder = function($div, options, colDefine, addDef){
	var idCol = options.idCol || '_id';
	var allowAdd = !!addDef;

	// events
	var events = {};
	var bind = function(e, func){
		if(!events[e]) events[e] = [func];
		else events[e].push(func);
	};
	var trigger = function(e){
		var a = events[e];
		if(!a) return;
		var args = [];
		for(var i=1; i<arguments.length; i++)
			args.push(arguments[i]);
		for(var i=0; i<a.length; i++)
			a[i].apply(that, args);
	};

	// build dom structure
	var _ = wp.tableBuilder.i18n;
	var $wrapper = $('<div><div class="errors"></div><table cellpadding="0" cellspacing="0" border="0" class="wp_table"><thead></thead><tbody></tbody><tfoot></tfoot></table></div>').appendTo($div);
	var $table = $wrapper.children('table');
	var $thead = $table.children('thead');
	var $tbody = $table.children('tbody');
	var $tfoot = $table.children('tfoot');
	var $theadTr = $('<tr></tr>').appendTo('thead');
	var colCount = 0;
	for(var i=0; i<colDefine.length; i++) {
		var col = colDefine[i];
		if(col.type === 'hidden' || col.type === 'extra') continue;
		colCount++;
		$('<th></th>').text(col.name).appendTo($theadTr);
	}
	var $navi = $('<tr><th colspan="'+colCount+'" class="wp_table_navi"></th></tr>').appendTo($tfoot).find('th');
	if(allowAdd)
		$('<div class="wp_table_action"><input type="button" class="wp_table_add" value="+"></div>').appendTo($navi);
	var $page = $('<div class="wp_table_page"></div>').appendTo($navi);

	// loading control
	var loading = false;
	var startLoading = function(){
		loading = true;
		$tbody.fadeTo(200, 0.5);
		$tfoot.find('input').attr('disabled', true);
	};
	var stopLoading = function(){
		loading = false;
		$tbody.fadeTo(200, 1);
		$tfoot.find('input').removeAttr('disabled');
	};

	// input events
	$tfoot.on('click', '.wp_table_add', function(){
		if(loading) return;
		var $row = $tbody.children('.wp_table_add_row');
		if(!$row.length)
			enterEditMode.call(rowContent(addDef[idCol] || '', addDef).addClass('wp_table_add_row').hide().fadeIn(200)[0]);
		else
			$row.focus();
	});
	var exitEditMode = function(){
		if(!this.wpTableEditing) return;
		var row = this;
		row.wpTableEditing = false;
		var $tr = $(row).next().andSelf();
		$tr.children('td').each(function(){
			$(this).text(this.wpTableData);
		});
	};
	var enterEditMode = function(){
		if(loading || this.wpTableEditing) return;
		if(clickHandled) {
			trigger('click', $(this).attr('rowId'));
			return;
		}
		var row = this;
		row.wpTableEditing = true;
		// put inputs
		var rowId = $(row).attr('rowId');
		var $tr = $(row).next().andSelf();
		$tr.children('td').each(function(){
			var colId = this.wpTableColId;
			var type = this.wpTableInput;
			if(typeof(type) === 'object') {
				// select
				var $input = $('<select name="'+colId+'"></select>');
				var defSel = '';
				for(var k in type) {
					$('<option value="'+k+'"></option>').text(type[k]).appendTo($input);
					if(type[k] === this.wpTableData) defSel = k;
				}
				$input.val(defSel);
			} else if(type === 'password') {
				// password
				var $input = $('<input type="password" name="'+colId+'">');
			} else if(type === 'add' && !$tr.hasClass('wp_table_add_row')) {
				// hidden
				var $input = $('<span></span>').text(this.wpTableData).add($('<input type="hidden" name="'+colId+'">').val(this.wpTableData));
			} else if(type === false) {
				// not editable
				var $input = $('<span></span>').text(this.wpTableData);
			} else {
				// text
				var $input = $('<input type="text" name="'+colId+'">').val(this.wpTableData);
			}
			$(this).html('').append($input);
		});
		// find name-value
		var getValue = function(){
			var vals = {};
			$tr.find('[name]').each(function(){
				vals[$(this).attr('name')] = $(this).val();
			});
			return vals;
		};
		// disable inputs
		var disableInputs = function(cb){
			$tr.find('input, select, textarea').attr('disabled', true);
			$btns.slideUp(200, function(){
				if(cb) cb();
			});
		};
		// add buttons
		var $btns = $('<div class="wp_table_edit_btn"></div>').appendTo($tr.eq(1).children());
		if($tr.hasClass('wp_table_add_row')) {
			$('<input type="button" value="'+_('Add')+'">')
				.click(function(){
					if(loading) return;
					disableInputs();
					trigger('add', getValue());
				})
				.appendTo($btns);
			$('<input type="button" value="'+_('Cancel')+'">')
				.click(function(){
					if(loading) return;
					$tr.fadeOut(200, function(){
						$tr.remove();
					});
				})
				.appendTo($btns);
		} else {
			$('<input type="button" value="'+_('Save')+'">')
				.click(function(){
					if(loading) return;
					disableInputs();
					trigger('change', getValue());
				})
				.appendTo($btns);
			$('<input type="button" value="'+_('Cancel')+'">')
				.click(function(){
					if(loading) return;
					disableInputs(function(){
						exitEditMode.call(row);
					});
				})
				.appendTo($btns);
			// remove buttons
			var $removeCancel = $('<input type="button" class="wp_table_edit_btn_right" value="'+_('No, thanks.')+'">')
				.click(function(){
					if(loading) return;
					$removeConfirm.hide();
					$removeCancel.hide();
					$remove.fadeIn(200);
				})
				.hide()
				.appendTo($btns);
			var $removeConfirm = $('<input type="button" class="wp_table_edit_btn_right" value="'+_('Yes, remove!')+'">')
				.click(function(){
					if(loading) return;
					disableInputs();
					trigger('remove', rowId);
				})
				.hide()
				.appendTo($btns);
			var $remove = $('<input type="button" class="wp_table_edit_btn_right" value="'+_('Remove')+'">')
				.click(function(){
					if(loading) return;
					$remove.hide();
					$removeCancel.fadeIn(200);
					$removeConfirm.fadeIn(200);
				})
				.appendTo($btns);
		}
	};
	$tbody.on('click', '.wp_table_row', enterEditMode);

	// cancel edit
	var enableAdd = function(){
		var $tr = $tbody.children('.wp_table_add_row');
		$tr.find('.wp_table_edit_btn').slideDown(200, function(){
			$tr.find('input, select, textarea').removeAttr('disabled');
		});
	};
	var enableModify = function(id){
		var $tr = $tbody.find('[rowId='+id+']');
		$tr.find('.wp_table_edit_btn').slideDown(200, function(){
			$tr.find('input, select, textarea').removeAttr('disabled');
		});
	};

	// data control
	var rowContent = function(id, data){
		var $tr = $tbody.children('[rowId="'+id+'"]').html('');
		if(!$tr.length)
			$tr = $('<tr class="wp_table_row" rowId="'+id+'"></tr><tr rowId="'+id+'" class="wp_table_extra"></tr>').appendTo($tbody);
		for(var i=0; i<colDefine.length; i++) {
			var col = colDefine[i];
			if(col.type === 'hidden') continue;
			if(col.type === 'extra') {
				var $td = $('<td colspan="'+colCount+'"></td>').text(data[col.id] || '').appendTo($tr[1]);
			} else {
				var $td = $('<td></td>').text(data[col.id] || '').appendTo($tr[0]);
			}
			$td.prop('wpTableColId', col.id).prop('wpTableInput', col.input).prop('wpTableData', data[col.id] || '');
		}
		$tr[0].wpTableEditing = false;
		return $tr;
	};
	var updateTable = function(dataArray){
		$tbody.html('');
		for(var i=0; i<dataArray.length; i++) {
			var data = dataArray[i];
			var id = data[idCol];
			rowContent(id, data);
		}
	};
	var setRow = function(id, data){
		rowContent(id, data).hide().fadeIn(200);
		return this;
	};
	var addRow = function(id, data){
		$tbody.find('.wp_table_add_row').remove();
		return setRow(id, data);
	};
	var removeRow = function(id){
		var $tr = $tbody.children('[rowId="'+id+'"]').fadeOut(200, function(){
			$tr.remove();
		});
	};

	// page control
	var pagePos = 0;
	var pageTotal = 0;
	var updateNavi = function(){
		$page.html('<input type="button" class="wp_table_prev" value="&lt;"> <input type="text" class="wp_table_page_num"> / '+pageTotal+' <input type="button" class="wp_table_next" value="&gt;">');
		$page.find('.wp_table_page_num').val(pagePos+1).css('width', String(pageTotal).length+'em');
	};
	$page.on('change', '.wp_table_page_num', function(){
		var num = Number(this.value);
		if(num <= 0 || num > pageTotal) {
			this.value = pagePos+1;
		} else {
			pagePos = num-1;
			updateNavi();
			startLoading();
			trigger('data', pagePos);
		}
	});
	$page.on('click', '.wp_table_prev', function(){
		if(loading) return;
		if(pagePos > 0) {
			pagePos--;
			updateNavi();
			startLoading();
			trigger('data', pagePos);
		}
	});
	$page.on('click', '.wp_table_next', function(){
		if(loading) return;
		if(pagePos < pageTotal - 1) {
			pagePos++;
			updateNavi();
			startLoading();
			trigger('data', pagePos);
		}
	});
	var set = function(dataArray, pos){
		if(typeof(pos) !== 'undefined') {
			pagePos = pos;
			updateNavi();
		}
		updateTable(dataArray);
		stopLoading();
		return this;
	};
	var setPage = function(pos, total){
		pagePos = pos;
		if(typeof(total) !== 'undefined')
			pageTotal = total;
		updateNavi();
		startLoading();
		setTimeout(function(){
			trigger('data', pos);
		}, 0);
		return this;
	};
	var setTotal = function(total){
		pageTotal = total || 0;
		updateNavi();
		return this;
	};

	// event binding funcs
	var clickHandled = false;
	var click = function(func){
		clickHandled = true;
		bind('click', func);
		return this;
	};
	var change = function(func){
		bind('change', func);
		return this;
	};
	var remove = function(func){
		bind('remove', func);
		return this;
	};
	var add = function(func){
		bind('add', func);
		return this;
	};
	var data = function(func){
		bind('data', func);
		return this;
	};
	var that = {
		setRow: setRow,
		addRow: addRow,
		removeRow: removeRow,
		set: set,
		setPage: setPage,
		setTotal: setTotal,
		enableAdd: enableAdd,
		enableModify: enableModify,
		click: click,
		change: change,
		remove: remove,
		add: add,
		data: data
	};
	return that;
};
wp.tableBuilder.i18n = function(str){ return str; };