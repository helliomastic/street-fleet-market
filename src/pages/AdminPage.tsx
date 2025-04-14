
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BarChart, LineChart, ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from "recharts";
import { Car, Users, ShieldAlert, DollarSign, Edit, MoreHorizontal, Trash, Search, Lock, Shield } from "lucide-react";
import { mockListings, mockUsers } from "@/utils/mockData";
import { CarListing } from "@/components/car/CarCard";

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
  const [listings, setListings] = useState<CarListing[]>([]);
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredListings, setFilteredListings] = useState<CarListing[]>([]);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // For demo, we'll assume admin access

  useEffect(() => {
    // In a real app, this would check for admin permissions first
    if (!isAdmin) {
      navigate("/");
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to view the admin panel.",
      });
      return;
    }

    // Fetch listings and users data
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setListings(mockListings);
        setFilteredListings(mockListings);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load admin data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate, toast]);

  // Filter listings based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = listings.filter(
        listing =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredListings(filtered);

      const filteredUsers = users.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filteredUsers);
    } else {
      setFilteredListings(listings);
      setFilteredUsers(users);
    }
  }, [searchTerm, listings, users]);

  const handleDeleteListing = (id: string) => {
    // In a real app, this would delete from Supabase
    setListings(listings.filter(listing => listing.id !== id));
    setFilteredListings(filteredListings.filter(listing => listing.id !== id));
    toast({
      title: "Listing deleted",
      description: "The listing has been successfully deleted.",
    });
  };

  const toggleUserAdminStatus = (userId: string) => {
    // Update user's admin status
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(
      filteredUsers.map(user => 
        user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
      )
    );
    
    const user = users.find(u => u.id === userId);
    toast({
      title: `${user?.isAdmin ? "Removed" : "Granted"} admin access`,
      description: `Admin privileges have been ${user?.isAdmin ? "removed from" : "granted to"} ${user?.name}.`,
    });
  };

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
                {users.filter(user => user.isAdmin).length}
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

        {/* Management Tabs */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Platform</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="listings">
            <TabsList className="mb-6">
              <TabsTrigger value="listings">
                <Car className="h-4 w-4 mr-2" />
                Car Listings
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-brand-blue border-opacity-50 border-t-brand-blue rounded-full"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Make/Model</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredListings.length > 0 ? (
                        filteredListings.map((listing) => {
                          const user = mockUsers.find(u => u.id === listing.userId);
                          return (
                            <TableRow key={listing.id}>
                              <TableCell className="font-medium">{listing.title}</TableCell>
                              <TableCell>{listing.year}</TableCell>
                              <TableCell>{listing.make} {listing.model}</TableCell>
                              <TableCell>${listing.price.toLocaleString()}</TableCell>
                              <TableCell>{user?.name || "Unknown"}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                          <Trash className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this listing? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteListing(listing.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No listings found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="users">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Listings</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const userListings = mockListings.filter(listing => listing.userId === user.id);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {user.isAdmin ? (
                                  <div className="flex items-center">
                                    <Shield className="h-4 w-4 text-brand-orange mr-2" />
                                    <span className="font-medium">Admin</span>
                                  </div>
                                ) : (
                                  <span>User</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{userListings.length}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => toggleUserAdminStatus(user.id)}>
                                    {user.isAdmin ? (
                                      <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Remove Admin
                                      </>
                                    ) : (
                                      <>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Make Admin
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
