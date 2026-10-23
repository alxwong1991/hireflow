import type ApplicationStatus from "./applicationStatus";

export default interface ApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
}
