import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import MessagesTab from "@/components/messages/MessagesTab";

// Import any other required components

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userCars, setUserCars] = useState<any[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    // Redirect if not logged in and done loading
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

  // Check for unread messages
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
    
    // Set up subscription for new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${user?.id}`
      }, (payload) => {
        // Update unread count when a new message is received
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
              {/* Replace with your listings component */}
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
                              className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded hover:bg-gray-300"
                            >
                              View
                            </button>
                            <button
                              onClick={() => navigate(`/edit-car/${car.id}`)}
                              className="bg-brand-blue text-white px-3 py-1.5 rounded hover:bg-opacity-90"
                            >
                              Edit
                            </button>
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
              {/* Profile info - can be expanded in a future task */}
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
