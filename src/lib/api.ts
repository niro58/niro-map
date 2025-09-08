import { env } from "$env/dynamic/public";
import { getFilterSearchParams } from "./filters";
import type { GetPlacesFilters, PlaceResponse } from "./types";
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

