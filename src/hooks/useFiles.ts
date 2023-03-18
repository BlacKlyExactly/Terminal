import { useEffect, useState } from "react";
import { File } from "@prisma/client";

export const fetchFiles = async (path = "/") => {
  const request = await fetch(
    `/files${path.startsWith("/") ? path : `/${path}`}`
  );

  return (await request.json()) as File[];
};

export const fileExist = async (path = "/") => {
  const request = await fetch(
    `/file-exist${path.startsWith("/") ? path : `/${path}`}`
  );

  return (await request.json()) as File;
};

export const directoryExist = async (path = "/") => {
  console.log(process.env.PORT);

  const request = await fetch(
    `/directory-exist${path.startsWith("/") ? path : `/${path}`}`
  );

  return (await request.json()) as File;
};

export const createFile = async (path = "/") => {
  const request = await fetch(
    `/create-file${path.startsWith("/") ? path : `/${path}`}`,
    { method: "POST" }
  );

  return (await request.json()) as object;
};

export const createDirectory = async (path = "/") => {
  const request = await fetch(
    `/create-directory${path.startsWith("/") ? path : `/${path}`}`,
    { method: "POST" }
  );

  return (await request.json()) as object;
};

export const removeFile = async (path = "/") => {
  const request = await fetch(
    `/remove-file${path.startsWith("/") ? path : `/${path}`}`,
    { method: "DELETE" }
  );

  return (await request.json()) as object;
};

export const removeDirectory = async (path = "/") => {
  const request = await fetch(
    `/remove-directory${path.startsWith("/") ? path : `/${path}`}`,
    { method: "DELETE" }
  );

  return (await request.json()) as object;
};

export const modifyFile = async (path = "/", content: string = "") => {
  const request = await fetch(
    `/modify-file${path.startsWith("/") ? path : `/${path}`}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify({
        content,
      }),
    }
  );

  return (await request.json()) as object;
};

const useFiles = (path = "/") => {
  const [files, setFiles] = useState<File[]>([]);

  const refetchFiles = async (path = "/") => {
    const files = await fetchFiles(path);
    setFiles(files);
  };

  useEffect(() => {
    refetchFiles(path);
  }, []);

  return { files, refetchFiles };
};

export default useFiles;
