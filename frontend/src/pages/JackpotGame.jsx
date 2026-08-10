import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function JackpotGame() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/my-games", { replace: true });
  }, [navigate]);

  return (
    <div className="page-content" style={{ textAlign: "center", paddingTop: "48px" }}>
      <p className="text-muted">Redirecting to games...</p>
    </div>
  );
}

export default JackpotGame;
