import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  applyToJob,
  getApiErrorMessage,
  getEmployeeApplications,
  getJob,
} from "../jobApi";
import {
  formatEmploymentType,
  formatJobStatus,
  formatSalary,
  jobStatusClass,
} from "../jobFormatting";
import type ApplicationResponse from "../types/applicationResponse";
import { useAuth } from "../../auth/authContextValue";
import { showErrorAlert, showSuccessAlert } from "../../../shared/utils/alerts";

function JobDetailsPage() {
  const queryClient = useQueryClient();
  const { jobId } = useParams();
  const parsedJobId = Number(jobId);
  const isValidJobId = Number.isInteger(parsedJobId) && parsedJobId > 0;
  const [coverLetter, setCoverLetter] = useState("");
  const { user } = useAuth();
  const role = user?.role;
  const jobQuery = useQuery({
    queryKey: ["jobs", parsedJobId],
    queryFn: () => getJob(parsedJobId),
    enabled: isValidJobId,
  });
  const applicationsQuery = useQuery({
    queryKey: ["applications", "employee"],
    queryFn: getEmployeeApplications,
    enabled: role === "EMPLOYEE",
  });
  const applyMutation = useMutation({
    mutationFn: (letter: string) => applyToJob(parsedJobId, letter),
    onSuccess: async (application) => {
      queryClient.setQueryData<ApplicationResponse[]>(
        ["applications", "employee"],
        (current = []) => [application, ...current],
      );
      await showSuccessAlert("Your application has been submitted.", "Application submitted");
    },
    onError: async (error) => {
      await showErrorAlert(
        getApiErrorMessage(error, "Unable to submit your application."),
        "Application failed",
      );
    },
  });
  const job = jobQuery.data ?? null;
  const submittedApplication = applicationsQuery.data?.find(
    (application) => application.jobId === parsedJobId,
  ) ?? null;
  const isLoading = jobQuery.isLoading
    || (role === "EMPLOYEE" && applicationsQuery.isLoading);
  const loadError = jobQuery.error ?? applicationsQuery.error;

  useEffect(() => {
    if (loadError) {
      void showErrorAlert(
        getApiErrorMessage(loadError, "Unable to load this job."),
        "Unable to load job",
      );
    }
  }, [loadError]);

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job || role !== "EMPLOYEE") {
      await showErrorAlert("Please log in as an employee before applying.", "Unable to apply");
      return;
    }

    applyMutation.mutate(coverLetter);
  }

  if (!isValidJobId) return <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Job not found.</p>;
  if (isLoading) return <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Loading job...</p>;
  if (!job) {
    return <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Job not found.</p>;
  }

  const salary = formatSalary(job);

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <Link to="/jobs" className="mb-[22px] inline-block font-extrabold text-sky-300">← Back to jobs</Link>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(280px,360px)] items-start gap-6 max-[900px]:grid-cols-1">
        <article className="min-w-0 rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-sm:rounded-[22px] max-sm:p-6">
          <p className="m-0 text-[13px] font-black uppercase tracking-[.08em] text-sky-400">{job.companyName}</p>
          <h1 className="mb-4 break-words">{job.title}</h1>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${jobStatusClass(job.status)}`}>
              {formatJobStatus(job.status)}
            </span>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 px-4 text-sm font-bold text-sky-200 transition hover:bg-sky-500/20"
              to={`/jobs/${job.id}/company`}
            >
              View company information
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-sm text-slate-300">{formatEmploymentType(job.employmentType)}</span>
            <span className="rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-sm text-slate-300">{job.location || "Location flexible"}</span>
            {salary && <span className="rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-sm text-slate-300">{salary}</span>}
          </div>

          <div className="mt-[30px] border-t border-slate-400/20 pt-6">
            <h2>About the role</h2>
            <p>{job.description}</p>
          </div>
          {job.requirements && (
            <div className="mt-[30px] border-t border-slate-400/20 pt-6">
              <h2>Requirements</h2>
              <p>{job.requirements}</p>
            </div>
          )}
        </article>

        <aside className="min-w-0 rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-7 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-[900px]:rounded-[22px] max-sm:p-6">
          {role === "EMPLOYEE" && submittedApplication ? (
            <>
              <h2>Application submitted</h2>
              <p>Your application is view-only and the cover letter cannot be changed.</p>
              <div className="mt-5 rounded-2xl border border-slate-400/20 bg-slate-950/70 p-[18px]">
                <h3>Your cover letter</h3>
                <p>{submittedApplication.coverLetter}</p>
              </div>
              <Link className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-slate-400/25 bg-slate-400/12 px-4 text-sm font-bold text-slate-200 transition duration-200 hover:bg-slate-400/20" to="/employee/applications">
                View my applications
              </Link>
            </>
          ) : role === "EMPLOYEE" ? (
            job.status !== "OPEN" ? (
              <>
                <h2>Applications closed</h2>
                <p>This job is no longer accepting applications.</p>
              </>
            ) : (
            <>
              <h2 className="mb-2">Apply for this job</h2>
              <p>Introduce yourself and explain why you are a strong fit.</p>
              <form className="mt-6 grid gap-5" onSubmit={handleApply}>
                <div className="flex flex-col gap-[7px]">
                  <label htmlFor="cover-letter">Cover letter</label>
                  <textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    required
                    maxLength={5000}
                    placeholder="Tell the employer about your experience..."
                  />
                </div>
                <button className="mt-1 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-teal-500 px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgb(37_99_235/25%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65" disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? "Submitting..." : "Submit application"}
                </button>
              </form>
            </>
            )
          ) : role === "EMPLOYER" ? (
            <>
              <h2>Employee applications only</h2>
              <p>Employers can browse the listing, but only employee accounts can apply.</p>
            </>
          ) : (
            <>
              <h2>Ready to apply?</h2>
              <p>Log in or create an employee account to submit your application.</p>
              <Link className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100 mt-1 w-full" to="/login">Log in</Link>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

export default JobDetailsPage;
