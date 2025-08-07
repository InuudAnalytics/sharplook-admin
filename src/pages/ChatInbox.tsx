import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { HttpClient } from "../../api/HttpClient";

// Types for chat functionality
interface Message {
  id?: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  message: string;
  createdAt: string;
  type: "text";
  sent?: boolean;
  delivered?: boolean;
  seen?: boolean;
  seenAt?: string;
  sending?: boolean;
  error?: boolean;
  errorMessage?: string;
  status?: string;
}

interface Conversation {
  id: string;
  roomId: string;
  receiver: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  lastMessage?: string;
  time?: string;
  unread?: number;
}

const ChatInbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [searchQuery, setSearchQuery] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markAsReadTimeoutRef = useRef<number | null>(null);
  const hasUnreadMessages = useRef(false);

  // Get user ID from localStorage
  const getUserId = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData._id;
    }
    return null;
  };

  const userId = getUserId();

  // Debug authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    console.log("Auth Debug:", {
      token: token ? "Token exists" : "No token",
      user: user ? JSON.parse(user) : "No user",
      userId: userId,
    });
  }, [userId]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update chat preview when new message is received
  const updateChatPreview = (newMessage: Message) => {
    // Update the conversations list to move the updated chat to the top
    setConversations((prevChats) => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(
        (chat) => chat.roomId === newMessage.roomId
      );

      if (chatIndex !== -1) {
        const chat = updatedChats.splice(chatIndex, 1)[0];
        updatedChats.unshift(chat);
      }

      return updatedChats;
    });
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log("Testing API connection...");
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      console.log("Token:", token ? "Exists" : "Missing");
      console.log("User:", user ? JSON.parse(user) : "Missing");
      console.log("UserId:", userId);

      // Test a simple API call first
      const testResponse = await HttpClient.get("/auth/me");
      console.log("Auth test response:", testResponse.data);

      return true;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  };

  // Fetch chat list from backend
  const fetchChats = async () => {
    if (!userId) {
      console.error("No userId provided");
      setError("No user ID available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Test API connection first
      const apiConnected = await testApiConnection();
      if (!apiConnected) {
        setError("Cannot connect to API. Please check your authentication.");
        return;
      }

      console.log("Fetching chats for userId:", userId);

      const [chatlistRes, chatPreviewRes] = await Promise.all([
        HttpClient.get(`/messages/chats/${userId}`),
        HttpClient.get(`/messages/previews/${userId}`),
      ]);

      console.log("Chat list response:", chatlistRes);
      console.log("Chat preview response:", chatPreviewRes);

      if (!chatlistRes.data.success) {
        throw new Error(chatlistRes.data.error || "Failed to fetch chat list");
      }

      setConversations(chatlistRes.data.data || []);

      // Note: Chat previews are now handled directly in the conversations data
      // The preview data is already included in the chatlistRes response

      console.log("Successfully fetched chats:", chatlistRes.data.data);
    } catch (err: any) {
      console.error("Error fetching chats:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to load chats";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific room
  const fetchMessages = async (roomId: string) => {
    try {
      const response = await HttpClient.get(`/messages/${roomId}`);
      console.log("Fetched messages:", response.data);
      if (response.data.success && response.data.data) {
        const sortedMessages = response.data.data.sort(
          (a: Message, b: Message) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);

        // Check if there are unread messages from other users
        const unreadMessages = sortedMessages.filter(
          (msg: Message) => msg.senderId !== userId && !msg.seen
        );
        if (unreadMessages.length > 0) {
          hasUnreadMessages.current = true;
          debouncedMarkAsRead();
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      if (!hasUnreadMessages.current || !selectedConversation) return;

      const response = await HttpClient.patch(
        `/messages/${selectedConversation.roomId}/read`
      );
      if (response.data.success) {
        console.log("Messages marked as read");
        hasUnreadMessages.current = false;

        // Update local state to reflect read status
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            seen: msg.senderId !== userId ? true : msg.seen,
            seenAt:
              msg.senderId !== userId ? new Date().toISOString() : msg.seenAt,
          }))
        );

        // Emit socket event to notify other users
        if (socketRef.current?.connected) {
          socketRef.current.emit("messagesRead", {
            roomId: selectedConversation.roomId,
            userId,
          });
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Debounced mark as read function
  const debouncedMarkAsRead = () => {
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    markAsReadTimeoutRef.current = setTimeout(() => {
      markMessagesAsRead();
    }, 1000);
  };

  // Setup socket connection
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up socket connection...", { userId });

    setConnectionStatus("connecting");

    // Initialize socket connection
    socketRef.current = io("https://sharplook-backend.onrender.com", {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 30000,
      forceNew: false,
      autoConnect: true,
    });

    // Handle connection events
    socketRef.current.on("connect", () => {
      console.log("✅ Chat socket connected with ID:", socketRef.current?.id);
      setConnectionStatus("connected");

      if (selectedConversation) {
        socketRef.current?.emit("join-room", selectedConversation.roomId);
        console.log("📍 Joined room:", selectedConversation.roomId);
      }
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Chat socket disconnected:", reason);
      setConnectionStatus("disconnected");
    });

    socketRef.current.on("reconnect", (attemptNumber) => {
      console.log(
        "🔄 Chat socket reconnected after",
        attemptNumber,
        "attempts"
      );
      setConnectionStatus("connected");
      if (selectedConversation) {
        socketRef.current?.emit("join-room", selectedConversation.roomId);
      }
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message || error);
      setConnectionStatus("error");
    });

    // Listen for new messages
    socketRef.current.on("newMessage", (message: Message) => {
      console.log("📨 New message received:", message);
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) =>
            msg.id === message.id ||
            (msg.tempId && msg.tempId === message.tempId)
        );

        if (!messageExists) {
          if (message.senderId !== userId) {
            hasUnreadMessages.current = true;
            debouncedMarkAsRead();
          }
          return [...prevMessages, message];
        }

        return prevMessages.map((msg) =>
          msg.tempId === message.tempId ? message : msg
        );
      });

      // Update chat preview
      updateChatPreview(message);
    });

    // Listen for message delivery confirmations
    socketRef.current.on(
      "messageDelivered",
      ({ messageId, tempId, status }) => {
        console.log("✅ Message delivered:", { messageId, tempId, status });
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId || msg.tempId === tempId
              ? { ...msg, delivered: true, status: status || "delivered" }
              : msg
          )
        );
      }
    );

    // Listen for message seen confirmations
    socketRef.current.on("messageSeen", ({ messageId, tempId, seenAt }) => {
      console.log("👁️ Message seen:", { messageId, tempId, seenAt });
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId || msg.tempId === tempId
            ? { ...msg, seen: true, seenAt }
            : msg
        )
      );
    });

    // Listen for when other users read messages
    socketRef.current.on(
      "messagesRead",
      ({ roomId: readRoomId, userId: readUserId }) => {
        console.log("👁️ Messages read by user:", { readRoomId, readUserId });
        if (
          readRoomId === selectedConversation?.roomId &&
          readUserId !== userId
        ) {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => ({
              ...msg,
              seen: msg.senderId === userId ? true : msg.seen,
              seenAt:
                msg.senderId === userId ? new Date().toISOString() : msg.seenAt,
            }))
          );
        }
      }
    );

    // Listen for message send confirmations
    socketRef.current.on("messageSent", (data) => {
      console.log("✅ Message sent confirmation:", data);
      const { tempId, message: sentMessage } = data;
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === tempId
            ? {
                ...msg,
                id: sentMessage.id || tempId,
                sending: false,
                sent: true,
                delivered: true,
                createdAt: sentMessage.createdAt || msg.createdAt,
              }
            : msg
        )
      );
    });

    // Listen for message send errors
    socketRef.current.on("messageError", (data) => {
      console.error("❌ Message send error:", data);
      const { tempId, error } = data;
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === tempId
            ? { ...msg, sending: false, error: true, errorMessage: error }
            : msg
        )
      );
    });

    // Fetch initial chats
    fetchChats();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log("🧹 Cleaning up socket connection...");
        socketRef.current.off("newMessage");
        socketRef.current.off("messageDelivered");
        socketRef.current.off("messageSeen");
        socketRef.current.off("messagesRead");
        socketRef.current.off("messageSent");
        socketRef.current.off("messageError");
        socketRef.current.disconnect();
      }
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [userId]);

  // Handle conversation selection
  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    fetchMessages(conversation.roomId);

    // Join the room
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-room", conversation.roomId);
      console.log("📍 Joined room:", conversation.roomId);
    }
  };

  // Send message function
  const sendMessage = () => {
    if (!input.trim() || !selectedConversation) {
      console.log(
        "❌ Cannot send message: No input or no conversation selected"
      );
      return;
    }

    if (!socketRef.current?.connected) {
      console.log("❌ Cannot send message: Socket not connected");
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const messageData: Message = {
      tempId,
      senderId: userId,
      receiverId: selectedConversation.receiver.id,
      roomId: selectedConversation.roomId,
      message: input.trim(),
      createdAt: new Date().toISOString(),
      type: "text",
    };

    console.log("📤 Sending message:", messageData);

    // Add message optimistically to UI
    const optimisticMessage: Message = {
      ...messageData,
      id: tempId,
      sent: false,
      delivered: false,
      seen: false,
      sending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");

    // Send message via socket
    socketRef.current.emit("sendMessage", messageData);

    // Set a timeout to mark as sent if no confirmation received
    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === tempId && msg.sending
            ? { ...msg, sending: false, sent: true, error: false }
            : msg
        )
      );
    }, 5000);
  };

  // Retry sending failed message
  const retryMessage = (message: Message) => {
    if (!socketRef.current?.connected || !selectedConversation) {
      console.log("Cannot retry - socket not connected or no conversation");
      return;
    }

    const newTempId = `retry_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const messageData: Message = {
      tempId: newTempId,
      senderId: userId,
      receiverId: selectedConversation.receiver.id,
      roomId: selectedConversation.roomId,
      message: message.message,
      createdAt: new Date().toISOString(),
      type: "text",
    };

    console.log("🔄 Retrying message:", messageData);

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.tempId === message.tempId || msg.id === message.id
          ? { ...msg, sending: true, error: false, tempId: newTempId }
          : msg
      )
    );

    socketRef.current.emit("sendMessage", messageData);

    setTimeout(() => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === newTempId && msg.sending
            ? { ...msg, sending: false, sent: true, error: false }
            : msg
        )
      );
    }, 5000);
  };

  // Format time display
  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date label like WhatsApp
  const formatDateLabel = (timestamp: string) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    const daysDiff = Math.floor(
      (today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString("en-US", { weekday: "long" });
    }

    return messageDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: Array<{ date: string; messages: Message[] }> = [];
    let currentDate: string | null = null;
    let currentGroup: Message[] = [];

    messages.forEach((message) => {
      const dateLabel = formatDateLabel(message.createdAt);

      if (dateLabel !== currentDate) {
        if (currentGroup.length > 0) {
          grouped.push({
            date: currentDate!,
            messages: currentGroup,
          });
        }
        currentDate = dateLabel;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      grouped.push({
        date: currentDate!,
        messages: currentGroup,
      });
    }

    return grouped;
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.receiver.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#fafbfc]">
        <div className="text-gray-600">Loading chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#fafbfc]">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchChats}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-10 bg-[#fafbfc]">
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside className="w-[340px] bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-100 focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 border-b ${
                  selectedConversation?.id === conv.id ? "bg-gray-100" : ""
                }`}
                onClick={() => handleConversationSelect(conv)}
              >
                <img
                  src={
                    conv.receiver.avatar ||
                    "https://randomuser.me/api/portraits/lego/1.jpg"
                  }
                  alt={conv.receiver.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                      {conv.receiver.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        conv.receiver.role === "Client"
                          ? "bg-pink-100 text-pink-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {conv.receiver.role}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {conv.lastMessage || "No messages yet"}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {conv.time || ""}
                  </span>
                  {conv.unread && conv.unread > 0 && (
                    <span className="mt-1 bg-pink-600 text-white text-[10px] rounded-full px-1">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col h-full">
          {selectedConversation ? (
            <>
              <div className="flex items-center gap-4 px-8 py-4 border-b bg-white">
                <img
                  src={
                    selectedConversation.receiver.avatar ||
                    "https://randomuser.me/api/portraits/lego/1.jpg"
                  }
                  alt={selectedConversation.receiver.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-lg text-gray-900">
                    {selectedConversation.receiver.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedConversation.receiver.role === "Client"
                          ? "bg-pink-100 text-pink-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {selectedConversation.receiver.role}
                    </span>
                    <span className="text-xs text-green-500">
                      {connectionStatus === "connected" ? (
                        <>
                          Online <span className="text-green-400">•</span>
                        </>
                      ) : connectionStatus === "connecting" ? (
                        "Connecting..."
                      ) : connectionStatus === "error" ? (
                        "Connection failed - Retrying..."
                      ) : (
                        "Offline"
                      )}
                    </span>
                    {connectionStatus === "error" && (
                      <button
                        onClick={() => {
                          if (socketRef.current) {
                            console.log("🔄 Manual reconnection attempt...");
                            socketRef.current.connect();
                          }
                        }}
                        className="ml-2 bg-white/20 rounded-full px-2 py-1 text-xs text-white hover:bg-white/30"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4 bg-[#fafbfc]">
                {groupMessagesByDate(messages).map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {/* Date Label */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-200 rounded-full px-4 py-1">
                        <span className="text-xs text-gray-600">
                          {group.date}
                        </span>
                      </div>
                    </div>

                    {/* Messages in this group */}
                    {group.messages.map((msg, index) => {
                      const isOwn = msg.senderId === userId;
                      return (
                        <div
                          key={msg.id || msg.tempId || index}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[60%] px-4 py-2 rounded-lg cursor-pointer ${
                              isOwn
                                ? "bg-pink-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            } ${msg.error ? "border border-red-300" : ""}`}
                            onClick={
                              msg.error ? () => retryMessage(msg) : undefined
                            }
                          >
                            <div>{msg.message}</div>
                            <div className="text-[10px] text-right mt-1 opacity-70">
                              {formatTime(msg.createdAt)}
                            </div>
                            {msg.error && (
                              <div className="flex items-center mt-1 text-red-400">
                                <span className="text-xs">Tap to retry</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t bg-white">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={connectionStatus !== "connected"}
                    className="flex-1 px-4 py-2 rounded border border-gray-200 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={
                      !input.trim() ||
                      connectionStatus !== "connected" ||
                      !selectedConversation
                    }
                    className="bg-pink-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-pink-600"
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="text-2xl mb-2">💬</div>
                <div>Select a conversation to start chatting</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatInbox;
