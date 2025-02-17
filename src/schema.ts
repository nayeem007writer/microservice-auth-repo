import { z } from "zod";

export const UserCreateSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    name: z.string().max(255),
})

export const UserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})