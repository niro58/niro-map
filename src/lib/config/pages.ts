import { goto } from '$app/navigation';
import { env } from '$env/dynamic/public';

export type PublicPage = {
	key: string
	name: string
	withoutFooter: boolean;
	route: string
}
export type AppPage = {
	name: string;
	route: string;
	path: (() => string) | ((...params: string[]) => string);
	dev?: boolean;
	withoutFooter?: boolean;
};
export type AppPageWithKey = AppPage & { key: string };

const rawAppPages = {
	home: {
		name: "Map",
		route: "/",
		path: () => "/",
		withoutFooter: true
	},
	place_browser: {
		name: "Places",
		route: "/places",
		path: () => "/places",
		withoutFooter: true
	},
	place: {
		name: "Place",
		route: "/places/[id]",
		path: (id: string) => `/places/${id}`
	},
	about: {
		name: "About",
		route: "/about",
		path: () => "/about"
	},
	terms: {
		name: "Terms",
		route: "/terms",
		path: () => "/terms"
	},
	terms_terms_of_service: {
		name: "Terms of Service",
		route: "/terms/terms-of-service",
		path: () => "/terms/terms-of-service"
	},
	terms_privacy_policy: {
		name: "Privacy Policy",
		route: "/terms/privacy-policy",
		path: () => "/terms/privacy-policy"
	}
} as const;

export type PageKey = keyof typeof rawAppPages;

type AssertedAppPages = {
	[K in PageKey]: AppPage;
};

export const appPages: AssertedAppPages = rawAppPages;

export function getActivePage(route: string | null): AppPageWithKey | undefined {
	if (!route) {
		return undefined;
	}

	const entry = Object.entries(appPages).find(([key, page]) => {
		return page.route === route;
	});
	if (entry) {
		const [key, page] = entry;
		return { ...page, key };
	}
	return undefined;
}

export function gotoFilter(link: string) {
	goto(link, {
		invalidateAll: true,
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}