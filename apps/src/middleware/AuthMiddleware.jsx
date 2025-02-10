import { Navigate, Outlet } from "react-router-dom";

const AuthMiddleware = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return user?.token?.token ? <Outlet /> : <Navigate to="/" />;
};

export default AuthMiddleware;
