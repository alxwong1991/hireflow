import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  applyToJob,
  getApiErrorMessage,
  getEmployeeApplications,
  getJob,
} from "../jobApi";
import { formatEmploymentType, formatSalary } from "../jobFormatting";
import type { JobApplication } from "../types";
import { useAuth } from "../../auth/authContextValue";

function JobDetailsPage() {
  const queryClient = useQueryClient();
  const { jobId } = useParams();
  const parsedJobId = Number(jobId);
  const isValidJobId = Number.isInteger(parsedJobId) && parsedJobId > 0;
  const [coverLetter, setCoverLetter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    onSuccess: (application) => {
      queryClient.setQueryData<JobApplication[]>(
        ["applications", "employee"],
        (current = []) => [application, ...current],
      );
      setSuccessMessage("Application submitted successfully.");
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to submit your application."));
    },
  });
  const job = jobQuery.data ?? null;
  const submittedApplication = applicationsQuery.data?.find(
    (application) => application.jobId === parsedJobId,
  ) ?? null;
  const isLoading = jobQuery.isLoading
    || (role === "EMPLOYEE" && applicationsQuery.isLoading);
  const loadError = jobQuery.error ?? applicationsQuery.error;

  async function handleApply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!job) {
      setErrorMessage("Please log in as an employee before applying.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    applyMutation.mutate(coverLetter);
  }

  if (!isValidJobId) return <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">Invalid job.</p>;
  if (isLoading) return <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Loading job...</p>;
  if (!job) {
    return (
      <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">
        {loadError ? getApiErrorMessage(loadError, "Unable to load this job.") : "Job not found."}
      </p>
    );
  }

  const salary = formatSalary(job);

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <Link to="/jobs" className="mb-[22px] inline-block font-extrabold text-sky-300">← Back to jobs</Link>
      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(300px,.8fr)] items-start gap-6 max-sm:grid-cols-1">
        <article className="rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-sm:rounded-[22px] max-sm:p-6">
          <p className="m-0 text-[13px] font-black uppercase tracking-[.08em] text-sky-400">{job.companyName}</p>
          <h1>{job.title}</h1>
          <div className="my-[18px] flex flex-wrap gap-2">
            <span>{formatEmploymentType(job.employmentType)}</span>
            <span>{job.location || "Location flexible"}</span>
            {salary && <span>{salary}</span>}
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

        <aside className="sticky top-[100px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-sm:static max-sm:rounded-[22px] max-sm:p-6">
          {role === "EMPLOYEE" && submittedApplication ? (
            <>
              <h2>Application submitted</h2>
              <p>Your application is view-only and the cover letter cannot be changed.</p>
              {successMessage && <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-green-500/30 bg-green-500/12 text-green-200">{successMessage}</p>}
              <div className="mt-5 rounded-2xl border border-slate-400/20 bg-slate-950/70 p-[18px]">
                <h3>Your cover letter</h3>
                <p>{submittedApplication.coverLetter}</p>
              </div>
              <Link className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] border border-slate-400/25 bg-slate-400/12 px-[22px] font-black text-slate-200 transition duration-200 hover:bg-slate-400/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none mt-1 w-full" to="/employee/applications">
                View my applications
              </Link>
            </>
          ) : role === "EMPLOYEE" ? (
            <>
              <h2>Apply for this job</h2>
              <p>Introduce yourself and explain why you are a strong fit.</p>
              <form className="mt-[22px] grid gap-[18px]" onSubmit={handleApply}>
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
                {errorMessage && <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">{errorMessage}</p>}
                {successMessage && <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-green-500/30 bg-green-500/12 text-green-200">{successMessage}</p>}
                <button className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100 mt-1 w-full" disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? "Submitting..." : "Submit application"}
                </button>
              </form>
            </>
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
