# raytable
I wanted a very simple to use jQuery data table that met 95% of the patterns I needed which included paging, sorting, 
adding a few button columns with custom handlers, and using icons and styles from Bootstrap to keep it simple.

I know ther are TONS of js gridtables in the world but the best ones cost and others take some time to figure out all the settings.
I'm trying to keep this one as simple as possible.

raytools.js is the only required file and the only dependencies are of course Bootstrap and jQuery.

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

Sorting is very basic

You can add Bootstrap icons to any column and attache them to any client side handler. You can even have multiple icons in one column.

Enjoy
