import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useWallet } from "../context/WalletContext";
import { useNotification } from "../context/NotificationContext";
import AppLogo from "../components/AppLogo";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptAge, setAcceptAge] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { refreshWallet } = useWallet();
  const { notify } = useNotification();

  const loginUser = async (e) => {
    e.preventDefault();

    if (!acceptTerms || !acceptAge) {
      notify("warning", "Please accept Terms & Conditions");
      return;
    }

    if (!mobile.trim() || !password) {
      notify("warning", "Please enter your mobile number and password");
      return;
    }

    setSubmitting(true);

    try {
      const res = await API.post("/auth/login", {
        mobile: mobile.trim(),
        password,
      });

      const token = res.data?.token;

      if (!token) {
        throw new Error("Login token was not received");
      }

      // Clear any old login session first
      localStorage.removeItem("token");
      localStorage.removeItem("userName");

      // Save current user's session
      localStorage.setItem("token", token);
      localStorage.setItem(
        "userName",
        res.data?.data?.fullName || res.data?.user?.fullName || "Player"
      );

      await refreshWallet();

      notify("success", "Login Successful");

      // Clear form values before navigating
      setMobile("");
      setPassword("");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);

      notify(
        "error",
        err.response?.data?.message ||
          err.message ||
          "Login Failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <AppLogo className="mb-3" />

          <h1 className="auth-title">Sign In</h1>

          <p className="auth-subtitle">
            Welcome back! Sign in to your Thumbi Lotteries account.
          </p>
        </div>

        <form onSubmit={loginUser} autoComplete="off">
          <div className="auth-field">
            <label htmlFor="login-mobile">Phone Number</label>

            <input
              id="login-mobile"
              name="lottery-login-mobile"
              type="tel"
              inputMode="numeric"
              className="auth-input"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              name="lottery-login-password"
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-check">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              id="terms"
            />

            <label htmlFor="terms">
              I agree to the Terms & Conditions
            </label>
          </div>

          <div className="auth-check">
            <input
              type="checkbox"
              checked={acceptAge}
              onChange={(e) => setAcceptAge(e.target.checked)}
              id="age"
            />

            <label htmlFor="age">
              I confirm I am 18 years or older
            </label>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          New to Thumbi Lotteries?{" "}
          <Link to="/register" className="auth-link">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;