import type ApplicationStatus from "./applicationStatus";

export default interface EmployerApplicationResponse {
  id: number;
  employeeName: string;
  employeeLocation: string | null;
  employeePhone: string | null;
  employeeSummary: string | null;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
}
