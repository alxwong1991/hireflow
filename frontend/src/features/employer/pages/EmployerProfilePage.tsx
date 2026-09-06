import { useEffect, useState } from "react";
import {
  getEmployerProfile,
  type EmployerProfileResponse,
} from "../employerApi";

function EmployerProfilePage() {
  const [profile, setProfile] = useState<EmployerProfileResponse | null>(null);
  const [companyDescription, setCompanyDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadEmployerProfile() {
      try {
        const employerProfileId = localStorage.getItem("employerProfileId");

        if (!employerProfileId) {
          setErrorMessage("No employer profile id found. Please login again.");
          return;
        }

        const data = await getEmployerProfile(Number(employerProfileId));

        setProfile(data);

        setCompanyDescription(data.companyDescription ?? "");
        setWebsite(data.website ?? "");
        setLocation(data.location ?? "");
      } catch (error) {
        console.error("Failed to load employer profile:", error);
        setErrorMessage("Failed to load employer profile.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEmployerProfile();
  }, []);

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <p>Loading employer profile...</p>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <p className="form-error">{errorMessage}</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <p>No employer profile found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-card">
        <p className="eyebrow">Employer Profile</p>

        <h1 className="profile-title">{profile.companyName}</h1>

        <p className="profile-description">
          This page is currently only reading profile data from the backend.
          Company description, website, and location are shown as input fields for the next
          update step.
        </p>

        <div className="profile-form">
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" value={profile.companyName} disabled />
          </div>

          <div className="form-field">
            <label htmlFor="companyDescription">Company Description</label>
            <textarea
              id="companyDescription"
              placeholder="Add your company description later"
              value={companyDescription}
              onChange={(event) => setCompanyDescription(event.target.value)}
              rows={4}
            />
          </div>

          <div className="form-field">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              type="text"
              placeholder="Add your website later"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              placeholder="Add your location later"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <button type="button" className="primary-button" disabled>
            Save profile later
          </button>
        </div>
      </div>
    </section>
  );
}

export default EmployerProfilePage;