import { useEffect } from "react";
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
import type EmployerApplicationResponse from "../types/employerApplicationResponse";
import type EmployerApplicationStatus from "../types/employerApplicationStatus";
import { showErrorAlert, showSuccessAlert } from "../../../shared/utils/alerts";

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
    onSuccess: async (updated) => {
      queryClient.setQueryData<EmployerApplicationResponse[]>(
        ["applications", "employer", parsedJobId],
        (current = []) =>
          current.map((application) =>
            application.id === updated.id ? updated : application,
          ),
      );
      await showSuccessAlert(
        `Application status changed to ${updated.status.toLowerCase()}.`,
        "Status updated",
      );
    },
    onError: async (error) => {
      await showErrorAlert(
        getApiErrorMessage(error, "Unable to update application status."),
        "Unable to update status",
      );
    },
  });

  const job = jobQuery.data ?? null;
  const applications = applicationsQuery.data ?? [];
  const isLoading = jobQuery.isLoading || applicationsQuery.isLoading;
  const queryError = jobQuery.error ?? applicationsQuery.error;

  useEffect(() => {
    if (queryError) {
      void showErrorAlert(
        getApiErrorMessage(queryError, "Unable to load applicants."),
        "Unable to load applicants",
      );
    }
  }, [queryError]);

  async function handleStatusChange(
    application: EmployerApplicationResponse,
    status: EmployerApplicationStatus,
  ) {
    if (!canReviewApplications) {
      await showErrorAlert(
        "Please log in as an employer to update applications.",
        "Unable to update status",
      );
      return;
    }

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

      {!queryError && applications.length === 0 && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">No employees have applied to this job yet.</p>
      )}

      <div className="grid gap-[18px]">
        {applications.map((application) => (
          <article className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-6 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-sm:p-5" key={application.id}>
            <div className="flex items-start justify-between gap-6 max-sm:flex-col">
              <div className="min-w-0">
                <p className="m-0 text-[13px] font-black uppercase tracking-[.08em] text-sky-400">Employee applicant</p>
                <h2 className="mb-2 break-words">{application.employeeName}</h2>
                <Link
                  className="inline-flex min-h-9 items-center justify-center rounded-lg border border-sky-400/25 bg-sky-500/10 px-3.5 text-sm font-bold text-sky-200 transition hover:bg-sky-500/20"
                  to={`/employer/jobs/${parsedJobId}/applications/${application.id}/profile`}
                >
                  View applicant profile
                </Link>
              </div>
              <span className={`rounded-full px-2.5 py-[7px] text-xs font-extrabold ${applicationStatusClass(application.status)}`}>
                {formatApplicationStatus(application.status)}
              </span>
            </div>

            <div className="my-5 flex flex-wrap gap-2">
              {application.employeeLocation && <span className="rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-sm text-slate-300">{application.employeeLocation}</span>}
              {application.employeePhone && <span className="rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-sm text-slate-300">{application.employeePhone}</span>}
              <span className="rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-sm text-slate-300">Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
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

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(220px,320px)] items-center gap-6 border-t border-slate-400/20 pt-5 max-[700px]:grid-cols-1 max-[700px]:gap-3">
              <div className="min-w-0">
                <h3 className="mb-1">Application decision</h3>
                <p className="mb-0 text-sm text-slate-400">The employee will see this status in their application tracker.</p>
              </div>
              <select
                className="w-full"
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
