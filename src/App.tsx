
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import PostCarPage from "./pages/PostCarPage";
import AdminPage from "./pages/AdminPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure resources are loaded before showing the app
    window.addEventListener('load', () => setIsLoaded(true));
    // If already loaded, set to true
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    }
    return () => window.removeEventListener('load', () => setIsLoaded(true));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/post-car" element={<PostCarPage />} />
            <Route path="/edit-car/:id" element={<PostCarPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/car/:id" element={<CarDetailsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
