
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CarListing } from "@/components/admin/CarListing";
import { UserProfile } from "@/components/admin/UserManagement";

export const useAdminData = () => {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

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

  return {
    cars,
    users,
    loadingCars,
    loadingUsers,
    fetchCars,
    fetchUsers
  };
};
