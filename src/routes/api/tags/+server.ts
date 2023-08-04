import { json } from '@sveltejs/kit';
import { addTag, getTags } from '$lib/server/db';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = async () => {

    const allTags = getTags();
    return json(allTags);
};


export const POST: RequestHandler = async ({request}) => {

    const newTag = await request.json();
    addTag(newTag.newTag);

    return new Response();
};