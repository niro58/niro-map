import { extractParams } from '$lib/filters.js';
import { db } from '$lib/server/db.js';
import { getPlacesFilters } from '$lib/types.js';
import { urlParamsToJson } from '$lib/utils.js';
import { json } from '@sveltejs/kit';

export async function GET(event) {
    if (!db) {
        return json({ error: "Database not configured" }, { status: 500 });
    }
    let urlParams = extractParams(event.url.searchParams, getPlacesFilters);

    let confidenceMin = urlParams.confidenceMin && getPlacesFilters.confidenceMin.default !== urlParams.confidenceMin ? urlParams.confidenceMin : undefined;
    let confidenceMax = urlParams.confidenceMax && getPlacesFilters.confidenceMax.default !== urlParams.confidenceMax ? urlParams.confidenceMax : undefined;
    if (confidenceMin && confidenceMin > 1) {
        confidenceMin /= 100;
    }
    if (confidenceMax && confidenceMax > 1) {
        confidenceMax /= 100;
    }

    let latFilter: number | undefined = undefined;
    let lonFilter: number | undefined = undefined;
    let radiusMeters: number | undefined = undefined;
    if (urlParams.latitude && urlParams.longitude && urlParams.radius) {
        if (Math.abs(urlParams.latitude) <= 90 && Math.abs(urlParams.longitude) <= 180 && urlParams.radius > 0) {
            latFilter = urlParams.latitude;
            lonFilter = urlParams.longitude;
            radiusMeters = Math.max(0, urlParams.radius) * 1000;
        }
    }

    // Build SQL with parameterized values
    const values: any[] = [];
    let idx = 1;
    const where: string[] = [];

    // countries: addresses is jsonb array of objects -> country
    if (urlParams.country && urlParams.country.length > 0) {
        values.push(urlParams.country);
        where.push(
            `country_code = ANY($${idx})`
        );
        idx++;
    }

    if (urlParams.category && urlParams.category.length > 0) {
        values.push(urlParams.category);
        where.push(`( "categories.primary" = ANY($${idx}::varchar[]))`);
        idx++;
    }

    // confidence min/max: compare against normalized confidence in DB (handle values stored 0-100 or 0-1)
    if (confidenceMin !== undefined) {
        values.push(confidenceMin);
        where.push(`(CASE WHEN confidence > 1 THEN confidence/100.0 ELSE confidence END) >= $${idx}`);
        idx++;
    }
    if (confidenceMax !== undefined) {
        values.push(confidenceMax);
        where.push(`(CASE WHEN confidence > 1 THEN confidence/100.0 ELSE confidence END) <= $${idx}`);
        idx++;
    }

    // spatial filter: ST_DWithin using geography for meters; ensure params order lon, lat, meters
    if (radiusMeters && latFilter && lonFilter) {
        values.push(lonFilter, latFilter, radiusMeters);
        where.push(
            `ST_DWithin(
                geometry::geography,
                ST_SetSRID(ST_MakePoint($${idx}::double precision, $${idx + 1}::double precision), 4326)::geography,
                $${idx + 2}::double precision
            )`
        );
        idx += 3;
    }

    if (urlParams.limit) {
        values.push(urlParams.limit);
    }
    const limitParamIndex = idx;
    idx++;

    const offsetParamIndex = idx;
    if (urlParams.offset) {
        values.push(urlParams.offset);
    }


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
        ${urlParams.limit ? `LIMIT $${limitParamIndex}` : ''}
        ${urlParams.offset ? `OFFSET $${offsetParamIndex}` : ''}
    `;

    const result = await db.query(sql, values);
    return json(result.rows);
}