import { addRecord } from '$lib/server/db';
import {json} from '@sveltejs/kit';

import type { RequestEvent, RequestHandler } from './$types';

export const POST: RequestHandler = async ({request}) => {

    const {date, totalTime} = await request.json();
    
    addRecord(date, totalTime);

    return new Response();
};