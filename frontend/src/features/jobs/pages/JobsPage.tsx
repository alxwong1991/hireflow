import { useQuery } from "@tanstack/react-query";
import JobCard from "../components/JobCard";
import { getApiErrorMessage, getOpenJobs } from "../jobApi";

function JobsPage() {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs", "open"],
    queryFn: getOpenJobs,
  });
  const errorMessage = error ? getApiErrorMessage(error, "Unable to load jobs.") : "";

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <div className="mb-7">
        <div>
          <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Find your next opportunity</p>
          <h1>Open jobs</h1>
          <p>Explore current roles from employers on HireFlow.</p>
        </div>
      </div>

      {isLoading && <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Loading jobs...</p>}
      {errorMessage && <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">{errorMessage}</p>}
      {!isLoading && !errorMessage && jobs.length === 0 && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">No open jobs yet. Check back soon.</p>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(310px,1fr))] gap-5">
        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </section>
  );
}

export default JobsPage;
