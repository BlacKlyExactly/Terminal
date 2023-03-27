import { File, User } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import { CommandRow } from "./components/Terminal";
import {
  createDirectory,
  createFile,
  directoryExist,
  fileExist,
  modifyFile,
  removeDirectory,
  removeFile,
  fetchFiles,
} from "./hooks/useFiles";

type Command = {
  name: string;
  action: (args: {
    setCmdHistory: Dispatch<SetStateAction<CommandRow[]>>;
    setCurrLocation: Dispatch<SetStateAction<string>>;
    refetchFiles: (path?: string) => Promise<void>;
    logout: () => void;
    cmdHistory: CommandRow[];
    currLocation: string;
    args: string[];
    user: User;
    files?: File[];
  }) => Promise<{ response: string; addToHistory: boolean }>;
};

const getPath = (path: string, currLocation: string) => {
  if (path === "/") return path;

  if (
    (!path.startsWith("/") || path.startsWith("./")) &&
    !path.startsWith("..")
  ) {
    path = path.replace("./", "");
    path = `${currLocation}/${path}`;
  }

  if (path.includes("..")) {
    const backLvls = path.split("..").length - 1;
    const pathParts = currLocation.split("/");
    const newPath = pathParts.slice(0, pathParts.length - backLvls).join("/");

    if (!newPath && !pathParts.find((part) => part)) return undefined;
    return newPath || "/";
  }

  path = path.replaceAll("//", "/");
  return path;
};

const commands: Command[] = [
  {
    name: "clear",
    action: async ({ setCmdHistory }) => {
      setCmdHistory([]);
      return { response: "", addToHistory: false };
    },
  },
  {
    name: "eval",
    action: async ({ args }) => {
      const js = args.join(" ");

      const result = args.includes("return")
        ? eval(`async () => {
          ${js}
        }`)
        : eval(`async () => ${js}`);

      const response = await result();

      return {
        response:
          typeof response === "object"
            ? JSON.stringify(response, null, 2)
            : response.toString(),
        addToHistory: true,
      };
    },
  },
  {
    name: "ls",
    action: async ({ args, currLocation }) => {
      const [path] = args;
      const formatedPath = getPath(path || currLocation, currLocation);

      console.log(formatedPath);

      const fetchedFiles = await fetchFiles(formatedPath);
      const fileNames = fetchedFiles.map(({ name }) => name);

      return { response: fileNames?.join("<br>"), addToHistory: true };
    },
  },
  {
    name: "cd",
    action: async ({ setCurrLocation, args, currLocation }) => {
      const [path] = args;
      const formatedPath = getPath(path, currLocation);

      if (formatedPath === "/") {
        setCurrLocation(formatedPath);
        return { response: "", addToHistory: true };
      }

      if (!formatedPath)
        return {
          response: `cd: directory doesn't exist: ${path}`,
          addToHistory: true,
        };

      const file = await directoryExist(formatedPath);

      if (!file)
        return {
          response: `cd: directory doesn't exist: ${path}`,
          addToHistory: true,
        };

      if (!file.isDirectory)
        return {
          response: `cd: not a directory: ${path}`,
          addToHistory: true,
        };

      setCurrLocation(formatedPath);

      return { response: "", addToHistory: true };
    },
  },
  {
    name: "help",
    action: async () => {
      const cmds = commands.map(({ name }) => name).join("<br>");
      return { response: cmds, addToHistory: true };
    },
  },
  {
    name: "cat",
    action: async ({ currLocation, args }) => {
      const [path] = args;
      const formatedPath = getPath(path, currLocation);

      if (!formatedPath)
        return {
          response: `cat: file doesn't exist: ${path}`,
          addToHistory: true,
        };

      const file = await fileExist(formatedPath);

      if (!file)
        return {
          response: `cat: file doesn't exist: ${path}`,
          addToHistory: true,
        };

      if (file.isDirectory)
        return {
          response: `cat: not a file: ${path}`,
          addToHistory: true,
        };

      return { response: file.content, addToHistory: true };
    },
  },
  {
    name: "touch",
    action: async ({ currLocation, args, refetchFiles }) => {
      const [path] = args;
      const formatedPath = getPath(path, currLocation);

      if (!formatedPath)
        return {
          response: `touch: location does not exist: ${path}`,
          addToHistory: true,
        };

      const file = await fileExist(formatedPath);

      if (file && !file.isDirectory)
        return {
          response: `touch: file already exists: ${path}`,
          addToHistory: true,
        };

      await createFile(formatedPath);
      await refetchFiles(formatedPath.split("/").slice(0, -1).join("/") || "/");

      return { response: "", addToHistory: true };
    },
  },
  {
    name: "mkdir",
    action: async ({ currLocation, args, refetchFiles }) => {
      const [path] = args;
      const formatedPath = getPath(path, currLocation);

      if (!formatedPath)
        return {
          response: `mkdir: location does not exist: ${path}`,
          addToHistory: true,
        };

      const file = await directoryExist(formatedPath);

      if (file && file.isDirectory)
        return {
          response: `mkdir: directory already exists: ${path}`,
          addToHistory: true,
        };

      await createDirectory(formatedPath);
      await refetchFiles(formatedPath.split("/").slice(0, -1).join("/") || "/");

      return { response: "", addToHistory: true };
    },
  },
  {
    name: "rm",
    action: async ({ currLocation, args, refetchFiles }) => {
      let deleteDirectory = false;

      if (args.includes("-R")) {
        deleteDirectory = true;

        const idx = args.indexOf("-R");
        args.splice(idx, 1);
      }

      const [path] = args;
      const formatedPath = getPath(path, currLocation);

      if (!formatedPath)
        return {
          response: `rm: location does not exist: ${path}`,
          addToHistory: true,
        };

      const file = deleteDirectory
        ? await directoryExist(formatedPath)
        : await fileExist(formatedPath);

      if (!file)
        return {
          response: `rm: ${
            deleteDirectory ? "directory" : "file"
          } does not exist: ${path}`,
          addToHistory: true,
        };

      deleteDirectory
        ? await removeDirectory(formatedPath)
        : await removeFile(formatedPath);

      refetchFiles();

      return { response: "", addToHistory: true };
    },
  },
  {
    name: "write",
    action: async ({ currLocation, args, refetchFiles }) => {
      const [path, ...content] = args;
      const formatedPath = getPath(path, currLocation);

      if (!formatedPath)
        return {
          response: `write: location does not exist: ${path}`,
          addToHistory: true,
        };

      const file = await fileExist(formatedPath);

      if (!file)
        return {
          response: `write: file does not exist: ${path}`,
          addToHistory: true,
        };

      await modifyFile(formatedPath, content.join(" "));

      return { response: "", addToHistory: true };
    },
  },
  {
    name: "logout",
    action: async ({ setCmdHistory, logout }) => {
      setCmdHistory([]);
      logout();

      return { response: "", addToHistory: false };
    },
  },
];

export default commands;
