import { LoginContext } from "./components/Login";
import Terminal from "./components/Terminal";
import useAuth from "./hooks/useAuth";

const App = () => {
  const { token, user, isLoged, logout, login } = useAuth();

  return (
    <LoginContext.Provider value={{ isLoged, user, token, login, logout }}>
      <Terminal />
    </LoginContext.Provider>
  );
};

export default App;
