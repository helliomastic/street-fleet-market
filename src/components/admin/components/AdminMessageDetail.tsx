
import { useState } from "react";
import { Message } from "../types/MessageTypes";
import { MessageDetail } from "@/components/messages/MessageDetail";

interface AdminMessageDetailProps {
  message: Message | null;
  userId: string | undefined;
  replyText: string;
  sendingReply: boolean;
  onReplyTextChange: (text: string) => void;
  onSendReply: () => Promise<void>;
}

export const AdminMessageDetail = ({ 
  message, 
  userId,
  replyText,
  sendingReply,
  onReplyTextChange,
  onSendReply
}: AdminMessageDetailProps) => {
  // Convert the admin message to the format expected by MessageDetail
  const adaptedMessage = message ? {
    ...message,
    car: message.car || {
      title: message.car_title || '',
      make: message.car?.make || '',
      model: message.car?.model || '',
      year: message.car?.year || 0
    },
    sender_profile: message.sender_profile || { 
      full_name: message.sender_name || null 
    },
    recipient_profile: message.recipient_profile || { 
      full_name: message.recipient_name || null 
    }
  } : null;

  // Custom send reply handler that uses the admin props
  const handleSendReply = async (carId: string, recipientId: string, message: string) => {
    if (message === replyText) {
      await onSendReply();
      return true;
    }
    return false;
  };

  // Custom reply input handler for admin
  const AdminReplyInput = () => (
    <div className="w-full space-y-2">
      <h3 className="font-medium">Reply</h3>
      <div className="flex">
        <input
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mr-2"
          placeholder="Type your reply..."
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
        />
        <button 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={onSendReply} 
          disabled={!replyText.trim() || sendingReply}
        >
          {sendingReply ? 'Sending...' : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send h-4 w-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>}
        </button>
      </div>
    </div>
  );

  return (
    <MessageDetail 
      message={adaptedMessage as any} 
      userId={userId}
      onSendReply={handleSendReply}
      customReplyInput={<AdminReplyInput />}
    />
  );
};
