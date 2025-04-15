
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CarCard, { CarListing } from "@/components/car/CarCard";
import SearchFilters from "@/components/car/SearchFilters";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const HomePage = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const listingsRef = useRef<HTMLDivElement>(null);
  const searchFiltersRef = useRef<any>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const navigate = useNavigate();

  // Memoized function to fetch car listings
  const fetchListings = useCallback(async () => {
    try {
      console.log("Fetching car listings...");
      setLoading(true);
      
      // Fetch cars data first
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (carsError) {
        throw carsError;
      }
      
      console.log("Fetched cars data:", carsData);
      
      // Create a map to store profile information for each user
      const userProfiles: Record<string, any> = {};
      
      // Get unique user IDs
      const userIds = [...new Set(carsData.map(car => car.user_id))];
      
      // If there are user IDs, fetch their profiles
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        } else if (profilesData) {
          // Create a map of user_id to profile data
          profilesData.forEach(profile => {
            userProfiles[profile.id] = profile;
          });
        }
      }
      
      // Map the cars data to our CarListing type, including profile information
      const formattedListings: CarListing[] = carsData.map(car => {
        // Get profile data from our map, or use empty object if not found
        const profile = userProfiles[car.user_id] || {};
        
        return {
          id: car.id,
          title: car.title,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          description: car.description,
          image: car.image_url,
          location: "United States", // Default location
          postedDate: new Date(car.created_at || new Date()),
          userId: car.user_id,
          condition: car.condition,
          sellerName: profile.full_name || profile.username || 'Anonymous',
          createdAt: new Date(car.created_at || new Date()),
        };
      });
      
      console.log("Formatted listings:", formattedListings);
      setListings(formattedListings);
      setFilteredListings(formattedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        variant: "destructive",
        title: "Error loading listings",
        description: "Could not load car listings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        // First get existing listings
        await fetchListings();
        console.log("Initial listings fetch complete");
        
        // Clean up any existing subscription
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        
        // Create a new channel
        const channel = supabase
          .channel('public:cars')
          .on('postgres_changes', { 
            event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public', 
            table: 'cars' 
          }, (payload) => {
            console.log('Car listing change detected:', payload);
            // Immediately fetch updated listings
            fetchListings();
          })
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
          });
        
        // Store channel reference for cleanup
        channelRef.current = channel;
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        // Try again after a delay if there's an error
        setTimeout(() => {
          setupRealtimeSubscription();
        }, 3000);
      }
    };
    
    // Initialize the real-time subscription
    setupRealtimeSubscription();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchListings]);

  const handleFilterChange = (filters: any) => {
    const { searchTerm, make, minYear, maxYear, priceRange } = filters;
    
    const filtered = listings.filter((car) => {
      // Search term filter
      const searchMatch = !searchTerm || 
        car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Make filter
      const makeMatch = make === "All Makes" || car.make === make;
      
      // Year range filter
      const yearMatch = car.year >= minYear && car.year <= maxYear;
      
      // Price range filter
      const priceMatch = car.price >= priceRange[0] && car.price <= priceRange[1];
      
      return searchMatch && makeMatch && yearMatch && priceMatch;
    });
    
    setFilteredListings(filtered);
  };

  // Function to reset filters and scroll to listings
  const resetFiltersAndScroll = () => {
    // Reset filters to defaults by setting filteredListings back to all listings
    setFilteredListings(listings);
    
    // If SearchFilters component exposes a reset method through ref, call it
    if (searchFiltersRef.current && searchFiltersRef.current.resetFilters) {
      searchFiltersRef.current.resetFilters();
    }
    
    // Scroll to listings section
    listingsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToSellCar = () => {
    navigate('/post-car');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-brand-blue rounded-lg p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Find Your Perfect Ride on Street Fleet
            </h1>
            <p className="text-lg mb-6 text-gray-200">
              Browse thousands of cars from trusted sellers. Whether you're looking for a family SUV, 
              a sleek sedan, or a powerful truck, you'll find it here.
            </p>
            <div className="flex gap-4">
              <button 
                className="px-6 py-3 bg-brand-orange rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                onClick={resetFiltersAndScroll}
              >
                Browse Cars
              </button>
              <button 
                className="px-6 py-3 bg-transparent border border-white rounded-lg font-medium hover:bg-white hover:text-brand-blue transition-colors"
                onClick={goToSellCar}
              >
                Sell Your Car
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchFilters 
          onFilterChange={handleFilterChange} 
          ref={searchFiltersRef}
        />

        {/* Results */}
        <div ref={listingsRef}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-full">
                  <Card className="overflow-hidden h-full">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                    <div className="px-4 py-3 bg-gray-50 flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {filteredListings.length} {filteredListings.length === 1 ? "Car" : "Cars"} Available
                </h2>
                <div className="text-sm text-gray-500">
                  Sorted by: Latest
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredListings.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No cars match your search</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
