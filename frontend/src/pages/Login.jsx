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
      notify("warning", "Please accept Terms & Conditions and confirm your age");
      return;
    }

    setSubmitting(true);

    try {
      const res = await API.post("/auth/login", {
        mobile: mobile.trim(),
        password,
      });

      console.log("Login response:", res.data);

      // Support different backend response structures
      const token =
        res.data?.token ||
        res.data?.accessToken ||
        res.data?.access_token ||
        res.data?.data?.token ||
        res.data?.data?.accessToken ||
        res.data?.data?.access_token;

      if (!token) {
        console.error("Login response did not contain a token:", res.data);
        throw new Error("Login token was not received");
      }

      // Save token
      localStorage.setItem("token", token);

      // Get user information safely
      const user =
        res.data?.user ||
        res.data?.data?.user ||
        res.data?.data ||
        {};

      const userName =
        user?.fullName ||
        user?.name ||
        res.data?.fullName ||
        res.data?.name ||
        "Player";

      localStorage.setItem("userName", userName);

      // Save user ID if backend provides it
      const userId =
        user?.id ||
        user?._id ||
        res.data?.userId ||
        res.data?.data?.userId;

      if (userId) {
        localStorage.setItem("userId", userId.toString());
      }

      // Refresh wallet after token is stored
      try {
        await refreshWallet();
      } catch (walletError) {
        console.warn("Wallet refresh failed:", walletError);
      }

      notify("success", "Login Successful");

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login Failed";

      notify("error", errorMessage);

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

        <form onSubmit={loginUser}>

          <div className="auth-field">
            <label htmlFor="login-mobile">
              Phone Number
            </label>

            <input
              id="login-mobile"
              type="tel"
              className="auth-input"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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