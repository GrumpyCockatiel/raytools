/*
 * Ray Tools
 * Copyright (c) 2016 Tag Guillory
 * Created : 2016-Feb-18
 * Last Update : 2016-Feb-26
*/

(function ($) {

	var headers = []; //column definitions

	$.fn.raytable = function (options)
	{
		// remove all records from teh table
		$(this).find("tbody > tr").remove();

		// get the input options
		var data = options.datasource.data;
		var keyField = options.datasource.keyfield;

		// use the options def for columns first
		if (options.columns != null && options.columns.length > 0 ) {
			headers = options.columns;

			var ths = '';
			jQuery.each(headers, function (idx, h) { ths += '<th>' + h.title + '</th>' });
			$(this).append('<thead><tr>' + ths + '</tr></thead>');
		}
		else // use the table headers
		{
			var ths = $(this).find('thead tr').children();

			// create header objects based on the html tags
			for (var j = 0; j < ths.length; ++j) {

				// find the data-ray-field attr
				var field = $(ths[j]).data('ray-field');
				var title = $(ths[j]).text();
				headers.push({field:field, title:title});
			}
		}

		// foreach record of data
		for (var i = 0; i < data.length; i++)
		{
			var newRow = "<tr";
			if (keyField != null)
				newRow += " data-ray-key='" + data[i][keyField] + "'";
			newRow += ">";

			// foreach column in the table fetch the data
			for (var j = 0; j < headers.length; ++j)
			{
				// find the data-ray-field attr
				var fieldName = headers[j].field;

				// start the td text
				var cell = '';

				if (headers[j].icons != null && headers[j].icons.length > 0)
				{
					jQuery.each(headers[j].icons, function (idx, ic) {
						cell += "<span class='glyphicon " + ic.glyph + "' aria-hidden='true'";
						cell += " onclick='" + ic.handler + "(this)'";
						cell += ">";
					});

					//for (var j = 0; j < headers.length; ++j) {
						
					//}
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

			$(this).append(newRow);
		}
	};

}(jQuery));