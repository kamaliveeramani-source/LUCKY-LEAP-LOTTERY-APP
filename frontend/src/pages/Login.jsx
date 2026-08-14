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

    setSubmitting(true);

    try {
      const res = await API.post("/auth/login", { mobile, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.data?.fullName || "Player");

      await refreshWallet();

      notify("success", "Login Successful");
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      notify("error", err.response?.data?.message || "Login Failed");
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
          <p className="auth-subtitle">Welcome back! Sign in to your Lucky Leap account.</p>
        </div>

        <form onSubmit={loginUser}>
          <div className="auth-field">
            <label htmlFor="login-mobile">Phone Number</label>
            <input
              id="login-mobile"
              type="text"
              className="auth-input"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <label htmlFor="terms">I agree to the Terms & Conditions</label>
          </div>

          <div className="auth-check">
            <input
              type="checkbox"
              checked={acceptAge}
              onChange={(e) => setAcceptAge(e.target.checked)}
              id="age"
            />
            <label htmlFor="age">I confirm I am 18 years or older</label>
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          New to Lucky Leap?{" "}
          <Link to="/register" className="auth-link">Create Account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
