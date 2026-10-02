import { Link } from "react-router-dom";
import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log("Login form submitted:", {
      email,
      password,
    });

    // Backend integration will be added in the next step.
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-[7px]">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <button type="submit" className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[14px] bg-linear-to-br from-blue-600 to-teal-500 px-[22px] font-black text-white shadow-[0_16px_40px_rgb(37_99_235/35%)] transition duration-200 hover:-translate-y-px hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65 disabled:transform-none disabled:brightness-100 mt-1 w-full">
        Login
      </button>

      <p className="mt-0.5 text-center text-sm text-slate-400">
        Not a user?{" "}
        <Link to="/register">
          Register
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;