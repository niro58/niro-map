import { getPlace } from "$lib/api"

export async function load({ params }) {
    const place = await getPlace({ fid: params.id });

    if (place.type === "FAILURE") {
        throw new Error(place.error);
    }
    return {
        place: place.data
    }
}