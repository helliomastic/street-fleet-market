
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Car className="h-24 w-24 mx-auto text-brand-blue mb-6" />
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for seems to have taken a detour.
          </p>
          <Button asChild className="bg-brand-blue hover:bg-brand-lightBlue">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
