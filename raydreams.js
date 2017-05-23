/**
 * Ray Tools
 * Copyright (c) 2016 Tag Guillory
 * Created : 2016-Feb-18
 * Last Update : 2016-July-26
**/

(function ($) {

	// object that holds all the settings and properties which is externally visible i.e. NOT private
	var base = {
		datasource: { data: [], keyfield: null },
		headers: [], //column definitions
		pageSize: 25,
		currentPageIdx: 0, // current page index
		parentElem: null, // the base HTML element
		data: loadData, // function reference to set the data
		rowNumbers: true // whether to add a column with line numbers in it
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
		for (var row = startRow - 1; row < ((base.currentPageIdx + 1) * base.pageSize) && row < data.length; ++row) {
			// start a new row
			var rowStr = "<tr";
			if (keyField != null)
				rowStr += " data-ray-key='" + data[row][keyField] + "'";
			rowStr += ">";

			// add a column to hold row numbers
			if (base.rowNumbers) {
				rowStr += '<td>' + (row + 1) + '</td>';
			}

			// foreach column in the table fetch the data
			var col = (base.rowNumbers) ? 1 : 0;
			for (; col < base.headers.length; ++col) {
				// find the data-ray-field attr
				var fieldName = base.headers[col].field;

				// start the td text
				var cell = '';

				if (base.headers[col].icons != null && base.headers[col].icons.length > 0) {
					jQuery.each(base.headers[col].icons, function (idx, ic) {
						cell += "<span class='glyphicon " + ic.glyph + "' aria-hidden='true'";
						if (ic.handler != null)
							cell += " onclick='" + ic.handler + "(this)'";
						if (ic.data != null)
							cell += " data='" + data[row][ic.data] + "'";
						cell += ">";
					});
				}

				if (fieldName != null) {
					cell += data[row][fieldName];
				}

				if (cell.length < 1) {
					cell += "&nbsp;";
				}

				rowStr += "<td>" + cell + "</td>"
			}

			rowStr += "</tr>"

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
		var skel = '<table class="table table-striped table-bordered" style="margin-bottom:0px;">';

		var ths = '';

		jQuery.each(base.headers, function (idx, h) {
			if (h.width == undefined)
				ths += '<th>' + h.title + '</th>'
			else
				ths += '<th style="width:' + h.width + 'px">' + h.title + '</th>'
		});

		skel += '<thead><tr>' + ths + '</tr></thead>';

		skel += '<tbody></tbody></table>';

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

	//
	function debug(event) {
		alert();
	}

}(jQuery));
