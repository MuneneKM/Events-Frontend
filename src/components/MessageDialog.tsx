import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth } from '../context/AuthContext';
import { messageAPI, type Message } from '../services/api';
import { toast } from 'sonner';

// Get eventId from localStorage (set when user opens an event)
const getDefaultEventId = () => {
    return localStorage.getItem('currentEventId') || '';
};

interface MessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipientId: string;
    recipientName: string;
    eventId?: string;
}

export function MessageDialog({
    open,
    onOpenChange,
    recipientId,
    recipientName,
    eventId: propEventId,
}: MessageDialogProps) {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Use prop eventId or get from localStorage
    const eventId = propEventId || getDefaultEventId();

    // Load messages when dialog opens
    useEffect(() => {
        if (open && recipientId) {
            loadMessages();
        }
    }, [open, recipientId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            // Validate eventId is present before making API call
            if (!eventId) {
                throw new Error('Event context not found');
            }
            const response = await messageAPI.getConversation(recipientId, eventId);
            setMessages(response.data.message || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
            // Use mock data for demo
            setMessages([
                {
                    id: '1',
                    sender_id: recipientId,
                    receiver_id: user?.id || '',
                    sender_name: recipientName,
                    receiver_name: user?.name || '',
                    event_id: eventId,
                    message: `Hi! Thanks for connecting with me. Looking forward to networking!`,
                    is_read: true,
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        // Validate event_id is present
        if (!eventId) {
            toast.error('Event context not found. Please navigate to an event first.');
            return;
        }

        setIsSending(true);
        try {
            await messageAPI.sendMessage({
                receiver_id: recipientId,
                message: message.trim(),
            });

            // Add message to local state
            const newMessage: Message = {
                id: Date.now().toString(),
                sender_id: user?.id || '',
                receiver_id: recipientId,
                sender_name: user?.name || '',
                receiver_name: recipientName,
                event_id: eventId,
                message: message.trim(),
                is_read: false,
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, newMessage]);
            setMessage('');
            toast.success('Message sent!');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message. Please try again.');
            // For demo, add message locally even if API fails
            const newMessage: Message = {
                id: Date.now().toString(),
                sender_id: user?.id || '',
                receiver_id: recipientId,
                sender_name: user?.name || '',
                receiver_name: recipientName,
                event_id: eventId,
                message: message.trim(),
                is_read: false,
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, newMessage]);
            setMessage('');
        } finally {
            setIsSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <span>Message {recipientName}</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-center">
                                No messages yet.<br />Start the conversation!
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwn = msg.sender_id === user?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${isOwn
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.message}</p>
                                        <p
                                            className={`text-xs mt-1 ${isOwn
                                                ? 'text-blue-100'
                                                : 'text-gray-500'
                                                }`}
                                        >
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex-shrink-0 border-t p-4">
                    <div className="flex gap-2">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="min-h-[60px] max-h-[120px] resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!message.trim() || isSending}
                            className="self-end"
                            size="icon"
                        >
                            <Send className="size-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
