import { z } from "zod";

export const blackListSchema = z.object({
    token : z.string(),
})


export type blacklistTypes = z.infer<typeof blackListSchema>