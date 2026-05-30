"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Reply,
  Send,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { commentApi, Comment } from "@/lib/api/comment/commentApi";
import { getTokens } from "@/lib/auth/tokenManager";
import { formatTimeAgo } from "@/services/dateService";
import { getUserInitial } from "@/services/common";
import { useAuth } from "@/components/auth/AuthProvider";

interface CommentProps {
  movieSlug: string;
  onCommentCountChange?: (count: number) => void;
}

interface ReplyState {
  parentId: string;
  parentUserName?: string;
  text: string;
}

function getUserFromToken(): {
  userId?: string;
  name?: string;
  email?: string;
} | null {
  const tokens = getTokens();
  if (!tokens?.accessToken) return null;

  try {
    const payload = tokens.accessToken.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function CommentComponent({
  movieSlug,
  onCommentCountChange,
}: CommentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>(
    {},
  );
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyState | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [likingComments, setLikingComments] = useState<Set<string>>(new Set());
  const [deletingComments, setDeletingComments] = useState<Set<string>>(
    new Set(),
  );

  const { user } = useAuth();

  const fetchComments = useCallback(
    async (page = 1) => {
      try {
        // Fetch all comments (root + all nested replies)
        const response = await commentApi.getComments(movieSlug, {
          page,
          limit: 100,
        });

        // Store all comments for nested structure building
        setAllComments(response.data);

        // Filter only root comments (parentId is null)
        const rootComments = response.data.filter(
          (comment: Comment) => comment.parentId === null
        );

        setComments(rootComments);
        setPagination({
          page: response.pagination.page,
          totalPages: response.pagination.totalPages,
          total: rootComments.length,
        });
        if (onCommentCountChange) {
          onCommentCountChange(rootComments.length);
        }

        return response;
      } catch (error) {
        console.error("Error fetching comments:", error);
        return null;
      }
    },
    [movieSlug, onCommentCountChange],
  );

  const getRepliesForComment = useCallback(
    (parentId: string): Comment[] => {
      // Get all direct replies for a given parent comment
      return allComments.filter((comment) => comment.parentId === parentId);
    },
    [allComments],
  );

  useEffect(() => {
    setLoading(true);
    fetchComments(1).finally(() => setLoading(false));
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await commentApi.createComment({
        movieSlug,
        text: newComment.trim(),
        parentId: null,
      });

      if (response.success) {
        setComments((prev) => [response.data, ...prev]);
        setNewComment("");
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));
        if (onCommentCountChange) {
          onCommentCountChange(pagination.total + 1);
        }
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyingTo?.text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await commentApi.createComment({
        movieSlug,
        text: replyingTo.text.trim(),
        parentId,
      });

      if (response.success) {
        // Add new comment to allComments
        setAllComments((prev) => [response.data, ...prev]);
        setReplyingTo(null);

        // Auto-expand replies section when new reply is added
        setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));

        // Update parent's replyCount
        setComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? { ...c, replyCount: (c.replyCount || 0) + 1 }
              : c,
          ),
        );

        // Also update in allComments to reflect in nested replies
        setAllComments((prev) =>
          prev.map((c) =>
            c._id === parentId
              ? { ...c, replyCount: (c.replyCount || 0) + 1 }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (likingComments.has(commentId)) return;

    setLikingComments((prev) => new Set(prev).add(commentId));
    try {
      const response = await commentApi.likeComment(commentId);

      setAllComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, likes: response.data.likes } : c,
        ),
      );
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, likes: response.data.likes } : c,
        ),
      );
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setLikingComments((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingComments.has(commentId)) return;
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    setDeletingComments((prev) => new Set(prev).add(commentId));
    try {
      await commentApi.deleteComment(commentId);

      // Remove from allComments
      setAllComments((prev) => prev.filter((c) => c._id !== commentId));

      // Remove from root comments
      const isRootComment = comments.some((c) => c._id === commentId);
      if (isRootComment) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        const newTotal = pagination.total - 1;
        setPagination((prev) => ({ ...prev, total: newTotal }));
        if (onCommentCountChange) {
          onCommentCountChange(newTotal);
        }
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setDeletingComments((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    const isExpanded = expandedReplies[commentId];
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !isExpanded }));
  };

  const renderRootComment = (comment: Comment) => {
    const isOwner = user?.id === comment.userId;
    const isDeleting = deletingComments.has(comment._id);
    const replies = getRepliesForComment(comment._id);

    return (
      <div key={comment._id} className="space-y-3">
        {/* Root comment */}
        <div className="flex gap-3">
          <Avatar className="size-8 flex-shrink-0">
            <AvatarImage
              src={comment?.userAvatar || ""}
              alt={comment?.userName || "User"}
            />
            <AvatarFallback>
              {comment?.userName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-foreground">
                {comment.userName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            <p className="text-sm mb-1.5 text-foreground/90">{comment.text}</p>

            {user && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setReplyingTo(
                      replyingTo?.parentId === comment._id
                        ? null
                        : {
                            parentId: comment._id,
                            parentUserName: comment.userName,
                            text: "",
                          },
                    )
                  }
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Reply className="w-3 h-3" /> Trả lời
                </Button>
                {isOwner && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(comment._id)}
                    disabled={isDeleting}
                    className="size-8 flex items-center gap-1 text-[10px] hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Reply form */}
            {replyingTo?.parentId === comment._id && (
              <div className="mt-3 flex gap-2">
                <Textarea
                  value={replyingTo.text}
                  onChange={(e) =>
                    setReplyingTo((prev) =>
                      prev ? { ...prev, text: e.target.value } : null,
                    )
                  }
                  placeholder={`Trả lời @${comment.userName}...`}
                  className="min-h-[60px] text-sm resize-none"
                />
                <div className="flex flex-col gap-1.5">
                  <Button
                    onClick={() => handleSubmitReply(comment._id)}
                    disabled={!replyingTo.text.trim() || submitting}
                  >
                    Gửi <Send />
                  </Button>
                  <Button variant="outline" onClick={() => setReplyingTo(null)}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}

            {/* Show replies button */}
            {replies.length > 0 && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                {expandedReplies[comment._id]
                  ? "Ẩn phản hồi"
                  : `Xem ${replies.length} phản hồi`}
              </button>
            )}
          </div>
        </div>

        {/* Render all replies (flat - same level) */}
        {expandedReplies[comment._id] && (
          <div className="ml-4 pl-3 border-l-2 border-border space-y-3">
            {replies.map((reply) => {
              const isOwner = user?.id === reply.userId;
              const isDeleting = deletingComments.has(reply._id);
              
              // Find who this reply is responding to (could be root comment or another reply)
              const parentReplyComment = allComments.find(
                (c) => c._id === reply.parentId,
              );

              return (
                <div key={reply._id} className="flex gap-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage
                      src={reply?.userAvatar || ""}
                      alt={reply?.userName || "User"}
                    />
                    <AvatarFallback>
                      {reply?.userName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        {reply.userName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(reply.createdAt)}
                      </span>
                    </div>

                    {/* Show @ tag to indicate who they're replying to */}
                    {parentReplyComment && (
                      <div className="text-[11px] text-primary mb-1">
                        @{parentReplyComment.userName}
                      </div>
                    )}

                    <p className="text-sm mb-1.5 text-foreground/90">
                      {reply.text}
                    </p>

                    {user && isOwner && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(reply._id)}
                          disabled={isDeleting}
                          className="size-8 flex items-center gap-1 text-[10px] hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments && comments.length > 0 ? (
        comments.map((comment) => renderRootComment(comment))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </p>
      )}

      <div className="pt-4 border-t border-border">
        {user ? (
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.avatar || ""} alt={user.name || "User"} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {getUserInitial(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="min-h-[60px] resize-none mb-2"
              />
              <div className="flex items-center justify-end">
                <Button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? "Đang gửi..." : "Gửi"} <Send />
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            Đăng nhập để bình luận
          </p>
        )}
      </div>
    </div>
  );
}

export default CommentComponent;
