
import { Message } from "../types/MessageTypes";
import { MessageList } from "@/components/messages/MessageList";

interface AdminMessageListProps {
  messages: Message[];
  loading: boolean;
  selectedMessageId: string | null;
  userId: string | undefined;
  onSelectMessage: (message: Message) => void;
}

export const AdminMessageList = ({ 
  messages, 
  loading, 
  selectedMessageId, 
  userId, 
  onSelectMessage 
}: AdminMessageListProps) => {
  // Convert admin messages to the format expected by MessageList
  const adaptedMessages = messages.map(message => ({
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
  }));

  return (
    <MessageList
      messages={adaptedMessages as any}
      loading={loading}
      selectedMessageId={selectedMessageId}
      userId={userId}
      onSelectMessage={onSelectMessage as any}
    />
  );
};
