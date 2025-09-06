import { clientPg } from '$lib/server/db.js';
import type { GetPlaceRequest, PlaceRequest } from '$lib/types.js';
import { urlParamsToJson } from '$lib/utils.js';
import { json } from '@sveltejs/kit';



export async function GET(req) {
    const reqParams = urlParamsToJson(req.url.searchParams) as unknown as GetPlaceRequest;


    const result = await clientPg.query(
        `
       SELECT 
        ogc_fid, id, version, sources, "names.primary", "categories.primary", "categories.alternate", confidence, websites, socials, emails, phones, "brand.names.primary", addresses,
        ST_Y(geometry::geometry) AS latitude,
        ST_X(geometry::geometry) AS longitude
        FROM public.places
            WHERE ogc_fid = $1
        ORDER BY ogc_fid ASC LIMIT $1
        `,
        [
            reqParams.fid
        ],
    )
    const rows = result.rows;
    return json(rows[0]);
}
