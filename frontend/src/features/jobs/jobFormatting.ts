import type { ApplicationStatus, EmploymentType, Job } from "./types";

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

export function formatSalary(job: Job): string | null {
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
    APPLIED: "bg-sky-500/14 text-sky-200",
    REVIEWING: "bg-amber-500/14 text-amber-200",
    SHORTLISTED: "bg-violet-500/16 text-violet-200",
    REJECTED: "bg-red-500/14 text-red-200",
    ACCEPTED: "bg-green-500/14 text-green-200",
    WITHDRAWN: "bg-red-500/14 text-red-200",
  };

  return classes[status];
}

export function jobStatusClass(status: Job["status"]): string {
  const classes: Record<Job["status"], string> = {
    OPEN: "bg-green-500/14 text-green-200",
    DRAFT: "bg-amber-500/14 text-amber-200",
    CLOSED: "bg-red-500/14 text-red-200",
  };

  return classes[status];
}
