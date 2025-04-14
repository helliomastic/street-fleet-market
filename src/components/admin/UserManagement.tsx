
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role: string;
  is_admin?: boolean;
}

interface UserManagementProps {
  users: UserProfile[];
  loadingUsers: boolean;
}

export const UserManagement = ({ users, loadingUsers }: UserManagementProps) => {
  return (
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
  );
};
