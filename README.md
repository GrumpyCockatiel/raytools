# raytable
I wanted a very simple to use jQuery data table that met 95% of the patterns I needed which included paging, sorting, 
adding a few button columns with custom handlers, and using icons and styles from Bootstrap to keep it simple.

I know ther are TONS of js gridtables in the world but the best ones cost and others take some time to figure out all the settings.
I'm trying to keep this one as simple as possible.

raytools.js is the only required file and the only dependencies are of course Bootstrap and jQuery. All icons come from Bootstrap and are set with their glyph name.

[Live Demo](http://www.raydreams.com/raytable/)

![Raytools data grid](/Screenshots/screen.png)

Use the index and data file to see how to set it up.

```
dataTable = jQuery("#dataTable").raytable({
	datasource: { data: [], keyfield: 'id' },
		columns: [
			{ title: "Info", icons: [{ glyph: "glyphicon-info-sign", handler: iconAction, data:"id" }], renderIf: isManager },
			{ field: "firstName", title: "First Name", sort:true },
			{ field: "lastName", title: "Last Name", sort: true },
			{ field: "title", title: "Title" },
			{ field: "grade", title: "Grade", sort: true },
			{ field: "ssn", title: "SSN"  },
			{ field: "birthDate", title: "DOB", sort: true, format: parseDate },
			{ title: "Delete", icons: [{ glyph: "glyphicon-trash", handler: iconAction, data: "id" }] }
		],
		pagesize: 13,
		rowNumbers: true,
		rowClickHandler: rowAction
	});
```

The datasource property has a data and keyfield property. Data can be left blank and set after loading or with a default object array. keyfield is the object proprety to use to identify each unique object.

Columns is the array of column objects to display which mainly need a title and field to map to in the data objects. It can optionally have an array of icon objects with glyph property to set the Bootstrap glyph icon name, an external function handler, and some data value like a data object property. Column icon event handlers return a jQuery event in which event.data = {rowIdx:&lt;0 based row index&gt;, id:&lt;object key field&gt;}

Columns can also have a renderIf and format custom handler. The first has the signature of (item)->bool and the later (item)->string - where item is the row data item. If renderIf returns false, then the cell will be rendered completely empty. You can use this to skip buttons on some rows based on a condition.

If rowNumbers is set to true, then the first column will be incrementing row count.

Pagesize should be self-explanatory.

Sorting is very basic, just add sort to true on a column.

You can add Bootstrap icons to any column and attache them to any client side handler. You can even have multiple icons in one column.

Clicking a row set the table's currentSelection property to an object with the zero based row index as well as the keyfield ID of the object bound to that row. Set the table property rowClickHander to your own external event handler which also gets a jQuery event as the sole parameter.

Enjoy
