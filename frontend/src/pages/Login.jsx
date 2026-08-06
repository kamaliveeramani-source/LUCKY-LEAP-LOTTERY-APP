import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLogo from "../components/AppLogo";

function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptAge, setAcceptAge] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();

    if (!acceptTerms || !acceptAge) {
      alert("Please accept Terms & Conditions");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          mobile,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.data?.fullName || "Player");

      alert("Login Successful");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
      <div className="page-content d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="card-panel card-panel-strong" style={{ width: "100%", maxWidth: "420px", padding: "40px", borderRadius: "20px", color: "var(--text)" }}>
          <div className="text-center">
            <AppLogo className="mb-3" />

            <h1
              className="mt-4"
              style={{
                fontWeight: "bold",
              }}
            >
              Sign In
            </h1>

            <p className="text-muted">
              Welcome back! Sign in to your Lucky Leap account.
            </p>

          </div>

          <form onSubmit={loginUser}>

            <label className="mb-2">Phone Number</label>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              style={{
                background: "var(--input-bg)",
                color: "var(--text)",
                border: "1px solid var(--input-border)",
                height: "50px",
              }}
            />

            <label className="mb-2">Password</label>

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: "var(--input-bg)",
                color: "var(--text)",
                border: "1px solid var(--input-border)",
                height: "50px",
              }}
            />

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              id="terms"
            />

            <label className="form-check-label" htmlFor="terms">
              I agree to the Terms & Conditions
            </label>
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              checked={acceptAge}
              onChange={(e) => setAcceptAge(e.target.checked)}
              id="age"
            />

            <label className="form-check-label" htmlFor="age">
              I confirm I am 18 years or older
            </label>
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{
              background: "var(--accent)",
              color: "var(--text-secondary)",
              fontWeight: "bold",
              height: "50px",
              borderRadius: "10px",
              border: "1px solid transparent",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)"
            }}
          >
            Sign In
          </button>
        </form>

        <div className="text-center mt-4">
          <span style={{ color: "var(--text-muted)" }}>
              New to Lucky Leap?{" "}
          </span>
          <a
            href="/register"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;