export const excludeNullishProps = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v !== "undefined" && v !== null));
};
//Assigns element to correct property
export const assignCorrectly = (element, prop) => {
    Object.keys(prop).map((key) => {
        if (element.type === key) {
            const index = key;
            if (element.className) {
                const el = document.querySelector("." + element.className);
                prop[index] = el;
            }
            if (element.id) {
                const el = document.querySelector(element.id);
                prop[index] = el;
            }
        }
    });
};
//# sourceMappingURL=common.js.map