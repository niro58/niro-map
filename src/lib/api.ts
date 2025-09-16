import { env } from "$env/dynamic/public";
import { extractParams, getFilterSearchParams } from "./filters";
import { getPlacesFilters, type GetPlacesFilters, type PlaceResponse } from "./types";
import type { ResultFetch } from "./utils";

// search params are GetPlacesFilters
export async function getMapPlaces(filters: GetPlacesFilters): Promise<ResultFetch<PlaceResponse[]>> {
    try {
        const url = new URL(env.PUBLIC_API_ENDPOINT + '/api/places');
        const sp = getFilterSearchParams(filters);
        url.search = sp.toString();

        const res = await fetch(url.toString());

        if (!res.ok) {
            return { type: "FAILURE", error: `Error fetching places: ${res.status} ${res.statusText}` };
        }

        const data = await res.json() as PlaceResponse[];
        return { type: "SUCCESS", data };

    } catch (error) {
        return { type: "FAILURE", error: `Error fetching places: ${error}` };
    }
}
export async function getMapPlacesPartial(filters: Partial<GetPlacesFilters>): Promise<ResultFetch<PlaceResponse[]>> {
    const fullFilters: GetPlacesFilters = extractParams(new URLSearchParams(), getPlacesFilters);
    return getMapPlaces({ ...fullFilters, ...filters });
}