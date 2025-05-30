import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

const SearchFilters = forwardRef<any, SearchFiltersProps>(({ onFilterChange }, ref) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [make, setMake] = useState("All Makes");
  const [minYear, setMinYear] = useState(2000);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());
  const [priceRange, setPriceRange] = useState([0, 5000000]); // Updated to Rs 50 lakhs max

  const resetFilters = () => {
    setSearchTerm("");
    setMake("All Makes");
    setMinYear(2000);
    setMaxYear(new Date().getFullYear());
    setPriceRange([0, 5000000]);
    
    // Apply the reset filters
    onFilterChange({
      searchTerm: "",
      make: "All Makes",
      minYear: 2000,
      maxYear: new Date().getFullYear(),
      priceRange: [0, 5000000]
    });
  };

  useImperativeHandle(ref, () => ({
    resetFilters
  }));

  // Apply filters whenever any filter changes
  const applyFilters = (newFilters: any = {}) => {
    const filters = {
      searchTerm: newFilters.searchTerm !== undefined ? newFilters.searchTerm : searchTerm,
      make: newFilters.make !== undefined ? newFilters.make : make,
      minYear: newFilters.minYear !== undefined ? newFilters.minYear : minYear,
      maxYear: newFilters.maxYear !== undefined ? newFilters.maxYear : maxYear,
      priceRange: newFilters.priceRange !== undefined ? newFilters.priceRange : priceRange,
    };
    onFilterChange(filters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    applyFilters({ searchTerm: value });
  };

  const handleMakeChange = (value: string) => {
    setMake(value);
    applyFilters({ make: value });
  };

  const handleYearChange = (type: 'min' | 'max', value: string) => {
    const year = parseInt(value);
    if (type === 'min') {
      setMinYear(year);
      applyFilters({ minYear: year });
    } else {
      setMaxYear(year);
      applyFilters({ maxYear: year });
    }
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    applyFilters({ priceRange: value });
  };

  // Format price in Nepali Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      maximumFractionDigits: 0,
    }).format(price).replace('NPR', 'Rs');
  };

  const carMakes = [
    "All Makes", "Toyota", "Honda", "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", 
    "Ford", "Chevrolet", "Volkswagen", "BMW", "Mercedes-Benz", "Audi"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              type="text"
              placeholder="Search cars..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Make */}
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Select value={make} onValueChange={handleMakeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              {carMakes.map((carMake) => (
                <SelectItem key={carMake} value={carMake}>
                  {carMake}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Range */}
        <div className="space-y-2">
          <Label>Year Range</Label>
          <div className="flex space-x-2">
            <Select value={minYear.toString()} onValueChange={(value) => handleYearChange('min', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={maxYear.toString()} onValueChange={(value) => handleYearChange('max', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="space-y-2 flex flex-col justify-end">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</Label>
        <Slider
          value={priceRange}
          onValueChange={handlePriceRangeChange}
          max={5000000}
          min={0}
          step={50000}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Rs 0</span>
          <span>Rs 50,00,000</span>
        </div>
      </div>
    </div>
  );
});

SearchFilters.displayName = "SearchFilters";

export default SearchFilters;
