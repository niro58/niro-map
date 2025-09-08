import { extractParams } from "$lib/filters"

export async function load({ url }) {
    const filters = extractParams(
        url.searchParams, {
        limit: {
            type: "number",
            default: 2500
        },
        offset: {
            type: "number"
        },
        country: {
            type: "string"
        },
        category: {
            type: "string"
        },
        confidence_min: {
            type: "number",
            default: 0
        },
        confidence_max: {
            type: "number",
            default: 100
        },
        latitude: {
            type: "number"
        },
        longitude: {
            type: "number"
        },
        radius: {
            type: "number"
        }
    }
    )
    return {
        filters
    }
}