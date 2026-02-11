import { MessageCircle } from 'lucide-react';

interface FloatingAskBotProps {
  onClick: () => void;
}

export function FloatingAskBot({ onClick }: FloatingAskBotProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping"></div>

      {/* Main button */}
      <button
        onClick={onClick}
        className="
          relative
          w-14 h-14
          rounded-full
          bg-blue-600
          text-white
          flex items-center justify-center
          shadow-lg
          hover:bg-blue-700
          transition
        "
        aria-label="AskBot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
