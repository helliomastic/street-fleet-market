
import { CarListing } from "@/components/car/CarCard";

// Generate random price between min and max
const randomPrice = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Generate mock car listings data
export const generateMockListings = (count: number): CarListing[] => {
  const currentYear = new Date().getFullYear();
  const carBrands = [
    { make: "Toyota", models: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma"] },
    { make: "Honda", models: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey"] },
    { make: "Ford", models: ["F-150", "Escape", "Explorer", "Mustang", "Bronco"] },
    { make: "Chevrolet", models: ["Silverado", "Equinox", "Malibu", "Tahoe", "Suburban"] },
    { make: "BMW", models: ["3 Series", "5 Series", "X3", "X5", "7 Series"] },
    { make: "Mercedes-Benz", models: ["C-Class", "E-Class", "GLC", "GLE", "S-Class"] },
    { make: "Audi", models: ["A4", "A6", "Q5", "Q7", "A8"] },
    { make: "Tesla", models: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"] },
    { make: "Volkswagen", models: ["Jetta", "Passat", "Tiguan", "Atlas", "Golf"] },
    { make: "Hyundai", models: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade"] }
  ];

  const conditions = ["Excellent", "Good", "Fair", "Like New"];
  const colors = ["Black", "White", "Silver", "Blue", "Red", "Gray"];
  const transmissions = ["Automatic", "Manual"];
  const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid"];

  // Image URLs (using placeholder images but in a real app would use Supabase Storage)
  const imageUrls = [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000",
    "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1000",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000",
    "https://images.unsplash.com/photo-1617814076668-8dfc6fe159ed?q=80&w=1000"
  ];

  // Generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 15);

  return Array.from({ length: count }, (_, index) => {
    const brandIndex = Math.floor(Math.random() * carBrands.length);
    const { make } = carBrands[brandIndex];
    const modelIndex = Math.floor(Math.random() * carBrands[brandIndex].models.length);
    const model = carBrands[brandIndex].models[modelIndex];
    const year = Math.floor(Math.random() * 10) + (currentYear - 10);
    const imageIndex = Math.floor(Math.random() * imageUrls.length);

    // Generate a descriptive title
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const transmission = transmissions[Math.floor(Math.random() * transmissions.length)];
    const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];

    const title = `${year} ${make} ${model} - ${color}`;
    
    const priceBase = make === "Tesla" || make === "BMW" || make === "Mercedes-Benz" || make === "Audi" 
      ? randomPrice(40000, 90000) 
      : randomPrice(15000, 40000);
    
    // Adjust price based on year
    const ageAdjustment = (currentYear - year) * 1000;
    const price = Math.max(5000, priceBase - ageAdjustment);

    // Generate detailed description
    const description = `This ${year} ${make} ${model} is in ${condition.toLowerCase()} condition. It features a ${color.toLowerCase()} exterior, ${transmission.toLowerCase()} transmission, and runs on ${fuelType.toLowerCase()} fuel. The car has been well-maintained and is ready for its new owner. Features include air conditioning, power windows, and a premium sound system.`;

    return {
      id: generateId(),
      title,
      price,
      make,
      model,
      year,
      image: imageUrls[imageIndex],
      description,
      userId: "user-" + (index % 5), // Distribute cars among 5 mock users
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    };
  });
};

// Mock user data
export const mockUsers = [
  { id: "user-0", name: "John Doe", email: "john@example.com", isAdmin: true },
  { id: "user-1", name: "Jane Smith", email: "jane@example.com", isAdmin: false },
  { id: "user-2", name: "Bob Johnson", email: "bob@example.com", isAdmin: false },
  { id: "user-3", name: "Alice Brown", email: "alice@example.com", isAdmin: false },
  { id: "user-4", name: "Sam Wilson", email: "sam@example.com", isAdmin: false }
];

// Generate mock data
export const mockListings = generateMockListings(24);
