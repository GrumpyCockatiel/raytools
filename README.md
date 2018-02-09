# raytable
I wanted a very simple to use jQuery data table that met 95% of the patterns I needed which included paging, sorting, 
adding a few button columns with custom handlers, and using icons and styles from Bootstrap to keep it simple.

I know ther are TONS of js gridtables in the world but the best ones cost and others take some time to figure out all the settings.
I'm trying to keep this one as simple as possible.

raytools.js is the only required file and the only dependencies are of course Bootstrap and jQuery.

[Live Demo](http://www.raydreams.com/raytable/)

![Raytools data grid](/Screenshots/screen.png)

Use the index and data file to see how to set it up.

```
var dataTable = jQuery("#dataTable").raytable({
	datasource: { data: [], keyfield: 'id' },
		columns: [
			{ title: "Add", icons: [{ glyph: "glyphicon-plus", handler: "someAction", data:"id" }] },
			{ field: "firstName", title: "First Name", sort:true },
			{ field: "lastName", title: "Last Name", sort: true },
			{ field: "gender", title: "Gender", sort: true },
			{ field: "email", title: "Email" },
			{ field: "title", title: "Title", sort: true },
			{ field: "city", title: "City", sort: true },
			{ title: "Delete", icons: [{ glyph: "glyphicon-trash", handler: "someAction", data: "id" }] }
		],
		pagesize: 10,
		rowNumbers: true
	});
```

The datasource property has a data and keyfield property. Data can be left blank and set after loading or with a default object array. Keyfield is the object proprety to use to identify each unique object.

Columns is the array of column objects to display which mainly need a title and field to map to in the data objects.

If rowNumbers is set to true, then the first column will be incrementing row count.

Pagesize should be self-explanatory.

Sorting is very basic

You can add Bootstrap icons to any column and attache them to any client side handler. You can even have multiple icons in one column.

Enjoy
