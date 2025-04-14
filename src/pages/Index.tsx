
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the home page since that's where we display car listings
    navigate("/", { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-brand-blue border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to homepage...</p>
      </div>
    </div>
  );
};

export default Index;
