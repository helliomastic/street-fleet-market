
import { useState } from "react";
import { CarListing } from "./CarListing";
import { CarListItem } from "./CarListItem";
import { CarEditForm } from "./CarEditForm";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CarListingComponentProps {
  cars: CarListing[];
  loadingCars: boolean;
  fetchCars: () => Promise<void>;
}

export const CarListingComponent = ({ 
  cars, 
  loadingCars, 
  fetchCars 
}: CarListingComponentProps) => {
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdateCar = async (id: string) => {
    if (!editingCar) return;
    
    try {
      setUpdating(true);
      setUpdateError(null);
      
      const { error } = await supabase
        .from('cars')
        .update({
          title: editingCar.title,
          make: editingCar.make,
          model: editingCar.model,
          year: editingCar.year,
          price: editingCar.price,
          description: editingCar.description,
          condition: editingCar.condition,
          fuel_type: editingCar.fuel_type,
        })
        .eq('id', id);
        
      if (error) {
        console.error("Error updating car:", error);
        setUpdateError(error.message);
        return;
      }
      
      fetchCars();
      setEditingCar(null);
      
      toast({
        title: "Updated",
        description: "The car listing has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating car:", error);
      setUpdateError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loadingCars) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-t-brand-blue border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Car Listings</h2>
        <span className="text-gray-500">{cars.length} listings</span>
      </div>
      
      {cars.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No car listings found.
        </div>
      ) : (
        <div className="grid gap-4">
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
    </div>
  );
};
