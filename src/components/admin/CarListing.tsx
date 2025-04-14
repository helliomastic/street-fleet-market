
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CarListItem } from "./CarListItem";
import { CarEditForm } from "./CarEditForm";
import { CarCreateForm } from "./CarCreateForm";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image_url?: string;
  condition: string;
  description: string;
  user_id: string;
}

interface CarListingProps {
  cars: CarListing[];
  loadingCars: boolean;
  fetchCars: () => Promise<void>;
}

export const CarListingComponent = ({ cars, loadingCars, fetchCars }: CarListingProps) => {
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  const [deletingAll, setDeletingAll] = useState(false);

  const handleUpdateCar = async (id: string) => {
    if (!editingCar) return;
    
    try {
      setUpdating(true);
      setUpdateError(null);
      
      const updateData = {
        title: editingCar.title,
        make: editingCar.make,
        model: editingCar.model,
        year: editingCar.year,
        price: editingCar.price,
        description: editingCar.description,
        condition: editingCar.condition
      };
      
      const { error } = await supabase
        .from('cars')
        .update(updateData as any)
        .eq('id', id);
        
      if (error) {
        setUpdateError(error.message);
        return;
      }
      
      fetchCars();
      
      setEditingCar(null);
      
      toast({
        title: "Car Updated",
        description: "The car listing has been updated successfully",
      });
    } catch (error: any) {
      setUpdateError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateCar = async (userId: string, newCarData: any) => {
    if (!userId) return;
    
    try {
      setCreating(true);
      setCreateError(null);
      
      // Get user data
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setCreateError("User not authenticated");
        return;
      }
      
      // Insert the new car
      const { error } = await supabase
        .from('cars')
        .insert({
          title: newCarData.title,
          make: newCarData.make,
          model: newCarData.model,
          year: newCarData.year,
          price: newCarData.price,
          condition: newCarData.condition,
          description: newCarData.description,
          user_id: userId,
        });
        
      if (error) {
        setCreateError(error.message);
        return;
      }
      
      toast({
        title: "Car Created",
        description: "The new car listing has been created successfully",
      });
      
      fetchCars();
    } catch (error: any) {
      setCreateError(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAllCars = async () => {
    try {
      setDeletingAll(true);
      
      // First, delete all messages related to any car
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .neq('car_id', 'dummy_value'); // This will match all car_ids
        
      if (messagesError) {
        console.error("Error deleting related messages:", messagesError);
        toast({
          title: "Error",
          description: "Failed to delete related messages: " + messagesError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Then delete all cars
      const { error } = await supabase
        .from('cars')
        .delete()
        .neq('id', 'dummy_value'); // This will match all car ids
        
      if (error) {
        console.error("Error deleting all cars:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      fetchCars();
      
      toast({
        title: "All Listings Deleted",
        description: "All car listings have been successfully deleted",
      });
    } catch (error: any) {
      console.error("Error deleting all cars:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Car Listings</h2>
        
        {cars.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex items-center gap-1">
                <Trash2 className="h-4 w-4" /> Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Listings</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete ALL car listings? This action cannot be undone
                  and will remove all associated messages as well.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllCars}
                  disabled={deletingAll}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {deletingAll ? "Deleting..." : "Delete All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      {loadingCars ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      ) : (
        <div className="space-y-4">
          {cars.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No car listings available.
            </div>
          ) : (
            cars.map((car) => (
              <CarListItem 
                key={car.id} 
                car={car} 
                onEdit={setEditingCar} 
                fetchCars={fetchCars} 
              />
            ))
          )}
        </div>
      )}
      
      {editingCar && (
        <CarEditForm 
          editingCar={editingCar} 
          setEditingCar={setEditingCar} 
          updating={updating} 
          updateError={updateError} 
          handleUpdateCar={handleUpdateCar} 
        />
      )}
      
      <CarCreateForm 
        creating={creating} 
        createError={createError} 
        handleCreateCar={handleCreateCar}
      />
    </div>
  );
};
