import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getApiErrorMessage, getEmployeeApplications } from "../jobApi";
import {
  applicationStatusClass,
  formatApplicationStatus,
} from "../jobFormatting";
import { showErrorAlert } from "../../../shared/utils/alerts";

function EmployeeApplicationsPage() {
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ["applications", "employee"],
    queryFn: getEmployeeApplications,
  });

  useEffect(() => {
    if (error) {
      void showErrorAlert(
        getApiErrorMessage(error, "Unable to load your applications."),
        "Unable to load applications",
      );
    }
  }, [error]);

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <div className="mb-7">
        <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Your job search</p>
        <h1>My applications</h1>
        <p>Track the jobs you have applied for and their current status.</p>
      </div>
      {isLoading && <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">Loading applications...</p>}
      {!isLoading && !error && applications.length === 0 && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">You have not applied to any jobs yet.</p>
      )}
      <div className="grid gap-4">
        {applications.map((application) => (
          <article className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-6 shadow-[0_24px_70px_rgb(0_0_0/30%)]" key={application.id}>
            <div className="flex items-start justify-between gap-5 max-sm:flex-col max-sm:items-stretch">
              <div>
              <p className="m-0 text-[13px] font-black uppercase tracking-[.08em] text-sky-400">{application.companyName}</p>
              <h2>{application.jobTitle}</h2>
              <p>Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-stretch">
              <span className={`rounded-full px-2.5 py-[7px] text-xs font-extrabold ${applicationStatusClass(application.status)}`}>
                {formatApplicationStatus(application.status)}
              </span>
              <Link className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] border border-slate-400/25 bg-slate-400/12 px-[22px] font-black text-slate-200 transition duration-200 hover:bg-slate-400/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none" to={`/jobs/${application.jobId}`}>View job</Link>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-400/20 bg-slate-950/70 p-[18px]">
              <h3>Submitted cover letter</h3>
              <p>{application.coverLetter}</p>
              <small>Applications are final. Your submitted cover letter cannot be changed.</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EmployeeApplicationsPage;
