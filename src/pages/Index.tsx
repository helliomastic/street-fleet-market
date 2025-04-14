
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the home page since that's where we display car listings
    navigate("/");
  }, [navigate]);
  
  return null; // No need to render anything as we're redirecting
};

export default Index;
