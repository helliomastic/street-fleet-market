
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
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
import { CarListing } from "./CarListing";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CarListItemProps {
  car: CarListing;
  onEdit: (car: CarListing) => void;
  fetchCars: () => Promise<void>;
}

export const CarListItem = ({ car, onEdit, fetchCars }: CarListItemProps) => {
  const [updating, setUpdating] = useState(false);
  
  const handleDeleteCar = async (id: string) => {
    try {
      setUpdating(true);
      
      // First delete all messages related to this car
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('car_id', id);
        
      if (messagesError) {
        console.error("Error deleting related messages:", messagesError);
        toast({
          title: "Error",
          description: "Failed to delete related messages: " + messagesError.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Successfully deleted messages for car:", id);
      
      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now that messages are deleted, delete the car
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error("Error deleting car:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      fetchCars();
      
      toast({
        title: "Deleted",
        description: "The car listing has been deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting car:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col md:flex-row items-center md:items-start gap-4">
      <div className="w-full md:w-40 h-32 bg-gray-200 rounded-lg overflow-hidden">
        {car.image_url ? (
          <img
            src={car.image_url}
            alt={car.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{car.title}</h3>
        <p className="text-gray-500">
          {car.make} {car.model} {car.year}
        </p>
        <p className="font-bold text-brand-blue mt-2">
          ${car.price.toLocaleString()}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(car)}
            className="flex items-center gap-1 bg-brand-blue text-white px-3 py-1.5 rounded hover:bg-opacity-90"
          >
            <Edit className="h-4 w-4" /> Edit
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
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
                  onClick={() => handleDeleteCar(car.id)}
                  disabled={updating}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {updating ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
