export interface ChatInputProps {
    onSend: (message: string) => Promise<void>;
    isLoading: boolean;
}
export declare function ChatInput({ onSend, isLoading }: ChatInputProps): import("react").JSX.Element;
