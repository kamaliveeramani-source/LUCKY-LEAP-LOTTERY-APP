import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLogo from "../components/AppLogo";

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = fullName.trim();
    const ageNumber = Number(age);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10,15}$/;

    if (!trimmedName || !age || !gender || !mobile || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (ageNumber < 18) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!mobileRegex.test(mobile)) {
      setError("Please enter a valid mobile number (10-15 digits).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        fullName: trimmedName,
        age: ageNumber,
        gender,
        mobile,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.data?.fullName || "Player");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="page-content d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="card-panel card-panel-strong" style={{ width: "100%", maxWidth: "520px", padding: "36px", borderRadius: "24px", color: "var(--text)" }}>
          <div className="text-center mb-4">
            <AppLogo />
            <h1 className="mt-3" style={{ fontWeight: "bold" }}>Create Account</h1>
            <p className="text-muted">Sign up to start playing and managing your lottery entries.</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  min="18"
                />
              </div>

              <div className="col-md-8">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Mobile Number</label>
              <input
                type="tel"
                className="form-control"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email ID</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Retype Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            <button
              type="submit"
              className="btn w-100"
              style={{
                background: "var(--accent)",
                color: "var(--text-secondary)",
                fontWeight: "bold",
                height: "50px",
                borderRadius: "12px",
                border: "1px solid transparent",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)"
              }}
              disabled={submitting}
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span style={{ color: "var(--text-muted)" }}>Already have an account? </span>
            <button type="button" className="btn btn-link p-0" style={{ color: "var(--accent)" }} onClick={() => navigate("/login")}>Sign In</button>
          </div>
        </div>
      </div>
  );
}

export default Register;
