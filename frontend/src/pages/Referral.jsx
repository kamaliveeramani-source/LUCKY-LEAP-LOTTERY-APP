import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const formatPhone = (value) => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

function Referral() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [friendPhone, setFriendPhone] = useState("");
  const [shareChannel, setShareChannel] = useState("LINK");
  const [referralCode, setReferralCode] = useState("");
  const [referralInfo, setReferralInfo] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const referralLink = useMemo(() => {
    if (!referralInfo?.referralCode) return "";
    return `${window.location.origin}/register?ref=${encodeURIComponent(referralInfo.referralCode)}`;
  }, [referralInfo]);

  const loadReferralInfo = async () => {
    setLoading(true);
    try {
      const response = await API.get("/referral/me");
      const payload = response.data?.data || {};
      setReferralInfo(payload);
      setReferralCode(payload.referralCode || "");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Unable to load referral details.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferralInfo();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = formatPhone(friendPhone);

    if (!normalized) {
      setMessage({ type: "error", text: "Enter the friend's mobile number to continue." });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/referral/create", {
        friendPhone: normalized,
        shareChannel,
        referralCode: referralCode || referralInfo?.referralCode,
      });

      setMessage({
        type: "success",
        text: response.data?.message || "Referral saved successfully.",
      });
      setFriendPhone("");
      await loadReferralInfo();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Unable to save referral.",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setMessage({ type: "success", text: "Referral link copied." });
    } catch (error) {
      setMessage({ type: "error", text: "Copy failed. Please copy the link manually." });
    }
  };

  const shareToWhatsapp = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(`Join me on Thumbi Lotteries using my referral code: ${referralCode || referralInfo?.referralCode}. ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="page-content">
      <div className="home-section-title">
        <div className="section-label">Refer a Friend</div>
        <div className="section-note">Invite a friend and earn ₹250 once they sign up with your code.</div>
      </div>

      {message.text ? (
        <div className={`notice-box ${message.type === "error" ? "error" : "success"}`}>
          {message.text}
        </div>
      ) : null}

      {loading ? (
        <div className="empty-state">Loading referral details...</div>
      ) : (
        <>
          <div className="home-card" style={{ padding: 20 }}>
            <div className="home-card-title">Your referral code</div>
            <div className="home-card-subtitle" style={{ marginTop: 8, fontSize: 14, color: "#7c3aed" }}>
              {referralInfo?.referralCode || "Generating code..."}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-gradient-primary btn-pill" onClick={copyLink} disabled={!referralLink}>
                Copy link
              </button>
              <button type="button" className="btn btn-outline-primary btn-pill" onClick={shareToWhatsapp} disabled={!referralLink}>
                Share on WhatsApp
              </button>
            </div>

            <div style={{ marginTop: 18, fontSize: 12, color: "#64748b" }}>
              {referralLink || "Referral link is being generated."}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="home-card" style={{ padding: 20, marginTop: 18 }}>
            <div className="home-card-title">Add a friend</div>

            <div className="auth-field" style={{ marginTop: 12 }}>
              <label htmlFor="friend-phone">Friend's mobile number</label>
              <input
                id="friend-phone"
                className="auth-input"
                type="tel"
                inputMode="numeric"
                value={friendPhone}
                onChange={(event) => setFriendPhone(event.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="share-channel">How will you share?</label>
              <select
                id="share-channel"
                className="auth-input"
                value={shareChannel}
                onChange={(event) => setShareChannel(event.target.value)}
              >
                <option value="LINK">Share link</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="DIRECT">Direct</option>
              </select>
            </div>

            <button type="submit" className="btn btn-gradient-primary btn-block" disabled={saving}>
              {saving ? "Saving..." : "Save referral"}
            </button>
          </form>

          <div className="home-card" style={{ padding: 20, marginTop: 18 }}>
            <div className="home-card-title">Rewards status</div>
            <div className="home-card-subtitle" style={{ marginTop: 10 }}>
              Reward: ₹{Number(referralInfo?.rewardAmount || 250)} per successful referral
            </div>
            <div className="home-card-subtitle" style={{ marginTop: 6 }}>
              Total referrals: {referralInfo?.totalReferrals || 0}
            </div>
            <div className="home-card-subtitle" style={{ marginTop: 6 }}>
              Successful referrals: {referralInfo?.successfulReferrals || 0}
            </div>
            {Array.isArray(referralInfo?.referrals) && referralInfo.referrals.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                {referralInfo.referrals.map((entry) => (
                  <div key={entry.id} style={{ borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: 10, marginTop: 10 }}>
                    <div style={{ fontWeight: 700 }}>{entry.friendPhone}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {entry.status} • {entry.rewardCredited ? "Reward credited" : "Awaiting eligible sign-up"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: 16 }}>No referrals recorded yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Referral;
