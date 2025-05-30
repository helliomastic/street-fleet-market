import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react"; 
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

interface CarCardProps {
  car: CarListing;
}

const CarCard = ({ car }: CarCardProps) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const isOwner = user && user.id === car.userId;
  
  // Format the time since posting
  const timeAgo = formatDistanceToNow(car.postedDate, { addSuffix: true });
  
  // Format price with commas in Nepali Rupees
  const formattedPrice = new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(car.price).replace('NPR', 'Rs');
  
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
  
  const handleDelete = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      console.log("Deleting car with ID:", car.id);
      
      // Use the RPC function to safely delete all messages first
      const { error: messagesError } = await supabase
        .rpc('delete_car_messages', { car_id_param: car.id });
      
      if (messagesError) {
        console.error("Error deleting related messages:", messagesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete related messages: " + messagesError.message
        });
        setIsDeleting(false);
        return;
      }
      
      console.log("Successfully deleted messages for car:", car.id);
      
      // Now delete the car listing
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', car.id)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error deleting car:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete car: " + error.message
        });
        setIsDeleting(false);
        return;
      }
      
      console.log("Car successfully deleted");
      
      toast({
        title: "Listing deleted",
        description: "Your car listing has been successfully deleted.",
      });
      
      // After successful deletion, redirect or refresh
      if (window.location.pathname.includes(`/car/${car.id}`)) {
        navigate('/');
      } else if (window.location.pathname.includes('/dashboard')) {
        // Force refresh the dashboard to show the updated list
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error deleting car:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete the listing. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEdit = () => {
    navigate(`/edit-car/${car.id}`);
  };
  
  return (
    <div className="relative h-full">
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
      
      {/* Owner controls */}
      {isOwner && (
        <div className="absolute top-2 left-2 flex gap-2">
          <Button 
            variant="default" 
            size="icon" 
            className="w-8 h-8 bg-brand-blue"
            onClick={(e) => {
              e.preventDefault();
              handleEdit();
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="icon" 
                className="w-8 h-8" 
                onClick={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this car listing? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default CarCard;
