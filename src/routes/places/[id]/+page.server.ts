import { db } from "$lib/server/db";
import type { PlaceResponse } from "$lib/types.js";

export async function load({ params }) {
    if (!db) {
        throw new Error("Database not configured");
    }
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
            params.id
        ],
    )

    const rows = result.rows

    return {
        place: rows[0] as unknown as PlaceResponse || null
    }
}