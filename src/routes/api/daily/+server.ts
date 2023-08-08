import type { RequestHandler } from './$types';
import { getDaily } from '$lib/server/db';
import { json } from '@sveltejs/kit';



export const GET: RequestHandler = async (request) => {
    
    const date = request.url.searchParams.get('date');
    let entries;

    if (date !== null){
        entries = getDaily(date);
    }
    

    return json(entries);
};