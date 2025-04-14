
import { supabase } from "./client";

/**
 * Helper function to setup real-time channel subscription
 * @param channelName Unique name for this channel
 * @param tableName Database table to listen for changes
 * @param callback Function to call when changes occur
 * @returns Cleanup function to remove the channel
 */
export const subscribeToTableChanges = (
  channelName: string,
  tableName: string,
  callback: (payload: any) => void
) => {
  // Create a channel
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { 
      event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
      schema: 'public', 
      table: tableName
    }, callback)
    .subscribe((status) => {
      console.log(`Subscription status for ${tableName}:`, status);
      
      if (status !== 'SUBSCRIBED') {
        console.error(`Failed to subscribe to ${tableName} changes`);
      }
    });
    
  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}
