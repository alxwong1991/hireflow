import type EmploymentType from "./employmentType";

export default interface JobResponse {
  id: number;
  companyName: string;
  companyDescription: string | null;
  companyWebsite: string | null;
  companyLocation: string | null;
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
