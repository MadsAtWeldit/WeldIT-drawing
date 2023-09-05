//Removes nullish values from provided object
export const excludeNullishProps = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v !== "undefined" && v !== null));
};
// //Throws error if value is null or undefined
export function assertDefined(value) {
    if (value == null) {
        throw new Error(`Error: value ${value} cannot be null/undefined`);
    }
}
// //Function that throws an error if coords are undefined or not typeof number
export function assertRequired(coords) {
    //IF there is no props in the provided object
    if (Object.keys(coords).length <= 0)
        throw new Error(`Error: no coords exist on this object`);
    //IF the provided value of said object is not type of a number
    Object.entries(coords).forEach(([k, v]) => {
        if (typeof v !== "number")
            throw new Error(`Error type ${k}:${v} must be of type number`);
    });
}
//Function for creating an html element
export const createPersonalElement = (type, parent, styles) => {
    const element = document.createElement(type);
    if (styles) {
        Object.keys(styles).forEach((k) => {
            Reflect.set(element.style, k, styles[k]);
        });
    }
    parent.appendChild(element);
    return element;
};
//# sourceMappingURL=common.js.map