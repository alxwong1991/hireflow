import { Link } from "react-router-dom";
import { useState } from "react";

type Role = "EMPLOYEE" | "EMPLOYER";

function RegisterForm() {
  const [role, setRole] = useState<Role>("EMPLOYEE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData =
      role === "EMPLOYEE"
        ? {
            role,
            email,
            password,
            fullName,
          }
        : {
            role,
            email,
            password,
            companyName,
          };

    console.log("Register form submitted:", formData);

    // Backend integration will be added in the next step.
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="register-role">Account Type</label>
        <select
          id="register-role"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="EMPLOYER">Employer</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      {role === "EMPLOYEE" && (
        <div className="form-field">
          <label htmlFor="register-full-name">Full Name</label>
          <input
            id="register-full-name"
            type="text"
            placeholder="John Employee"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
      )}

      {role === "EMPLOYER" && (
        <div className="form-field">
          <label htmlFor="register-company-name">Company Name</label>
          <input
            id="register-company-name"
            type="text"
            placeholder="Acme Corporation"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            required
          />
        </div>
      )}

      <button type="submit" className="primary-button full-width">
        Create Account
      </button>

      <p className="auth-switch-text">
        Already have an account?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;