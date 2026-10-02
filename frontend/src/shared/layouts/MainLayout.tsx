import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="p-8 max-sm:p-5">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;