
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, MapPin, User, Mail, Phone, ArrowLeft, Share2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { CarListing } from "@/components/car/CarCard";
import { mockListings, mockUsers } from "@/utils/mockData";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CarDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const carData = mockListings.find(car => car.id === id);
        if (carData) {
          setCar(carData);
          // Find the seller
          const userData = mockUsers.find(user => user.id === carData.userId);
          setSeller(userData);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg mb-8" />
            <div className="h-10 bg-gray-200 animate-pulse rounded mb-4 w-3/4" />
            <div className="h-6 bg-gray-200 animate-pulse rounded mb-8 w-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2 space-y-4">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
              </div>
              <div className="col-span-1">
                <div className="bg-gray-200 animate-pulse rounded-lg h-64" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Car Not Found</h1>
            <p className="text-gray-600 mb-8">
              The car listing you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/?make=${car.make}`}>{car.make}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/?model=${car.model}`}>{car.model}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{car.title}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Car Image */}
          <div className="mb-8 rounded-lg overflow-hidden h-96 bg-gray-100 flex items-center justify-center">
            {car.image ? (
              <img 
                src={car.image} 
                alt={car.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="text-gray-400">No image available</div>
            )}
          </div>

          {/* Car Info Header */}
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{car.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Year: {car.year}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Location: San Francisco, CA</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>Posted by: {seller?.name || "Unknown"}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-3xl font-bold text-brand-blue flex items-center">
                <DollarSign className="h-6 w-6" />
                {car.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Car Details */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Car Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-gray-500 text-sm">Make</p>
                    <p className="font-medium">{car.make}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Model</p>
                    <p className="font-medium">{car.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Year</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Body Style</p>
                    <p className="font-medium">Sedan</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Transmission</p>
                    <p className="font-medium">Automatic</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Fuel Type</p>
                    <p className="font-medium">Gasoline</p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 mb-4">{car.description}</p>

                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5 text-gray-700">
                  <li>Air Conditioning</li>
                  <li>Power Windows</li>
                  <li>Power Steering</li>
                  <li>Anti-lock Braking System</li>
                  <li>Driver Airbag</li>
                  <li>Passenger Airbag</li>
                  <li>Automatic Climate Control</li>
                  <li>Premium Sound System</li>
                </ul>
              </div>
            </div>

            {/* Seller Info */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-brand-blue text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                    {seller?.name.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-semibold">{seller?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">Member since April 2023</p>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{seller?.email || "Not available"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span>(555) 123-4567</span>
                  </div>
                </div>
                <Button className="w-full bg-brand-orange hover:bg-opacity-90 mb-3">
                  Contact Seller
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Listing
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Safety Tips</h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Meet in a public place for viewing</li>
                  <li>• Test drive with the owner present</li>
                  <li>• Verify vehicle history before purchase</li>
                  <li>• Check for liens before payment</li>
                  <li>• Consider a mechanic inspection</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Similar Listings */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Similar Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mockListings
                .filter(listing => listing.id !== car.id && listing.make === car.make)
                .slice(0, 3)
                .map(car => (
                  <div key={car.id} className="car-card">
                    <div className="relative">
                      {car.image ? (
                        <img
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          className="car-card-img"
                        />
                      ) : (
                        <div className="car-card-img bg-gray-200"></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 truncate">{car.title}</h3>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xl font-bold text-brand-blue">
                          ${car.price.toLocaleString()}
                        </div>
                        <Link
                          to={`/car/${car.id}`}
                          className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-opacity-90 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarDetailsPage;
