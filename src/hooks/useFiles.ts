import { useEffect, useState } from "react";
import { File } from "@prisma/client";
import authFetch from "../utils/authFetch";

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

const formatPath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const fetchFiles = (path = "/") =>
  authFetch<File[]>(`/api/files${formatPath(path)}`);

export const fileExist = (path = "/") =>
  authFetch<File>(`/api/file-exist${formatPath(path)}`);

export const directoryExist = (path = "/") =>
  authFetch<File>(`/api/directory-exist${formatPath(path)}`);

export const createFile = (path = "/") =>
  authFetch<object>(`/api/create-file${formatPath(path)}`, {
    method: "POST",
  });

export const createDirectory = (path = "/") =>
  authFetch<object>(`/api/create-directory${formatPath(path)}`, {
    method: "POST",
  });

export const removeFile = async (path = "/") =>
  authFetch<object>(`/api/remove-file${formatPath(path)}`, {
    method: "DELETE",
  });

export const removeDirectory = (path = "/") =>
  authFetch<object>(`/api/remove-directory${formatPath(path)}`, {
    method: "DELETE",
  });

export const modifyFile = async (path = "/", content: string = "") =>
  authFetch<object>(`/api/modify-file${formatPath(path)}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PATCH",
    body: JSON.stringify({
      content,
    }),
  });

export default useFiles;
