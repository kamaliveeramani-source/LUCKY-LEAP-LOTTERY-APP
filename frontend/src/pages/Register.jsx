import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useWallet } from "../context/WalletContext";
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

  const { refreshWallet } = useWallet();

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
      const res = await API.post("/auth/register", {
        fullName: trimmedName,
        age: ageNumber,
        gender,
        mobile,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.data?.fullName || "Player");

      await refreshWallet();

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <AppLogo />
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Sign up to start playing and managing your lottery entries.</p>
        </div>

        {error ? <div className="auth-error" role="alert">{error}</div> : null}

        <form onSubmit={handleRegister}>
          <div className="auth-field">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="reg-age">Age</label>
              <input
                id="reg-age"
                type="number"
                className="auth-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="18+"
                min="18"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-gender">Gender</label>
              <select
                id="reg-gender"
                className="auth-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-mobile">Mobile Number</label>
            <input
              id="reg-mobile"
              type="tel"
              className="auth-input"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your mobile number"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email ID</label>
            <input
              id="reg-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-confirm">Retype Password</label>
            <input
              id="reg-confirm"
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <button type="button" className="auth-link" onClick={() => navigate("/login")}>Sign In</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
