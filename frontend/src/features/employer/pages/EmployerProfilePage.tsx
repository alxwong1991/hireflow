import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getEmployerProfile, updateEmployerProfile } from "../employerApi";
import type EmployerProfileResponse from "../types/employerProfileResponse";
import { showErrorAlert, showSuccessAlert } from "../../../shared/utils/alerts";

function EmployerProfileForm({ profile }: { profile: EmployerProfileResponse }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(profile.companyDescription ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const mutation = useMutation({
    mutationFn: updateEmployerProfile,
    onSuccess: async (updated) => {
      queryClient.setQueryData(["profile", "employer"], updated);
      await showSuccessAlert("Your profile has been saved.", "Profile updated");
    },
    onError: async (error) => {
      await showErrorAlert(
        error instanceof Error ? error.message : "Failed to save employer profile.",
        "Unable to save profile",
      );
    },
  });

  return (
    <div className="w-full max-w-[720px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6">
      <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Employer Profile</p>
      <h1 className="my-2 mb-3 text-[32px] leading-tight tracking-[-.04em] text-white max-sm:text-[28px]">{profile.companyName}</h1>

      <div className="grid gap-[18px]">
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="companyName">Company name</label>
          <input id="companyName" value={profile.companyName} disabled />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="description">Company description</label>
          <textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="website">Website</label>
          <input id="website" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </div>
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="location">Location</label>
          <input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        <button
          type="button"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ description, website, location })}
        >
          {mutation.isPending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </div>
  );
}

function EmployerProfilePage() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", "employer"],
    queryFn: getEmployerProfile,
  });

  useEffect(() => {
    if (error) {
      void showErrorAlert(
        error instanceof Error ? error.message : "Failed to load employer profile.",
        "Unable to load profile",
      );
    }
  }, [error]);

  if (isLoading) {
    return <section className="flex min-h-[calc(100vh-140px)] items-start justify-center py-12"><div className="w-full max-w-[720px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6"><p>Loading employer profile...</p></div></section>;
  }
  if (error || !profile) {
    return <section className="flex min-h-[calc(100vh-140px)] items-start justify-center py-12"><div className="w-full max-w-[720px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6"><p>Employer profile unavailable.</p></div></section>;
  }
  return <section className="flex min-h-[calc(100vh-140px)] items-start justify-center py-12"><EmployerProfileForm profile={profile} /></section>;
}

export default EmployerProfilePage;
