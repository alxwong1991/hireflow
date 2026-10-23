import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getEmployeeProfile, updateEmployeeProfile } from "../employeeApi";
import type EmployeeProfileResponse from "../types/employeeProfileResponse";
import { showErrorAlert, showSuccessAlert } from "../../../shared/utils/alerts";

function EmployeeProfileForm({ profile }: { profile: EmployeeProfileResponse }) {
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [summary, setSummary] = useState(profile.summary ?? "");
  const mutation = useMutation({
    mutationFn: updateEmployeeProfile,
    onSuccess: async (updated) => {
      queryClient.setQueryData(["profile", "employee"], updated);
      await showSuccessAlert("Your profile has been saved.", "Profile updated");
    },
    onError: async (error) => {
      await showErrorAlert(
        error instanceof Error ? error.message : "Failed to save employee profile.",
        "Unable to save profile",
      );
    },
  });

  return (
    <div className="w-full max-w-[720px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6">
      <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Employee Profile</p>
      <h1 className="my-2 mb-3 text-[32px] leading-tight tracking-[-.04em] text-white max-sm:text-[28px]">{profile.fullName}</h1>

      <div className="grid gap-[18px]">
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" type="text" value={profile.fullName} disabled />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="phone">Phone</label>
          <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="location">Location</label>
          <input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} />
        </div>
        <button
          type="button"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ phone, location, summary })}
        >
          {mutation.isPending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}

function EmployeeProfilePage() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", "employee"],
    queryFn: getEmployeeProfile,
  });

  useEffect(() => {
    if (error) {
      void showErrorAlert(
        error instanceof Error ? error.message : "Failed to load employee profile.",
        "Unable to load profile",
      );
    }
  }, [error]);

  if (isLoading) {
    return <section className="flex min-h-[calc(100vh-140px)] items-start justify-center py-12"><div className="w-full max-w-[720px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6"><p>Loading employee profile...</p></div></section>;
  }
  if (error || !profile) {
    return <section className="flex min-h-[calc(100vh-140px)] items-start justify-center py-12"><div className="w-full max-w-[720px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6"><p>Employee profile unavailable.</p></div></section>;
  }
  return <section className="flex min-h-[calc(100vh-140px)] items-start justify-center py-12"><EmployeeProfileForm profile={profile} /></section>;
}

export default EmployeeProfilePage;
