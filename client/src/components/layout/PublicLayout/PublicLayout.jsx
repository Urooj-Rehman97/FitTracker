import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

function PublicLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}

export default PublicLayout;
