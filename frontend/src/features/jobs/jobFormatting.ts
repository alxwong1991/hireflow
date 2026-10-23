import type ApplicationStatus from "./types/applicationStatus";
import type EmploymentType from "./types/employmentType";
import type JobResponse from "./types/jobResponse";

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  TEMPORARY: "Temporary",
};

export function formatEmploymentType(type: EmploymentType): string {
  return employmentTypeLabels[type];
}

export function formatSalary(job: JobResponse): string | null {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (job.salaryMin != null && job.salaryMax != null) {
    return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
  }
  if (job.salaryMin != null) {
    return `From ${formatter.format(job.salaryMin)}`;
  }
  if (job.salaryMax != null) {
    return `Up to ${formatter.format(job.salaryMax)}`;
  }
  return null;
}

export function formatApplicationStatus(status: ApplicationStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function applicationStatusClass(status: ApplicationStatus): string {
  const classes: Record<ApplicationStatus, string> = {
    APPLIED: "border border-sky-400/30 bg-sky-500/15 text-sky-200",
    REVIEWING: "border border-amber-400/30 bg-amber-500/15 text-amber-200",
    SHORTLISTED: "border border-violet-400/30 bg-violet-500/15 text-violet-200",
    REJECTED: "border border-red-400/30 bg-red-500/15 text-red-200",
    ACCEPTED: "border border-green-400/30 bg-green-500/15 text-green-200",
    WITHDRAWN: "border border-slate-400/30 bg-slate-500/15 text-slate-200",
  };

  return classes[status];
}

export function formatJobStatus(status: JobResponse["status"]): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function jobStatusClass(status: JobResponse["status"]): string {
  const classes: Record<JobResponse["status"], string> = {
    OPEN: "border border-green-400/30 bg-green-500/15 text-green-200",
    DRAFT: "border border-amber-400/30 bg-amber-500/15 text-amber-200",
    CLOSED: "border border-red-400/30 bg-red-500/15 text-red-200",
  };

  return classes[status];
}
