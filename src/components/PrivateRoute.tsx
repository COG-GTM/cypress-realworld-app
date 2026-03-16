import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface IPrivateRouteProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
}

function PrivateRoute({ isLoggedIn, children }: IPrivateRouteProps) {
  const location = useLocation();

  if (!isLoggedIn) {
    /* istanbul ignore next */
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
