export namespace appUtil {

  export const MIN_YEAR: number = 2018;
  export const MAX_YEAR: number = 2099;

  export function isValidDateString(value: string): boolean {
    const result: RegExpMatchArray | null = value.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (result === null || result.length !== 4) {
      return false;
    }

    const yyyy: number | undefined = parseInt(result[1], 10);
    if (typeof(yyyy) !== 'number' || yyyy < MIN_YEAR || MAX_YEAR < yyyy) {
      return false;
    }

    const mm: number | undefined = parseInt(result[2], 10);
    if (typeof(mm) !== 'number' || mm < 1 || 12 < mm) {
      return false;
    }

    const dd: number | undefined = parseInt(result[3], 10);
    if (typeof(dd) !== 'number' || dd < 1 || 31 < dd) {
      return false;
    }

    return true;
  }

  export interface YYYYMMDD {
    yyyy: number;
    mm: number;
    dd: number;
  }

  export function parseYYYYMMDD(value: string): YYYYMMDD {
    const result: RegExpMatchArray | null = value.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (result === null || result.length !== 4) {
      throw new Error('invalid value');
    }

    const yyyy: number | undefined = parseInt(result[1], 10);
    if (typeof(yyyy) !== 'number' || yyyy < MIN_YEAR || MAX_YEAR < yyyy) {
      throw new Error('invalid value');
    }

    const mm: number | undefined = parseInt(result[2], 10);
    if (typeof(mm) !== 'number' || mm < 1 || 12 < mm) {
      throw new Error('invalid value');
    }

    const dd: number | undefined = parseInt(result[3], 10);
    if (typeof(dd) !== 'number' || dd < 1 || 31 < dd) {
      throw new Error('invalid value');
    }

    return {
      yyyy: yyyy,
      mm: mm,
      dd: dd
    };
  }
}
