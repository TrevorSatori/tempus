import { json } from '@sveltejs/kit';
import { getMonthly } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {

    let entries = getMonthly();

    return json(entries);
};