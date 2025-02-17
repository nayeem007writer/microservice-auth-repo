import { NextFunction, Request, Response } from "express";
import { UserCreateSchema } from "../schema";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import axios from "axios";
import { USER_SERVICE } from "../config";

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

        if(existingUser) {
            return res.status(400).json({ message: "User already exists" });
        };

        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(parseBody.data.password, salt);


        const user = await prisma.user.create({
            data: {
                ...parseBody.data,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
            }
        });
        console.log("User created successfully",user);

        await axios.post(`${USER_SERVICE}users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email,
        })
        return res.status(201).json(user);


    }
    catch(err) {
        next(err);
    }
}