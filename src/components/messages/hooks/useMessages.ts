
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types";
import { toast } from "@/components/ui/use-toast";

export const useMessages = (userId: string | undefined) => {
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    
    // Do not toggle the main loading state here to avoid UI flicker on realtime updates
    // Initial load starts with loading=true by default
    setError(null);
    setRefreshing(true);
    
    try {
      console.log("Fetching messages for user:", userId);
      
      // Fetch received messages
      const { data: receivedData, error: receivedError } = await supabase
        .from('messages')
        .select(`
          id,
          car_id,
          sender_id,
          recipient_id,
          message,
          read,
          created_at,
          car:cars(title, make, model, year)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (receivedError) {
        console.error("Error fetching received messages:", receivedError);
        setError(receivedError.message);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("Received messages data:", receivedData);

      // Calculate unread count
      const unreadMessages = (receivedData || []).filter(msg => !msg.read);
      setUnreadCount(unreadMessages.length);
      
      // Get profile data for received messages
      const enhancedReceivedMessages = await Promise.all(
        (receivedData || []).map(async (msg) => {
          try {
            // Get sender profile
            const { data: senderData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', msg.sender_id)
              .maybeSingle();
              
            // Get recipient profile (should be the current user)
            const { data: recipientData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', msg.recipient_id)
              .maybeSingle();
              
            return {
              ...msg,
              sender_profile: senderData || { full_name: 'Unknown User' },
              recipient_profile: recipientData || { full_name: 'Unknown User' },
              car: msg.car || { title: 'Unknown', make: 'Unknown', model: 'Unknown', year: 0 }
            } as Message;
          } catch (error) {
            console.error("Error processing received message:", error);
            return null;
          }
        })
      );
      
      setReceivedMessages(enhancedReceivedMessages.filter(Boolean) as Message[]);
      
      // Fetch sent messages
      const { data: sentData, error: sentError } = await supabase
        .from('messages')
        .select(`
          id,
          car_id,
          sender_id,
          recipient_id,
          message,
          read,
          created_at,
          car:cars(title, make, model, year)
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (sentError) {
        console.error("Error fetching sent messages:", sentError);
        setError(sentError.message);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      console.log("Sent messages data:", sentData);
      
      // Get profile data for sent messages
      const enhancedSentMessages = await Promise.all(
        (sentData || []).map(async (msg) => {
          try {
            // Get sender profile (should be current user)
            const { data: senderData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', msg.sender_id)
              .maybeSingle();
              
            // Get recipient profile
            const { data: recipientData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', msg.recipient_id)
              .maybeSingle();
              
            return {
              ...msg,
              sender_profile: senderData || { full_name: 'Unknown User' },
              recipient_profile: recipientData || { full_name: 'Unknown User' },
              car: msg.car || { title: 'Unknown', make: 'Unknown', model: 'Unknown', year: 0 }
            } as Message;
          } catch (error) {
            console.error("Error processing sent message:", error);
            return null;
          }
        })
      );
      
      setSentMessages(enhancedSentMessages.filter(Boolean) as Message[]);
      
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Setup Supabase Realtime subscriptions
  useEffect(() => {
    if (!userId) return;
    
    fetchMessages();
    
    // Set up realtime subscription for message changes (both inbox and sent)
    const channel = supabase
      .channel('messages-channel-' + userId) // Unique channel per user
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        console.log('New message received:', payload);
        fetchMessages(); // Refresh messages when a new one arrives
        toast({
          title: "New Message",
          description: "You have received a new message",
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`
      }, (payload) => {
        console.log('Message sent (self insert):', payload);
        fetchMessages(); // Keep Sent tab in sync across tabs/devices
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        console.log('Message updated (recipient view):', payload);
        fetchMessages();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`
      }, (payload) => {
        console.log('Message updated (sender view):', payload);
        fetchMessages();
      })
      .subscribe((status) => {
        console.log(`Messages realtime status for ${userId}:`, status);
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMessages]);

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) {
        console.error("Error marking message as read:", error);
        toast({
          title: "Error",
          description: "Failed to mark message as read. Please try again.",
          variant: "destructive",
        });
        return false;
      } 
      
      // Update local state
      setReceivedMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
  };

  const sendReply = async (carId: string, recipientId: string, messageText: string) => {
    if (!userId || !messageText.trim()) return false;

    try {
      const messageData = {
        car_id: carId,
        sender_id: userId,
        recipient_id: recipientId,
        message: messageText,
        read: false
      };

      console.log("Sending reply:", messageData);

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) {
        console.error("Error sending reply:", error);
        toast({
          title: "Send Failed",
          description: "There was an error sending your reply. Please try again.",
          variant: "destructive",
        });
        return false;
      } 
      
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully.",
      });
      
      // Refresh messages
      fetchMessages();
      return true;
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Send Failed",
        description: "There was an error sending your reply. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    receivedMessages,
    sentMessages,
    loading,
    refreshing,
    error,
    unreadCount,
    fetchMessages,
    markAsRead,
    sendReply
  };
};
