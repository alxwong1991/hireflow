import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import { getApiErrorMessage, getEmployerJobs } from "../jobApi";

function EmployerJobsPage() {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs", "employer"],
    queryFn: getEmployerJobs,
  });
  const errorMessage = error
    ? getApiErrorMessage(error, "Unable to load your jobs.")
    : "";

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <div className="mb-7 flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch">
        <div>
          <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Employer workspace</p>
          <h1>My jobs</h1>
          <p>Create listings and review what your company has published.</p>
        </div>
        <Link className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100" to="/employer/jobs/new">Create a job</Link>
      </div>
      {isLoading && <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Loading your jobs...</p>}
      {errorMessage && <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">{errorMessage}</p>}
      {!isLoading && !errorMessage && jobs.length === 0 && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">You have not created a job yet.</p>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(310px,1fr))] gap-5">
        {jobs.map((job) => <JobCard key={job.id} job={job} showStatus />)}
      </div>
    </section>
  );
}

export default EmployerJobsPage;
