import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessagesTab } from "@/components/messages/MessagesTab";
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
import { toast } from "@/components/ui/use-toast";
import { Trash2, Eye, Pencil } from "lucide-react";

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userCars, setUserCars] = useState<any[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth?tab=login");
    } else if (user) {
      fetchUserProfile();
      fetchUserCars();
    }
  }, [user, isLoading, navigate]);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserCars = async () => {
    try {
      setCarsLoading(true);
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching cars:", error);
      } else {
        setUserCars(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCarsLoading(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!user) return;
    
    try {
      setDeletingCarId(carId);
      
      console.log("Deleting car with ID:", carId);
      
      const { error: messagesError } = await supabase
        .rpc('delete_car_messages', { car_id_param: carId });
      
      if (messagesError) {
        console.error("Error deleting related messages:", messagesError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete related messages: " + messagesError.message
        });
        setDeletingCarId(null);
        return;
      }
      
      console.log("Successfully deleted messages for car:", carId);
      
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error deleting car:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete car: " + error.message
        });
        setDeletingCarId(null);
        return;
      }
      
      console.log("Car successfully deleted");
      
      setUserCars(prevCars => prevCars.filter(car => car.id !== carId));
      
      toast({
        title: "Listing deleted",
        description: "Your car listing has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting car:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete the listing. Please try again.",
      });
    } finally {
      setDeletingCarId(null);
    }
  };

  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user) return;
      
      try {
        const { data, error, count } = await supabase
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('recipient_id', user.id)
          .eq('read', false);
          
        if (error) {
          console.error("Error fetching unread messages:", error);
        } else if (count !== null) {
          setUnreadCount(count);
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };
    
    fetchUnreadMessages();
    
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${user?.id}`
      }, (payload) => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (isLoading || !user) {
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="listings" className="flex items-center justify-center">
                <Car className="h-4 w-4 mr-2" /> My Listings
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" /> 
                Messages
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center justify-center">
                <User className="h-4 w-4 mr-2" /> Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">My Car Listings</h2>
                {carsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded" />
                    <div className="h-20 bg-gray-200 rounded" />
                  </div>
                ) : userCars.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't posted any cars yet.</p>
                    <button
                      onClick={() => navigate("/post-car")}
                      className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-opacity-90"
                    >
                      Post a Car
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userCars.map((car) => (
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
                              onClick={() => navigate(`/car/${car.id}`)}
                              className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-1.5 rounded hover:bg-gray-300"
                            >
                              <Eye className="h-4 w-4" /> View
                            </button>
                            <button
                              onClick={() => navigate(`/edit-car/${car.id}`)}
                              className="flex items-center gap-1 bg-brand-blue text-white px-3 py-1.5 rounded hover:bg-opacity-90"
                            >
                              <Pencil className="h-4 w-4" /> Edit
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
                                    disabled={deletingCarId === car.id}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    {deletingCarId === car.id ? "Deleting..." : "Delete"}
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
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <MessagesTab />
            </TabsContent>

            <TabsContent value="profile">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">My Profile</h2>
                {profileLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded w-1/3" />
                    <div className="h-12 bg-gray-200 rounded w-1/2" />
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <p className="mt-1 text-lg">{profile?.full_name || "Not set"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="mt-1 text-lg">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <p className="mt-1 text-lg">{profile?.username || "Not set"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Member Since
                        </label>
                        <p className="mt-1 text-lg">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button className="bg-brand-blue text-white px-4 py-2 rounded hover:bg-opacity-90">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
