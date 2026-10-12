import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const location = useLocation();

  const token = sessionStorage.getItem("fittrackToken");
  const user = sessionStorage.getItem("fittrackUser");

  const isLoggedIn = Boolean(token && user);

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;