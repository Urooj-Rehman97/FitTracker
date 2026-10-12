
import { Navigate, Outlet } from "react-router-dom";

function AdminProtectedRoute() {
  let user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("fittrackUser") || "null"
    );
  } catch {
    user = null;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

export default AdminProtectedRoute;

