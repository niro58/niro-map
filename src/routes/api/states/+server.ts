import { MapHandler, type MapStatesBody } from '$lib/server/map';
import { json } from '@sveltejs/kit';

export async function POST(req) {
    const body = await req.request.json() as MapStatesBody;

    const mapStatesResult = await MapHandler.states(body);
    return json(mapStatesResult.points);
}
