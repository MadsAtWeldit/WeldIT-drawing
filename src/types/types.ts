//Type that removes readonly so we can assign values
type Writable<T> = { -readonly [K in keyof T]: T[K] };

//Loop each key in T and cast key as "startX" instead of "x1"
type RenameSelectionCoords<T, U> = {
  [K in keyof T as U extends string ? U : never]: T[K];
};
//Take each prop of T and combine the K in keyof T which is inferred to type PropertyKey so we add & string so its inferred to type string
type PrefixCoords<T, P extends string> = {
  [K in keyof T & string as `${P}${Capitalize<K>}`]?: T[K];
};
