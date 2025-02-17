import { NextFunction, Request, Response } from "express";
import { UserLoginSchema } from "../schema";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttemptStatus } from "@prisma/client";

type LoginHistory = {
    userId: string,
    userAgent: string | undefined,
    ipAddress: string | undefined,
    attempt: LoginAttemptStatus,
}

const createLoginHistory = async (info: LoginHistory) => {

}

export const Login =async(
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {

            const ipAddress = req.headers['x-forwarded-for'] as string || req.ip || '';
            const userAgent = req.headers['user-agent'] || '';

            const parseBody = UserLoginSchema.safeParse(req.body);
            if(!parseBody.success) {
                return res.status(400).json({ errors: parseBody.error.errors });
            }
            const user = await prisma.user.findUnique({
                where: {
                    email: parseBody.data.email,
                },
            });
            if(!user) {
                await createLoginHistory({
                    userId: 'Guest',
                    userAgent,
                    ipAddress,
                    attempt: 'FAILED'
                })
                return res.status(404).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(parseBody.data.password, user.password);
            if(!isMatch) {
                await createLoginHistory({
                    userId:'',
                    userAgent,
                    ipAddress,
                    attempt: 'FAILED'
                })
                return res.status(400).json({ message: "Invalid credentials" });
            }
            if(!user.verified) {
                await createLoginHistory({
                    userId: user.id,
                    userAgent,
                    ipAddress,
                    attempt: 'FAILED'
                })
                return res.status(400).json({ message: "User not verified" });
            }
            if(user.status !== 'ACTIVE') {
                await createLoginHistory({
                    userId: user.id,
                    userAgent,
                    ipAddress,
                    attempt: 'FAILED'
                })
                return res.status(400).json({ message: `User is not ${user.status.toLocaleLowerCase()}` });
            }


            const accesstoken = jwt.sign(
                { userId: user.id, name: user.name, email: user.email, role: user.role },
                process.env.JWT_SECRET ?? '&J*mysecr$etU)9UJM',
                { expiresIn: "1h" }
            );
            await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: 'SUCCESS'
            })

            return res.status(200).json({
                accesstoken,
            })



        }
        catch(err) {
            next(err);
        }
}

export default Login;