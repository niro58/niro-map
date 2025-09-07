import { clientPg } from '$lib/server/db.js';
import type { PlaceRequest } from '$lib/types.js';
import { urlParamsToJson } from '$lib/utils.js';
import { json } from '@sveltejs/kit';

export async function GET(event) {
    const reqParams = urlParamsToJson(event.url.searchParams) as unknown as PlaceRequest;
    // normalize/guard incoming params
    const limit = Math.min(Math.max(0, Number(reqParams.limit) || 10000), 10000);

    const categories = reqParams.categories && reqParams.categories.length > 0 ? (Array.isArray(reqParams.categories) ? reqParams.categories : [reqParams.categories]) : null;
    const countries = reqParams.countries && reqParams.countries.length > 0 ? (Array.isArray(reqParams.countries) ? reqParams.countries : [reqParams.countries]) : null;
    // confidence in request may be 0-100 or 0-1; normalize to 0-1
    let confidenceMin, confidenceMax;

    if (reqParams.confidenceMin != null) {
        const min = Number(reqParams.confidenceMin);
        if (!isNaN(min) && min > 0) {
            confidenceMin = min;
        }
    }

    if (reqParams.confidenceMax != null) {
        const max = Number(reqParams.confidenceMax);
        if (!isNaN(max) && max < 100) {
            confidenceMax = max;
        }
    }

    // Normalize valid numbers to be between 0 and 1
    if (confidenceMin != null && confidenceMin > 1) {
        confidenceMin = confidenceMin / 100;
    }
    if (confidenceMax != null && confidenceMax > 1) {
        confidenceMax = confidenceMax / 100;
    }

    let radiusMeters: number | undefined;
    let latNum: number | undefined;
    let lonNum: number | undefined;
    if (reqParams.latitude && reqParams.longitude && reqParams.radius) {
        const lat = Number(reqParams.latitude);
        const lon = Number(reqParams.longitude);
        const radiusKm = Number(reqParams.radius);
        if (!isNaN(lat) && !isNaN(lon) && !isNaN(radiusKm) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && radiusKm > 0) {
            latNum = lat;
            lonNum = lon;
            radiusMeters = Math.max(0, radiusKm) * 1000;
        }
    }

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
    if (radiusMeters !== undefined && latNum !== undefined && lonNum !== undefined) {
        values.push(lonNum, latNum, radiusMeters);
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
    if (limit) {
        values.push(limit);
    }

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
        ${limit ? `LIMIT $${limitParamIndex}` : ''}
    `;
    const result = await clientPg.query(sql, values);
    return json(result.rows);
}