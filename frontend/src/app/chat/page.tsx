'use client';

import { ChatLayout, ChatArea } from '@/components/chat';

export default function ChatPage() {
    return (
        <ChatLayout>
            <ChatArea
                conversationId="1"
                conversationName="João Silva"
                isOnline={true}
            />
        </ChatLayout>
    );
}
