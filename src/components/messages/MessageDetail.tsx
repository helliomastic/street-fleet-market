
import { useState } from "react";
import { Message } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MessageDetailProps {
  message: Message | null;
  userId: string | undefined;
  onSendReply: (carId: string, recipientId: string, message: string) => Promise<boolean>;
}

export const MessageDetail = ({ message, userId, onSendReply }: MessageDetailProps) => {
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendReply = async () => {
    if (!message || !replyText.trim() || !userId) return;
    
    setSendingReply(true);
    try {
      const recipientId = message.sender_id === userId 
        ? message.recipient_id 
        : message.sender_id;
      
      const success = await onSendReply(message.car_id, recipientId, replyText);
      
      if (success) {
        setReplyText("");
      }
    } finally {
      setSendingReply(false);
    }
  };

  if (!message) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No message selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a message from the list to view it here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {message.recipient_id === userId 
                ? `From: ${message.sender_profile?.full_name || 'Anonymous'}` 
                : `To: ${message.recipient_profile?.full_name || 'Anonymous'}`}
            </CardTitle>
            <CardDescription>
              {message.car?.title || `${message.car?.make} ${message.car?.model} ${message.car?.year}`}
            </CardDescription>
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(message.created_at)}
            {message.recipient_id === userId && message.read && (
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
          <p className="whitespace-pre-wrap">{message.message}</p>
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
  );
};
