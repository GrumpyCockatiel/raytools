/* common utility functions */
export { isEmpty, addAllClasses, debug }

/* check a string for an empty or all whitespace value */
const isEmpty = (s) => s === null || s === undefined ? true : /^[\s\xa0]*$/.test(s);

/* adds and array of CSS classes to an element */
const addAllClasses = (elem, classArray) => {
    if ( !classArray || !Array.isArray(classArray) || classArray.length < 1)
        return;

    classArray.forEach(style => elem.classList.add(style));
}

/* debug handler */
const debug = (msg) => console.log(msg);