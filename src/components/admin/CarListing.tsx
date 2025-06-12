
export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  description: string;
  image_url?: string;
  condition: string;
  fuel_type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Convert database car to CarListing format
export const convertToCarListing = (dbCar: any): CarListing => ({
  id: dbCar.id,
  title: dbCar.title,
  make: dbCar.make,
  model: dbCar.model,
  year: dbCar.year,
  price: dbCar.price,
  description: dbCar.description,
  image_url: dbCar.image_url,
  condition: dbCar.condition,
  fuel_type: dbCar.fuel_type,
  user_id: dbCar.user_id,
  created_at: dbCar.created_at,
  updated_at: dbCar.updated_at
});
