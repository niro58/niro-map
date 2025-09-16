import { extractParams } from '$lib/filters';
import { getPlacesFilters } from '$lib/types';

export async function load({url}){
    const filters = extractParams(url.searchParams, getPlacesFilters);
  
    return { filters };
}