/**
 * Ray Tools
 * Copyright (c) 2016-2024 TAG Digital Studios
 * Created : 2016-Feb-18
 * Last Update : 2024-Aug-06
 * Version : 1.0.0
 * License : MIT License
**/
export class RayGrid {

    static space = "&nbsp;";
   
    #keyfield = ''; // the field to use as the ID of the row
    #data = []; // all the table data
    #columns = []; // column definitions
    #tableStyleClasses = []; // CSS classes to set on the table element itself
    #parentElem = null; // the enclosing parent element to put the table inside
    #rowNumbers = { visible: true, title: "Row" }; // whether to use row numbers
    #onRowClick = null; // event hanlder when a row is clicked
    #noDataLabel = "no data"; // the label to display when there is no data
    #sortAscIcon = 'sort-numeric-down'; // sort ascending icon
    #sortDescIcon = 'sort-numeric-up-alt'; // sort descending icon
    #pageSize = 25; // current page size
    #currentPageIdx = 0; // current page index - zero based
    #maxPageButtons = 2; // the maximum number of pager buttons to display
    #currentSort = { field: null, direction: 1}; // current sort field and direction where asc = 1 and desc = -1
    #currentSelection = null; // last clicked row - the data record itself

    /* constructor */
    constructor(parentElem, options) {

        if (!parentElem || !options || !options.columns)
            throw new Error('Invalid construction paramaters. A parent element and at least one column is required.');

        this.#parentElem = parentElem;
        this.#tableStyleClasses = (options.styleClasses) ? options.styleClasses : [];
        this.#columns = options.columns;
        this.#rowNumbers = (options.rowNumbers) ? options.rowNumbers : { visible: false, title: 'Row' };
        this.#keyfield = (options.keyfield) ? options.keyfield : null;
        this.#onRowClick = options.rowClickHandler;
        this.#noDataLabel = (options.noDataLabel ) ? options.noDataLabel : 'no data';
        this.#pageSize = ( options.pageSize > 0 ) ? options.pageSize : 25 ;
        this.#maxPageButtons = (options.maxPageButtons) ? options.maxPageButtons : 2;

        if (options.sortIcons)
        {
            this.#sortAscIcon = options.sortIcons.asc;
            this.#sortDescIcon = options.sortIcons.desc;
        }
    }

    /* gets the data */
    get data() {
        return this.#data;
    }

    /* sets the data */
    set data(data) {
        this.#data = data;
        
        // check the current page index is not too large for the new data
        if ( this.#currentPageIdx > this.maxPages - 1 )
            this.#currentPageIdx = this.maxPages - 1;
    }

    /* get the last selected data row */
    get selected() {
        return this.#currentSelection;
    }

    /* get the current 0 base page index */
    get pageIndex() {
        return this.#currentPageIdx;
    }

    /* sets the current 0 base page index */
    set pageIndex( page ) {
        if ( page < 0 ) page = 0;
        
        this.#currentPageIdx = (page < this.maxPages ) ? page : 0;
    }

    /* get the maximum possible pages based on the current data and page size */
    get maxPages() {
        return Math.ceil(this.data.length / this.#pageSize);
    }

    /* check a string for an empty or all whitespace value */
    #isEmpty = (s) => s === null || s === undefined ? true : /^[\s\xa0]*$/.test(s);

    /* adds and array of CSS classes to an element */
    #addAllClasses = (elem, classArray) => { classArray.forEach( style => elem.classList.add(style) ); }

    /*  render the table 
        you must call explcitly for now to give a chance the modify the data before rendering
    */
    render() {

        let table = document.createElement("table");
        table.className = 'table';
        this.#addAllClasses(table, this.#tableStyleClasses);

        let header = document.createElement("thead");
        let headerRow = document.createElement("tr");

        // show row numbers
        if (this.#rowNumbers.visible) {
            let th = document.createElement("th");
            th.innerHTML = `${this.#rowNumbers.title}`;
            headerRow.appendChild(th);
        }

        // set headers
        this.#columns.forEach( (header, _) => {
            let th = document.createElement("th");
            let span = document.createElement("span");
            span.innerHTML = `${header.title}`;
            th.appendChild(span);
            
            // is sortable
            if ( header.sort && header.field )
            {
                th.dataset.field = header.field;
                let icon = document.createElement("i");
                let iconClass = (this.#currentSort.direction > -1) ? this.#sortAscIcon : this.#sortDescIcon;
                this.#addAllClasses(icon, [`bi-${iconClass}`, 'ms-1']);
                icon.style.color = (this.#currentSort.field == header.field) ? '#000' : '#999';
                icon.addEventListener('click', (evt) => { this.#doSortCol(evt, header.field); } );
                th.appendChild(icon);
            }
            headerRow.appendChild(th);
        });
        header.appendChild(headerRow);
        table.appendChild(header);

        // create the table body
        let body = document.createElement("tbody");

        // iterate each data row
        for (let idx = 0; idx < this.#pageSize; ++idx )
        {
            // the actual data index
            let dataIdx = idx + (this.#currentPageIdx * this.#pageSize);

            if ( dataIdx >= this.#data.length )
                break;

            // data object itself
            let row = this.#data[dataIdx];

            let tr = document.createElement("tr");

            // add the ID to each row if the key field is set
            let rowKey = (!this.#isEmpty(this.#keyfield) && Object.hasOwn(row, this.#keyfield)) ? row[this.#keyfield] : '';

            if ( !this.#isEmpty(rowKey) )
                tr.dataset.key = rowKey;

            if (this.#rowNumbers.visible) {
                let td = document.createElement("td");
                this.#addAllClasses(td, this.#rowNumbers.styleClasses);
                td.innerHTML = `${1 + dataIdx }`;
                tr.appendChild(td);
            }

            // iterate each column to find the data field
            this.#columns.forEach((col) => {

                let cell = document.createElement("td");

                // test for renderIf
                if (col.renderIf && !col.renderIf(row)) {
                    cell.innerHTML = RayGrid.space;
                    tr.appendChild(cell);
                    return;
                }

                // check for icons first
                if (col.icons) {
                    col.icons.forEach(icon => {
                        let img = document.createElement("i");
                        this.#addAllClasses(img, [`bi-${icon.glyph}`, 'me-1']);
                        // add event click handler
                        if (icon.handler)
                            img.addEventListener('click', (evt) => { icon.handler(evt, { idx: dataIdx, id: rowKey, value: row[icon.data] }); });
                        cell.appendChild(img);
                    });
                }

                // now add the value inside a span
                let value = this.#getCellValue(row, col);
                let span = document.createElement("span");
                span.innerHTML = value;
                cell.append(span);
                tr.appendChild(cell);
            }); // end each col

            // add onClick event handler to the row
            tr.addEventListener('click', (evt) => { this.#doRowClick(evt, { idx: dataIdx, id: rowKey }); } );

            body.appendChild(tr);
        }

        table.appendChild(body);

        // replace the current table
        this.#parentElem.replaceChildren();
        this.#parentElem.appendChild(table);

        // render footer
        if (this.#data.length < 1)
            this.#parentElem.appendChild(this.#renderNoData() );
        else
            this.#parentElem.appendChild( this.#renderFooter() );
    }

    /* renders just the footer */
    #renderFooter()
    {
        let footer = document.createElement("div");
        this.#addAllClasses(footer, ['d-flex', 'justify-content-center']);

        // pager
        let pagerNav = document.createElement("nav");
        let pagerCtrl = document.createElement("ul");
        pagerCtrl.className = 'pagination';
        this.#addAllClasses(pagerNav, ['align-items-start', 'me-auto']);

        // first page
        let firstPage = this.#createPageLink( '&laquo;', 0, false);
        pagerCtrl.appendChild(firstPage);

        // render the pager buttons
        let pages = this.#createPageButtons();

        pages.forEach( (v) => {
            let currentPage = this.#createPageLink(`${v + 1}`, v, v == this.#currentPageIdx);
            pagerCtrl.appendChild(currentPage);
        } );

        // last page
        let lastPage = this.#createPageLink('&raquo;', Math.ceil(this.data.length / this.#pageSize) - 1, false );
        pagerCtrl.appendChild(lastPage);

        pagerNav.appendChild(pagerCtrl);

        // summary
        let start = this.#currentPageIdx * this.#pageSize;
        let end = Math.min( start + this.#pageSize, this.#data.length );

        let summary = document.createElement("div");
        summary.innerHTML = `${start + 1} - ${end} of ${this.#data.length} items`;
        footer.appendChild(pagerNav);
        footer.appendChild(summary);

        return footer;
    }

    /* renders a no data footer */
    #renderNoData()
    {
        let div = document.createElement("div");
        this.#addAllClasses(div, ['d-flex', 'justify-content-center']);
        let span = document.createElement("span");
        span.innerHTML = `${this.#noDataLabel}`;

        // replace the current table
        div.appendChild(span);
        return div;
    }

    /* creates a pager button */
    #createPageLink( text, idx, active )
    {
        let li = document.createElement("li");
        let link = document.createElement("a");
        li.className = "page-item";
        if (active)
            li.classList.add('active');
        link.className = "page-link";
        link.href = `#`;
        link.innerHTML = text;
        link.addEventListener('click', (evt) => this.#doChangePage(evt, idx));
        li.appendChild(link);
        return li;
    }

    /* determine the data value to show in the table cell */
    #getCellValue(dataRow, colDef)
    {
        if ( !colDef.field || !Object.hasOwn(dataRow, colDef.field) )
            return RayGrid.space;

        let value = (colDef.format != null) ? `${colDef.format(dataRow)}` : `${dataRow[colDef.field]}`;

        return ( this.#isEmpty(value)) ? RayGrid.space : value;
    }

    /* determines an array of int indices for the pager control */
    #createPageButtons()
    {
        // never mutate maxPageButtons, should never be less than 2
        let totalPage = (this.#maxPageButtons < 2) ? 2 : this.#maxPageButtons;

        // calculate maximum possible pages ever needed
        const maxPage = this.maxPages;

        if ( totalPage > maxPage )
            totalPage = maxPage;

        // page button to render first is 1/2 distance
        let startPage = this.#currentPageIdx - Math.floor( totalPage / 2 );

        if (startPage < 0)
            startPage = 0;

        // handles when the current page is close to the end
        if ( maxPage - startPage < totalPage )
            startPage = maxPage - totalPage;

        // create an index array from start page
        let pages = [];
        for (let idx = startPage; idx < startPage + totalPage && idx < maxPage; ++idx)
            pages.push(idx);

        return pages;
    }

    /* when a sort header is clicked */
    // event.srcElement
    #doSortCol(event, sortField)
    {
        // set the current sort info
        if (this.#currentSort == null) 
            this.#currentSort = { field: sortField, direction: 1 };
        else if (this.#currentSort.field != sortField )
            this.#currentSort = { field: sortField, direction: this.#currentSort.direction };
        else 
            this.#currentSort = { field: sortField, direction: this.#currentSort.direction * -1 };

        // sort the data itself
        this.#data.sort( this.#dynamicSort(sortField) );

        // reload the date and page back to start
        this.#currentPageIdx = 0;
        this.render();
    }

    /* when a row is clicked on */
	#doRowClick(event, data) {

        this.#currentSelection = this.#data[data.dataIdx];

        if ( this.#onRowClick )
            this.#onRowClick(event, data);
    }

    /* when a page button is clicked */
	#doChangePage(event, newPage) {
        this.#currentPageIdx = newPage;
        this.render();
    }

    /* sort by a specified property, use prefix '-' to reverse the sort direction */
	#dynamicSort( property )
    {
        let sortOrder = this.#currentSort.direction;

        return function(a, b) {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    /* internal debug handler */
	#debug = (msg) => console.log(msg);
}