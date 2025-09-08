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
export type PlaceRequest = {
    limit?: string; // number
    countries?: string; // string[]
    categories?: string; // string[]
    confidenceMin?: string; // number
    confidenceMax?: string; // number
    latitude?: string; // number
    longitude?: string; // number
    radius?: string; // number in km
}
export type GetPlaceRequest = {
    fid: string;
}