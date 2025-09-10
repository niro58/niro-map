import { goto } from "$app/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };


export type ResultClient<T> = Success<T> | Failure | NotAsked | Loading;
export type ResultFetch<T> = Success<T> | Failure;
export type NotAsked = { type: "NOT_ASKED" };
export type Loading = { type: "LOADING" };
export type Success<T> = {
	type: "SUCCESS";
	data: T;
};
export type Failure = {
	type: "FAILURE";
	error: string;
};

export function urlParamsToJson(searchParams: URLSearchParams): Record<string, string | string[]> {
	const object: Record<string, string | string[]> = {};

	searchParams.forEach((value, key) => {
		if (key in object) {
			if (Array.isArray(object[key])) {
				(object[key] as string[]).push(value);
			} else {
				object[key] = [object[key] as string, value];
			}
		} else {
			object[key] = value;
		}
	});
	return object;
}

export function cleanCategory(cat: string): string {
	return cat.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function cleanWebsite(webRaw: string): string {
	const web = webRaw.replace("{", "").replace("}", "").replace(/"/g, "");
	return web;
}
export function googleMapsLink(lat?: number, lon?: number) {
	if (lat == null || lon == null) return '#';
	const latlon = `${lat},${lon}`;
	return `https://www.google.com/maps/search/?api=1&query=${latlon}&query_place_id=&center=${latlon}&zoom=17`;
}
export function gotoFilter(link: string) {
	goto(link, {
		invalidateAll: true,
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}

export function dateToQueryString(date: Date | undefined): string {
	if (!date) {
		return '';
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}


import { MediaQuery } from 'svelte/reactivity';

const MOBILE_BREAKPOINT = 768;

export class IsMobile extends MediaQuery {
	constructor() {
		super(`max-width: ${MOBILE_BREAKPOINT - 1}px`);
	}
}
