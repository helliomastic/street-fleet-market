
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  description: string;
  image: string | null;
  location: string;
  postedDate: Date;
  userId: string;
  condition: string;
  sellerName: string;
  createdAt: Date;
}

const CarCard = ({ car }: { car: CarListing }) => {
  // Format the time since posting
  const timeAgo = formatDistanceToNow(car.postedDate, { addSuffix: true });
  
  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(car.price);

  // Get condition display text
  const getConditionDisplay = (condition: string) => {
    const conditionMap: Record<string, string> = {
      'new': 'New',
      'like_new': 'Like New',
      'excellent': 'Excellent',
      'good': 'Good',
      'fair': 'Fair',
      'poor': 'Poor'
    };
    return conditionMap[condition] || condition;
  };
  
  return (
    <Link to={`/car/${car.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
        <div className="relative h-48 bg-gray-200">
          {car.image ? (
            <img 
              src={car.image} 
              alt={car.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
              No image available
            </div>
          )}
          <Badge 
            className="absolute top-2 right-2"
            variant={car.condition === 'new' ? "default" : "secondary"}
          >
            {getConditionDisplay(car.condition)}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1 truncate">{car.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{car.year} {car.make} {car.model}</p>
          <p className="text-xl font-bold text-brand-blue">{formattedPrice}</p>
          <p className="text-xs text-gray-500 mt-1">Seller: {car.sellerName}</p>
        </CardContent>
        <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center text-sm text-gray-500">
          <span>{car.location}</span>
          <span>{timeAgo}</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CarCard;
