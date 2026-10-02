import { Link } from "react-router-dom";
import { formatEmploymentType, formatSalary, jobStatusClass } from "../jobFormatting";
import type { Job } from "../types";

interface JobCardProps {
  job: Job;
  showStatus?: boolean;
}

function JobCard({ job, showStatus = false }: JobCardProps) {
  const salary = formatSalary(job);

  return (
    <article className="flex flex-col items-start rounded-[22px] border border-slate-400/25 bg-slate-900/90 p-6 shadow-[0_24px_70px_rgb(0_0_0/30%)]">
      <div className="flex w-full items-start justify-between gap-3">
        <div>
          <p className="m-0 text-[13px] font-black uppercase tracking-[.08em] text-sky-400">{job.companyName}</p>
          <h2>{job.title}</h2>
        </div>
        {showStatus && <span className={`rounded-full bg-slate-400/12 px-2.5 py-[7px] text-xs font-extrabold text-slate-300 ${jobStatusClass(job.status)}`}>{job.status}</span>}
      </div>

      <div className="my-[18px] flex flex-wrap gap-2">
        <span>{formatEmploymentType(job.employmentType)}</span>
        <span>{job.location || "Location flexible"}</span>
        {salary && <span>{salary}</span>}
        {showStatus && (
          <span>
            {job.applicationCount} {job.applicationCount === 1 ? "applicant" : "applicants"}
          </span>
        )}
      </div>

      <p className="mb-[22px] line-clamp-3 w-full overflow-hidden text-slate-400 leading-[1.6]">{job.description}</p>

      <div className="mt-auto flex w-full flex-wrap gap-2.5">
        <Link className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] border border-slate-400/25 bg-slate-400/12 px-[22px] font-black text-slate-200 transition duration-200 hover:bg-slate-400/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none" to={`/jobs/${job.id}`}>
          View job
        </Link>
        {showStatus && (
          <Link className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100" to={`/employer/jobs/${job.id}/applications`}>
            View applicants
          </Link>
        )}
      </div>
    </article>
  );
}

export default JobCard;
