import { json } from '@sveltejs/kit';
import { getYearly } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
       
    let entries = getYearly();

    return json(entries);
};