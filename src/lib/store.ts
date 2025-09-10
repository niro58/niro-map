import { writable } from "svelte/store";

export let isFilterOpen = writable<boolean>(false);
