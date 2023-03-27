import jwt from "jsonwebtoken";
import { Response, NextFunction, Request } from "express";
import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.COOKIE_SECRET as string,
    async (err: any, jwtUser: any) => {
      if (err) return res.status(403).send(err);
      if (!jwtUser) return res.status(404);

      const { username } = jwtUser as User;

      const user = await prisma.user.findFirst({
        where: {
          username,
        },
      });

      if (!user) return res.sendStatus(404);

      res.locals.user = username;
      next();
    }
  );
};

export default authenticate;
