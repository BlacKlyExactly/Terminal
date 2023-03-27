import React, { useState } from "react";
import { useCookies } from "react-cookie";

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
      const request = await fetch("/auth", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      const user = (await request.json()) as User;
      setUser(user);
    })();
  }, [token]);

  const login = async (username?: string, password?: string) => {
    const request = await fetch("/auth/login", {
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

    const user = (await request.json()) as User;
    setCookie("token", user.token);
    setUser(user);
  };

  const logout = () => removeCookie("token", undefined);

  return {
    login,
    logout,
    user,
    token,
    isLoged: token !== undefined,
  };
};

export default useAuth;
