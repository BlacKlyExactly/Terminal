import Cookies from "js-cookie";

const authFetch = async <T>(path: string, options?: RequestInit) => {
  options = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  };

  const req = await fetch(path, options);
  return (await req.json()) as T;
};

export default authFetch;
