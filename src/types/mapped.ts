//Type that removes readonly so we can assign values
type Writable<T> = { -readonly [K in keyof T]: T[K] };

//Rename each key as U
type Rename<T, U> = {
  [K in keyof T as U extends string ? U : never]: T[K];
};

//Take each prop of T and combine the K in keyof T which is inferred to type PropertyKey so we add & string so its inferred to type string
type Prefix<T, P extends string> = {
  [K in keyof T & string as `${P}${Capitalize<K>}`]?: T[K];
};

//Removes props that are of nullish value
type Valuble<T> = { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] };

type ToBool<T> = {
  [K in keyof T]: boolean;
};
