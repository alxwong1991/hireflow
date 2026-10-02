import axios from "axios";
import apiClient from "../../lib/apiClient";
import type {
  CreateJobRequest,
  EmployerApplication,
  EmployerApplicationStatus,
  Job,
  JobApplication,
} from "./types";

export async function getOpenJobs(): Promise<Job[]> {
  const response = await apiClient.get<Job[]>("/jobs");
  return response.data;
}

export async function getJob(jobId: number): Promise<Job> {
  const response = await apiClient.get<Job>(`/jobs/${jobId}`);
  return response.data;
}

export async function getEmployerJobs(): Promise<Job[]> {
  const response = await apiClient.get<Job[]>("/employer/jobs");
  return response.data;
}

export async function createJob(
  request: CreateJobRequest,
): Promise<Job> {
  const response = await apiClient.post<Job>(
    "/employer/jobs",
    request,
  );
  return response.data;
}

export async function applyToJob(
  jobId: number,
  coverLetter: string,
): Promise<JobApplication> {
  const response = await apiClient.post<JobApplication>(
    `/employee/jobs/${jobId}/applications`,
    { coverLetter },
  );
  return response.data;
}

export async function getEmployeeApplications(): Promise<JobApplication[]> {
  const response = await apiClient.get<JobApplication[]>(
    "/employee/applications",
  );
  return response.data;
}

export async function getEmployerJobApplications(
  jobId: number,
): Promise<EmployerApplication[]> {
  const response = await apiClient.get<EmployerApplication[]>(
    `/employer/jobs/${jobId}/applications`,
  );
  return response.data;
}

export async function updateApplicationStatus(
  jobId: number,
  applicationId: number,
  status: EmployerApplicationStatus,
): Promise<EmployerApplication> {
  const response = await apiClient.patch<EmployerApplication>(
    `/employer/jobs/${jobId}/applications/${applicationId}/status`,
    { status },
  );
  return response.data;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") {
      return message;
    }
    if (message && typeof message === "object") {
      return Object.values(message).join(" ");
    }
  }
  return fallback;
}
