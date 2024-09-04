import { isEmpty, debug } from "./utils.js";

/* a Dropdown Menu Control */
export class RayDropdown
{
    #keyfield = ''; // the field to use as the value/data
    #displayfield = ''; // the field to display
    #data = []; // all the table data
    #parentElem = null;
    #selectedIdx = -1; // the currently selected index
    #onChange = null; // event hanlder when the menu changes

    /* constructor */
    constructor(parentElem, options) {

        if (!parentElem || parentElem.localName != 'select' )
            throw new Error("Invalid construction paramaters. A parent element of type 'Select' is required.");

        this.#parentElem = parentElem;
        this.#keyfield = options.keyField;
        this.#displayfield = options.displayField;
        this.#onChange = options.changeHandler;

        this.#parentElem.addEventListener('change', evt => this.#doChangeSelection(evt) );
    }

    /* gets the data */
    get data() {
        return this.#data;
    }

    /* sets the data */
    set data(data) {
        if (!Array.isArray(data))
            debug('Bound data is not an array of records.');

        this.#data = data;

        // need rules to reset index

        this.#render();
    }

    /* get the currently selected value */
    get selectedValue() {
        return this.#parentElem.value;
    }

    /* get the currently selected data item */
    get selectedItem() {
        return this.#data.find(d => this.#parentElem.value === d[this.#keyfield]);
    }

    /* */
    #render() {
        if ( this.#data.length < 1 )
            return;

        // TO DO - also test is has the property field and an array of objects vs primitives
        const useIdx = isEmpty(this.#keyfield);
        const useFirst = isEmpty(this.#displayfield);

        const isStrings = useIdx && useFirst;

        this.#parentElem.replaceChildren();

        this.#data.forEach( (elem, idx) => {
            let option = document.createElement("option");
            option.value = isStrings ? `${elem}` : !useIdx ? elem[this.#keyfield] : `${idx}`;
            option.innerText = isStrings ? `${elem}` : !useFirst ? `${elem[this.#displayfield]}` : `${elem[0]}`;
            this.#parentElem.appendChild(option);
        });
    }

    /* when the menu is changed */
    #doChangeSelection(event) {

        this.#selectedIdx = event.srcElement.selectedIndex;

        if (this.#onChange)
            this.#onChange(event, this.#data[this.#selectedIdx] );
    }
} 