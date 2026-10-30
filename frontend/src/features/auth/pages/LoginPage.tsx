import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../authApi";
import { useAuth } from "../authContextValue";
import { showErrorAlert, showSuccessAlert } from "../../../shared/utils/alerts";
import { profilePathForRole } from "../authRoutes";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    let isValid = true;

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
    }

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      const userData = await loginUser({
        email: email.trim(),
        password,
      });
      await showSuccessAlert("You are now signed in.", "Login successful");
      setUser(userData);
      navigate(profilePathForRole(userData.role), { replace: true });

    } catch (error) {
      await showErrorAlert(
        error instanceof Error ? error.message : "Unable to log in. Please try again.",
        "Login failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-140px)] items-center justify-center">
      <div className="w-full max-w-[460px] rounded-[28px] border border-slate-400/25 bg-slate-900/90 p-8 shadow-[0_30px_100px_rgb(0_0_0/45%)] max-sm:rounded-[22px] max-sm:p-6">
        <div className="mb-6">
          <p className="m-0 mb-3.5 text-sm font-black uppercase tracking-[.14em] text-sky-400">Welcome back</p>
          <h1>Login to your account</h1>
          <p>Access your HireFlow dashboard.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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
              placeholder="Enter your password"
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <p className="mt-0.5 text-center text-sm text-slate-400">
            Do not have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;