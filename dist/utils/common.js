export const excludeNullishProps = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v !== "undefined" && v !== null));
};
//Assigns element to correct property
export const assignCorrectly = (element, prop) => {
    Object.keys(prop).map((key) => {
        if (element.type === key) {
            const index = key;
            if (!element.className && !element.id)
                throw new Error(`Please provide a class or id for element: ${element.type}`);
            if (element.className) {
                const el = document.querySelector("." + element.className);
                if (el) {
                    prop[index] = el;
                }
                else {
                    throw new Error(`Could not find element with className: ${element.className}`);
                }
            }
            if (element.id) {
                const el = document.getElementById(element.id);
                if (el) {
                    prop[index] = el;
                }
                else {
                    throw new Error(`Could not find element with id: ${element.id}`);
                }
            }
        }
    });
};
//# sourceMappingURL=common.js.map