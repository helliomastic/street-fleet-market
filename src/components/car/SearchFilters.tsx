
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock data for filters - will be replaced with actual data from Supabase
const MOCK_MAKES = [
  "All Makes", "Audi", "BMW", "Chevrolet", "Dodge", "Ford", "Honda", "Hyundai", 
  "Jeep", "Kia", "Lexus", "Mazda", "Mercedes-Benz", "Nissan", "Tesla", "Toyota", "Volkswagen"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
  const isMobile = useIsMobile();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    make: "All Makes",
    minYear: CURRENT_YEAR - 15,
    maxYear: CURRENT_YEAR,
    priceRange: [5000, 50000] as [number, number]
  });

  // Apply filters when they change
  useEffect(() => {
    onFilterChange({ searchTerm, ...filters });
  }, [searchTerm, filters, onFilterChange]);

  const handlePriceChange = (value: number[]) => {
    setFilters({
      ...filters,
      priceRange: value as [number, number]
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilters({
      make: "All Makes",
      minYear: CURRENT_YEAR - 15,
      maxYear: CURRENT_YEAR,
      priceRange: [5000, 50000]
    });
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Make</Label>
        <Select
          value={filters.make}
          onValueChange={(value) => setFilters({ ...filters, make: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select make" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {MOCK_MAKES.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Min Year</Label>
        <Select
          value={filters.minYear.toString()}
          onValueChange={(value) => 
            setFilters({ 
              ...filters, 
              minYear: parseInt(value),
              maxYear: Math.max(parseInt(value), filters.maxYear) 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Min Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {YEAR_RANGE.map((year) => (
                <SelectItem key={`min-${year}`} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Max Year</Label>
        <Select
          value={filters.maxYear.toString()}
          onValueChange={(value) => 
            setFilters({ 
              ...filters, 
              maxYear: parseInt(value),
              minYear: Math.min(parseInt(value), filters.minYear) 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Max Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {YEAR_RANGE.map((year) => (
                <SelectItem key={`max-${year}`} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>Price Range</Label>
          <span className="text-sm text-muted-foreground">
            ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          defaultValue={filters.priceRange}
          min={0}
          max={100000}
          step={1000}
          value={filters.priceRange}
          onValueChange={handlePriceChange}
        />
      </div>

      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleReset}
      >
        <X className="h-4 w-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, make, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {isMobile ? (
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-grow">
              <Select
                value={filters.make}
                onValueChange={(value) => setFilters({ ...filters, make: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {MOCK_MAKES.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={filters.minYear.toString()}
                onValueChange={(value) => 
                  setFilters({ 
                    ...filters, 
                    minYear: parseInt(value),
                    maxYear: Math.max(parseInt(value), filters.maxYear) 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {YEAR_RANGE.map((year) => (
                      <SelectItem key={`min-${year}`} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="relative px-3 py-2 border rounded-md flex items-center text-sm">
                <span className="text-gray-500">
                  ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                </span>
              </div>

              <Button variant="outline" onClick={handleReset} className="whitespace-nowrap">
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
