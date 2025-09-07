import { db } from '$lib/server/db.js';
import type { GetPlaceRequest, PlaceRequest } from '$lib/types.js';
import { urlParamsToJson } from '$lib/utils.js';
import { json } from '@sveltejs/kit';



export async function GET(req) {
    if (!db) {
        return json({ error: "Database not configured" }, { status: 500 });
    }
    const reqParams = urlParamsToJson(req.url.searchParams) as unknown as GetPlaceRequest;


    const result = await db.query(
        `
       SELECT 
        ogc_fid, id, version, sources, "names.primary", "categories.primary", "categories.alternate", confidence, websites, socials, emails, phones, "brand.names.primary", addresses,
        ST_Y(geometry::geometry) AS latitude,
        ST_X(geometry::geometry) AS longitude
        FROM public.places
            WHERE ogc_fid = $1 
        LIMIT 1
        `,
        [
            reqParams.fid
        ],
    )
    const rows = result.rows;
    return json(rows[0]);
}
