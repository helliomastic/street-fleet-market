
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let authListener: { data: { subscription: { unsubscribe: () => void } } };
    let messageChannel: any = null;

    const setupAuthListener = async () => {
      try {
        // Check for existing session first
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await ensureUserProfileExists(currentSession.user);
          checkIsAdmin(currentSession.user.id);
          setupMessageSubscription(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
      
      // Set up auth state change listener
      authListener = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Logged in',
            description: 'You have been logged in successfully',
          });
          
          if (newSession?.user) {
            await ensureUserProfileExists(newSession.user);
            checkIsAdmin(newSession.user.id);
            setupMessageSubscription(newSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Logged out',
            description: 'You have been logged out successfully',
          });
          
          setIsAdmin(false);
          
          if (messageChannel) {
            supabase.removeChannel(messageChannel);
            messageChannel = null;
          }
        }
      });
    };
    
    const setupMessageSubscription = (userId: string) => {
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
      }
      
      messageChannel = supabase
        .channel(`messages:${userId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        }, (payload) => {
          toast({
            title: 'New Message',
            description: 'You have received a new message',
          });
        })
        .subscribe((status) => {
          console.log('Message subscription status:', status);
        });
    };
    
    setupAuthListener();

    return () => {
      if (authListener) authListener.data.subscription.unsubscribe();
      if (messageChannel) supabase.removeChannel(messageChannel);
    };
  }, [toast]);

  const ensureUserProfileExists = async (user: User) => {
    try {
      // Check by user_id (not id)
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error fetching profile:', checkError);
      }

      if (!existingProfile) {
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

        const profileData = {
          user_id: user.id,
          full_name: fullName,
          email: user.email ?? null,
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData as any);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  const checkIsAdmin = async (_userId: string) => {
    // Roles are not implemented; default to false to avoid schema errors
    setIsAdmin(false);
  };

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        
        // Show user-friendly error message
        if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Unable to sign out due to network issues. You may already be signed out.",
          });
        } else {
          throw error;
        }
      } else {
        console.log("Sign out successful");
      }
      
      // Clear local state regardless of API call success
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
