import type { RequestHandler } from './$types';
import { getDaily } from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
       
    let entries = getDaily();

    return json(entries);
};