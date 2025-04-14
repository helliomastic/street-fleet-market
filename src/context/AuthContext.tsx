
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

    // Set up auth state listener
    const setupAuthListener = async () => {
      // First check existing session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Ensure user profile exists
        await ensureUserProfileExists(currentSession.user);
        checkIsAdmin(currentSession.user.id);
        
        // Set up message subscription only if logged in
        setupMessageSubscription(currentSession.user.id);
      }
      
      setIsLoading(false);
      
      // Then listen for changes
      authListener = supabase.auth.onAuthStateChange(async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Logged in',
            description: 'You have been logged in successfully',
          });
          
          if (newSession?.user) {
            // Ensure user profile exists
            await ensureUserProfileExists(newSession.user);
            checkIsAdmin(newSession.user.id);
            
            // Set up message subscription
            setupMessageSubscription(newSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Logged out',
            description: 'You have been logged out successfully',
          });
          
          setIsAdmin(false);
          
          // Clean up message subscription
          if (messageChannel) {
            supabase.removeChannel(messageChannel);
            messageChannel = null;
          }
        }
      });
    };
    
    const setupMessageSubscription = (userId: string) => {
      // Remove existing subscription if any
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
      }
      
      // Create new subscription
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

    // Cleanup function
    return () => {
      if (authListener) authListener.data.subscription.unsubscribe();
      if (messageChannel) supabase.removeChannel(messageChannel);
    };
  }, [toast]);

  // Ensure user profile exists in the profiles table
  const ensureUserProfileExists = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id as any)
        .single();
      
      if (checkError && !existingProfile) {
        // Profile doesn't exist, create one
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const username = user.email?.split('@')[0] || `user_${Math.random().toString(36).substring(2, 10)}`;
        
        const profileData = {
          id: user.id,
          full_name: fullName,
          username: username,
          role: 'user'
        } as any;
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  const checkIsAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', userId as any)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }
      
      setIsAdmin(data?.role === 'admin' || !!data?.is_admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
