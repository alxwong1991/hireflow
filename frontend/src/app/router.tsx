import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../shared/layouts/MainLayout";
import HomePage from "../features/home/pages/HomePage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import EmployeeProfilePage from "../features/employee/pages/EmployeeProfilePage";
import EmployerProfilePage from "../features/employer/pages/EmployerProfilePage";
import JobsPage from "../features/jobs/pages/JobsPage";
import JobDetailsPage from "../features/jobs/pages/JobDetailsPage";
import EmployerJobsPage from "../features/jobs/pages/EmployerJobsPage";
import CreateJobPage from "../features/jobs/pages/CreateJobPage";
import EmployeeApplicationsPage from "../features/jobs/pages/EmployeeApplicationsPage";
import EmployerJobApplicationsPage from "../features/jobs/pages/EmployerJobApplicationsPage";
import RequireRole from "../features/auth/components/RequireRole";
import PublicOnlyRoute from "../features/auth/components/PublicOnlyRoute";

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
        element: <PublicOnlyRoute />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
      {
        path: "jobs",
        element: <JobsPage />,
      },
      {
        path: "jobs/:jobId",
        element: <JobDetailsPage />,
      },
      {
        element: <RequireRole role="EMPLOYEE" />,
        children: [
          { path: "employee/profile", element: <EmployeeProfilePage /> },
          { path: "employee/applications", element: <EmployeeApplicationsPage /> },
        ],
      },
      {
        element: <RequireRole role="EMPLOYER" />,
        children: [
          { path: "employer/profile", element: <EmployerProfilePage /> },
          { path: "employer/jobs", element: <EmployerJobsPage /> },
          { path: "employer/jobs/new", element: <CreateJobPage /> },
          {
            path: "employer/jobs/:jobId/applications",
            element: <EmployerJobApplicationsPage />,
          },
        ],
      },
    ],
  },
]);