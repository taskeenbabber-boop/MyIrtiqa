import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "public" | "member" | "editor" | "admin" | "super_admin";

export interface AuthUser extends User {
  roles?: UserRole[];
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Preserve roles if user is the same
        setUser((currentUser) => {
          const newUser = session?.user ?? null;
          if (newUser && currentUser && newUser.id === currentUser.id) {
            // Same user - preserve roles
            return { ...newUser, roles: currentUser.roles };
          }
          return newUser;
        });
        
        // Re-fetch roles if this is a new session
        if (session?.user) {
          setRolesLoaded(false); // Reset
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRolesLoaded(true); // No user = roles "loaded" (empty)
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    if (data) {
      // Use functional update to avoid closure issues
      setUser((currentUser) => {
        if (currentUser) {
          return {
            ...currentUser,
            roles: data.map(r => r.role as UserRole),
          };
        }
        return currentUser;
      });
    }
    setRolesLoaded(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  const isAdmin = (): boolean => {
    return hasRole('admin') || hasRole('super_admin');
  };

  return {
    user,
    session,
    loading,
    rolesLoaded,
    signOut,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isAuthenticated: !!session,
  };
}
