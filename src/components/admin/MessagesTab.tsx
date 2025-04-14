
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { MessageSquare, Trash2, CheckCircle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  recipient_id: string;
  car_id: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  recipient_name?: string;
  car_title?: string;
}

export const MessagesTab = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        setError(error.message);
        return;
      }
      
      // Get user info for sender and recipient
      const enhancedMessages = await Promise.all(
        (data || []).map(async (message) => {
          // Get sender info
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .single();
            
          // Get recipient info
          const { data: recipientData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.recipient_id)
            .single();
            
          // Get car info
          const { data: carData } = await supabase
            .from('cars')
            .select('title')
            .eq('id', message.car_id)
            .maybeSingle();
            
          return {
            ...message,
            sender_name: senderData?.full_name || 'Unknown',
            recipient_name: recipientData?.full_name || 'Unknown',
            car_title: carData?.title || 'Unknown car'
          };
        })
      );
      
      setMessages(enhancedMessages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      
      fetchMessages();
      
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
      
      fetchMessages();
      
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

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          Error loading messages: {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No messages found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`border rounded-lg p-4 ${!message.read ? 'bg-blue-50' : ''}`}>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{message.sender_name}</span>
                  <span className="text-gray-500"> → </span>
                  <span className="font-medium">{message.recipient_name}</span>
                </div>
                <div>
                  {!message.read ? (
                    <Badge variant="default" className="bg-blue-500">New</Badge>
                  ) : (
                    <Badge variant="outline">Read</Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">
                Re: <span className="italic">{message.car_title}</span>
              </p>
              
              <p className="my-2">{message.message}</p>
              
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">
                  {new Date(message.created_at).toLocaleString()}
                </span>
                
                <div className="flex gap-2">
                  {!message.read && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(message.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" /> Mark as Read
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-red-500 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Message</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this message? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteMessage(message.id)}
                          disabled={deleting}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
