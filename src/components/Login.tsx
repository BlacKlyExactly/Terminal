import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import useAuth from "../hooks/useAuth";

export const LoginContext = createContext<ReturnType<typeof useAuth>>({
  isLoged: false,
  login: async (username, password) => {},
  logout: () => {},
  user: {
    isAdmin: false,
    username: "",
    password: "",
    id: "",
    token: "",
  },
  token: "",
});

type Credentials = {
  username?: string;
  password?: string;
};

const Login = () => {
  const [submits, setSubmits] = useState(0);
  const [history, setHistory] = useState<LoginRowProps[]>([]);

  const { login, isLoged } = useContext(LoginContext);

  const [credentials, setCredentials] = useReducer(
    (currState: Credentials, newState: Credentials) => ({
      ...currState,
      ...newState,
    }),
    {
      username: "",
      password: "",
    }
  );

  useEffect(() => {
    if (submits % 2 === 0 && submits) {
      auth();
      setCredentials({ username: "", password: "" });
    }
  }, [submits]);

  const auth = async () => {
    updateResponse("Logging in...");

    const { username, password } = credentials;
    try {
      await login(username, password);
      setHistory([]);
    } catch (error) {
      updateResponse("Invalid credentials");
    }

    setCredentials({ username: "", password: "" });
  };

  const updateResponse = (response: string) => {
    const newHistory = history.map((value, idx) => {
      if (idx === history.length - 1)
        return {
          ...value,
          response,
        };

      return value;
    });

    setHistory(newHistory);
  };

  const inputLabel = submits % 2 === 0 ? "Username" : "Password";

  const inputValue =
    submits % 2 === 0 ? credentials.username : credentials.password;

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    submits % 2 === 0
      ? setCredentials({ username: value })
      : setCredentials({ password: value });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    { ...props }: LoginRowProps
  ) => {
    if (e.key !== "Enter") return;

    setHistory([
      ...history,
      {
        ...props,
        disabled: false,
        autoFocus: false,
        executedAt: new Date().getTime(),
      },
    ]);

    setSubmits(submits + 1);
  };

  if (isLoged) return null;

  return (
    <div className="flex flex-col">
      {history.map((props) => (
        <LoginRow {...props} key={props.executedAt} />
      ))}
      <LoginRow
        label={inputLabel}
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        executedAt={new Date().getTime()}
        value={inputValue}
      />
    </div>
  );
};

const LoginRow = ({
  onKeyDown,
  executedAt,
  response,
  ...props
}: LoginRowProps) => (
  <>
    <label>
      {props.label}:
      <input
        className="ml-2 bg-main text-response outline-none"
        onKeyDown={(e) => onKeyDown && onKeyDown(e, { ...props, executedAt })}
        autoFocus
        {...props}
      />
    </label>
    <p className="text-response">{response}</p>
  </>
);

type LoginRowProps = Omit<React.HTMLProps<HTMLInputElement>, "onKeyDown"> & {
  label: string;
  onKeyDown?: (e: React.KeyboardEvent, props: LoginRowProps) => void;
  executedAt: number;
  response?: string;
};

export default Login;
