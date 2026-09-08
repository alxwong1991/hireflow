import { useEffect, useState } from "react";
import {
  getEmployeeProfile,
  updateEmployeeProfile,
  amendEmployeeProfile,
} from "../employeeApi";
import type EmployeeProfileResponse from "../types/employeeProfileResponse";

function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfileResponse | null>(null);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdateProfile, setIsUpdateProfile] = useState(false);

  useEffect(() => {
    async function loadEmployeeProfile() {
      try {
        const employeeProfileId = localStorage.getItem("employeeProfileId");

        if (!employeeProfileId) {
          setErrorMessage("No employee profile id found. Please login again.");
          return;
        }

        const data = await getEmployeeProfile(Number(employeeProfileId));

        setProfile(data);

        setPhone(data.phone ?? "");
        setLocation(data.location ?? "");
        setSummary(data.summary ?? "");
      } catch (error) {
        console.error("Failed to load employee profile:", error);
        setErrorMessage("Failed to load employee profile.");
      } finally {
        setIsLoading(false);
      }
    }
    loadEmployeeProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const employeeProfileId = localStorage.getItem("employeeProfileId");
      if (!employeeProfileId) {
        setErrorMessage("No employee profile id found. Please login again.");
        return;
      }

      const updatedPayload = { phone, location, summary };
      let updatedData: EmployeeProfileResponse;

      if (isUpdateProfile) {
        updatedData = await amendEmployeeProfile(Number(employeeProfileId), updatedPayload);
      } else {
        updatedData = await updateEmployeeProfile(Number(employeeProfileId), updatedPayload);
      }

      setProfile(updatedData);
      setIsUpdateProfile(true);
    } catch (error) {
      console.error("Failed to save employee profile:", error);
      setErrorMessage("Failed to save employee profile.");
    }
  };
  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-card">
          <p>Loading employee profile...</p>
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
          <p>No employee profile found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-card">
        <p className="eyebrow">Employee Profile</p>

        <h1 className="profile-title">{profile.fullName}</h1>

        {/* <p className="profile-description">
          This page is currently only reading profile data from the backend.
          Phone, location, and summary are shown as input fields for the next
          update step.
        </p> */}

        <div className="profile-form">
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" value={profile.fullName} disabled />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="text"
              placeholder="Add your phone number later"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
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

          <div className="form-field">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              placeholder="Add your profile summary later"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
            />
          </div>

          <button type="submit" className="primary-button" onClick={handleSaveProfile}>
            Save profile
          </button>
        </div>
      </div>
    </section>
  );
}

export default EmployeeProfilePage;