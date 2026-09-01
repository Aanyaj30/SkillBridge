import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Wraps the whole app. Anything inside can call useAuth() to know
// who's logged in (candidate or employer) and to log in/out.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      return savedUser && token ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  });
  const authLoading = false;

  const login = (userData) => {
    // userData comes straight from the backend response: { _id, name/companyName, email, token, role }
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
