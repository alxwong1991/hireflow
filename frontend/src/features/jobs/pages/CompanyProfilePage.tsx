import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage, getJob } from "../jobApi";
import { showErrorAlert } from "../../../shared/utils/alerts";

function getSafeWebsiteUrl(website: string): string | null {
  try {
    const url = new URL(website);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function CompanyProfilePage() {
  const { jobId } = useParams();
  const parsedJobId = Number(jobId);
  const isValidJobId = Number.isInteger(parsedJobId) && parsedJobId > 0;
  const jobQuery = useQuery({
    queryKey: ["jobs", parsedJobId],
    queryFn: () => getJob(parsedJobId),
    enabled: isValidJobId,
  });

  useEffect(() => {
    if (jobQuery.error) {
      void showErrorAlert(
        getApiErrorMessage(jobQuery.error, "Unable to load company information."),
        "Unable to load company",
      );
    }
  }, [jobQuery.error]);

  if (!isValidJobId || jobQuery.isError) {
    return (
      <p className="mx-auto mt-10 max-w-3xl rounded-[20px] border border-slate-400/20 bg-slate-900/85 p-8 text-center text-slate-400">
        Company information is unavailable.
      </p>
    );
  }

  if (jobQuery.isLoading || !jobQuery.data) {
    return (
      <p className="mx-auto mt-10 max-w-3xl rounded-[20px] border border-slate-400/20 bg-slate-900/85 p-8 text-center text-slate-400">
        Loading company information...
      </p>
    );
  }

  const job = jobQuery.data;
  const safeWebsiteUrl = job.companyWebsite
    ? getSafeWebsiteUrl(job.companyWebsite)
    : null;

  return (
    <section className="mx-auto w-full max-w-3xl py-10 pb-16">
      <Link
        to={`/jobs/${job.id}`}
        className="mb-6 inline-flex font-bold text-sky-300 hover:text-sky-200"
      >
        ← Back to {job.title}
      </Link>
      <article className="rounded-[24px] border border-slate-400/20 bg-slate-900/85 p-7 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-sm:p-5">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[.14em] text-sky-400">
          Company profile
        </p>
        <h1 className="mb-6 text-3xl">{job.companyName}</h1>

        <dl className="grid gap-5">
          {job.companyDescription && (
            <div>
              <dt className="mb-1 text-sm font-bold text-slate-300">About the company</dt>
              <dd className="m-0 whitespace-pre-wrap leading-7 text-slate-400">
                {job.companyDescription}
              </dd>
            </div>
          )}
          {job.companyLocation && (
            <div>
              <dt className="mb-1 text-sm font-bold text-slate-300">Location</dt>
              <dd className="m-0 text-slate-400">{job.companyLocation}</dd>
            </div>
          )}
          {job.companyWebsite && (
            <div>
              <dt className="mb-1 text-sm font-bold text-slate-300">Website</dt>
              <dd className="m-0">
                {safeWebsiteUrl ? (
                  <a
                    className="break-all font-semibold text-sky-300 underline decoration-sky-300/40 underline-offset-4 hover:text-sky-200"
                    href={safeWebsiteUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {job.companyWebsite}
                  </a>
                ) : (
                  <span className="break-all text-slate-400">{job.companyWebsite}</span>
                )}
              </dd>
            </div>
          )}
          {!job.companyDescription && !job.companyLocation && !job.companyWebsite && (
            <p className="m-0 text-slate-400">
              The company has not added more profile information yet.
            </p>
          )}
        </dl>
      </article>
    </section>
  );
}

export default CompanyProfilePage;
