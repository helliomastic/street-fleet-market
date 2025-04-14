
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import CarCard, { CarListing } from "@/components/car/CarCard";
import SearchFilters from "@/components/car/SearchFilters";
import { supabase } from "@/integrations/supabase/client";

const HomePage = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch car listings from Supabase
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        // Fetch car listings from Supabase
        const { data, error } = await supabase
          .from('cars')
          .select('*, profiles(*)')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Convert the data to match our CarListing type
        const formattedListings: CarListing[] = data.map(car => ({
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
          sellerName: car.profiles?.full_name || 'Anonymous',
          createdAt: car.created_at ? new Date(car.created_at) : new Date(),
        }));
        
        setListings(formattedListings);
        setFilteredListings(formattedListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

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
              <button className="px-6 py-3 bg-brand-orange rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                Browse Cars
              </button>
              <button className="px-6 py-3 bg-transparent border border-white rounded-lg font-medium hover:bg-white hover:text-brand-blue transition-colors">
                Sell Your Car
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchFilters onFilterChange={handleFilterChange} />

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="car-card animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
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
    </Layout>
  );
};

export default HomePage;
