import { NextFunction, Request, Response } from "express";
import { UserCreateSchema } from "../schema";
import prisma from "../prisma";


const userRegistration = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try{
        const parseBody = UserCreateSchema.safeParse(req.body);

        if(!parseBody.success) {
            return res.status(400).json({ error: parseBody.error.errors });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: parseBody.data.email,
            },
        });
    }
    catch(err) {
        next(err);
    }
}