import { createDB } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    createDB();
    return {};
}) satisfies PageServerLoad;