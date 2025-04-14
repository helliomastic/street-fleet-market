// Add this code to the imports section
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Car, Users, MessageSquare, Trash2, Edit } from "lucide-react";

// Define the state for the car listings, users, and settings
interface CarListing {
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

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role: string;
  is_admin?: boolean;
}

// Main component
const AdminPage = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("listings");
  const [cars, setCars] = useState<CarListing[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Car editing state
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // New car state
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

  // Reset car form function
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

  // Handler for updating a car listing
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
      
      // Refresh the cars list
      fetchCars();
      
      // Close the edit form
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

  // Handler for creating a new car listing
  const handleCreateCar = async () => {
    if (!user) return;
    
    try {
      setCreating(true);
      setCreateError(null);
      
      const carData = {
        ...newCar,
        user_id: user.id
      };
      
      const { error } = await supabase
        .from('cars')
        .insert(carData as any);
        
      if (error) {
        setCreateError(error.message);
        return;
      }
      
      // Refresh the cars list
      fetchCars();
      
      // Reset the form
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

  // Handler for deleting a car listing
  const handleDeleteCar = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id);
        
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Refresh the cars list
      fetchCars();
      
      toast({
        title: "Deleted",
        description: "The car listing has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Fetch car listings from Supabase
  const fetchCars = async () => {
    setLoadingCars(true);
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setCars(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingCars(false);
    }
  };

  // Fetch user profiles from Supabase
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth?tab=login");
    } else if (!isLoading && user && !isAdmin) {
      navigate("/dashboard");
    } else if (isAdmin) {
      fetchCars();
      fetchUsers();
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="h-12 bg-gray-200 animate-pulse rounded w-48 mb-8" />
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Unauthorized</h1>
            <p>You do not have permission to view this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listings" className="flex items-center justify-center">
                <Car className="h-4 w-4 mr-2" /> Car Listings
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" /> User Management
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" /> Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
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
                
                {/* Car Edit Form */}
                {editingCar && (
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
                )}
                
                {/* Car Creation Form */}
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
                    <Button onClick={handleCreateCar} disabled={creating}>
                      {creating ? "Creating..." : "Create Car"}
                    </Button>
                    {createError && (
                      <p className="text-red-500 text-sm mt-1">{createError}</p>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                {loadingUsers ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-16 bg-gray-200 rounded" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="border rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.full_name ? user.full_name.charAt(0) : "U"}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{user.full_name || "N/A"}</h3>
                          <p className="text-gray-500">{user.email}</p>
                          <p className="text-gray-500">Role: {user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Messages</h2>
                <p>This tab is under development.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
