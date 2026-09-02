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
      notify(
        "warning",
        "Please accept the Terms & Conditions and confirm that you are 18 years or older"
      );
      return;
    }

    if (!mobile.trim() || !password) {
      notify("error", "Please enter your phone number and password");
      return;
    }

    setSubmitting(true);

    try {
      console.log("[LOGIN] Sending login request...");

      const response = await API.post("/auth/login", {
        mobile: mobile.trim(),
        password,
      });

      console.log("[LOGIN] Full response:", response);
      console.log("[LOGIN] Response data:", response.data);

      const responseData = response?.data;

      // Support different possible backend response structures
      const token =
        responseData?.token ||
        responseData?.accessToken ||
        responseData?.data?.token ||
        responseData?.data?.accessToken ||
        null;

      console.log("[LOGIN] Token received:", !!token);

      if (!token || typeof token !== "string") {
        console.error(
          "[LOGIN] Token missing. Actual API response:",
          responseData
        );

        throw new Error("Login token was not received");
      }

      localStorage.setItem("token", token);

      const user =
        responseData?.data?.user ||
        responseData?.data ||
        responseData?.user ||
        null;

      localStorage.setItem(
        "userName",
        user?.fullName ||
          user?.name ||
          responseData?.fullName ||
          "Player"
      );

      console.log("[LOGIN] Token saved successfully");

      // Refresh wallet, but don't fail login if wallet refresh has an issue
      try {
        await refreshWallet();
      } catch (walletError) {
        console.warn(
          "[LOGIN] Wallet refresh failed, continuing login:",
          walletError
        );
      }

      notify("success", "Login Successful");

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("[LOGIN] Login error:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login Failed";

      notify("error", message);

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
              type="text"
              className="auth-input"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="tel"
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
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />

            <label htmlFor="terms">
              I agree to the Terms & Conditions
            </label>
          </div>

          <div className="auth-check">
            <input
              type="checkbox"
              id="age"
              checked={acceptAge}
              onChange={(e) => setAcceptAge(e.target.checked)}
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