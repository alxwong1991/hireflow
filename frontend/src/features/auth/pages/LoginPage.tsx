import { SubmitEvent, useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../authApi";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setSubmitError("");
    setSubmitSuccess("");

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

      const data = await loginUser({
        email: email.trim(),
        password,
      });

      console.log("Login success:", data);

      setSubmitSuccess("Login successful.");

      // Later we will store the token and redirect the user.
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="eyebrow">Welcome back</p>
          <h1>Login to your account</h1>
          <p>Access your HireFlow dashboard.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              placeholder="Enter your password"
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <p className="auth-switch-text">
            Do not have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;