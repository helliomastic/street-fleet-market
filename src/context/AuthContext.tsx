
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: 'Logged in',
            description: 'You have been logged in successfully',
          });
          
          // Check if user is admin
          if (session?.user) {
            // Ensure user profile exists
            await ensureUserProfileExists(session.user);
            
            checkIsAdmin(session.user.id);
            
            // Enable realtime subscriptions for messages after login
            const channel = supabase
              .channel('public:messages')
              .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${session.user.id}`
              }, (payload) => {
                toast({
                  title: 'New Message',
                  description: 'You have received a new message',
                });
              })
              .subscribe();
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Logged out',
            description: 'You have been logged out successfully',
          });
          
          setIsAdmin(false);
          
          // Disable all realtime subscriptions
          supabase.removeAllChannels();
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Check if user is admin and enable realtime for messages if logged in
      if (session?.user) {
        // Ensure user profile exists
        await ensureUserProfileExists(session.user);
        
        checkIsAdmin(session.user.id);
        
        const channel = supabase
          .channel('public:messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${session.user.id}`
          }, (payload) => {
            toast({
              title: 'New Message',
              description: 'You have received a new message',
            });
          })
          .subscribe();
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  // Ensure user profile exists in the profiles table
  const ensureUserProfileExists = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (checkError && !existingProfile) {
        // Profile doesn't exist, create one
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const username = user.email?.split('@')[0] || `user_${Math.random().toString(36).substring(2, 10)}`;
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: fullName,
            username: username,
            role: 'user'
          });
        
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
        .eq('id', userId)
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
