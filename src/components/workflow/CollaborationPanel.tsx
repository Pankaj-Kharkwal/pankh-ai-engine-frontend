import React, { useState, useEffect } from "react";
import {
  Users,
  MessageCircle,
  Share2,
  User,
  Send,
  X,
  Eye,
  EyeOff,
  Copy,
  Link,
  Mail,
  Check, // Added Check icon for resolved comments
} from "lucide-react";

interface UserPresence {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
  currentNode?: string;
  cursorPosition?: { x: number; y: number };
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  nodeId?: string;
  position?: { x: number; y: number };
  resolved: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
}

interface CollaborationPanelProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  currentUserId: string;
  workflowId: string;
}

const SAMPLE_USERS: UserPresence[] = [
  {
    id: "user1",
    name: "Alice Johnson",
    color: "#3b82f6",
    isOnline: true,
    lastSeen: new Date(),
    currentNode: "ai_generator",
  },
  {
    id: "user2",
    name: "Bob Smith",
    color: "#10b981",
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: "user3",
    name: "Carol Davis",
    color: "#f59e0b",
    isOnline: false,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
];

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "comment1",
    userId: "user1",
    userName: "Alice Johnson",
    content:
      "This AI generator block needs better error handling for API timeouts.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    nodeId: "ai_generator",
    resolved: false,
    replies: [
      {
        id: "reply1",
        userId: "user2",
        userName: "Bob Smith",
        content: "Agreed, I'll add a retry mechanism.",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    ],
  },
  {
    id: "comment2",
    userId: "user3",
    userName: "Carol Davis",
    content:
      "The data flow between search and scrape blocks could be optimized.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    resolved: true,
    replies: [],
  },
];

export default function CollaborationPanel({
  isVisible,
  onToggleVisibility,
  currentUserId,
  workflowId,
}: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<"users" | "comments" | "share">(
    "comments",
  ); // Default to comments for a conversation-focused panel
  const [users, setUsers] = useState<UserPresence[]>(SAMPLE_USERS);
  const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  // Generate share URL
  useEffect(() => {
    setShareUrl(`${window.location.origin}/workflow/${workflowId}`);
  }, [workflowId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId: currentUserId,
      userName: "You", // In real app, get from user context
      content: newComment,
      timestamp: new Date(),
      resolved: false,
      replies: [],
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };

  const addReply = (commentId: string) => {
    if (!newReply.trim()) return;

    const reply: Reply = {
      id: `reply_${Date.now()}`,
      userId: currentUserId,
      userName: "You",
      content: newReply,
      timestamp: new Date(),
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment,
      ),
    );
    setNewReply("");
    setSelectedComment(null);
  };

  const toggleCommentResolved = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, resolved: !comment.resolved }
          : comment,
      ),
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  // Helper to get the user's color or a default one
  const getUserColor = (userId: string, isReply: boolean = false) => {
    const user = users.find((u) => u.id === userId);
    if (userId === currentUserId) return isReply ? "#6b7280" : "#4f46e5"; // Use indigo for 'You'
    return user?.color || "#6b7280"; 
  }

  const onlineUsers = users.filter((user) => user.isOnline);
  const unresolvedComments = comments.filter((comment) => !comment.resolved);

  if (!isVisible) {
    return (
      <div className="fixed top-[50%] right-4 transform -translate-y-1/2 z-40">
        <div className="relative">
          <button
            onClick={onToggleVisibility}
            className="bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300"
            title="Collaboration Panel"
          >
            <MessageCircle className="w-5 h-5 text-indigo-600" />
          </button>

          {/* Notification badges (Improved visibility) */}
          {(onlineUsers.length > 1 || unresolvedComments.length > 0) && (
            <div className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${unresolvedComments.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
              title={`${onlineUsers.length - 1} online, ${unresolvedComments.length} unresolved comments`}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 max-h-[80vh] bg-white border border-gray-200 rounded-xl shadow-2xl z-40 flex flex-col font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-indigo-50 rounded-t-xl">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Collaboration</span>
        </h3>
        <button
          onClick={onToggleVisibility}
          className="p-1.5 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-white"
          title="Hide Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
            { id: "users", Icon: Users, label: `Users (${onlineUsers.length})` },
            { id: "comments", Icon: MessageCircle, label: `Comments (${comments.length})` },
            { id: "share", Icon: Share2, label: "Share" },
        ].map(({ id, Icon, label }) => (
            <button
                key={id}
                onClick={() => setActiveTab(id as "users" | "comments" | "share")}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center space-x-2 
                    ${activeTab === id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
            >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* --- USERS TAB --- */}
        {activeTab === "users" && (
          <div className="p-4 space-y-6">
            <h4 className="text-sm font-bold text-gray-700">Online ({onlineUsers.length})</h4>

            {onlineUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No other users online</p>
              </div>
            ) : (
              <div className="space-y-4">
                {onlineUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center space-x-3 p-2 rounded-lg ${user.id === currentUserId ? 'bg-indigo-100/50' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.name} {user.id === currentUserId && "(You)"}
                      </div>
                      {user.currentNode && (
                        <div className="text-xs font-semibold mt-0.5" style={{ color: user.color }}>
                          Editing: {user.currentNode}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-bold text-gray-700 mb-3">
                Recently Active
              </h4>
              <div className="space-y-3">
                {users
                  .filter((user) => !user.isOnline)
                  .slice(0, 3)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 opacity-80"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-700 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last seen: {formatTimeAgo(user.lastSeen)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* --- COMMENTS TAB --- */}
        {activeTab === "comments" && (
          <div className="p-4 flex flex-col h-full">
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No comments yet</p>
                  <p className="text-xs mt-1">Start a conversation below.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`border rounded-xl p-3 transition-shadow duration-200 shadow-sm 
                      ${comment.resolved
                          ? "bg-green-50 border-green-200 opacity-80"
                          : "bg-white border-gray-200 hover:shadow-md"
                      }`}
                  >
                    {/* Comment Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: getUserColor(comment.userId) }}
                        >
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {comment.userName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimeAgo(comment.timestamp)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCommentResolved(comment.id)}
                        className={`flex items-center text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                            comment.resolved
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        title={comment.resolved ? "Unresolve Comment" : "Mark as Resolved"}
                      >
                        {comment.resolved ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Check className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100" />
                        )}
                        {comment.resolved ? "Resolved" : "Resolve"}
                      </button>
                    </div>

                    {/* Comment Content */}
                    <div className="text-sm text-gray-700 mb-3 ml-8">
                      {comment.content}
                    </div>

                    {/* Node Reference */}
                    {comment.nodeId && (
                      <div className="text-xs text-indigo-600 font-medium mb-2 ml-8 cursor-pointer hover:underline">
                        <Link className="w-3 h-3 inline mr-1" /> Referenced: {comment.nodeId}
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="space-y-3 mb-3 pl-4 border-l-2 border-gray-200 ml-8">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="text-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: getUserColor(reply.userId, true) }}
                              >
                                {reply.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900">
                                {reply.userName}
                              </span>
                              <span className="text-xs text-gray-500">
                                • {formatTimeAgo(reply.timestamp)}
                              </span>
                            </div>
                            <div className="text-gray-700 ml-6">
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input/Button */}
                    <div className="ml-8 mt-2">
                        {selectedComment === comment.id ? (
                            <div className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <textarea
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={2}
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => {setSelectedComment(null); setNewReply("")}}
                                        className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm font-medium rounded hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => addReply(comment.id)}
                                        disabled={!newReply.trim()}
                                        className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setSelectedComment(comment.id)}
                                className="text-xs text-indigo-600 font-medium hover:bg-indigo-50 px-2 py-1 rounded transition-colors border border-transparent hover:border-indigo-200"
                            >
                                {comment.replies.length > 0 ? "Add another reply" : "Reply"}
                            </button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Add Comment (Fixed at Bottom) */}
            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 mt-4 -mx-4">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a new comment on the workflow..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  rows={2}
                />
                {newComment.trim() && (
                    <button onClick={() => setNewComment("")} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
              </div>
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="flex items-center mt-2 space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                <span>Post Comment</span>
              </button>
            </div>
          </div>
        )}

        {/* --- SHARE TAB --- */}
        {activeTab === "share" && (
          <div className="p-4 space-y-6">
            <h4 className="text-sm font-bold text-gray-700">Share Workflow</h4>

            {/* Share URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Workflow URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm truncate"
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h5 className="text-sm font-bold text-gray-700">
                Direct Sharing
              </h5>

              <div className="space-y-2">
                <button
                  onClick={() =>
                    copyToClipboard(`Check out this workflow: ${shareUrl}`)
                  }
                  className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-white hover:bg-indigo-50 text-left transition-colors"
                >
                  <Link className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Copy Link
                    </div>
                    <div className="text-xs text-gray-500">
                      Get a direct link to the workflow
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `mailto:?subject=Workflow Share&body=Check out this workflow: ${shareUrl}`,
                    )
                  }
                  className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg bg-white hover:bg-indigo-50 text-left transition-colors"
                >
                  <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Send via Email
                    </div>
                    <div className="text-xs text-gray-500">Share with colleagues via email</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-sm font-bold text-gray-700 mb-3">
                Permissions
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                  <span className="text-gray-600">Public Access</span>
                  <span className="text-green-600 font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                  <span className="text-gray-600">Allow Comments</span>
                  <span className="text-green-600 font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                  <span className="text-gray-600">Allow Edits</span>
                  <span className="text-orange-600 font-bold">View Only</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}