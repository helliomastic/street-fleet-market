
import { Link } from "react-router-dom";
import { Car, Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-brand-blue text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-6 w-6 text-brand-orange" />
              <span className="font-bold text-xl">Street Fleet</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              The premier marketplace for buying and selling vehicles. Find your dream car or sell your current ride with ease.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/post-car" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Post a Car
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-lg">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Sedans
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                  SUVs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Trucks
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Luxury Cars
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-brand-orange transition-colors">
                  Electric Vehicles
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-brand-orange" />
                <span className="text-gray-300">contact@streetfleet.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-brand-orange" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Street Fleet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
