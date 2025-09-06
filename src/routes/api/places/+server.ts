import { clientPg } from '$lib/server/db.js';
import type { PlaceRequest } from '$lib/types.js';
import { urlParamsToJson } from '$lib/utils.js';
import { json } from '@sveltejs/kit';

export async function GET(event) {
    const reqParams = urlParamsToJson(event.url.searchParams) as unknown as PlaceRequest;
    console.log(reqParams);
    // normalize/guard incoming params
    const limit = Math.max(1, Math.min(10000, Number(reqParams.limit ?? 100)));

    const categories = reqParams.categories ? (Array.isArray(reqParams.categories) ? reqParams.categories : [reqParams.categories]) : null;
    const countries = reqParams.countries ? (Array.isArray(reqParams.countries) ? reqParams.countries : [reqParams.countries]) : null;

    // confidence in request may be 0-100 or 0-1; normalize to 0-1
    let confidenceMin = typeof reqParams.confidenceMin === 'number' && reqParams.confidenceMin !== 0 ? reqParams.confidenceMin : undefined;
    let confidenceMax = typeof reqParams.confidenceMax === 'number' && reqParams.confidenceMax !== 100 ? reqParams.confidenceMax : undefined;
    if (confidenceMin != null && confidenceMin > 1) confidenceMin = confidenceMin / 100;
    if (confidenceMax != null && confidenceMax > 1) confidenceMax = confidenceMax / 100;

    const hasPoint = reqParams.point && typeof reqParams.point.lat === 'number' && typeof reqParams.point.lon === 'number';
    const radiusKm = typeof reqParams.pointRadiusKm === 'number' ? Number(reqParams.pointRadiusKm) : undefined;
    const radiusMeters = radiusKm != null ? Math.max(0, radiusKm) * 1000 : undefined;

    // Build SQL with parameterized values
    const values: any[] = [];
    let idx = 1;
    const where: string[] = [];

    if (categories) {
        values.push(categories);
        where.push(`( "categories.primary" = ANY($${idx}::varchar[]) OR ( "categories.alternate" && $${idx}::varchar[] ) )`);
        idx++;
    }

    // countries: addresses is jsonb array of objects -> country
    if (countries) {
        values.push(countries);
        where.push(
            `EXISTS (
                SELECT 1 FROM jsonb_array_elements(addresses) AS addr(item)
                WHERE (item->>'country') = ANY($${idx})
            )`
        );
        idx++;
    }

    // confidence min/max: compare against normalized confidence in DB (handle values stored 0-100 or 0-1)
    if (confidenceMin != null) {
        values.push(confidenceMin);
        where.push(`(CASE WHEN confidence > 1 THEN confidence/100.0 ELSE confidence END) >= $${idx}`);
        idx++;
    }
    if (confidenceMax != null) {
        values.push(confidenceMax);
        where.push(`(CASE WHEN confidence > 1 THEN confidence/100.0 ELSE confidence END) <= $${idx}`);
        idx++;
    }

    // spatial filter: ST_DWithin using geography for meters; ensure params order lon, lat, meters
    if (hasPoint && radiusMeters != null && reqParams.point) {
        values.push(reqParams.point.lon, reqParams.point.lat, radiusMeters);
        where.push(
            `ST_DWithin(
                geometry::geography,
                ST_SetSRID(ST_MakePoint($${idx}::double precision, $${idx + 1}::double precision), 4326)::geography,
                $${idx + 2}::double precision
            )`
        );
        idx += 3;
    }

    // final limit param
    values.push(limit);
    const limitParamIndex = idx;
    idx++;

    // optimized select: normalize confidence on output, include lat/lon, keep required columns
    const sql = `
        SELECT
            ogc_fid,
            id,
            version,
            sources,
            "names.primary",
            "categories.primary",
            "categories.alternate",
            (CASE WHEN confidence > 1 THEN confidence/100.0 ELSE confidence END)::double precision AS confidence,
            websites,
            socials,
            emails,
            phones,
            "brand.names.primary",
            addresses,
            ST_Y(geometry::geometry) AS latitude,
            ST_X(geometry::geometry) AS longitude
        FROM public.places
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY confidence desc
        LIMIT $${limitParamIndex}
    `;

    const result = await clientPg.query(sql, values);

    return json(result.rows);
}