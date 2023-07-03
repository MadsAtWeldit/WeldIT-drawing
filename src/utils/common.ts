export const excludeNullishProps = <T extends object>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => typeof v !== "undefined" && v !== null)
  ) as Valuble<T>;
};
