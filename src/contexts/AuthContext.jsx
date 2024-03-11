import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { BACKEND_URL } from "../constants/BackendUrl";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  console.log("user:", user);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userAuth) => {
      const userID = userAuth.uid;
      const response = await axios.get(`${BACKEND_URL}/workers/${userID}`);
      const user = response.data;
      setUser(user);
      console.log("user:", user);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    setUser,
    loadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
