import React, { useState } from "react";
import { useCookies } from "react-cookie";
import authFetch from "../utils/authFetch";

export type User = {
  isAdmin: boolean;
  username: string;
  password: string;
  id: string;
  token: string;
};

const useAuth = () => {
  const [user, setUser] = useState<User>();
  const [{ token }, setCookie, removeCookie] = useCookies(["token"]);

  React.useEffect(() => {
    if (!token) return;

    (async () => {
      const user = await authFetch<User>("/auth", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      setUser(user);
    })();
  }, [token]);

  const login = async (username?: string, password?: string) => {
    const user = await authFetch<User>("/auth/login", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });

    setCookie("token", user.token);
    setUser(user);
  };

  const logout = () => removeCookie("token");

  return {
    login,
    logout,
    user,
    token,
    isLoged: token !== undefined,
  };
};

export default useAuth;
