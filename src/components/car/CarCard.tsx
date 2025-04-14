
import { Link } from "react-router-dom";
import { Car as CarIcon, Calendar, Tag, DollarSign } from "lucide-react";

export interface CarListing {
  id: string;
  title: string;
  price: number;
  make: string;
  model: string;
  year: number;
  image: string;
  description: string;
  userId: string;
  createdAt: string;
}

interface CarCardProps {
  car: CarListing;
}

const CarCard = ({ car }: CarCardProps) => {
  const { id, title, price, make, model, year, image } = car;

  // Format price with commas
  const formattedPrice = price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder.svg';
    e.currentTarget.classList.add('object-contain', 'p-4');
  };

  return (
    <div className="car-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48">
        {image ? (
          <img
            src={image}
            alt={`${make} ${model}`}
            className="car-card-img w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="car-card-img h-full w-full bg-gray-200 flex items-center justify-center">
            <CarIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{title}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{year}</span>
          <span className="mx-2">•</span>
          <Tag className="h-4 w-4 mr-1" />
          <span>{make} {model}</span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xl font-bold text-brand-blue flex items-center">
            <DollarSign className="h-5 w-5" />
            {formattedPrice}
          </div>
          <Link
            to={`/car/${id}`}
            className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-opacity-90 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
