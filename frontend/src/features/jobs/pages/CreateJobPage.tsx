import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob, getApiErrorMessage } from "../jobApi";
import type { CreateJobRequest, EmploymentType } from "../types";

function parseOptionalNumber(value: string): number | null {
  return value === "" ? null : Number(value);
}

function CreateJobPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULL_TIME");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: async (job) => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate(`/jobs/${job.id}`);
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, "Unable to create the job."));
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request: CreateJobRequest = {
      title,
      description,
      requirements,
      location,
      employmentType,
      salaryMin: parseOptionalNumber(salaryMin),
      salaryMax: parseOptionalNumber(salaryMax),
    };

    setErrorMessage("");
    mutation.mutate(request);
  }

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 pb-16">
      <div className="mx-auto max-w-[820px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_24px_70px_rgb(0_0_0/30%)] max-sm:rounded-[22px] max-sm:p-6">
        <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">New opportunity</p>
        <h1>Create a job</h1>
        <p>Share the role, expectations, and compensation with candidates.</p>

        <form className="mt-[22px] grid gap-[18px]" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="job-title">Job title</label>
            <input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="job-description">Description</label>
            <textarea id="job-description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="job-requirements">Requirements</label>
            <textarea id="job-requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="job-location">Location</label>
              <input id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={150} />
            </div>
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="employment-type">Employment type</label>
              <select id="employment-type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}>
                <option value="FULL_TIME">Full time</option>
                <option value="PART_TIME">Part time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="TEMPORARY">Temporary</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[18px] max-sm:grid-cols-1">
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="salary-min">Minimum salary (USD)</label>
              <input id="salary-min" type="number" min="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </div>
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="salary-max">Maximum salary (USD)</label>
              <input id="salary-max" type="number" min="0" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
            </div>
          </div>
          {errorMessage && <p className="m-0 rounded-[14px] p-3.5 text-sm font-extrabold leading-6 border border-red-500/30 bg-red-500/12 text-red-200">{errorMessage}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] border border-slate-400/25 bg-slate-400/12 px-[22px] font-black text-slate-200 transition duration-200 hover:bg-slate-400/20 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none" onClick={() => navigate("/employer/jobs")}>Cancel</button>
            <button className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100" disabled={mutation.isPending}>
              {mutation.isPending ? "Publishing..." : "Publish job"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CreateJobPage;
