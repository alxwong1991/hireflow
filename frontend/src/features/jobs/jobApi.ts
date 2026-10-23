import axios from "axios";
import apiClient from "../../lib/apiClient";
import type ApplicationResponse from "./types/applicationResponse";
import type CreateJobRequest from "./types/createJobRequest";
import type EmployerApplicationResponse from "./types/employerApplicationResponse";
import type EmployerApplicationStatus from "./types/employerApplicationStatus";
import type JobResponse from "./types/jobResponse";
import type UpdateJobStatusRequest from "./types/updateJobStatusRequest";

export async function getOpenJobs(): Promise<JobResponse[]> {
  const response = await apiClient.get<JobResponse[]>("/jobs");
  return response.data;
}

export async function getJob(jobId: number): Promise<JobResponse> {
  const response = await apiClient.get<JobResponse>(`/jobs/${jobId}`);
  return response.data;
}

export async function getEmployerJobs(): Promise<JobResponse[]> {
  const response = await apiClient.get<JobResponse[]>("/employer/jobs");
  return response.data;
}

export async function createJob(
  request: CreateJobRequest,
): Promise<JobResponse> {
  const response = await apiClient.post<JobResponse>(
    "/employer/jobs",
    request,
  );
  return response.data;
}

export async function updateJobStatus(
  jobId: number,
  request: UpdateJobStatusRequest,
): Promise<JobResponse> {
  const response = await apiClient.patch<JobResponse>(
    `/employer/jobs/${jobId}/status`,
    request,
  );
  return response.data;
}

export async function deleteJob(jobId: number): Promise<void> {
  await apiClient.delete(`/employer/jobs/${jobId}`);
}

export async function applyToJob(
  jobId: number,
  coverLetter: string,
): Promise<ApplicationResponse> {
  const response = await apiClient.post<ApplicationResponse>(
    `/employee/jobs/${jobId}/applications`,
    { coverLetter },
  );
  return response.data;
}

export async function getEmployeeApplications(): Promise<ApplicationResponse[]> {
  const response = await apiClient.get<ApplicationResponse[]>(
    "/employee/applications",
  );
  return response.data;
}

export async function getEmployerJobApplications(
  jobId: number,
): Promise<EmployerApplicationResponse[]> {
  const response = await apiClient.get<EmployerApplicationResponse[]>(
    `/employer/jobs/${jobId}/applications`,
  );
  return response.data;
}

export async function updateApplicationStatus(
  jobId: number,
  applicationId: number,
  status: EmployerApplicationStatus,
): Promise<EmployerApplicationResponse> {
  const response = await apiClient.patch<EmployerApplicationResponse>(
    `/employer/jobs/${jobId}/applications/${applicationId}/status`,
    { status },
  );
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseData: unknown = error.response?.data;
    const status = error.response?.status;
    const message =
      responseData && typeof responseData === "object" && "message" in responseData
        ? responseData.message
        : null;

    if (typeof message === "string") {
      return message;
    }
    if (message && typeof message === "object") {
      const validationMessages = Object.values(message)
        .filter((value): value is string => typeof value === "string")
        .join(" ");
      if (validationMessages) {
        return validationMessages;
      }
    }
    if (responseData && typeof responseData === "object" && "error" in responseData) {
      const serverError = responseData.error;
      if (typeof serverError === "string") {
        return status ? `${serverError} (HTTP ${status})` : serverError;
      }
    }
    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }
    if (status) {
      return `Request failed with HTTP ${status}.`;
    }
    if (error.message) {
      return error.message;
    }
  }
  return error instanceof Error ? error.message : fallback;
}
