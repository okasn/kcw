import type { ChatMessage } from '@/lib/types';
import { getTextContent } from '@/lib/message';

export default function TextMessage({
  msg,
  fanNickname,
}: {
  msg: ChatMessage;
  fanNickname?: string;
}) {
  return <div className="textBubble">{getTextContent(msg, fanNickname)}</div>;
}