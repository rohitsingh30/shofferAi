export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-3 shadow-lg shadow-primary/10">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/20">
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.06]">
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-200">
          {message.content}
        </p>
      </div>
    </div>
  );
}
