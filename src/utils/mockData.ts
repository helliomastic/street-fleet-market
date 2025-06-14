
import { CarListing } from "@/components/car/CarCard";

export const mockCarListings: CarListing[] = [
  {
    id: "1",
    title: "2018 Honda Civic LX",
    price: 1800000,
    make: "Honda",
    model: "Civic",
    year: 2018,
    image: "/placeholder.svg",
    description: "Excellent condition, low mileage, well maintained.",
    userId: "user1",
    location: "New York",
    postedDate: new Date("2024-01-15"),
    condition: "excellent",
    fuelType: "petrol",
    sellerName: "John Doe",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "2020 Tesla Model 3",
    price: 4500000,
    make: "Tesla",
    model: "Model 3",
    year: 2020,
    image: "/placeholder.svg",
    description: "Electric vehicle with autopilot, great for eco-friendly driving.",
    userId: "user2",
    location: "California",
    postedDate: new Date("2024-01-20"),
    condition: "like_new",
    fuelType: "electric",
    sellerName: "Jane Smith",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    title: "2017 Toyota Corolla",
    price: 1500000,
    make: "Toyota",
    model: "Corolla",
    year: 2017,
    image: "/placeholder.svg",
    description: "Reliable and fuel efficient, perfect for daily commuting.",
    userId: "user3",
    location: "Texas",
    postedDate: new Date("2024-01-25"),
    condition: "good",
    fuelType: "petrol",
    sellerName: "Mike Johnson",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "4",
    title: "2019 BMW 3 Series",
    price: 3200000,
    make: "BMW",
    model: "3 Series",
    year: 2019,
    image: "/placeholder.svg",
    description: "Luxury sedan with premium features and excellent performance.",
    userId: "user4",
    location: "Florida",
    postedDate: new Date("2024-02-01"),
    condition: "excellent",
    fuelType: "diesel",
    sellerName: "Sarah Wilson",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "5",
    title: "2016 Ford F-150",
    price: 2800000,
    make: "Ford",
    model: "F-150",
    year: 2016,
    image: "/placeholder.svg",
    description: "Powerful pickup truck, great for work and recreation.",
    userId: "user5",
    location: "Colorado",
    postedDate: new Date("2024-02-05"),
    condition: "good",
    fuelType: "petrol",
    sellerName: "David Brown",
    createdAt: new Date("2024-02-05"),
  },
  {
    id: "6",
    title: "2021 Hyundai Elantra",
    price: 2200000,
    make: "Hyundai",
    model: "Elantra",
    year: 2021,
    image: "/placeholder.svg",
    description: "Modern compact car with advanced safety features.",
    userId: "user6",
    location: "Washington",
    postedDate: new Date("2024-02-10"),
    condition: "new",
    fuelType: "petrol",
    sellerName: "Lisa Garcia",
    createdAt: new Date("2024-02-10"),
  },
];
