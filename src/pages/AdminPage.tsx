
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Car, Users, MessageSquare } from "lucide-react";

// Import refactored components
import { CarListingComponent } from "@/components/admin/CarListing";
import { UserManagement } from "@/components/admin/UserManagement";
import { MessagesTab } from "@/components/admin/MessagesTab";
import { useAdminData } from "@/hooks/useAdminData";

const AdminPage = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("listings");
  const { cars, users, loadingCars, loadingUsers, fetchCars, fetchUsers } = useAdminData();

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
              <CarListingComponent 
                cars={cars} 
                loadingCars={loadingCars} 
                fetchCars={fetchCars} 
              />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement 
                users={users} 
                loadingUsers={loadingUsers} 
              />
            </TabsContent>

            <TabsContent value="messages">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
