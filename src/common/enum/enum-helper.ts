export function assignEnumValue<T>(value: string, enumType: T): T[keyof T] {
  if (Object.values(enumType).includes(value as unknown as T[keyof T])) {
    return value as unknown as T[keyof T];
  }
  throw new Error(`Invalid value ${value} for enum ${enumType}`);
}
