import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage, getEmployerJobApplications } from "../jobApi";
import { showErrorAlert } from "../../../shared/utils/alerts";

function ApplicantProfilePage() {
  const { jobId, applicationId } = useParams();
  const parsedJobId = Number(jobId);
  const parsedApplicationId = Number(applicationId);
  const isValidRoute =
    Number.isInteger(parsedJobId)
    && parsedJobId > 0
    && Number.isInteger(parsedApplicationId)
    && parsedApplicationId > 0;
  const applicationsQuery = useQuery({
    queryKey: ["applications", "employer", parsedJobId],
    queryFn: () => getEmployerJobApplications(parsedJobId),
    enabled: isValidRoute,
  });
  const applicant = applicationsQuery.data?.find(
    (application) => application.id === parsedApplicationId,
  );

  useEffect(() => {
    if (applicationsQuery.error) {
      void showErrorAlert(
        getApiErrorMessage(
          applicationsQuery.error,
          "Unable to load the applicant profile.",
        ),
        "Unable to load applicant",
      );
    }
  }, [applicationsQuery.error]);

  if (!isValidRoute || applicationsQuery.isError) {
    return (
      <p className="mx-auto mt-10 max-w-3xl rounded-[20px] border border-slate-400/20 bg-slate-900/85 p-8 text-center text-slate-400">
        Applicant profile is unavailable.
      </p>
    );
  }

  if (applicationsQuery.isLoading) {
    return (
      <p className="mx-auto mt-10 max-w-3xl rounded-[20px] border border-slate-400/20 bg-slate-900/85 p-8 text-center text-slate-400">
        Loading applicant profile...
      </p>
    );
  }

  if (!applicant) {
    return (
      <p className="mx-auto mt-10 max-w-3xl rounded-[20px] border border-slate-400/20 bg-slate-900/85 p-8 text-center text-slate-400">
        Applicant profile was not found.
      </p>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl py-10 pb-16">
      <Link
        to={`/employer/jobs/${parsedJobId}/applications`}
        className="mb-6 inline-flex font-bold text-sky-300 hover:text-sky-200"
      >
        ← Back to applicants
      </Link>
      <article className="rounded-[24px] border border-slate-400/20 bg-slate-900/85 p-7 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-sm:p-5">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[.14em] text-sky-400">
          Applicant profile
        </p>
        <h1 className="mb-6 text-3xl">{applicant.employeeName}</h1>
        <dl className="grid gap-5">
          {applicant.employeeLocation && (
            <div>
              <dt className="mb-1 text-sm font-bold text-slate-300">Location</dt>
              <dd className="m-0 text-slate-400">{applicant.employeeLocation}</dd>
            </div>
          )}
          {applicant.employeePhone && (
            <div>
              <dt className="mb-1 text-sm font-bold text-slate-300">Phone</dt>
              <dd className="m-0 text-slate-400">{applicant.employeePhone}</dd>
            </div>
          )}
          {applicant.employeeSummary && (
            <div>
              <dt className="mb-1 text-sm font-bold text-slate-300">Profile summary</dt>
              <dd className="m-0 whitespace-pre-wrap leading-7 text-slate-400">
                {applicant.employeeSummary}
              </dd>
            </div>
          )}
          {!applicant.employeeLocation
            && !applicant.employeePhone
            && !applicant.employeeSummary && (
              <p className="m-0 text-slate-400">
                This applicant has not added additional profile information.
              </p>
            )}
        </dl>
      </article>
    </section>
  );
}

export default ApplicantProfilePage;
