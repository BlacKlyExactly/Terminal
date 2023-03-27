import { PrismaClient } from "@prisma/client";
import express, { Request } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import authenticate from "../middlewares/authenticate";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", authenticate, async (_req, res) => {
  const username = res.locals.user;

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  res.send(user);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username) return res.status(400).send("All input is required");

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  const doPasswordsMatch = await bcrypt.compare(password, user?.password || "");

  if (!user || (user.password && !doPasswordsMatch))
    return res.status(400).send("Invalid credentials");

  const token = jwt.sign(
    {
      username,
      id: user.id,
      isAdmin: user.isAdmin,
    },
    process.env.COOKIE_SECRET as string
  );

  res.status(200).send({
    ...user,
    token,
  });
});

export default router;
