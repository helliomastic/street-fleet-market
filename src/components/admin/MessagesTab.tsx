
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { MessageSquare, Trash2, CheckCircle, RefreshCw, Mail, Send, Check } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  car?: {
    title: string;
    make: string;
    model: string;
    year: number;
  };
  sender_profile?: {
    full_name: string | null;
  };
  recipient_profile?: {
    full_name: string | null;
  };
}

export const MessagesTab = () => {
  const { user } = useAuth();
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setRefreshing(true);
    
    try {
      console.log("Fetching messages for user:", user.id);
      
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
        .eq('recipient_id', user.id)
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
        .eq('sender_id', user.id)
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
  }, [user]);

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

  const selectMessage = (message: Message) => {
    setSelectedMessage(message);
    // If it's a received message, mark it as read
    if (message.recipient_id === user?.id && !message.read) {
      handleMarkAsRead(message.id);
    }
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim() || !user) return;

    setSendingReply(true);
    try {
      const messageData = {
        car_id: selectedMessage.car_id,
        sender_id: user.id,
        recipient_id: selectedMessage.sender_id === user.id 
          ? selectedMessage.recipient_id 
          : selectedMessage.sender_id,
        message: replyText,
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
      } else {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent successfully.",
        });
        setReplyText("");
        // Refresh messages
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Send Failed",
        description: "There was an error sending your reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
      
      // Set up realtime subscription for new messages
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
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
    }
  }, [user, fetchMessages]);

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <div className="text-center py-10">
          <p>Please log in to view your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg mb-4">
          Error loading messages: {error}
          <Button variant="outline" className="ml-4" onClick={fetchMessages}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="received" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="received" className="flex-1">
                  Inbox {receivedMessages.filter(m => !m.read).length > 0 && 
                    <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {receivedMessages.filter(m => !m.read).length}
                    </span>
                  }
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex-1">Sent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="received" className="mt-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse p-3 rounded-lg border">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : receivedMessages.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Mail className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No messages</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't received any messages yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {receivedMessages.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id 
                            ? 'bg-brand-blue text-white' 
                            : message.read 
                              ? 'bg-white hover:bg-gray-100 border' 
                              : 'bg-brand-blue bg-opacity-10 border-2 border-brand-blue hover:bg-opacity-20'
                        }`}
                        onClick={() => selectMessage(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`font-medium ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-900'}`}>
                              {message.sender_name || 'Anonymous'} 
                              {!message.read && <span className="ml-2 text-xs font-bold text-red-500">New</span>}
                            </p>
                            <p className={`text-sm truncate ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-500'}`}>
                              {message.car?.make} {message.car?.model} {message.car?.year}
                            </p>
                            <p className={`text-sm truncate mt-1 ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-700'}`}>
                              {message.message}
                            </p>
                          </div>
                          <p className={`text-xs mt-1 whitespace-nowrap ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sent" className="mt-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse p-3 rounded-lg border">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : sentMessages.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No sent messages</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't sent any messages yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentMessages.map((message) => (
                      <div 
                        key={message.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id 
                            ? 'bg-brand-blue text-white' 
                            : 'bg-white hover:bg-gray-100 border'
                        }`}
                        onClick={() => selectMessage(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`font-medium ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-900'}`}>
                              To: {message.recipient_name || 'Anonymous'}
                            </p>
                            <p className={`text-sm truncate ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-500'}`}>
                              {message.car?.make} {message.car?.model} {message.car?.year}
                            </p>
                            <p className={`text-sm truncate mt-1 ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-700'}`}>
                              {message.message}
                            </p>
                          </div>
                          <p className={`text-xs mt-1 whitespace-nowrap ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-500'}`}>
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {selectedMessage.recipient_id === user.id 
                          ? `From: ${selectedMessage.sender_name || 'Anonymous'}` 
                          : `To: ${selectedMessage.recipient_name || 'Anonymous'}`}
                      </CardTitle>
                      <CardDescription>
                        {selectedMessage.car_title || `${selectedMessage.car?.make} ${selectedMessage.car?.model} ${selectedMessage.car?.year}`}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(selectedMessage.created_at)}
                      {selectedMessage.recipient_id === user.id && selectedMessage.read && (
                        <div className="flex items-center text-green-600 mt-1">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Read</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4">
                  <div className="w-full space-y-2">
                    <h3 className="font-medium">Reply</h3>
                    <div className="flex">
                      <Input
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="mr-2"
                      />
                      <Button 
                        onClick={handleSendReply} 
                        disabled={!replyText.trim() || sendingReply}
                      >
                        {sendingReply ? 'Sending...' : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No message selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Select a message from the list to view it here.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
