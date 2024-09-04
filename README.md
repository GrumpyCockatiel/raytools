# raytools 1.1.0

Raytools is my personal collection of Javascript controls that depend on Bootstrap 5 (that may change later to no dependencies or multiple CSS libs).

![Raytools data grid](/docs/screen.png)

I wanted a very simple to use JavaScript data table that met 95% of the patterns I needed which included paging, sorting, 
adding a few button columns with custom handlers, and using icons and styles from Bootstrap to keep it simple. This started out of me getting totally hosed by Telerik's Kendo UI jQuery in which the grid was originally free and then they started charging.

I know ther are TONS of JS gridtables in the world but the best ones cost and others take some time to figure out all the settings.
I'm trying to keep this one as simple as possible.

I'm no Bootstrap/CSS guru so if you have some tips to clean-up the layout, feel free to pass them along. I'm totally open to snazzing it up and even completly removing the Bootstrap dependency to make this a pure jQuery data table.

There's no plan to make this an inline editable grid table since my prefered UI is to use edit modals when a row is clicked.

## Installation

You can [download the package from NPM](https://www.npmjs.com/package/@raydreams/jscontrols)

## Implementation

Bootstrap 5 and Bootstrap Icons are a required dependency.

[Live Demo](http://www.raydreams.com/raygrid)

See `demo/index.html` to see how to configure.

```javascript

import { RayGrid } from '@raydreams/jscontrols'

var dataTable = null;

document.addEventListener("DOMContentLoaded", function (event) {

    dataTable = new RayGrid(document.getElementById("dataTable"), {
        keyfield: 'id',
        styleClasses: ['table-bordered', 'table-hover'],
        columns: [
            { title: "Info", icons: [{ glyph: "info-circle-fill", handler: iconAction, data: "color" }], renderIf: isManager },
            { field: "firstName", title: "First Name", sort: true },
            { field: "lastName", title: "LastName", sort: true },
            { field: "title", title: "Title", sort: false },
            { field: "email", title: "Email" },
            { field: "grade", title: "Grade", sort: true },
            { field: "ssn", title: "SSN", sort: false },
            { field: "dob", title: "DOB", sort: true, format: (date) => { return new Date(date).toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }); } },
            { title: "Delete", icons: [{ glyph: "trash", handler: deleteRecord, data: "color" }] }
        ],
        rowNumbers: { visible: true, title: "Row", styleClasses: ['rowNumStyle'], },
        pageSize: 11,
        maxPageButtons: 5,
        footer: { autoHide: true },
        rowClickHandler: rowAction
    });

    getData();
});

/* callback when data is loaded from an API call or file */
function loadData(myData) {
    dataTable.data = myData;
    dataTable.render();
}
```

### Using Icons

The whole original idea was to just use the Bootstrap icons - then Bootstrap 4 happened. Version 1 of RayGrid finally goes back to just specifying the Bootstrap 5 icon label such as `arrow-bar-left`.

Thus, on any column use can add an array of interactive icons:
```javascript
icons: [{ glyph: "trash", handler: deleteRecord, data: "someField" }]
```

The glyph name is just the [Bootstrap 5 icon](https://icons.getbootstrap.com/) name.

## Parameters & Options
The following documents parameters you can set in constructor options:

* **keyfield** - keyfield is the object property to use to identify each unique row object - usually a string, GUID or INT unique identifier.
* **styleClasses** - By default the `table` class is set - but this string array allows you to specify other Bootstrap table style classes as options.
* **columns** - Columns is the array of column objects to display which mainly need a title and field to map to in the data objects.
  * field - the actual object property field name.
  * title - the column header displayed
  * icons - (optional) An arary of Bootstrap icons to display in the column so each column can have more than one icon.
    * glyph - the glyph's name e.g. `trash`
    * handler - (optional) a callback to handle clicking on the icon. Column icon event handlers return a JS event as well as a data object `{ idx: dataIdx, id: rowKey, value: data }`
    * data - (optional) Additional data field value returned in the event handler
  * sort - (optional, default is false) set to true to allowing sorting on this field.
  * renderIf - (optional) a callback function with the signature `(dataItem) -> bool`, where item is the object bound to that row, that returns whether to even render the contents of the cell at all. This can be use to skip cell icons based on some condition and simply a shortcut to using format that returns an empty string if the condition is true.
  * format - (optional) a callback function with the signature `(dataItem) -> string`, where item is the object bound to that row, that returns a format string to display in that cell, such as formatting dates. **WARNING** this sets the InnerHTML so only set data from a trusted source.
  * width - (optional) If specified with a positive integer will set a style width property on the column in pixels.
* **pageSize** - (optional, defaults to 25) Should be self-explanatory, the number of items to display per page.
* **rowNumbers** - (optonal) Options for displaying row numbers as the left most column
  * visble - (bool) set to true to render, otherwise just false
  * title - (string) override the default column header which is 'Row'
  * styleClass - (string) the CSS class to set on each <td> in this column
* **maxPageButtons** - (optional) the maximum number of pager buttons to display.
* **noDataLabel** - (optional) the text to display where there is no data to display.
* **rowClickHandler** - (optional) If the row is clicked you can set a generic row click handler. This will set the table's currentSelection property to an object with the zero based row index as well as the keyfield ID of the object bound to that row. It will also send back a JS event as well as some additional data `{ idx: dataIdx, id: rowKey }`. Using row click events in combination with cell icon events may cause weirdness.
* **footer** - (optonal) Options for displaying the table footer containing the pager and summary
  * autoHide - (bool) When true will hide the pager if there is only a single page 

## Accessors

There are a few getters/setters on the table property for changing the data programmatically:

### Setting Data at Runtime
Use the 'data' property to set the data then you must call `render()` explicitly.
```javascript
dataTable.data = myData;
dataTable.render();
```

#### Accessing Bound Data
```javascript
for (var i; i < dataTable.data.length; ++i)
{
	let item = dataTable.data[i];
}
```

#### Selected
Get the last selected or clicked record
```javascript
let item = dataTable.selected;
```

#### Page Index
Get or set the page index which is 0 based for the first page
```javascript
const pages = dataTable.maxPages;
dataTable.pageIndex = 5;
```

## Event Handlers

### Handle an Icon Click Event
```javascript
function iconAction(event, item) {
    alert(`Favorite Color for item ${item.idx} is ${item.value}`);
    event.stopPropagation();
}
```

#### Handle a Row Click Event
```javascript
function rowAction(event, item) {
    alert(JSON.stringify(item));
}
```

#### Handle a Conditional Render
```javascript
function isManager(item) {
	return (item.grade > 3);
}
```

#### Handle Custom Formatting
Sets the `InnerHTML` property for now so be careful. Will change to send back only the HTML element.

```javascript
function formatDate(item) {
  return new Date(item).toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
```

```javascript
function formatHyperlink(item) {
  return `<a href="https://www.linkedin.com/">${item.email}</a>`;
}
```

## Using with vue.js

I use vue.js but I really only use it for the templating and routing i.e. I don't use it the **vue way** with all the HTML attribute conditionals. This make my code more portable if I want to change to something else later.

So something like this works perfectly fine in vue.

```javascript
<script setup>

import { onMounted } from 'vue'
import { RayGrid } from '@raydreams/jscontrols'

let dataTable = null;

onMounted( () => {

    // define the data table using a parent block element like div
    dataTable = new RayGrid(document.getElementById("dataTable"), { 
        keyfield:'id',
        styleClasses: ['table-bordered','table-hover'],
        columns:[
            { title: "Info", icons:[ { glyph: "info-circle-fill", handler: iconAction, data: "color" }], renderIf:isManager },
            { field: "firstName", title: "First Name", sort: true },
            { field: "lastName", title: "LastName", sort: true },
            { field: "title", title: "Title", sort: false },
            { field: "email", title: "Email" },
            { field: "grade", title: "Grade", sort: true },
            { field: "ssn", title: "SSN", sort: false },
            { field: "dob", title: "DOB", sort: true, format: (item) => { return new Date(item.dob).toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }); } },
            { title: "Delete", icons: [{ glyph: "trash", handler: deleteRecord, data: "color" }]}
        ],
        rowNumbers: { visible: true, title: "Row", styleClasses: ['rowNumStyle'] },
        pageSize: 13,
        maxPageButtons: 7,
        rowClickHandler: rowAction
    });

    doGetData();
})

```

Enjoy

## Change History

### Change History 1.1.0

* Added RayDropdown.
* Added being able to hide the pager if there is only one page.
* Fixed bugs when there is no data.
* Moved common utility functions to `utils.js`

### Change History 1.0.10

* Bug fixes
* Documentation updates

### Change History 1.0.3

* The main control file is now `raygrid.js` since there might be other controls later.
* Dependency is now on Bootstrap 5.
* Dependency on jQuery has been removed.
* Bootstrap glyph icons are supported again.
* Added properties to specify the sort icons.
* Added Getter/Setter for the data itself.
* Added Getter for the last selected data row.
* Added `options.tableStyleClasses` to set multiple style classes on the table element itself.
* Each row is set with a `data-key` attribute set to the key field value
* Added Getter/Setter for the current page index to set if you load new data.
