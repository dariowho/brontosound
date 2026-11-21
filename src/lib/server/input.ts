import { error } from '@sveltejs/kit';
import type { EntityTarget, ObjectLiteral } from 'typeorm';
import TypeOrm from '$lib/db';

// Checks for request input, field by field. Endpoints build what they save from these, so nothing else a client
// sends (ids of other rows, authorship, relations) reaches the database.

const MAX_TEXT = 10_000;

export function text(value: unknown, field: string): string {
    if (typeof value != 'string' || value.length > MAX_TEXT) error(400, `"${field}" must be text`);
    return value;
}

export function optionalText(value: unknown, field: string): string | null {
    return value === null || value === undefined ? null : text(value, field);
}

export function oneOf<T extends string>(value: unknown, values: Record<string, T>, field: string): T {
    if (!Object.values<unknown>(values).includes(value)) error(400, `"${field}" must be one of: ${Object.values(values).join(', ')}`);
    return value as T;
}

export function date(value: unknown, field: string): Date {
    const parsed = new Date(value as string);
    if ((typeof value != 'string' && !(value instanceof Date)) || isNaN(parsed.getTime())) error(400, `"${field}" must be a date`);
    return parsed;
}

export function list(value: unknown, field: string): unknown[] {
    if (!Array.isArray(value)) error(400, `"${field}" must be a list`);
    return value;
}

/** Form fields that carry JSON */
export function parseJson(value: unknown, field: string): Record<string, unknown> {
    try {
        const parsed = JSON.parse(String(value));
        if (parsed && typeof parsed == 'object') return parsed;
    } catch { /* below */ }
    error(400, `"${field}" must be a JSON object`);
}

/** The id of an existing row, or a 400/404 error */
export async function existingId<T extends ObjectLiteral>(entity: EntityTarget<T>, id: unknown, what: string): Promise<number> {
    if (!Number.isInteger(id)) error(400, `Invalid ${what} id`);
    const found = await (await TypeOrm.getRepository(entity)).existsBy({ id } as never);
    if (!found) error(404, `No such ${what}`);
    return id as number;
}
