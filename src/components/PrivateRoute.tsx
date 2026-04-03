import React from "react";
import { Navigate, Outlet } from "react-router";

interface IPrivateRouteProps {
  isLoggedIn: boolean;
}

function PrivateRoute({ isLoggedIn }: IPrivateRouteProps) {
  return isLoggedIn ? <Outlet /> : <Navigate to="/signin" />;
}

export default PrivateRoute;
