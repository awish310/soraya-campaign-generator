import { Leaf } from 'lucide-react';

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="toast-enter fixed bottom-6 left-1/2 -translate-x-1/2 bg-forest-900 text-cream-50 px-5 py-3 rounded-full shadow-2xl text-sm font-medium z-50 flex items-center gap-2"
    >
      <Leaf size={16} className="text-sage-300" />
      <span>{message}</span>
    </div>
  );
}
