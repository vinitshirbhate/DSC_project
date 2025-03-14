import { string, z } from "zod";

export const blackListSchema = z.object({
    accessToken : z.string(),
    refreshToken : z.string()
})


export type blacklistTypes = z.infer<typeof blackListSchema>