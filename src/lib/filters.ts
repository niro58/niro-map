import { goto } from '$app/navigation';
import { page } from '$app/state';
import { CalendarDate, fromDate, parseDate } from '@internationalized/date';
import { dateToQueryString, gotoFilter } from './utils';


export type ExtractParamValueDefinition =
	| {
		type: 'string';
		default?: string;
	}
	| {
		type: 'number';
		default?: number;
		max?: number;
	}
	| {
		type: 'float';
		default?: number;
		max?: number;
	}
	| {
		type: 'boolean';
		default?: boolean;
	}
	| {
		type: 'date';
		default?: Date;
	}
	| {
		type: 'string[]';
		default?: string[];
	};

type ParamValueType<T extends ExtractParamValueDefinition> = T extends { type: 'string' }
	? string
	: T extends { type: 'number' }
	? number
	: T extends { type: 'float' }
	? number
	: T extends { type: 'boolean' }
	? boolean
	: T extends { type: 'date' }
	? Date
	: T extends { type: 'string[]' }
	? string[]
	: never;

export type ExtractedParams<T extends Record<string, ExtractParamValueDefinition>> = {
	[K in keyof T]: ParamValueType<T[K]>;
};

export function extractParams<T extends Record<string, ExtractParamValueDefinition>>(
	url: URLSearchParams,
	keys: T
): ExtractedParams<T> {
	const params = {} as ExtractedParams<T>;

	Object.entries(keys).forEach(([key, value]) => {
		const urlValueStr = url.get(key);
		let urlValue: string | number | boolean | Date | string[] | undefined = undefined;

		if (value.type === 'string' && urlValueStr) {
			urlValue = urlValueStr;
		} else if (value.type === 'number' && urlValueStr) {
			const num = parseInt(urlValueStr);
			if (!isNaN(num) && (value.max === undefined || num <= value.max)) {
				urlValue = num;
			}
		}
		else if (value.type === 'float' && urlValueStr) {
			const num = parseFloat(urlValueStr);
			if (!isNaN(num) && (value.max === undefined || num <= value.max)) {
				urlValue = num;
			}
		} else if (value.type === 'boolean' && urlValueStr) {
			if (urlValueStr === 'true') {
				urlValue = true;
			} else if (urlValueStr === 'false') {
				urlValue = false;
			}
		} else if (value.type === 'date' && urlValueStr) {
			const date = parseDate(urlValueStr)
			if (date) {
				urlValue = date.toDate("UTC");
			}
		} else if (value.type === 'string[]') {
			if (urlValueStr) {
				urlValue = urlValueStr.split(',').map((v) => v.trim());
			}
		}

		if (urlValue === undefined && value.default !== undefined) {
			urlValue = value.default;
		}

		if (urlValue !== undefined) {
			params[key as keyof T] = urlValue as ExtractedParams<T>[keyof T];
		}
	});

	return params;
}

export function triggerFilter<TDefs extends Record<string, ExtractParamValueDefinition>>(
	filters: ExtractedParams<TDefs>
): void {
	const urlParams = getFilterSearchParams(filters);
	gotoFilter(`${page.url.pathname}?${urlParams.toString()}`);
}
export function getFilterSearchParams<TDefs extends Record<string, ExtractParamValueDefinition>>(
	filters: ExtractedParams<TDefs>
): URLSearchParams {
	let urlParams = new URLSearchParams();
	Object.entries(filters).forEach(([key, value]) => {
		let paramValue: string | undefined = undefined;

		if (value instanceof Date) {
			if (!isNaN(value.getTime())) {
				paramValue = dateToQueryString(value);
			}
		} else if (Array.isArray(value)) {
			if (value.length > 0) {
				paramValue = value.join(',');
			}
		} else if (value !== undefined && value !== null && value !== '') {
			paramValue = String(value);
		}

		if (paramValue !== undefined) {
			urlParams.set(key, paramValue);
		}
	});
	return urlParams;
}
export function refreshPage(): void {
	const basePath = page.url.pathname;
	const urlQuery = page.url.searchParams.toString();
	const finalUrl = urlQuery === '' ? basePath : `${basePath}?${urlQuery}`;

	goto(finalUrl, {
		invalidateAll: true,
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}
