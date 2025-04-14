
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

  // Handle image loading errors with better fallback strategy
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Use a placeholder image specific to the car make if possible
    const makeLower = make.toLowerCase();
    if (makeLower.includes('toyota')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=500&auto=format';
    } else if (makeLower.includes('bmw')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=500&auto=format';
    } else if (makeLower.includes('mercedes')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&auto=format';
    } else if (makeLower.includes('audi')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=500&auto=format';
    } else if (makeLower.includes('ford')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=500&auto=format';
    } else if (makeLower.includes('honda')) {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&auto=format';
    } else {
      // Default placeholder as fallback
      e.currentTarget.src = '/placeholder.svg';
      e.currentTarget.classList.add('object-contain', 'p-4');
    }
  };

  return (
    <div className="car-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48">
        {image ? (
          <img
            src={image}
            alt={`${year} ${make} ${model}`}
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
