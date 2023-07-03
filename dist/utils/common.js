export const excludeNullishProps = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => typeof v !== "undefined" && v !== null));
};
//# sourceMappingURL=common.js.map