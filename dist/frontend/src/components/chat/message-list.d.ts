import { Message } from '@/hooks/use-chat';
interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}
export declare function MessageList({ messages, isLoading }: MessageListProps): import("react").JSX.Element;
export {};
