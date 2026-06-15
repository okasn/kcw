import type { ChatMessage, Manifest } from '@/lib/types';
import MessageItem from './MessageItem';
import DateDivider from './DateDivider';

export default function ChatView({
  messages,
  profile,
}: {
  messages: ChatMessage[];
  profile: Manifest['profile'];
}) {
  let lastDate = '';

  return (
    <div className="chatScreen">
      {messages.map((msg) => {
        const date = msg.createdAt.slice(0, 10);
        const showDate = date !== lastDate;
        lastDate = date;

        return (
          <div key={msg.id}>
            {showDate && <DateDivider iso={msg.createdAt} />}
            <MessageItem msg={msg} profile={profile} />
          </div>
        );
      })}
    </div>
  );
}