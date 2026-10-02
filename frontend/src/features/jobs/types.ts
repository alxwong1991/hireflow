export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "TEMPORARY";

export interface Job {
  id: number;
  companyName: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  status: "DRAFT" | "OPEN" | "CLOSED";
  createdAt: string;
  applicationCount: number;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string;
  location: string;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
}

export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface EmployerApplication {
  id: number;
  employeeName: string;
  employeeLocation: string | null;
  employeePhone: string | null;
  employeeSummary: string | null;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export type ApplicationStatus =
  | "APPLIED"
  | "REVIEWING"
  | "SHORTLISTED"
  | "REJECTED"
  | "ACCEPTED"
  | "WITHDRAWN";

export type EmployerApplicationStatus = Exclude<ApplicationStatus, "WITHDRAWN">;
