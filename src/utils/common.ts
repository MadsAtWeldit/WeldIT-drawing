import { OptionElement } from "../types/elements";
export const excludeNullishProps = <T extends object>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => typeof v !== "undefined" && v !== null)
  ) as Valuble<T>;
};

//Assigns element to correct property
export const assignCorrectly = <T extends object, U>(
  element: U extends OptionElement ? U : never,
  prop: T
) => {
  Object.keys(prop).map((key) => {
    if (element.type === key) {
      const index = key as keyof T;
      if (!element.className && !element.id)
        throw new Error(`Please provide a class or id for element: ${element.type}`);

      if (element.className) {
        const el = document.querySelector("." + element.className) as T[keyof T];
        if (el) {
          prop[index] = el;
        } else {
          throw new Error(`Could not find element with className: ${element.className}`);
        }
      }

      if (element.id) {
        const el = document.getElementById(element.id) as T[keyof T];

        if (el) {
          prop[index] = el;
        } else {
          throw new Error(`Could not find element with id: ${element.id}`);
        }
      }
    }
  });
};
