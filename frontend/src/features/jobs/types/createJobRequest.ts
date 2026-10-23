import type EmploymentType from "./employmentType";

export default interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string;
  location: string;
  employmentType: EmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
}
