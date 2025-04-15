
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Message } from "./types";
import { useMessages } from "./hooks/useMessages";
import { MessageList } from "./MessageList";
import { MessageDetail } from "./MessageDetail";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function MessagesTab() {
  const { user } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const {
    receivedMessages,
    sentMessages,
    loading,
    refreshing,
    error,
    unreadCount,
    fetchMessages,
    markAsRead,
    sendReply
  } = useMessages(user?.id);

  const handleRefresh = () => {
    fetchMessages();
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    // If it's a received message, mark it as read
    if (message.recipient_id === user?.id && !message.read) {
      markAsRead(message.id);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Please log in to view your messages.</p>
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
                  Inbox {unreadCount > 0 && 
                    <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {unreadCount}
                    </span>
                  }
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex-1">Sent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="received" className="mt-4">
                <MessageList
                  messages={receivedMessages}
                  loading={loading}
                  selectedMessageId={selectedMessage?.id || null}
                  userId={user.id}
                  onSelectMessage={handleSelectMessage}
                />
              </TabsContent>
              
              <TabsContent value="sent" className="mt-4">
                <MessageList
                  messages={sentMessages}
                  loading={loading}
                  selectedMessageId={selectedMessage?.id || null}
                  userId={user.id}
                  onSelectMessage={handleSelectMessage}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Message Detail */}
          <div className="lg:col-span-2">
            <MessageDetail 
              message={selectedMessage} 
              userId={user.id}
              onSendReply={sendReply}
            />
          </div>
        </div>
      )}
    </div>
  );
}
