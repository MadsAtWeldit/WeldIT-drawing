import { OptionElement } from "../types/elements";
//Removes nullish values from provided object
export const excludeNullishProps = <T extends object>(obj: T) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => typeof v !== "undefined" && v !== null)
  ) as Valuble<T>;
};

//Assigns element passed to options to correct property
export const assignCorrectly = <T extends object, U extends OptionElement>(
  element: U,
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

//Throws error if value is null or undefined
export function assertDefined<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error(`Error: value ${value} cannot be null/undefined`);
  }
}

//Function that throws an error if coords are undefined or not typeof number
export function assertRequired<T extends object>(coords: T): asserts coords is Required<T> {
  //IF there is no props in the provided object
  if (Object.keys(coords).length <= 0) throw new Error(`Error: no coords exist on this object`);
  //IF the provided value of said object is not type of a number
  Object.entries(coords).forEach(([k, v]) => {
    if (typeof v !== "number") throw new Error(`Error type ${k}:${v} must be of type number`);
  });
}

//Function for incrementing and decrementing
export function incOrDec(index: number, action: "increment" | "decrement", steps: number) {
  if (action === "increment") {
    return (index += steps);
  } else {
    return (index -= steps);
  }
}

//Function for creating an html element
export const createPersonalElement = <T extends keyof HTMLElementTagNameMap>(
  type: T,
  parent: HTMLElement,
  styles?: Record<string, string | number>
): HTMLElementTagNameMap[T] => {
  const element = document.createElement(type);
  if (styles) {
    Object.keys(styles).forEach((k) => {
      Reflect.set(element.style, k, styles[k]);
    });
  }
  parent.appendChild(element);

  return element;
};
