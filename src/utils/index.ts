
/**
 * Calculates delay (in minutes) between the current time and a given timestamp.
 * @param timestamp - ISO 8601 string representing the timestamp of the event
 */
export const calculateDelayInMinutes = (timestamp: string): number => {
  console.log({timestamp})
  const eventTime = new Date(timestamp).getTime();
  const currentTime = Date.now();
  return (currentTime - eventTime) / 60000; // Convert milliseconds to minutes
};

export const isUndefined = (obj: any): obj is undefined => typeof obj === 'undefined';


export const isPlainObject = (fn: any): fn is Record<string, unknown> => {
  if (!isObject(fn)) {
    return false;
  }
  const proto = Object.getPrototypeOf(fn);
  if (proto === null) {
    return true;
  }
  const ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (
    typeof ctor === 'function' &&
    ctor instanceof ctor &&
    Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object)
  );
};


// Remove objects duplicates from the array
export const uniqueObjectsList = arrayOfObjects => arrayOfObjects
  .map(o => JSON.stringify(o))
  .filter((o, index, array) => array.indexOf(o) === index)
  .map(o => JSON.parse(o));

export const flatOneDepth = array => array.reduce((a, v) => a.concat(v), []);

export const addLeadingSlash = (path?: string): string =>
  path && typeof path === 'string' ? (path.charAt(0) !== '/' ? '/' + path : path) : '';

/**
 * Deprecated. Use the "addLeadingSlash" function instead.
 * @deprecated
 */
export const validatePath = addLeadingSlash;

export const normalizePath = (path?: string): string =>
  path
    ? path.startsWith('/')
      ? ('/' + path.replace(/\/+$/, '')).replace(/\/+/g, '/')
      : '/' + path.replace(/\/+$/, '')
    : '/';

export const stripEndSlash = (path: string) => (path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path);

export const isString = (fn: any): fn is string => typeof fn === 'string';
export const isConstructor = (fn: any): boolean => fn === 'constructor';
export const isNil = (obj: any): obj is null | undefined => isUndefined(obj) || obj === null;
export const isSymbol = (fn: any): fn is symbol => typeof fn === 'symbol';

export const toTitleCase = (str) => {
  if (str === null || str === undefined) {
    return '';
  }
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Check is function .
 * @param item
 * @returns {boolean}
 */
 export function isFunction(item: any): boolean {
	return (item && typeof item === 'function' && !Array.isArray(item));
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 * From https://stackoverflow.com/a/34749873/772859
 */
export function isObject(item: any) {
	return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Check is object or function.
 * @param item
 * @returns {boolean}
 */
export function isObjectOrFunction(item: any): boolean {
	return isFunction(item) || isObject(item);
}

/**
 * Check is class instance.
 * @param item
 * @returns {boolean}
 */
export function isClassInstance(item: any): boolean {
	return isObject(item) && item.constructor.name !== 'Object';
}

/**
 * Check value not empty.
 * @param item
 * @returns {boolean}
 */
export function isNotEmpty(item: any): boolean {
	return !isEmpty(item);
}

/**
 * Check value empty.
 * @param item
 * @returns {boolean}
 */
export function isEmpty(item: any) {
	if (item instanceof Array) {
		item = item.filter((val) => !isEmpty(val));
		return item.length === 0;
	} else if (item && typeof item === 'object') {
		for (var key in item) {
			if (
				item[key] === null ||
				item[key] === undefined ||
				item[key] === ''
			) {
				delete item[key];
			}
		}
		return Object.keys(item).length === 0;
	} else {
		return (
			!item ||
			(item + '').toLocaleLowerCase() === 'null' ||
			(item + '').toLocaleLowerCase() === 'undefined'
		);
	}
}

export function isJsObject(object: any) {
	return (
		object !== null && object !== undefined && typeof object === 'object'
	);
}

/**
 * Remove duplicates from an array
 * 
 * @param data 
 * @returns 
 */
export function removeDuplicates(data: string[]) {
	return [...new Set(data)];
}

/**
 * Check string is null or undefined
 * From https://github.com/typeorm/typeorm/issues/873#issuecomment-502294597 
 * 
 * @param obj 
 * @returns 
 */
export function isNullOrUndefined<T>(string: T | null | undefined): string is null | undefined {
	return typeof string === "undefined" || string === null
}

