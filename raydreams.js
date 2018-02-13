/**
 * Ray Tools
 * Copyright (c) 2016-2018 Tag Guillory
 * Created : 2016-Feb-18
 * Last Update : 2018-Feb-11
 * Version : 0.9
**/

(function ($) {

	// object that holds all the settings and properties which is externally visible i.e. NOT private
	var base = {
		datasource: { data: [], keyfield: null },
		headers: [], //column definitions
		pageSize: 25, // current page size
		currentPageIdx: 0, // current page index
		parentElem: null, // the base HTML element
		data: loadData, // function reference to set the data
		rowNumbers: true, // whether to add a column with line numbers in it
		currentSort: null, // the current field and direction of sorting
		currentSelection: null, // last clicked row
		onRowClick: null // last clicked row
	};

	// iterates the data and fills in the table body
	function loadData(data, keyField) {

		// remove all data records from the table
		base.parentElem.find("tbody > tr").remove();
		base.datasource.data = data;
		base.datasource.keyfield = keyField;

		var startRow = (base.currentPageIdx * base.pageSize) + 1; // row we started counting on
		var curRow = startRow;

		// foreach record of data
		for (var row = startRow - 1; row < ((base.currentPageIdx + 1) * base.pageSize) && row < data.length; ++row)
		{
			// start a new row
			var rowStr = jQuery('<tr></tr>');
			if (keyField != null)
				//rowStr.attr( 'data-ray-key', data[row][keyField] );
				rowStr.data( 'ray-key', data[row][keyField] );

			// add a column to hold row numbers
			if (base.rowNumbers) {
				rowStr.append('<td>' + (row + 1) + '</td>');
			}

			// foreach column in the table fetch the data
			var col = (base.rowNumbers) ? 1 : 0;
			
			// for each header column
			for (; col < base.headers.length; ++col) {
				
				// get this field name
				var fieldName = base.headers[col].field;

				// start the td
				var cell = jQuery('<td></td>');

				// foreach icon in the column
				if (base.headers[col].icons != null && base.headers[col].icons.length > 0)
				{
					jQuery.each(base.headers[col].icons, function (idx, ic) {
					
						var colBtn = jQuery("<span class='glyphicon' aria-hidden='true' />");
						colBtn.addClass(ic.glyph);
						
						if (ic.handler != null)
							cell.on('click', null, {handler:ic.handler, data: { rowIdx: row, id: data[row][keyField] } }, doIconClick );

						if (ic.data != null)
							colBtn.data('ray-data', data[row][ic.data]);

						cell.append(colBtn);
					});
				}

				// add cell data
				if (fieldName != null) {
					cell.append(data[row][fieldName]);
				}

				// if empty add a space
				if ( jQuery.trim(cell.html()).length < 1 ) {
					cell.append("&nbsp;");
				}

				rowStr.append(cell);
			}

			// add onClick event handler to the row
			rowStr.on('click', null, { rowIdx: row, id: data[row][keyField] }, doRowClick );

			// append the row
			$(base.parentElem).find('table > tbody').append(rowStr);

			++curRow;
		}

		// update the footer
		renderFooter({ start: startRow, end: curRow - 1, total: data.length });
	};

	// sets all the options
	jQuery.fn.raytable = function (options) {
		// remember the base element
		base.parentElem = $(this);

		// test the root tag is either div or table, we want to put a div around a table
		if (base.parentElem.prop("tagName").toLowerCase() != 'div') {
			alert('Parent element must be a div tag!');
			return;
		}

		// if there are no options, then don't change anything, else merge existing options for the same instance

		// get the input options
		base.datasource.data = options.datasource.data;
		base.datasource.keyfield = options.datasource.keyfield;
		if (options.pagesize != null && options.pagesize > 0)
			base.pageSize = options.pagesize;
		base.rowNumbers = options.rowNumbers;
		base.onRowClick = options.rowClickHandler;

		// set the headers
		if (options.columns != null && options.columns.length > 0) {
			base.headers = options.columns;
		}
		else // use the HTML table headers
		{
			var ths = base.parentElem.find('thead tr').children();

			// create header objects based on the html tags
			for (var j = 0; j < ths.length; ++j) {

				// find the data-ray-field attr
				var field = $(ths[j]).data('ray-field');
				var title = $(ths[j]).text();
				base.headers.push({ field: field, title: title });
			}
		}

		// add a column to hold row numbers
		if (base.rowNumbers) {
			options.columns.unshift({ field: "rowNum", title: "Row" });
		}

		// render header
		renderTable();

		// if data has been specified, then go ahead an load it, even empty data will cause this to run
		loadData(base.datasource.data, base.datasource.keyfield);

		// render footer
		renderFooter();

		// returning base exposes it publicly
		return base;
	};

	// creates the skeleton of the table
	function renderTable() {

		// skeleton of the table
		var skel = jQuery('<table class="table table-striped table-bordered" style="margin-bottom:0px;"><thead><tr></tr></thead><tbody></tbody></table>');

		// add each header
		jQuery.each(base.headers, function (idx, h) {

			var cell = jQuery('<th>'+h.title+'</th>');

			if (h.width != undefined)
				cel.css('width', h.width+'px');

			if (h.sort)
			{
				var sortBtn = jQuery("<span class='glyphicon glyphicon-sort-by-attributes' style='color:LightGray' aria-hidden='true' />");
				cell.append('&nbsp;');
				cell.append(sortBtn);
				sortBtn.on('click', null, h.field, doSortCol);
			}

			skel.find('tr').append(cell);
		});

		// add the table header and body to the parent elem
		base.parentElem.append(skel);

		// add a place holder for the footer
		base.parentElem.append('<div id="raytable-footer" style="padding:5px;"><span id="raytable-footer-summary" style="float:right;">0 - 0 of 0 items</span></div>');
	}

	// creates and appends the footer to the bottom of the table
	// params include { start: startRow, end: endRow, total: dataLength }
	function renderFooter(params) {
		if (!params)
			return;

		base.parentElem.find('#raytable-footer').empty();

		// update the summary
		base.parentElem.find('#raytable-footer-summary').text(params.start + ' - ' + params.end + ' of ' + params.total + ' items');

		// render pagination control
		var pager = '<ul class="pagination pagination-sm" id="raytable-footer-pager" style="margin-top:0px;"></ul>';
		base.parentElem.find('#raytable-footer').append(pager);
		//pager += '<li><a href="#"><span class="glyphicon glyphicon-step-backward" aria-hidden="true"/></a></li>';
		//pager += '<li><a href="#"><span class="glyphicon glyphicon-triangle-left" aria-hidden="true"/></a></li>';

		var page = 0;
		for (var i = params.total; i > 0; i -= base.pageSize) {
			var li = jQuery('<li></li>');
			if (page == base.currentPageIdx)
				li = jQuery('<li class="active"></li>');
			var test2 = jQuery('<a href="#" data="' + page + '">' + (page + 1) + '</a>');
			li.append(test2);
			test2.on("click", changePage);
			base.parentElem.find('#raytable-footer-pager').append(li);
			++page;
		}

		//pager += '<li><a href="#"><span class="glyphicon glyphicon-triangle-right" aria-hidden="true"/></a></li>';
		//pager += '<li><a href="#"><span class="glyphicon glyphicon-step-forward" aria-hidden="true"/></a></li>';

		var summary = '<span id="raytable-footer-summary" style="float:right;">' + params.start + ' - ' + params.end + ' of ' + params.total + ' items</span>';
		base.parentElem.find('#raytable-footer').append(summary);
	}

	// loads a different page of data
	function changePage(event) {
		var button = jQuery(event.target);
		var page = parseInt(button.attr('data'));

		// validata page bounds

		base.currentPageIdx = page;

		// reload the data
		loadData(base.datasource.data, base.datasource.keyfield);
	}
	
	// when a glyph icon is clicked
	function doIconClick(event) {
		event.stopPropagation();
		
		// set external handler
		var handler = event.data.handler;
		
		// set the current selection
		base.currentSelection = event.data.data;
		
		// forward the event
		event.data = event.data.data;
		handler(event);
	}
	
	// when a row is clicked on
	function doRowClick(event) {
		base.currentSelection = event.data;
		base.onRowClick(event);
	}

	// sorts the bound data
	function doSortCol(event) {
		if (base.currentSort == null)
		{ base.currentSort = { field: event.data, direction: 1 }; }
		else if (base.currentSort.field != event.data)
		{ base.currentSort = { field: event.data, direction: base.currentSort.direction }; }
		else
		{ base.currentSort = { field: event.data, direction: base.currentSort.direction * -1 }; }

		// sort the data
		base.datasource.data.sort( dynamicSort(event.data));

		// reload the date and page back to start
		base.currentPageIdx = 0;
		loadData(base.datasource.data, base.datasource.keyfield);

		// change the glyph 1=asc, -1=desc
		if (base.currentSort.direction > 0)
		{
			base.parentElem.find('thead th span').each(
				function (idx, elem) {
					jQuery(elem).removeClass('glyphicon-sort-by-attributes-alt');
					jQuery(elem).addClass('glyphicon-sort-by-attributes');
					jQuery(elem).css('color', 'LightGray');
				}
				);
		}
		else
		{
			base.parentElem.find('thead th span').each(
				function (idx, elem) {
					jQuery(elem).removeClass('glyphicon-sort-by-attributes');
					jQuery(elem).addClass('glyphicon-sort-by-attributes-alt');
					jQuery(elem).css('color', 'LightGray');
				}
				);
		}
		jQuery(event.target).css('color', 'Black');
	}

	// sort by a specified property, use prefix '-' to reverse the sort direction
	function dynamicSort(property) {
		var sortOrder = base.currentSort.direction;

		return function (a, b) {
			var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		}
	}

	// internal debug handler
	function debug(event) {
		alert('Debugging');
	}

}(jQuery));
