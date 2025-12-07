import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="gradient-primary p-4">
            <h3 className="font-semibold text-primary-foreground">Support Chat</h3>
            <p className="text-sm text-primary-foreground/80">We're here to help!</p>
          </div>

          {/* Messages Area */}
          <div className="h-64 p-4 overflow-y-auto bg-secondary/30">
            <div className="bg-card rounded-lg p-3 mb-3 max-w-[80%]">
              <p className="text-sm">Hi there! 👋 How can we help you today?</p>
              <span className="text-xs text-muted-foreground mt-1 block">Support Team</span>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) {
                  setMessage('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-10 px-4 rounded-lg bg-secondary border-0 focus:ring-2 focus:ring-primary outline-none text-sm"
              />
              <Button type="submit" size="icon" className="gradient-primary h-10 w-10">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
