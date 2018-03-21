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
		currentPageIdx: 0, // current page index - zero based
		maxPageButtons: 10, // the maximum number of pager buttons to display
		parentElem: null, // the base HTML element
		data: loadData, // function reference to set the data
		rowNumbers: true, // whether to add a column with line numbers in it
		currentSort: null, // the current field and direction of sorting
		currentSelection: null, // last clicked row
		onRowClick: null // external handler when a row is clicked
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

			// set the col index if there are row numbers
			var col = (base.rowNumbers) ? 1 : 0;
			
			// for each header column
			for (; col < base.headers.length; ++col) {
				
				// get this field name
				var fieldName = base.headers[col].field;

				// start the td
				var cell = jQuery('<td></td>');
				
				// the render func returns false
				if ( base.headers[col].renderIf != null && !base.headers[col].renderIf(data[row]) )
				{
					cell.append("&nbsp;");
					rowStr.append(cell);
					continue;
				}

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
				if (fieldName != null)
				{
					if ( base.headers[col].format != null )
						cell.append( base.headers[col].format( data[row] ) );
					else
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
			
		if (options.maxPageButtons != null && options.maxPageButtons > 0)
			base.maxPageButtons = options.maxPageButtons;
			
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
				cell.css('width', h.width+'px');

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

		// clear out the footer
		base.parentElem.find('#raytable-footer').empty();

		// update the summary
		base.parentElem.find('#raytable-footer-summary').text(params.start + ' - ' + params.end + ' of ' + params.total + ' items');

		// render pagination control
		var pager = jQuery('<ul class="pagination pagination-sm" id="raytable-footer-pager" style="margin-top:0px;"></ul>');
		base.parentElem.find('#raytable-footer').append(pager);

		// there are more items than page size
		if ( params.total > base.pageSize )
		{
			// the maximum number of pages needed
			var maxPage = Math.ceil(params.total / base.pageSize);
		
			if ( base.maxPageButtons < 2 )
				base.maxPageButtons = 2;
				
			if ( base.maxPageButtons > maxPage )
				base.maxPageButtons = maxPage;

			var startPage = base.currentPageIdx - Math.floor(base.maxPageButtons / 2);
			
			if (startPage < 0)
			{ startPage = 0; }
			
			if ( maxPage - startPage < base.maxPageButtons )
			{ startPage = maxPage - base.maxPageButtons; }
			
			var first = jQuery('<li><a href="#" data="0" aria-label="Previous">&laquo;</a></li>');
			first.on("click", changePage);
			pager.append(first);
			
			var page = 0;
			
			for (page = startPage; page < startPage + base.maxPageButtons && page * base.pageSize < params.total ; ++page)
			{
				var li = (page == base.currentPageIdx) ? jQuery('<li class="active"></li>') : jQuery('<li></li>');
				var anchor = jQuery('<a href="#" data="' + page + '">' + (page + 1) + '</a>');
				li.append(anchor);
				anchor.on("click", changePage);
				pager.append(li);
			}
			
			var last = jQuery('<li><a href="#" data="' + (maxPage-1) + '" aria-label="Next">&raquo;</a></li>');
			last.on("click", changePage);
			pager.append(last);
		}

		var summary = '<span id="raytable-footer-summary" style="float:right;">' + params.start + ' - ' + params.end + ' of ' + params.total + ' items</span>';
		base.parentElem.find('#raytable-footer').append(summary);
	}

	// loads a different page of data
	function changePage(event) {
		// get the page from the button element
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
