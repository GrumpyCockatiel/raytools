# raytable
I wanted a very simple to use jQuery data table that met 95% of the patterns I needed which included paging, sorting, 
adding a few button columns with custom handlers, and using icons and styles from Bootstrap to keep it simple.

I know ther are TONS of js gridtables in the world but the best ones cost and others take some time to figure out all the settings.
I'm trying to keep this one as simple as possible.

raytools.js is the only required file with dependencies on Bootstrap 3 and jQuery 1.12. It has not been upgraded to Bootstrap 4. All icons come from the Bootstrap 3 Glyphicons.

[Live Demo](http://www.raydreams.com/raytable/)

![Raytools data grid](/Screenshots/screen.png)

See the index and data file to see how to configure.

```
jQuery(document).ready(function () {

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
		maxPageButtons: 5,
		rowNumbers: true,
		rowClickHandler: rowAction
	});
```

### Parameters & Options
* **datasource** - The datasource property contains information about the data to render itself.
  * data - the actual data to render which can be initialized with an empty array or set to JSON list of data objects. After initial rendering of the table it can be set with the table function using **myTable.data(myData,'id')**.
  * keyfield - keyfield is the object property to use to identify each unique row object - usually a string, GUID or Int unique identifier.
* **columns** - Columns is the array of column objects to display which mainly need a title and field to map to in the data objects.
  * field - the actual object property field name.
  * title - the column header displayed
  * width - the width in pixels to hard code this column to.
  * icons - (optional) An arary of Glyph icons to display in the column so each column can have more than one icon.
    * glyph - the glyph's CSS class name from the Bootstrap 3 glyphicons.
    * handler - (optional) a callback to handle clicking on the icon. Column icon event handlers return a jQuery event in which event.data = {rowIdx:&lt; 0 based row index &gt;, id:&lt; object key field &gt;}. Icon clicks stop the bubbling of the event any further.
    * data - (optional) Additional data to set the ray-data attribute to.
  * sort - (optional, default is false) set to true to allowing sorting on this field.
  * renderIf - (optional) a callback function with the signature (item)->bool, where item is the object bound to that row, that returns whether to even render the contents of the cell at all. This can be use to skip cell icons based on some condition and simply a shortcut to using format that returns an empty string if the condition is true.
  * format - (optional) a callback function with the signature (item)->string, where item is the object bound to that row, that returns a format string to display in that cell, such as formatting dates.
* **pageSize** - (optional, defaults to 25) Should be self-explanatory, the number of items to display per page.
* **rowNumbers** - (optonal) default is false) If set to trye, the first column will display an incrementing row count.
* **maxPageButtons** - (optional) the maximum number of pager buttons to display.
* **noDataLabel** - (optional) the text to display where there is no data to display.
* **rowClickHandler** - (optional) If the row is click and not an icon with a handler, then you can set a generic row click handler. This will set the table's currentSelection property to an object with the zero based row index as well as the keyfield ID of the object bound to that row. It will also send back a jQuery event in which event.data = {rowIdx:&lt; 0 based row index &gt;, id:&lt; object key field &gt;} to the handler.

### Setting Data at Runtime
Use the 'data' method
The first parameter is the JSON object array and the second is the object property to use as the unique identifier
```
dataTable.data(myData,'id');
```

### Accessing Bound Data
```
for (var i; i < dataTable.datasource.data.length; ++i)
{
	var item = dataTable.datasource.data[i];
}
```

### Handle an Icon Click Event
```
function iconAction(event)
{
	// event is jQuery event
	// cast it to a jQuery element and get the ray-data attribute which the field set in the definition
	var data = jQuery(event.target).data('ray-data');

	// or use event.data which is an object {id:objectKey, rowIdx:clickedRow}
	alert('You clicked the icon with data = ' + event.data.id + ' on row ' + event.data.rowIdx );
}
```

### Handle a Row Click Event
```
function rowAction(event)
{
	// clicking a row outside of an icon is similar - just get the ray-key attribute
    var id = jQuery(event.target).data('ray-key');
    alert('You clicked row ' + event.data.rowIdx + ' with object ID ' + event.data.id );
}
```

### Handle a Conditional Render
```
function isManager(item)
{
	return (item.grade > 4);
}
```

### Handle Custom Formatting
```
function parseDate(item)
{
	// source is ISO 8601
    var d = new Date(item.birthDate);
    return d.toDateString();
}
```

Enjoy
