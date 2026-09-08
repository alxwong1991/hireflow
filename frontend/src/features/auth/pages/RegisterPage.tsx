import { SubmitEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { registerUser } from "../authApi";

function RegisterPage() {
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

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
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
    setSubmitError("");
    setSubmitSuccess("");

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

    // try {
    //   setIsSubmitting(true);
    //   const data = await registerUser({
    //     email: email.trim(),
    //     password,
    //     role,

        
    //     // For navbar/login display name
    //     displayName:role === "EMPLOYEE" ? fullName.trim() : companyName.trim(),

    //     // Role-specific fields
    //     // fullName: role === "EMPLOYEE" ? fullName.trim() : null,
    //     // companyName: role === "EMPLOYER" ? companyName.trim() : null,
    //   });

    //   console.log("Registration success:", data);

    //   setSubmitSuccess("Account created successfully. You can now log in.");

    //   setFullName("");
    //   setCompanyName("");
    //   setEmail("");
    //   setPassword("");
    //   setRole("");
    //   window.location.href = "/login";
    // } catch (error) {
    //   if (error instanceof Error) {
    //     setSubmitError(error.message);
    //   } else {
    //     setSubmitError("Something went wrong. Please try again.");
    //   }
    // } finally {
    //   setIsSubmitting(false);
    // }

    try {
      setIsSubmitting(true);
      const userData = await registerUser({
        email: email.trim(),
        password,
        role: role as "EMPLOYEE" | "EMPLOYER",
        displayName: role === "EMPLOYEE" ? fullName.trim() : companyName.trim(),
        fullName: role === "EMPLOYEE" ? fullName.trim() : undefined,
        companyName: role === "EMPLOYER" ? companyName.trim() : undefined,
      });
      console.log("Registration success:", userData);
      setSubmitSuccess("Account created successfully. You can now log in.");
      setFullName("");
      setCompanyName("");
      setEmail("");
      setPassword("");
      setRole("");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Create account</p>
          <h1>Join HireFlow</h1>
          <p>Create an account as an employee or employer.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
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
            {roleError && <p className="form-error">{roleError}</p>}
          </div>

          {role === "EMPLOYEE" && (
            <div className="form-field">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              {nameError && <p className="form-error">{nameError}</p>}
            </div>
          )}

          {role === "EMPLOYER" && (
            <div className="form-field">
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                type="text"
                placeholder="Your company name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />
              {companyNameError && (
                <p className="form-error">{companyNameError}</p>
              )}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError && <p className="form-error">{emailError}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {passwordError && <p className="form-error">{passwordError}</p>}
          </div>

          {submitError && <p className="form-alert error-alert">{submitError}</p>}

          {submitSuccess && (
            <p className="form-alert success-alert">{submitSuccess}</p>
          )}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Register"}
          </button>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;