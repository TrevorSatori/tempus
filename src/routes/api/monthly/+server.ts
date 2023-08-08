import { json } from '@sveltejs/kit';
import { getMonthly } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (request) => {

    const date = request.url.searchParams.get('date');
    let entries;

    if (date !== null){
        entries = getMonthly(date);
    }
    

    return json(entries);
};