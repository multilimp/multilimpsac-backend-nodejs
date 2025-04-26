// Define un tipo genérico para objetos con claves de string y valores any
type GenericObject = { [key: string]: any };

export const objectCleaner = (params: GenericObject = {}, onlyNull: boolean = false): GenericObject => {
  const clone = { ...params };
  Object.keys(clone).forEach((key) => {
    if (onlyNull && clone[key] === null) {
      delete clone[key];
    } else if (!onlyNull && !clone[key]) { // Verifica si es falsy solo si onlyNull es false
      delete clone[key];
    }
  });
  return clone;
};
