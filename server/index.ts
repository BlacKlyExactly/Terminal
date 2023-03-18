import express, { Request } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 1111;

const getPathAndFilename = (req: Request) => {
  const path = Object.values(req.params)[0] as string;

  const pathParts = path.split("/");
  const fileName = pathParts[pathParts.length - 1];

  return {
    fileName,
    path: `/${pathParts.slice(0, -1).join("/")}` || "/",
  };
};

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      `http://localhost:${process.env.PORT}`,
      "https://terminal-simulation.up.railway.app",
    ],
  })
);

app.use(express.json());

app.listen(port, () => {
  console.log(`Backend > listening on port: ${port}`);
});

app.use("/", express.static("dist"));

app.get("/files/*", async (req, res) => {
  const path = Object.values(req.params)[0] as string;

  const files = await prisma.file.findMany({
    where: {
      path: `/${path}` || "/",
    },
  });

  res.json(files);
});

app.get("/file-exist/*", async (req, res) => {
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

app.get("/directory-exist/*", async (req, res) => {
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

app.post("/create-file/*", async (req, res) => {
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

app.post("/create-directory/*", async (req, res) => {
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

app.delete("/remove-file/*", async (req, res) => {
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

app.delete("/remove-directory/*", async (req, res) => {
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

app.patch("/modify-file/*", async (req, res) => {
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
