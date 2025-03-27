import type { Actions } from './$types';
import { writeTextFile } from "$lib/server/cachedStorage";
import { instanceToPlain } from "class-transformer";

export const actions = {
    save: async ({request}) => {
        const data = await request.formData();
        const path = data.get('path')?.toString()
        const newContent = data.get('editor')?.toString();
        if (newContent == null) return {
            success: false,
            message: "No content to write"
        }

        const file = await writeTextFile(path, newContent);
        return {
            success: true,
            file: instanceToPlain(file)
        }
    },
} satisfies Actions;