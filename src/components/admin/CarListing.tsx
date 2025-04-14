
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [newCar, setNewCar] = useState({
    title: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    condition: 'used',
    description: ''
  });

  const resetCarForm = () => {
    setNewCar({
      title: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      condition: 'used',
      description: ''
    });
  };

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

  const handleCreateCar = async (userId: string) => {
    if (!userId) return;
    
    try {
      setCreating(true);
      setCreateError(null);
      
      const carData = {
        ...newCar,
        user_id: userId
      };
      
      const { error } = await supabase
        .from('cars')
        .insert(carData as any);
        
      if (error) {
        setCreateError(error.message);
        return;
      }
      
      fetchCars();
      
      resetCarForm();
      
      toast({
        title: "Car Created",
        description: "The new car listing has been created successfully",
      });
    } catch (error: any) {
      setCreateError(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCar = async (id: string) => {
    try {
      const { data: messageCheck, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('car_id', id);
        
      if (checkError) {
        console.error("Error checking for messages:", checkError);
        toast({
          title: "Error",
          description: "Failed to check for messages: " + checkError.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log(`Found ${messageCheck?.length || 0} messages to delete for car ${id}`);
      
      if (messageCheck && messageCheck.length > 0) {
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
      }
      
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
            <div
              key={car.id}
              className="border rounded-lg p-4 flex flex-col md:flex-row items-center md:items-start gap-4"
            >
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
                    onClick={() => setEditingCar(car)}
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
        newCar={newCar} 
        setNewCar={setNewCar} 
        creating={creating} 
        createError={createError} 
        resetCarForm={resetCarForm}
        handleCreateCar={handleCreateCar}
      />
    </div>
  );
};

interface CarEditFormProps {
  editingCar: CarListing;
  setEditingCar: (car: CarListing | null) => void;
  updating: boolean;
  updateError: string | null;
  handleUpdateCar: (id: string) => Promise<void>;
}

const CarEditForm = ({ 
  editingCar, 
  setEditingCar, 
  updating, 
  updateError, 
  handleUpdateCar 
}: CarEditFormProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Edit Car Listing</CardTitle>
        <CardDescription>
          Edit the details of the selected car listing.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Title
            </label>
            <Input
              id="title"
              value={editingCar.title}
              onChange={(e) =>
                setEditingCar({ ...editingCar, title: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="make"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Make
            </label>
            <Input
              id="make"
              value={editingCar.make}
              onChange={(e) =>
                setEditingCar({ ...editingCar, make: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="model"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Model
            </label>
            <Input
              id="model"
              value={editingCar.model}
              onChange={(e) =>
                setEditingCar({ ...editingCar, model: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="year"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Year
            </label>
            <Input
              id="year"
              type="number"
              value={editingCar.year}
              onChange={(e) =>
                setEditingCar({
                  ...editingCar,
                  year: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Price
            </label>
            <Input
              id="price"
              type="number"
              value={editingCar.price}
              onChange={(e) =>
                setEditingCar({
                  ...editingCar,
                  price: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="condition"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Condition
            </label>
            <Input
              id="condition"
              value={editingCar.condition}
              onChange={(e) =>
                setEditingCar({ ...editingCar, condition: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="description"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
          >
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Car Description"
            value={editingCar.description}
            onChange={(e) =>
              setEditingCar({ ...editingCar, description: e.target.value })
            }
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setEditingCar(null)}>
          Cancel
        </Button>
        <Button onClick={() => handleUpdateCar(editingCar.id)} disabled={updating}>
          {updating ? "Updating..." : "Update Car"}
        </Button>
        {updateError && (
          <p className="text-red-500 text-sm mt-1">{updateError}</p>
        )}
      </CardFooter>
    </Card>
  );
};

interface CarCreateFormProps {
  newCar: {
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    condition: string;
    description: string;
  };
  setNewCar: (car: typeof newCar) => void;
  creating: boolean;
  createError: string | null;
  resetCarForm: () => void;
  handleCreateCar: (userId: string) => Promise<void>;
}

export const CarCreateForm = ({ 
  newCar, 
  setNewCar, 
  creating, 
  createError, 
  resetCarForm,
  handleCreateCar
}: CarCreateFormProps) => {
  const { user } = require("@/context/AuthContext").useAuth();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Create New Car Listing</CardTitle>
        <CardDescription>
          Create a new car listing to be displayed on the site.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="new-title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Title
            </label>
            <Input
              id="new-title"
              value={newCar.title}
              onChange={(e) =>
                setNewCar({ ...newCar, title: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-make"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Make
            </label>
            <Input
              id="new-make"
              value={newCar.make}
              onChange={(e) =>
                setNewCar({ ...newCar, make: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-model"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Model
            </label>
            <Input
              id="new-model"
              value={newCar.model}
              onChange={(e) =>
                setNewCar({ ...newCar, model: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-year"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Year
            </label>
            <Input
              id="new-year"
              type="number"
              value={newCar.year}
              onChange={(e) =>
                setNewCar({
                  ...newCar,
                  year: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-price"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Price
            </label>
            <Input
              id="new-price"
              type="number"
              value={newCar.price}
              onChange={(e) =>
                setNewCar({
                  ...newCar,
                  price: parseInt(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="new-condition"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
            >
              Condition
            </label>
            <Input
              id="new-condition"
              value={newCar.condition}
              onChange={(e) =>
                setNewCar({ ...newCar, condition: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="new-description"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
          >
            Description
          </label>
          <Textarea
            id="new-description"
            placeholder="Car Description"
            value={newCar.description}
            onChange={(e) =>
              setNewCar({ ...newCar, description: e.target.value })
            }
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetCarForm}>
          Cancel
        </Button>
        <Button onClick={() => handleCreateCar(user?.id)} disabled={creating}>
          {creating ? "Creating..." : "Create Car"}
        </Button>
        {createError && (
          <p className="text-red-500 text-sm mt-1">{createError}</p>
        )}
      </CardFooter>
    </Card>
  );
};
