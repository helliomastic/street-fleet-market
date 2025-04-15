
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PostCarPage from "./pages/PostCarPage";
import AdminPage from "./pages/AdminPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
// New pages
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set to true immediately to prevent long loading screens
    setIsLoaded(true);
    
    // Also listen for window load event as a fallback
    const handleLoad = () => setIsLoaded(true);
    window.addEventListener('load', handleLoad);
    
    // If already loaded, set to true
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    }
    
    return () => window.removeEventListener('load', handleLoad);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-brand-blue border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Street Fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/post-car" element={<PostCarPage />} />
              <Route path="/edit-car/:id" element={<PostCarPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/car/:id" element={<CarDetailsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
