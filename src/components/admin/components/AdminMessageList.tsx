
import { Message } from "../types/MessageTypes";
import { Mail, MessageSquare } from "lucide-react";

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
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-3 rounded-lg border">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    const isInbox = userId && messages.some(m => m.recipient_id === userId);
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        {isInbox ? (
          <>
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No messages</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't received any messages yet.</p>
          </>
        ) : (
          <>
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No sent messages</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't sent any messages yet.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => {
        const isRecipient = message.recipient_id === userId;
        return (
          <div 
            key={message.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedMessageId === message.id 
                ? 'bg-brand-blue text-white' 
                : isRecipient && !message.read
                  ? 'bg-brand-blue bg-opacity-10 border-2 border-brand-blue hover:bg-opacity-20'
                  : 'bg-white hover:bg-gray-100 border'
            }`}
            onClick={() => onSelectMessage(message)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`font-medium ${selectedMessageId === message.id ? 'text-white' : 'text-gray-900'}`}>
                  {isRecipient 
                    ? message.sender_name || message.sender_profile?.full_name || 'Anonymous'
                    : `To: ${message.recipient_name || message.recipient_profile?.full_name || 'Anonymous'}`
                  } 
                  {isRecipient && !message.read && <span className="ml-2 text-xs font-bold text-red-500">New</span>}
                </p>
                <p className={`text-sm truncate ${selectedMessageId === message.id ? 'text-white' : 'text-gray-500'}`}>
                  {message.car?.make} {message.car?.model} {message.car?.year}
                </p>
                <p className={`text-sm truncate mt-1 ${selectedMessageId === message.id ? 'text-white' : 'text-gray-700'}`}>
                  {message.message}
                </p>
              </div>
              <p className={`text-xs mt-1 whitespace-nowrap ${selectedMessageId === message.id ? 'text-white' : 'text-gray-500'}`}>
                {new Date(message.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
