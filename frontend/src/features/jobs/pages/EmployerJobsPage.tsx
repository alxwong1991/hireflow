import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard";
import {
  deleteJob,
  getApiErrorMessage,
  getEmployerJobs,
  updateJobStatus,
} from "../jobApi";
import type JobResponse from "../types/jobResponse";
import {
  confirmJobDeletion,
  showErrorAlert,
  showSuccessAlert,
} from "../../../shared/utils/alerts";

function EmployerJobsPage() {
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs", "employer"],
    queryFn: getEmployerJobs,
  });
  const closeMutation = useMutation({
    mutationFn: (jobId: number) => updateJobStatus(jobId, { status: "CLOSED" }),
    onSuccess: async (closedJob) => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await showSuccessAlert(
        `"${closedJob.title}" is no longer accepting applications.`,
        "Job closed",
      );
    },
    onError: async (mutationError) => {
      await showErrorAlert(
        getApiErrorMessage(mutationError, "Unable to close this job."),
        "Unable to close job",
      );
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await showSuccessAlert(
        "The closed job and its applications have been deleted.",
        "Job deleted",
      );
    },
    onError: async (mutationError) => {
      await showErrorAlert(
        getApiErrorMessage(mutationError, "Unable to delete this job."),
        "Unable to delete job",
      );
    },
  });

  useEffect(() => {
    if (error) {
      void showErrorAlert(getApiErrorMessage(error, "Unable to load your jobs."), "Unable to load jobs");
    }
  }, [error]);

  async function handleDeleteJob(job: JobResponse) {
    if (job.status !== "CLOSED") {
      return;
    }
    if (await confirmJobDeletion(job.title)) {
      deleteMutation.mutate(job.id);
    }
  }

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
      {!isLoading && !error && jobs.length === 0 && (
        <p className="rounded-[20px] border border-slate-400/25 bg-slate-900/90 p-8 text-center text-slate-400 shadow-[0_24px_70px_rgb(0_0_0/30%)]">You have not created a job yet.</p>
      )}
      <div className="job-card-grid">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            showEmployerActions
            isUpdatingStatus={
              closeMutation.isPending && closeMutation.variables === job.id
            }
            isDeleting={
              deleteMutation.isPending && deleteMutation.variables === job.id
            }
            onCloseJob={(jobId) => closeMutation.mutate(jobId)}
            onDeleteJob={handleDeleteJob}
          />
        ))}
      </div>
    </section>
  );
}

export default EmployerJobsPage;
