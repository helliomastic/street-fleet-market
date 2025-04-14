
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Car, User, LogOut, Settings, PlusSquare
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Temporary auth state until Supabase integration
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  // This will be replaced with actual Supabase auth logic
  const login = () => {
    setIsLoggedIn(true);
    setUser({ name: "John Doe" });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
  };

  return { isLoggedIn, isAdmin, user, login, logout, toggleAdmin };
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, user, login, logout, toggleAdmin } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/");
  };

  // Temporary login function for demo purposes
  const handleLogin = () => {
    login();
    toast({
      title: "Logged in successfully",
      description: "Welcome back to Street Fleet Market!",
    });
  };

  return (
    <nav className="bg-brand-blue text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-brand-orange" />
            <span className="font-bold text-xl">Street Fleet</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center space-x-6">
              <Link to="/" className="hover:text-brand-orange transition-colors">
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link to="/dashboard" className="hover:text-brand-orange transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/post-car" className="hover:text-brand-orange transition-colors">
                    Post a Car
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="hover:text-brand-orange transition-colors">
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </div>
          )}

          {/* Auth buttons or user menu */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 bg-brand-orange">
                    <span className="font-bold">{user?.name.charAt(0)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.name}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/post-car" className="cursor-pointer flex items-center">
                      <PlusSquare className="mr-2 h-4 w-4" />
                      <span>Post a Car</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleAdmin} className="cursor-pointer">
                    <span>{isAdmin ? "Disable Admin" : "Enable Admin"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-brand-blue">
                  Sign Up
                </Button>
                <Button onClick={handleLogin} className="bg-brand-orange hover:bg-opacity-90">
                  Log In
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && isMenuOpen && (
          <div className="pt-4 pb-3 border-t border-brand-lightBlue mt-3 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="hover:text-brand-orange transition-colors">
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link to="/dashboard" className="hover:text-brand-orange transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/post-car" className="hover:text-brand-orange transition-colors">
                    Post a Car
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="hover:text-brand-orange transition-colors">
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
