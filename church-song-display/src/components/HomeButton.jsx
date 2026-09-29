import { useNavigate } from "react-router-dom";

export default function HomeButton() {
  const navigate = useNavigate();

  return (
    <button type="button" className="home-button" onClick={() => navigate("/")}>
      ← Home
    </button>
  );
}
