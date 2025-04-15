
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Message } from "../types/MessageTypes";

export const useAdminMessages = (userId: string | undefined) => {
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
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
        return;
      }
      
      console.log("Received messages data:", receivedData);
      
      // Get profile data for received messages
      const enhancedReceivedMessages = await Promise.all(
        (receivedData || []).map(async (msg) => {
          try {
            // Get sender profile
            const { data: senderData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', msg.sender_id)
              .maybeSingle();
              
            // Get recipient profile (should be the current user)
            const { data: recipientData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', msg.recipient_id)
              .maybeSingle();
              
            return {
              ...msg,
              sender_profile: senderData || { full_name: 'Unknown User' },
              recipient_profile: recipientData || { full_name: 'Unknown User' },
              sender_name: senderData?.full_name || 'Unknown User',
              recipient_name: recipientData?.full_name || 'Unknown User',
              car_title: msg.car?.title || 'Unknown car'
            } as Message;
          } catch (error) {
            console.error("Error processing message:", error);
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
              .eq('id', msg.sender_id)
              .maybeSingle();
              
            // Get recipient profile
            const { data: recipientData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', msg.recipient_id)
              .maybeSingle();
              
            return {
              ...msg,
              sender_profile: senderData || { full_name: 'Unknown User' },
              recipient_profile: recipientData || { full_name: 'Unknown User' },
              sender_name: senderData?.full_name || 'Unknown User',
              recipient_name: recipientData?.full_name || 'Unknown User',
              car_title: msg.car?.title || 'Unknown car'
            } as Message;
          } catch (error) {
            console.error("Error processing message:", error);
            return null;
          }
        })
      );
      
      setSentMessages(enhancedSentMessages.filter(Boolean) as Message[]);
      
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', id);
        
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setReceivedMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, read: true } : msg
      ));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, read: true });
      }
      
      toast({
        title: "Message updated",
        description: "The message has been marked as read",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
        
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setReceivedMessages(prev => prev.filter(msg => msg.id !== id));
      setSentMessages(prev => prev.filter(msg => msg.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSendReply = async (recipientId: string, carId: string, message: string) => {
    if (!userId || !message.trim()) return false;

    setSendingReply(true);
    try {
      const messageData = {
        car_id: carId,
        sender_id: userId,
        recipient_id: recipientId,
        message: message,
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
    } finally {
      setSendingReply(false);
    }
  };

  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!userId) return;
    
    // Create a unique channel identifier for this user
    const channel = supabase
      .channel('admin-messages-' + userId)
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
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMessages]);

  return {
    receivedMessages,
    sentMessages,
    loading,
    error,
    refreshing,
    selectedMessage,
    deleting,
    replyText,
    sendingReply,
    fetchMessages,
    handleMarkAsRead,
    handleDeleteMessage,
    handleSendReply,
    setSelectedMessage,
    setReplyText
  };
};
