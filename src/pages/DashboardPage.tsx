
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Car as CarIcon, Edit, Trash, User, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { CarListing } from "@/components/car/CarCard";
import { mockListings } from "@/utils/mockData";
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
import { useToast } from "@/components/ui/use-toast";

const DashboardPage = () => {
  const [userListings, setUserListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Mock fetching user's listings
    const fetchUserListings = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        // In a real app, would filter by logged-in user ID
        // For now, just filter to the first mock user
        const userCars = mockListings.filter(car => car.userId === "user-0");
        setUserListings(userCars);
      } catch (error) {
        console.error("Error fetching user listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserListings();
  }, []);

  const handleDeleteListing = (id: string) => {
    // In a real app, would delete from Supabase
    setUserListings(userListings.filter(car => car.id !== id));
    toast({
      title: "Car listing deleted",
      description: "Your car listing has been successfully deleted."
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your profile and car listings.
            </p>
          </div>
          <Button asChild className="bg-brand-orange hover:bg-opacity-90">
            <Link to="/post-car">
              <PlusCircle className="h-4 w-4 mr-2" />
              Post a Car
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="listings">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <h2 className="text-xl font-semibold mb-6">Your Car Listings</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-t-lg" />
                    <CardHeader>
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </CardHeader>
                    <CardFooter>
                      <div className="h-10 bg-gray-200 rounded w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((car) => (
                  <Card key={car.id}>
                    <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                      {car.image ? (
                        <img 
                          src={car.image} 
                          alt={car.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <CarIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{car.title}</CardTitle>
                      <CardDescription>
                        ${car.price.toLocaleString()} • {car.year}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" asChild>
                        <Link to={`/edit-car/${car.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Car Listing</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{car.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteListing(car.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="w-full text-center p-8">
                <CardHeader>
                  <CardTitle>No listings yet</CardTitle>
                  <CardDescription>
                    You haven't posted any cars for sale yet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link to="/post-car">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Post Your First Car
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-3xl">
              <h2 className="text-xl font-semibold mb-6">Your Profile</h2>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-brand-blue text-white rounded-full flex items-center justify-center text-xl font-bold">
                      JD
                    </div>
                    <div>
                      <CardTitle>John Doe</CardTitle>
                      <CardDescription>Member since April 2023</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>john@example.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p>+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p>San Francisco, CA</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Listings</p>
                      <p>{userListings.length} active listings</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Password & Security</CardTitle>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Last updated: 2 months ago
                      </div>
                      <Button variant="ghost" size="sm">
                        Manage
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notifications</CardTitle>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Receive email alerts for new messages
                      </div>
                      <Button variant="ghost" size="sm">
                        Manage
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
