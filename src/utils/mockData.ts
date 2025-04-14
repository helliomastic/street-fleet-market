
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

  // High-quality car images from Unsplash with reliable URLs
  const brandSpecificImages = {
    "Toyota": [
      "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=500&auto=format",
      "https://images.unsplash.com/photo-1621007690695-b5d6c1068acf?w=500&auto=format",
      "https://images.unsplash.com/photo-1610647752706-3bb12232b3e4?w=500&auto=format"
    ],
    "Honda": [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&auto=format",
      "https://images.unsplash.com/photo-1605816988069-b11383b50717?w=500&auto=format",
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=500&auto=format"
    ],
    "Ford": [
      "https://images.unsplash.com/photo-1551830820-330a71b99659?w=500&auto=format",
      "https://images.unsplash.com/photo-1612394383019-c8fe5e627f86?w=500&auto=format",
      "https://images.unsplash.com/photo-1600661653561-629509783105?w=500&auto=format"
    ],
    "Chevrolet": [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format",
      "https://images.unsplash.com/photo-1622503653138-cfdb63276e46?w=500&auto=format",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=500&auto=format"
    ],
    "BMW": [
      "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=500&auto=format",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&auto=format"
    ],
    "Mercedes-Benz": [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&auto=format",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&auto=format",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format"
    ],
    "Audi": [
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=500&auto=format",
      "https://images.unsplash.com/photo-1542128962-9d50ad7bf014?w=500&auto=format", 
      "https://images.unsplash.com/photo-1606664455838-4836be37e8ee?w=500&auto=format"
    ],
    "Tesla": [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&auto=format",
      "https://images.unsplash.com/photo-1617704548623-340376564e68?w=500&auto=format",
      "https://images.unsplash.com/photo-1554744512-d6c603f27c54?w=500&auto=format"
    ],
    "Volkswagen": [
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format",
      "https://images.unsplash.com/photo-1595229172888-58b7c6875d7c?w=500&auto=format",
      "https://images.unsplash.com/photo-1627454265303-394d6c9f3bab?w=500&auto=format"
    ],
    "Hyundai": [
      "https://images.unsplash.com/photo-1629897048514-3dd7414ebc78?w=500&auto=format",
      "https://images.unsplash.com/photo-1626475350303-bca578623acb?w=500&auto=format",
      "https://images.unsplash.com/photo-1607853234180-3d3c1642be8c?w=500&auto=format"
    ]
  };

  // Fallback images for any car make not covered above
  const genericCarImages = [
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&auto=format",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&auto=format",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format",
    "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500&auto=format",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format",
    "https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=500&auto=format"
  ];

  // Generate unique IDs
  const generateId = () => Math.random().toString(36).substring(2, 15);

  return Array.from({ length: count }, (_, index) => {
    const brandIndex = Math.floor(Math.random() * carBrands.length);
    const { make } = carBrands[brandIndex];
    const modelIndex = Math.floor(Math.random() * carBrands[brandIndex].models.length);
    const model = carBrands[brandIndex].models[modelIndex];
    const year = Math.floor(Math.random() * 10) + (currentYear - 10);
    
    // Select image based on car make
    let carImage;
    if (brandSpecificImages[make]) {
      const brandImages = brandSpecificImages[make];
      const imageIndex = Math.floor(Math.random() * brandImages.length);
      carImage = brandImages[imageIndex];
    } else {
      const imageIndex = Math.floor(Math.random() * genericCarImages.length);
      carImage = genericCarImages[imageIndex];
    }

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
      image: carImage,
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
