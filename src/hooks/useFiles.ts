import { useEffect, useState } from "react";
import { File } from "@prisma/client";
import Cookies from "js-cookie";

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

export const fetchFiles = async (path = "/") => {
  const request = await fetch(
    `/api/files${path.startsWith("/") ? path : `/${path}`}`,
    {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );

  return (await request.json()) as File[];
};

export const fileExist = async (path = "/") => {
  const request = await fetch(
    `/api/file-exist${path.startsWith("/") ? path : `/${path}`}`,
    {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );

  return (await request.json()) as File;
};

export const directoryExist = async (path = "/") => {
  const request = await fetch(
    `/api/directory-exist${path.startsWith("/") ? path : `/${path}`}`,
    {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );

  return (await request.json()) as File;
};

export const createFile = async (path = "/") => {
  const request = await fetch(
    `/api/create-file${path.startsWith("/") ? path : `/${path}`}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );

  return (await request.json()) as object;
};

export const createDirectory = async (path = "/") => {
  const request = await fetch(
    `/api/create-directory${path.startsWith("/") ? path : `/${path}`}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );

  return (await request.json()) as object;
};

export const removeFile = async (path = "/") => {
  const request = await fetch(
    `/api/remove-file${path.startsWith("/") ? path : `/${path}`}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );

  return (await request.json()) as object;
};

export const removeDirectory = async (path = "/") => {
  const request = await fetch(
    `/api/remove-directory${path.startsWith("/") ? path : `/${path}`}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    }
  );

  return (await request.json()) as object;
};

export const modifyFile = async (path = "/", content: string = "") => {
  const request = await fetch(
    `/api/modify-file${path.startsWith("/") ? path : `/${path}`}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      method: "PATCH",
      body: JSON.stringify({
        content,
      }),
    }
  );

  return (await request.json()) as object;
};

export default useFiles;
