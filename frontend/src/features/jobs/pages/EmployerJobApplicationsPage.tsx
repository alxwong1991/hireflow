import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  getApiErrorMessage,
  getEmployerJobApplications,
  getJob,
  updateApplicationStatus,
} from "../jobApi";
import {
  applicationStatusClass,
  formatApplicationStatus,
} from "../jobFormatting";
import type {
  EmployerApplication,
  EmployerApplicationStatus,
} from "../types";

const employerStatuses: EmployerApplicationStatus[] = [
  "APPLIED",
  "REVIEWING",
  "SHORTLISTED",
  "ACCEPTED",
  "REJECTED",
];

function EmployerJobApplicationsPage() {
  const queryClient = useQueryClient();
  const { jobId } = useParams();
  const parsedJobId = Number(jobId);
  const canReviewApplications = Number.isInteger(parsedJobId) && parsedJobId > 0;
  const [errorMessage, setErrorMessage] = useState("");
  const jobQuery = useQuery({
    queryKey: ["jobs", parsedJobId],
    queryFn: () => getJob(parsedJobId),
    enabled: canReviewApplications,
  });
  const applicationsQuery = useQuery({
    queryKey: ["applications", "employer", parsedJobId],
    queryFn: () => getEmployerJobApplications(parsedJobId),
    enabled: canReviewApplications,
  });
  const statusMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: number;
      status: EmployerApplicationStatus;
    }) => updateApplicationStatus(parsedJobId, applicationId, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<EmployerApplication[]>(
        ["applications", "employer", parsedJobId],
        (current = []) =>
          current.map((application) =>
            application.id === updated.id ? updated : application,
          ),
      );
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to update application status."));
    },
  });

  const job = jobQuery.data ?? null;
  const applications = applicationsQuery.data ?? [];
  const isLoading = jobQuery.isLoading || applicationsQuery.isLoading;
  const queryError = jobQuery.error ?? applicationsQuery.error;
  const loadErrorMessage = queryError
    ? getApiErrorMessage(queryError, "Unable to load applicants.")
    : "";

  async function handleStatusChange(
    application: EmployerApplication,
    status: EmployerApplicationStatus,
  ) {
    if (!canReviewApplications) {
      setErrorMessage("Please log in as an employer to update applications.");
      return;
    }

    setErrorMessage("");
    statusMutation.mutate({ applicationId: application.id, status });
  }

  if (isLoading) {
    return <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Loading applicants...</p>;
  }

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <Link to="/employer/jobs" className="mb-[22px] inline-block font-extrabold text-sky-300">← Back to my jobs</Link>
      <div className="mb-7">
        <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Applicant review</p>
        <h1>{job?.title ?? "Job applicants"}</h1>
        <p>
          {applications.length} {applications.length === 1 ? "employee has" : "employees have"} applied
          {job ? ` to ${job.companyName}.` : "."}
        </p>
      </div>

      {(errorMessage || loadErrorMessage) && (
        <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">{errorMessage || loadErrorMessage}</p>
      )}
      {!errorMessage && !loadErrorMessage && applications.length === 0 && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">No employees have applied to this job yet.</p>
      )}

      <div className="grid gap-[18px]">
        {applications.map((application) => (
          <article className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-6 shadow-[0_24px_70px_rgb(0_0_0/30%)]" key={application.id}>
            <div className="flex items-start justify-between gap-5 max-sm:flex-col max-sm:items-stretch">
              <div>
                <p className="m-0 text-[13px] font-black uppercase tracking-[.08em] text-sky-400">Employee applicant</p>
                <h2>{application.employeeName}</h2>
              </div>
              <span className={`rounded-full bg-slate-400/12 px-2.5 py-[7px] text-xs font-extrabold text-slate-300 ${applicationStatusClass(application.status)}`}>
                {formatApplicationStatus(application.status)}
              </span>
            </div>

            <div className="my-[18px] flex flex-wrap gap-2">
              {application.employeeLocation && <span>{application.employeeLocation}</span>}
              {application.employeePhone && <span>{application.employeePhone}</span>}
              <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
            </div>

            {application.employeeSummary && (
              <div className="mt-5 rounded-2xl border border-slate-400/20 bg-slate-950/70 p-[18px]">
                <h3>Profile summary</h3>
                <p>{application.employeeSummary}</p>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-slate-400/20 bg-slate-950/70 p-[18px]">
              <h3>Cover letter</h3>
              <p>{application.coverLetter}</p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-5 border-t border-slate-400/20 pt-5 max-sm:flex-col max-sm:items-stretch">
              <div>
                <h3>Application decision</h3>
                <p>The employee will see this status in their application tracker.</p>
              </div>
              <select
                aria-label={`Status for ${application.employeeName}`}
                value={application.status}
                disabled={
                  statusMutation.isPending
                  && statusMutation.variables?.applicationId === application.id
                }
                onChange={(event) =>
                  handleStatusChange(
                    application,
                    event.target.value as EmployerApplicationStatus,
                  )
                }
              >
                {employerStatuses.map((status) => (
                  <option value={status} key={status}>
                    {formatApplicationStatus(status)}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EmployerJobApplicationsPage;
