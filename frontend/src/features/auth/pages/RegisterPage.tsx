import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../authApi";
import { showErrorAlert, showSuccessAlert } from "../../../shared/utils/alerts";

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [nameError, setNameError] = useState("");
  const [companyNameError, setCompanyNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function handleRoleChange(value: string) {
    setRole(value);

    setNameError("");
    setCompanyNameError("");

    if (value === "EMPLOYEE") {
      setCompanyName("");
    }

    if (value === "EMPLOYER") {
      setFullName("");
    }
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameError("");
    setCompanyNameError("");
    setEmailError("");
    setPasswordError("");
    setRoleError("");
    let isValid = true;

    if (!role) {
      setRoleError("Please select a role.");
      isValid = false;
    }

    if (role === "EMPLOYEE" && !fullName.trim()) {
      setNameError("Full name is required.");
      isValid = false;
    }

    if (role === "EMPLOYER" && !companyName.trim()) {
      setCompanyNameError("Company name is required.");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      await registerUser({
        email: email.trim(),
        password,
        role: role as "EMPLOYEE" | "EMPLOYER",
        displayName: role === "EMPLOYEE" ? fullName.trim() : companyName.trim(),
        fullName: role === "EMPLOYEE" ? fullName.trim() : undefined,
        companyName: role === "EMPLOYER" ? companyName.trim() : undefined,
      });
      await showSuccessAlert(
        "Your account has been created. You can now log in.",
        "Registration successful",
      );
      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      await showErrorAlert(
        error instanceof Error ? error.message : "Unable to register. Please try again.",
        "Registration failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-140px)] items-center justify-center">
      <div className="w-full max-w-[460px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6">
        <div className="mb-6">
          <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Create account</p>
          <h1>Join HireFlow</h1>
          <p>Create an account as an employee or employer.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              value={role}
              onChange={(event) => handleRoleChange(event.target.value)}
            >
              <option value="">Select role</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="EMPLOYER">Employer</option>
            </select>
            {roleError && <p className="m-0 text-[13px] font-bold text-red-400">{roleError}</p>}
          </div>

          {role === "EMPLOYEE" && (
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              {nameError && <p className="m-0 text-[13px] font-bold text-red-400">{nameError}</p>}
            </div>
          )}

          {role === "EMPLOYER" && (
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                type="text"
                placeholder="Your company name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />
              {companyNameError && (
                <p className="m-0 text-[13px] font-bold text-red-400">{companyNameError}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-[7px]">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError && <p className="m-0 text-[13px] font-bold text-red-400">{emailError}</p>}
          </div>

          <div className="flex flex-col gap-[7px]">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {passwordError && <p className="m-0 text-[13px] font-bold text-red-400">{passwordError}</p>}
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100 mt-1 w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>

          <p className="mt-0.5 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;