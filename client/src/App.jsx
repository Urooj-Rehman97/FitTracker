import { useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar/Navbar";
// import Footer from "./components/layout/Footer/Footer";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop";

function App() {
  const location = useLocation();

 const isPanel =
  location.pathname.startsWith("/dashboard") ||
  location.pathname.startsWith("/admin");

  return (
    <>
        <ScrollToTop />

    {!isPanel && <Navbar />}

      <AppRoutes />

      {/* {!isUserPanel && <Footer />} */}
    </>
  );
}

export default App;