/**
 * Ray Tools
 * Copyright (c) 2016-2021 TAG Digital Studios
 * Created : 2016-Feb-18
 * Last Update : 2020-Nov-03
 * Version : 0.9.2
 * License : MIT License
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
		rowNumbers: { visible: true, title: "Row"}, // the row numbers property
		currentSort: null, // the current field and direction of sorting
		currentSelection: null, // last clicked row,
		noDataLabel: "No Results", // label to display if there is no data in the grid
		onRowClick: null // external handler when a row is clicked
	};

	var sortAscSVG = '<svg width="20px" height="20px" viewBox="0 0 16 16" class="bi bi-sort-down" fill="#999999" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 2a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-1 0v-10A.5.5 0 0 1 3 2z"/><path fill-rule="evenodd" d="M5.354 10.146a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L3 11.793l1.646-1.647a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 9a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/></svg>';

	var sortDescSVG = '<svg width="20px" height="20px" viewBox="0 0 16 16" class="bi bi-sort-down-alt" fill="#999999" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 3a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-1 0v-10A.5.5 0 0 1 3 3z"/><path fill-rule="evenodd" d="M5.354 11.146a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L3 12.793l1.646-1.647a.5.5 0 0 1 .708 0zM7 6.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5zm0 3a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5zm0 3a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7a.5.5 0 0 0-.5.5zm0-9a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0-.5.5z"/></svg>';

	/* iterates the data and fills in the table body
	data - the array of data to bind
	keyField - the entity property to use an identifier or key
	*/
	function loadData(data, keyField) {

		// remove all data records from the table
		base.parentElem.find("tbody > tr").remove();
		base.datasource.data = data;
		base.datasource.keyfield = keyField;

		var startRow = (base.currentPageIdx * base.pageSize) + 1; // row we started counting on
		var curRow = startRow;

		// foreach record of data
		for (var row = startRow - 1; row < ( (base.currentPageIdx + 1) * base.pageSize) && row < data.length; ++row)
		{
			// start a new row
			var rowStr = jQuery('<tr></tr>');

			// add a data field to each <tr>
			if (keyField != null)
				rowStr.data( 'ray-key', data[row][keyField] );

			// column to hold row numbers if implemented
			if (base.rowNumbers.visible) {
				var style = ( base.rowNumbers.styleClass != null ) ? " class='"+ base.rowNumbers.styleClass + "'" : "";
				rowStr.append('<td' + style + '>' + (row + 1) + '</td>');
			}

			// set the col index if there are row numbers
			var col = (base.rowNumbers.visible) ? 1 : 0;
			
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
					// foreach icon listed in the header
					jQuery.each(base.headers[col].icons, function (idx, ic) {
					
						// base span + the class name in the glyph property
						var colBtn = jQuery("<span class='rayicon " + ic.glyph + "' aria-hidden='true' />");
						//colBtn.addClass(ic.glyph);
						
						// add icon click handler where data contains the row index and object ID
						if (ic.handler != null)
							cell.on('click', null, {handler:ic.handler, data: { rowIdx: row, id: data[row][keyField] } }, doIconClick );

						// set a ray-data value as the field or value specified on this column
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

	/* sets all the options when the control is created */
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
				var field = $(ths[j]).data('ray-field');
				var title = $(ths[j]).text();
				base.headers.push({ field: field, title: title });
			}
		}

		// add a column to hold row numbers
		if (base.rowNumbers.visible) {
			options.columns.unshift({ field: "rowNum", title: base.rowNumbers.title });
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

			var cell = jQuery('<th>' + h.title + '</th>');

			if (h.width != undefined)
				cell.css('width', h.width+'px');

			// check for a sortable column
			if (h.sort)
			{
				if ( h.field != null )
					cell.data('field', h.field);

				cell.append('&nbsp;');
				var sortBtn = jQuery('<span></span>');
				sortBtn.on('click', null, h.field, doSortCol);
				sortBtn.append(sortDescSVG)
				cell.append(sortBtn);
			}
			
			// append the th cell to the tr
			skel.find('tr').append(cell);
		});

		// add the table header and body to the parent elem
		base.parentElem.append(skel);

		// add a place holder for the footer
		base.parentElem.append('<div class="container"><div id="raytable-footer" class="row" style="padding:5px;"><div class="col"><span id="raytable-footer-summary" class="float-right;">0 - 0 of 0 items</span></div></div></div>');
	}

	// creates and appends the footer to the bottom of the table
	// params include { start: startRow, end: endRow, total: dataLength }
	function renderFooter(params) {
		if (!params)
			return;

		// clear out the footer
		base.parentElem.find('#raytable-footer').empty();
		
		// when there's no data to display
		if ( params.total < 1)
		{
			var summary = '<div class="col"><span id="raytable-footer-summary">' + base.noDataLabel + '</span></div>';
			base.parentElem.find('#raytable-footer').append(summary);
			return;
		}

		// render pagination control
		var pager = jQuery('<ul class="pagination pagination-sm" id="raytable-footer-pager" class="float-left" style="margin-top:0px;"></ul>');
		base.parentElem.find('#raytable-footer').append( jQuery('<div class="col"></div' ).append( pager) );

		// there are more items than page size
		if ( params.total > base.pageSize )
		{
			// never mutate maxPageButtons, should never be less than 2
			var totalPage = ( base.maxPageButtons < 2 ) ? 2 : base.maxPageButtons;
		
			// calculate maximum number of pages needed
			var maxPage = Math.ceil(params.total / base.pageSize);
		
			if ( totalPage > maxPage )
				totalPage = maxPage;

			// page button to render first
			var startPage = base.currentPageIdx - Math.floor(totalPage / 2);
			
			if (startPage < 0)
			{ startPage = 0; }
			
			if ( maxPage - startPage < totalPage )
			{ startPage = maxPage - totalPage; }
			
			// append go to first page icon
			var first = jQuery('<li class="page-item"><a class="page-link" href="#" data="0" aria-label="Previous">&laquo;</a></li>');
			first.on("click", changePage);
			pager.append(first);
			
			// declare page
			var page = 0;
			
			for (page = startPage; page < startPage + totalPage && page * base.pageSize < params.total ; ++page)
			{
				var li = (page == base.currentPageIdx) ? jQuery('<li class="page-item active"></li>') : jQuery('<li class="page-item"></li>');
				var anchor = jQuery('<a class="page-link" href="#" data="' + page + '">' + (page + 1) + '</a>');
				li.append(anchor);
				anchor.on("click", changePage);
				pager.append(li);
			}
			
			// append got to last page icon
			var last = jQuery('<li class="page-item"><a class="page-link" href="#" data="' + (maxPage-1) + '" aria-label="Next">&raquo;</a></li>');
			last.on("click", changePage);
			pager.append(last);
		}

		// put the summary in a col
		var summary = '<div class="col"><span id="raytable-footer-summary" class="float-right" >' + params.start + ' - ' + params.end + ' of ' + params.total + ' items</span></div>';
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
	// event.data contains the field name sorted on
	function doSortCol(event) {
		// set the current sort info
		if (base.currentSort == null)
		{
			base.currentSort = { field: event.data, direction: 1 };
		}
		else if (base.currentSort.field != event.data)
		{
			base.currentSort = { field: event.data, direction: base.currentSort.direction };
		}
		else
		{
			base.currentSort = { field: event.data, direction: base.currentSort.direction * -1 };
		}

		// sort the data itself
		base.datasource.data.sort( dynamicSort(event.data) );

		// reload the date and page back to start
		base.currentPageIdx = 0;
		loadData(base.datasource.data, base.datasource.keyfield);

		// toggle the sort direction and change the glyph -> 1=asc, -1=desc
		if (base.currentSort.direction > 0)
		{
			base.parentElem.find('thead th span').each(
				function (idx, elem) {
					var parent = jQuery(elem).parent();
					var color = (parent.data('field') == event.data ) ? '#000000' : '#aaaaaa';
					jQuery(elem).empty();
					jQuery(elem).append( jQuery(sortDescSVG).attr('fill', color) );
				}
			);
		}
		else
		{
			base.parentElem.find('thead th span').each(
				function (idx, elem) {
					var parent = jQuery(elem).parent();
					var color = (parent.data('field') == event.data ) ? '#000000' : '#999999';
					jQuery(elem).empty();
					jQuery(elem).append( jQuery(sortAscSVG).attr('fill', color) );
				}
			);
		}

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
