import { Link } from "react-router-dom";
import { Banknote, BriefcaseBusiness, MapPin, UsersRound } from "lucide-react";
import {
  formatEmploymentType,
  formatJobStatus,
  formatSalary,
  jobStatusClass,
} from "../jobFormatting";
import type JobResponse from "../types/jobResponse";

interface JobCardProps {
  job: JobResponse;
  showEmployerActions?: boolean;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
  onCloseJob?: (jobId: number) => void;
  onDeleteJob?: (job: JobResponse) => void;
}

function JobCard({
  job,
  showEmployerActions = false,
  isUpdatingStatus = false,
  isDeleting = false,
  onCloseJob,
  onDeleteJob,
}: JobCardProps) {
  const salary = formatSalary(job);

  return (
    <article className="flex min-h-[300px] flex-col rounded-[22px] border border-slate-400/20 bg-slate-900/85 p-5 shadow-[0_18px_50px_rgb(0_0_0/22%)] transition duration-200 hover:-translate-y-1 hover:border-sky-400/35 hover:shadow-[0_24px_60px_rgb(0_0_0/32%)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.12em] text-sky-400">{job.companyName}</p>
          <h2 className="mb-0 line-clamp-2 break-words text-lg font-bold leading-snug text-white">{job.title}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${jobStatusClass(job.status)}`}>
          {formatJobStatus(job.status)}
        </span>
      </div>

      <div className="my-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-slate-300">
          <BriefcaseBusiness aria-hidden="true" size={14} className="text-sky-300" />
          {formatEmploymentType(job.employmentType)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-slate-300">
          <MapPin aria-hidden="true" size={14} className="text-sky-300" />
          {job.location || "Location flexible"}
        </span>
        {salary && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-slate-300">
            <Banknote aria-hidden="true" size={14} className="text-teal-300" />
            {salary}
          </span>
        )}
        {showEmployerActions && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/15 bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-slate-300">
            <UsersRound aria-hidden="true" size={14} className="text-violet-300" />
            {job.applicationCount} {job.applicationCount === 1 ? "applicant" : "applicants"}
          </span>
        )}
      </div>

      <p className="mb-6 line-clamp-3 min-h-[4.5rem] overflow-hidden text-sm leading-6 text-slate-400">{job.description}</p>

      <div className="mt-auto flex flex-wrap gap-2.5 border-t border-slate-400/10 pt-4">
        <Link className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-400/20 bg-slate-800/70 px-4 text-sm font-bold text-slate-200 transition duration-200 hover:border-slate-300/35 hover:bg-slate-700/70" to={`/jobs/${job.id}`}>
          View job
        </Link>
        {showEmployerActions && (
          <Link className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-teal-500 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgb(37_99_235/20%)] transition duration-200 hover:-translate-y-px hover:brightness-110" to={`/employer/jobs/${job.id}/applications`}>
            View applicants
          </Link>
        )}
        {showEmployerActions && job.status === "OPEN" && (
          <button
            type="button"
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 text-sm font-bold text-amber-200 transition duration-200 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUpdatingStatus}
            onClick={() => onCloseJob?.(job.id)}
          >
            {isUpdatingStatus ? "Closing..." : "Close job"}
          </button>
        )}
        {showEmployerActions && job.status === "CLOSED" && (
          <button
            type="button"
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 px-4 text-sm font-bold text-red-200 transition duration-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={() => onDeleteJob?.(job)}
          >
            {isDeleting ? "Deleting..." : "Delete job"}
          </button>
        )}
      </div>
    </article>
  );
}

export default JobCard;
