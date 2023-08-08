import { json } from '@sveltejs/kit';
import { getYearly } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (request) => {
       

    const date = request.url.searchParams.get('date');
    let entries;

    if (date !== null){
        entries = getYearly(date);
    }

    return json(entries);
};