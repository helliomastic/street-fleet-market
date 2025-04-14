
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CarListItem } from "./CarListItem";
import { CarEditForm } from "./CarEditForm";
import { CarCreateForm } from "./CarCreateForm";

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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Car Listings</h2>
      {loadingCars ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      ) : (
        <div className="space-y-4">
          {cars.map((car) => (
            <CarListItem 
              key={car.id} 
              car={car} 
              onEdit={setEditingCar} 
              fetchCars={fetchCars} 
            />
          ))}
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
