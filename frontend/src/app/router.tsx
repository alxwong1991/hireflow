import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../shared/layouts/MainLayout";
import HomePage from "../features/home/pages/HomePage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import EmployeeProfilePage from "../features/employee/pages/EmployeeProfilePage";
import EmployerProfilePage from "../features/employer/pages/EmployerProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "employee/profile",
        element: <EmployeeProfilePage />,
      },
      {
        path: "employer/profile",
        element: <EmployerProfilePage />,
      },
    ],
  },
]);