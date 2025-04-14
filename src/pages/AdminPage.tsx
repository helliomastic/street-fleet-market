import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Car, Users, ShieldAlert, DollarSign, Edit, Trash, PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from "recharts";

// Validation schema for car listing
const carListingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Invalid year"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  condition: z.string().optional(),
});

// Mock stats data
const MOCK_STATS = {
  totalUsers: 387,
  totalListings: 1432,
  activeListings: 876,
  newListingsThisMonth: 124,
  newUsersThisMonth: 42,
  revenue: 8750,
};

// Mock analytics data
const MOCK_MONTHLY_DATA = [
  { name: "Jan", listings: 65, users: 24, revenue: 3200 },
  { name: "Feb", listings: 78, users: 28, revenue: 3800 },
  { name: "Mar", listings: 82, users: 35, revenue: 4100 },
  { name: "Apr", listings: 95, users: 39, revenue: 4700 },
  { name: "May", listings: 102, users: 42, revenue: 5100 },
  { name: "Jun", listings: 113, users: 48, revenue: 5600 },
  { name: "Jul", listings: 125, users: 52, revenue: 6200 },
  { name: "Aug", listings: 132, users: 58, revenue: 6600 },
  { name: "Sep", listings: 124, users: 47, revenue: 6200 },
  { name: "Oct", listings: 118, users: 45, revenue: 5900 },
  { name: "Nov", listings: 110, users: 42, revenue: 5500 },
  { name: "Dec", listings: 124, users: 47, revenue: 6200 },
];

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [cars, setCars] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any>(null);

  // Form for adding/editing car
  const form = useForm<z.infer<typeof carListingSchema>>({
    resolver: zodResolver(carListingSchema),
    defaultValues: {
      title: "",
      make: "",
      model: "",
      year: undefined,
      price: undefined,
      description: "",
      condition: "",
    },
  });

  // Fetch cars on component mount
  useEffect(() => {
    fetchCars();
  }, [user]);

  // Fetch cars from Supabase
  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCars(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cars",
        variant: "destructive",
      });
    }
  };

  // Handle car form submission
  const onSubmit = async (values: z.infer<typeof carListingSchema>) => {
    try {
      if (selectedCar) {
        // Update existing car
        const { error } = await supabase
          .from('cars')
          .update({
            ...values,
            user_id: user?.id,
          })
          .eq('id', selectedCar.id);

        if (error) throw error;
        toast({ title: "Car Updated", description: "Car listing updated successfully" });
      } else {
        // Add new car
        const { error } = await supabase
          .from('cars')
          .insert({
            ...values,
            user_id: user?.id,
          });

        if (error) throw error;
        toast({ title: "Car Added", description: "New car listing added successfully" });
      }

      // Reset form and close dialog
      form.reset();
      setIsAddDialogOpen(false);
      setSelectedCar(null);
      fetchCars(); // Refresh car list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save car listing",
        variant: "destructive",
      });
    }
  };

  // Delete a car listing
  const handleDeleteCar = async (carId: string) => {
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId);

      if (error) throw error;
      
      toast({ 
        title: "Car Deleted", 
        description: "Car listing removed successfully" 
      });
      
      fetchCars(); // Refresh car list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete car listing",
        variant: "destructive",
      });
    }
  };

  // Edit a car listing
  const handleEditCar = (car: any) => {
    setSelectedCar(car);
    form.reset(car);
    setIsAddDialogOpen(true);
  };

  // Render car form dialog
  const renderCarForm = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedCar ? "Edit Car Listing" : "Add New Car Listing"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Car Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="Car Make" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Car Model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <FormControl>
                      <Input placeholder="Car Condition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Car Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {selectedCar ? "Update Listing" : "Add Listing"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage users, listings, and platform statistics.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <ShieldAlert className="h-5 w-5 text-brand-orange" />
            <span className="font-medium">Admin Access</span>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_STATS.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{MOCK_STATS.newUsersThisMonth} this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Listings
              </CardTitle>
              <Car className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_STATS.totalListings}</div>
              <p className="text-xs text-muted-foreground">
                {MOCK_STATS.activeListings} currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${MOCK_STATS.revenue}</div>
              <p className="text-xs text-muted-foreground">
                From featured listings and services
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Admin Users
              </CardTitle>
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {/* users.filter(user => user.isAdmin).length */}
                0
              </div>
              <p className="text-xs text-muted-foreground">
                With full administrative access
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Listings</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_MONTHLY_DATA}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="listings" fill="#2A3F54" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue & New Users</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={MOCK_MONTHLY_DATA}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="users" stroke="#2A3F54" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF7E1F" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cars Management Section */}
        <div className="space-y-6 mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Car Listings</h2>
            <Button 
              onClick={() => {
                setSelectedCar(null);
                setIsAddDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Add New Car
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>{car.title}</TableCell>
                    <TableCell>{car.make} {car.model}</TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>${car.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditCar(car)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteCar(car.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Render car form dialog */}
        {renderCarForm()}
      </div>
    </Layout>
  );
};

export default AdminPage;
