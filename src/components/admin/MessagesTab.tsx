
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { AdminMessageList } from "./components/AdminMessageList";
import { AdminMessageDetail } from "./components/AdminMessageDetail";
import { useAdminMessages } from "./hooks/useAdminMessages";
import { Message } from "./types/MessageTypes";

export const MessagesTab = () => {
  const { user } = useAuth();
  
  const {
    receivedMessages,
    sentMessages,
    loading,
    error,
    refreshing,
    selectedMessage,
    replyText,
    sendingReply,
    fetchMessages,
    handleMarkAsRead,
    handleSendReply,
    setSelectedMessage,
    setReplyText
  } = useAdminMessages(user?.id);

  const handleRefresh = () => {
    fetchMessages();
  };

  const selectMessage = (message: Message) => {
    setSelectedMessage(message);
    // If it's a received message, mark it as read
    if (message.recipient_id === user?.id && !message.read) {
      handleMarkAsRead(message.id);
    }
    setReplyText("");
  };

  const handleSendReplyClick = async () => {
    if (!selectedMessage || !replyText.trim() || !user) return;
    
    const recipientId = selectedMessage.sender_id === user.id 
      ? selectedMessage.recipient_id 
      : selectedMessage.sender_id;
      
    await handleSendReply(recipientId, selectedMessage.car_id, replyText);
    setReplyText("");
  };

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
                <AdminMessageList
                  messages={receivedMessages}
                  loading={loading}
                  selectedMessageId={selectedMessage?.id || null}
                  userId={user.id}
                  onSelectMessage={selectMessage}
                />
              </TabsContent>
              
              <TabsContent value="sent" className="mt-4">
                <AdminMessageList
                  messages={sentMessages}
                  loading={loading}
                  selectedMessageId={selectedMessage?.id || null}
                  userId={user.id}
                  onSelectMessage={selectMessage}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Message Detail */}
          <div className="lg:col-span-2">
            <AdminMessageDetail 
              message={selectedMessage}
              userId={user.id}
              replyText={replyText}
              sendingReply={sendingReply}
              onReplyTextChange={setReplyText}
              onSendReply={handleSendReplyClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};
