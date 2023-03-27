import { PrismaClient } from "@prisma/client";
import express, { Request } from "express";
import authenticate from "../middlewares/authenticate";

const prisma = new PrismaClient();
const router = express.Router();

const getPathAndFilename = (req: Request) => {
  const path = Object.values(req.params)[0] as string;

  const pathParts = path.split("/");
  const fileName = pathParts[pathParts.length - 1];

  return {
    fileName,
    path: `/${pathParts.slice(0, -1).join("/")}` || "/",
  };
};

router.get("/files/*", authenticate, async (req, res) => {
  const { path, fileName } = getPathAndFilename(req);

  const files = await prisma.file.findMany({
    where: {
      path: `${path}${fileName}`,
    },
  });

  res.json(files);
});

router.get("/file-exist/*", authenticate, async (req, res) => {
  const { fileName, path } = getPathAndFilename(req);

  const file = await prisma.file.findFirst({
    where: {
      name: fileName,
      isDirectory: false,
      path,
    },
  });

  return res.json(file);
});

router.get("/directory-exist/*", authenticate, async (req, res) => {
  const { fileName, path } = getPathAndFilename(req);

  const file = await prisma.file.findFirst({
    where: {
      name: fileName,
      isDirectory: true,
      path,
    },
  });

  return res.json(file);
});

router.post("/create-file/*", authenticate, async (req, res) => {
  const { fileName, path } = getPathAndFilename(req);

  const response = await prisma.file.create({
    data: {
      name: fileName,
      path,
      isDirectory: false,
    },
  });

  res.json(response);
});

router.post("/create-directory/*", authenticate, async (req, res) => {
  const { fileName, path } = getPathAndFilename(req);

  const response = await prisma.file.create({
    data: {
      name: fileName,
      path,
      isDirectory: true,
    },
  });

  res.json(response);
});

router.delete("/remove-file/*", authenticate, async (req, res) => {
  const { fileName, path } = getPathAndFilename(req);

  const response = await prisma.file.deleteMany({
    where: {
      name: fileName,
      path,
      isDirectory: false,
    },
  });

  res.json(response);
});

router.delete("/remove-directory/*", authenticate, async (req, res) => {
  const { fileName, path } = getPathAndFilename(req);

  const res1 = await prisma.file.deleteMany({
    where: {
      name: fileName,
      path,
      isDirectory: true,
    },
  });

  const res2 = await prisma.file.deleteMany({
    where: {
      path: `${path}/${fileName}`,
    },
  });

  res.json({ res1, res2 });
});

router.patch("/modify-file/*", authenticate, async (req, res) => {
  const { fileName, path } = getPathAndFilename(req);
  const { content } = req.body;

  const response = await prisma.file.updateMany({
    where: {
      name: fileName,
      path,
    },
    data: {
      content,
    },
  });

  res.json(response);
});

export default router;
