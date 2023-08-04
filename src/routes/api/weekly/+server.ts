import { json } from '@sveltejs/kit';
import { getWeekly } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
       
    let entries = getWeekly();

    return json(entries);
};