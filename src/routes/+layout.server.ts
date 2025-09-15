import { env } from '$env/dynamic/public';
import { appPages, getActivePage, type PublicPage } from '$lib/config/pages';
import { redirect } from '@sveltejs/kit';

export async function load({ route, locals }) {
    const page = getActivePage(route.id || null);

    if (page && page.dev && env.PUBLIC_PROD === "false") {
        return redirect(302, appPages.home.path())
    }

    const p: PublicPage = {
        key: page ? page.key : '',
        name: page ? page.name : '',
        route: page ? page.route : '',
        withoutFooter: page ? page.withoutFooter ?? false : false,
    }
    return {
        page: p,
    };
}
