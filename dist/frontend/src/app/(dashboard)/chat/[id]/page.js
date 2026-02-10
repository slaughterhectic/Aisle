'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ExistingChatPage;
const chat_interface_1 = require("@/components/chat/chat-interface");
const navigation_1 = require("next/navigation");
function ExistingChatPage() {
    const params = (0, navigation_1.useParams)();
    const id = params.id;
    return <chat_interface_1.ChatInterface conversationId={id}/>;
}
//# sourceMappingURL=page.js.map