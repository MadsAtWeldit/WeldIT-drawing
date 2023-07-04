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

      if (element.className) {
        const el = document.querySelector("." + element.className) as T[keyof T];
        prop[index] = el;
      }
      if (element.id) {
        const el = document.querySelector(element.id) as T[keyof T];
        prop[index] = el;
      }
    }
  });
};
