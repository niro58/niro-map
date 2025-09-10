import type { ExtractedParams, ExtractParamValueDefinition } from "./filters";

export type PlaceResponse = {
    ogc_fid: number;
    id: string;
    version: number;
    sources: { property: string; dataset: string; record_id: string; update_time: Date; confindence: number; }
    "names.primary": string;
    "categories.primary": string;
    "categories.alternate": string[];
    confidence: number;
    websites: string[] // ?
    socials: string[];
    emails: string[];
    phones: string[];
    "brand.names.primary": string;
    addresses: {
        freeform: string;
        locality: string;
        postcode: string;
        region: string;
        country: string;
    }[]
    latitude: number;
    longitude: number;
}

export type GetPlaceRequest = {
    fid: string;
}

export const getPlacesFilters = {
    limit: {
        type: "number",
        default: 2500,
        max: 10000
    },
    offset: {
        type: "number"
    },
    country: {
        type: "string[]",
        default: []
    },
    category: {
        type: "string[]",
        default: []
    },
    confidenceMin: {
        type: "number",
        default: 0,
        max: 100
    },
    confidenceMax: {
        type: "number",
        default: 100,
        max: 100
    },
    latitude: {
        type: "float"
    },
    longitude: {
        type: "float"
    },
    radius: {
        type: "number"
    }
} as const satisfies Record<string, ExtractParamValueDefinition>;
export type GetPlacesFilters = ExtractedParams<typeof getPlacesFilters>;