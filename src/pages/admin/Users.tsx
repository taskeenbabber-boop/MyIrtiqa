import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCog } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface UserWithRoles {
  user_id: string;
  roles: string[];
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      // Group roles by user_id
      const userMap = new Map<string, UserWithRoles>();

      rolesData?.forEach((roleEntry: UserRole) => {
        const userId = roleEntry.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            roles: [],
            created_at: roleEntry.created_at,
          });
        }
        userMap.get(userId)!.roles.push(roleEntry.role);
      });

      setUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // First, delete existing roles for this user
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Then insert the new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole as any }]);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Users & Roles
          </CardTitle>
          <CardDescription>
            View and manage user roles. Only super admins can modify roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Current Roles</TableHead>
                <TableHead>Change Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-mono text-sm">
                      {user.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(value) => updateUserRole(user.user_id, value)}
                        defaultValue={user.roles[0] || "public"}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-accent border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">How to Add First Super Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To create your first super admin, run this SQL in Supabase SQL Editor:
          </p>
          <pre className="bg-secondary p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`-- Replace YOUR_USER_ID with your actual user ID
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'super_admin');`}</code>
          </pre>
          <p className="text-xs text-muted-foreground">
            You can find your user ID in the Supabase Auth Users table.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
