/**
 * Ray Tools
 * Copyright (c) 2016 Tag Guillory
 * Created : 2016-Feb-18
 * Last Update : 2016-Feb-26
**/

(function ($) {

	// object that holds all the settings and properties
	var base = {
		datasource: { data: [], keyfield: null },
		headers: [], //column definitions
		pageSize : 25,
		parentElem: null,
		data : loadData
	};

	// iterates the data and fills in the table body
	function loadData(data, keyField) {

		// remove all data records from teh table
		base.parentElem.find("tbody > tr").remove();

		var startRow = 1;
		var endRow = startRow;

		// foreach record of data
		for (var i = 0; endRow < base.pageSize && i < data.length; i++)
		{
			// start a new row
			var newRow = "<tr";
			if (keyField != null)
				newRow += " data-ray-key='" + data[i][keyField] + "'";
			newRow += ">";

			// foreach column in the table fetch the data
			for (var j = 0; j < base.headers.length; ++j) {
				// find the data-ray-field attr
				var fieldName = base.headers[j].field;

				// start the td text
				var cell = '';

				if (base.headers[j].icons != null && base.headers[j].icons.length > 0) {
					jQuery.each(base.headers[j].icons, function (idx, ic) {
						cell += "<span class='glyphicon " + ic.glyph + "' aria-hidden='true'";
						if (ic.handler != null)
							cell += " onclick='" + ic.handler + "(this)'";
						if (ic.data != null)
							cell += " data='" + data[i][ic.data] + "'";
						cell += ">";
					});
				}

				if (fieldName != null) {
					cell += data[i][fieldName];
				}

				if (cell.length < 1) {
					cell += "&nbsp;";
				}

				newRow += "<td>" + cell + "</td>"
			}

			newRow += "</tr>"

			$(base.parentElem).find('table > tbody').append(newRow);

			++endRow;
		}

		// update the footer
		setFooter( { start: startRow, end: endRow - 1, total: data.length } );
	};

	// sets all the options
	$.fn.raytable = function (options)
	{
		// remember the base element
		base.parentElem = $(this);

		// test the root tag is either div or table, we want to put a div around a table
		if (base.parentElem.prop("tagName").toLowerCase() != 'div')
		{
			alert('Parent element must be a div tag!');
			return;
		}

		// if there are no options, then don't change anything, else merge existing options for the same instance

		// get the input options
		base.datasource.data = options.datasource.data;
		base.datasource.keyfield = options.datasource.keyfield;
		if ( options.pagesize != null && options.pagesize > 0 )
			base.pageSize = options.pagesize;

		// set the headers
		if (options.columns != null && options.columns.length > 0 ) {
			base.headers = options.columns;
		}
		else // use the table headers
		{
			var ths = base.parentElem.find('thead tr').children();

			// create header objects based on the html tags
			for (var j = 0; j < ths.length; ++j) {

				// find the data-ray-field attr
				var field = $(ths[j]).data('ray-field');
				var title = $(ths[j]).text();
				base.headers.push({field:field, title:title});
			}
		}

		// render header
		renderTable();

		// if data has been specified, then go ahead an load it
		loadData(base.datasource.data, base.datasource.keyfield);

		// render footer
		renderFooter();

		return base;
	};

	// creates the skeleton of the table
	function renderTable()
	{
		var skel = '<table class="table table-striped table-bordered" style="margin-bottom:0px;">';

		var ths = '';
		jQuery.each(base.headers, function (idx, h) { ths += '<th>' + h.title + '</th>' });
		skel += '<thead><tr>' + ths + '</tr></thead>';

		skel += '<tbody></tbody></table>';

		base.parentElem.append(skel);
	}

	// creates the skeleton of the table
	function renderFooter()
	{
		
		var left = '<span class="glyphicon glyphicon-step-backward" aria-hidden="true"/>&nbsp;<span class="glyphicon glyphicon-triangle-left" aria-hidden="true"/>';
		var right = '<span class="glyphicon glyphicon-triangle-right" aria-hidden="true"/>&nbsp;<span class="glyphicon glyphicon-step-forward" aria-hidden="true"/>';
		var pages = '<span id="raytable-footer-pages" />';
		// nned to create a button toolbar here
		var summary = '<span id="raytable-footer-summary" style="float:right;">0 - 0 of 0 items</span>';

		base.parentElem.append('<div id="raytable-footer" style="padding:5px;">' + left + pages + right + summary + "</div>");
	}

	// creates the skeleton of the table
	function setFooter(params) {
		base.parentElem.find('#raytable-footer-summary').text(params.start + ' - ' + params.end + ' of ' + params.total + ' items');
	}

}(jQuery));