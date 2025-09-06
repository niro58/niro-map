import { env } from "$env/dynamic/public";
import type { GetPlaceRequest, PlaceRequest, PlaceResponse } from "./types";
import type { ResultFetch } from "./utils";

export async function getMapPlaces(filters: PlaceRequest): Promise<ResultFetch<PlaceResponse[]>> {
    try {
        const url = new URL(env.PUBLIC_API_ENDPOINT + '/api/places');
        const sp = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            sp.append(key, value.toString());
        });

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


export async function getPlace(params: GetPlaceRequest): Promise<ResultFetch<PlaceResponse>> {
    try {
        const url = new URL(env.PUBLIC_API_ENDPOINT + '/api/place');
        const sp = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            sp.append(key, value.toString());
        });

        url.search = sp.toString();
        const res = await fetch(url.toString());

        if (!res.ok) {
            return { type: "FAILURE", error: `Error fetching places: ${res.status} ${res.statusText}` };
        }

        const data = await res.json() as PlaceResponse;
        return { type: "SUCCESS", data };

    } catch (error) {
        return { type: "FAILURE", error: `Error fetching places: ${error}` };
    }
}
