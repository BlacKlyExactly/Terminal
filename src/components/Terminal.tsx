import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { File } from "@prisma/client";
import useFiles from "../hooks/useFiles";
import commands from "../commands";
import Login, { LoginContext } from "./Login";

export type CommandRow = {
  user: string;
  path: string;
  command: string;
  active?: boolean;
  response?: string;
  executedAt: number;
};

const TerminalContext = createContext<{
  setCmdHistory: Dispatch<SetStateAction<CommandRow[]>>;
  setCurrLocation: Dispatch<SetStateAction<string>>;
  setCmd: Dispatch<SetStateAction<string>>;
  refetchFiles: (path?: string) => Promise<void>;
  cmdHistory: CommandRow[];
  cmd: string;
  currLocation: string;
  files?: File[];
}>({
  setCmdHistory: () => {},
  setCurrLocation: () => {},
  setCmd: () => {},
  refetchFiles: (path?: string) => new Promise(() => {}),
  cmdHistory: [],
  cmd: "",
  currLocation: "/",
  files: [],
});

const Terminal = () => {
  const [cmd, setCmd] = useState("");
  const [cmdHistory, setCmdHistory] = useState<CommandRow[]>([]);
  const [lastCmds, setLastCmds] = useState<string[]>([]);
  const [recoverCmdIndex, setRecoverCmdIndex] = useState(-1);
  const [currLocation, setCurrLocation] = useState("/");

  const { files, refetchFiles } = useFiles(currLocation);
  const { isLoged, user } = useContext(LoginContext);

  const rows = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refetchFiles(currLocation);
  }, [currLocation]);

  useEffect(() => {
    const handleWindowClick = () => {
      if (!rows.current) return;

      const inputs = rows.current.querySelectorAll("textarea");
      const lastInput = inputs[inputs.length - 1];
      lastInput?.focus();
    };

    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  useEffect(() => {
    rows.current && rows.current.scrollTo(0, rows.current.scrollHeight);
  }, [cmdHistory]);

  useEffect(() => {
    setRecoverCmdIndex(lastCmds.length);
  }, [lastCmds]);

  useEffect(() => {
    recoverCmdIndex >= 0 && setCmd(lastCmds[recoverCmdIndex]);
  }, [recoverCmdIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && rows.current) {
      const inputs = rows.current.querySelectorAll("textarea");
      const lastInput = inputs[inputs.length - 1];

      setLastCmds([...lastCmds, lastInput.value]);
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();

    e.key === "ArrowUp" &&
      setRecoverCmdIndex((prev) => (prev > 0 ? prev - 1 : prev));

    e.key === "ArrowDown" &&
      setRecoverCmdIndex((prev) =>
        prev < lastCmds.length - 1 ? prev + 1 : prev
      );
  };

  const handleCommandType = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCmd(e.target.value);
    rows.current && rows.current.scrollTo(0, rows.current.scrollHeight);
  };

  return (
    <div className="w-screen h-screen relative bg-main">
      <div className="w-full h-16 px-6 grid grid-cols-3 border-b border-[#d64196] items-center bg-[#141138] bg-opacity-50 border-opacity-40">
        <div className="flex gap-3">
          <button className="w-4 h-4 rounded-full bg-[#ff5654]" />
          <button className="w-4 h-4 rounded-full bg-[#ffbd2c]" />
          <button className="w-4 h-4 rounded-full bg-[#23cc34]" />
        </div>
        <h1 className="text-[#0ef3ff] text-base font-[consolas] place-self-center">
          Terminal
        </h1>
      </div>
      <div
        className="px-6 py-8 text-xl text-[#0ef3ff] font-semibold font-[consolas] overflow-y-auto overflow-x-hidden h-[calc(100vh-4rem)] relative"
        ref={rows}
      >
        <TerminalContext.Provider
          value={{
            setCmdHistory,
            setCurrLocation,
            setCmd,
            refetchFiles,
            cmd,
            cmdHistory,
            files: files,
            currLocation,
          }}
        >
          <Login />
          {isLoged && (
            <>
              {cmdHistory.map((row) => (
                <CmdRow key={row.executedAt} {...row} />
              ))}
              <CmdRow
                user={user?.username || ""}
                command={cmd || ""}
                path={
                  currLocation.startsWith("/")
                    ? currLocation
                    : `/${currLocation}`
                }
                active
                executedAt={new Date().getTime()}
                onKeyDown={handleKeyDown}
                onChange={handleCommandType}
              />
            </>
          )}
        </TerminalContext.Provider>
      </div>
    </div>
  );
};

const CmdRow = ({
  user,
  path,
  active,
  command,
  response,
  onChange,
  onKeyDown,
}: CommandRow & {
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) => {
  const {
    setCmdHistory,
    setCurrLocation,
    setCmd,
    refetchFiles,
    cmdHistory,
    files,
    currLocation,
    cmd,
  } = useContext(TerminalContext);

  const { logout, user: userData } = useContext(LoginContext);

  if (!userData) return null;

  const addCmdToHistory = (response: string) => {
    setCmdHistory([
      ...cmdHistory,
      {
        user,
        path,
        active: false,
        executedAt: new Date().getTime(),
        response,
        command: command,
      },
    ]);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown && onKeyDown(e);

    if (e.key !== "Enter") return;

    const foundCmd = commands.find(({ name }) => name === cmd.split(" ")[0]);
    setCmd("");

    if (cmd.split(" ")[0].trim().length === 0) {
      addCmdToHistory("");
      return;
    }

    if (!foundCmd) {
      addCmdToHistory(`terminal: command not found: ${cmd.split(" ")[0]}`);
      return;
    }

    const { response, addToHistory } = await foundCmd.action({
      setCmdHistory,
      setCurrLocation,
      refetchFiles,
      logout,
      cmdHistory,
      args: cmd.split(" ").slice(1),
      files,
      currLocation,
      user: userData,
    });

    addToHistory && addCmdToHistory(response);
  };

  return (
    <>
      <div className="flex gap-3 h-7">
        <div className="flex">
          <div className="flex relative">
            <p className="bg-[#06215a] px-4 whitespace-nowrap h-fit">
              {user}@
              {`${user.charAt(0).toUpperCase()}${user.slice(1, user.length)}`}
            </p>
            <div className="triangle-right !border-l-[#06215a] absolute left-full" />
          </div>
          <div className="flex">
            <p className="bg-[#ffd44e] pl-6 pr-2 text-main whitespace-nowrap h-fit">
              {path}
            </p>
            <div className="triangle-right !border-l-[#ffd44e]" />
          </div>
        </div>
        <textarea
          className={`bg-transparent outline-none caret-slate-300 w-full overflow-hidden resize-none ${
            active ? "h-fit" : ""
          }`}
          autoFocus={active}
          disabled={!active}
          value={command}
          onChange={onChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      {response && (
        <div
          className="text-[#ff2e87] whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: response }}
        />
      )}
    </>
  );
};

export default Terminal;
