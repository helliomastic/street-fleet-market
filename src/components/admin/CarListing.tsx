
export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  description: string;
  image?: string;
  location: string;
  postedDate: Date;
  userId: string;
  condition: string;
  fuelType: string;
  sellerName: string;
  createdAt: Date;
}
