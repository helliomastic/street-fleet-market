import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, MapPin, User, Mail, Phone, ArrowLeft, Share2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { CarListing } from "@/components/car/CarCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const CarDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [similarCars, setSimilarCars] = useState<CarListing[]>([]);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0,
    }).format(price).replace('NPR', 'Rs');
  };

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        
        if (!id) return;
        
        const { data: carData, error: carError } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .single();
          
        if (carError) {
          console.error("Error fetching car:", carError);
          return;
        }
        
        if (!carData) {
          return;
        }
        
        const formattedCar: CarListing = {
          id: carData.id,
          title: carData.title,
          make: carData.make,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          description: carData.description,
          image: carData.image_url,
          location: "United States",
          postedDate: new Date(carData.created_at || new Date()),
          userId: carData.user_id,
          condition: carData.condition,
          sellerName: 'Anonymous',
          createdAt: new Date(carData.created_at || new Date()),
        };
        
        setCar(formattedCar);
        
        if (carData.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', carData.user_id)
            .single();
            
          if (profileData) {
            setSeller({
              id: profileData.id,
              name: profileData.full_name || 'Anonymous',
              email: 'contact@example.com',
            });
          }
        }
        
        const { data: similarCarsData } = await supabase
          .from('cars')
          .select('*')
          .eq('make', carData.make)
          .neq('id', id)
          .limit(3);
          
        if (similarCarsData) {
          const formattedSimilarCars: CarListing[] = similarCarsData.map(car => ({
            id: car.id,
            title: car.title,
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
            description: car.description,
            image: car.image_url,
            location: "United States",
            postedDate: new Date(car.created_at || new Date()),
            userId: car.user_id,
            condition: car.condition,
            sellerName: 'Anonymous',
            createdAt: new Date(car.created_at || new Date()),
          }));
          setSimilarCars(formattedSimilarCars);
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to contact the seller",
        variant: "destructive",
      });
      setDialogOpen(false);
      navigate("/auth?tab=login");
      return;
    }

    if (!contactMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message for the seller",
        variant: "destructive",
      });
      return;
    }

    if (!car || !seller) {
      toast({
        title: "Error",
        description: "Car or seller information is missing",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          car_id: car.id,
          sender_id: user.id,
          recipient_id: seller.id,
          message: contactMessage,
          read: false
        });

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Message Failed",
          description: "There was an error sending your message. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message Sent!",
          description: "Your message has been sent to the seller.",
          duration: 5000,
        });
        setContactMessage("");
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error in message submission:", error);
      toast({
        title: "Message Failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

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
                {formatPrice(car.price)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <p className="text-gray-500 text-sm">Condition</p>
                    <p className="font-medium">{car.condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Body Style</p>
                    <p className="font-medium">Sedan</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Transmission</p>
                    <p className="font-medium">Automatic</p>
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
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-brand-orange hover:bg-opacity-90 mb-3">
                      Contact Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Contact Seller</DialogTitle>
                      <DialogDescription>
                        Send a message to the seller about {car.title}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">
                          Message
                        </label>
                        <Textarea 
                          id="message" 
                          value={contactMessage} 
                          onChange={(e) => setContactMessage(e.target.value)} 
                          placeholder="I'm interested in this car. Is it still available?" 
                          rows={4} 
                          required 
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={sendingMessage}>
                          {sendingMessage ? 'Sending...' : 'Send Message'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
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

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Similar Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {similarCars.length > 0 ? (
                similarCars.map(similarCar => (
                  <div key={similarCar.id} className="car-card">
                    <div className="relative">
                      {similarCar.image ? (
                        <img
                          src={similarCar.image}
                          alt={`${similarCar.make} ${similarCar.model}`}
                          className="car-card-img"
                        />
                      ) : (
                        <div className="car-card-img bg-gray-200"></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 truncate">{similarCar.title}</h3>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xl font-bold text-brand-blue">
                          {formatPrice(similarCar.price)}
                        </div>
                        <Link
                          to={`/car/${similarCar.id}`}
                          className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-opacity-90 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No similar vehicles found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarDetailsPage;
