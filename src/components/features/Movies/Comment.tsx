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
    async (page = 1, parentId: string | null = null) => {
      try {
        const response = await commentApi.getComments(movieSlug, {
          page,
          limit: 20,
          parentId,
        });

        if (parentId === null) {
          setComments(response.data);
          setPagination(response.pagination);
          if (onCommentCountChange) {
            onCommentCountChange(response.pagination.total);
          }
        }

        return response;
      } catch (error) {
        console.error("Error fetching comments:", error);
        return null;
      }
    },
    [movieSlug, onCommentCountChange],
  );

  const fetchReplies = useCallback(
    async (parentId: string) => {
      if (loadingReplies[parentId]) return;

      setLoadingReplies((prev) => ({ ...prev, [parentId]: true }));
      try {
        const response = await commentApi.getComments(movieSlug, {
          page: 1,
          limit: 50,
          parentId,
        });
        setReplies((prev) => ({ ...prev, [parentId]: response.data }));
      } catch (error) {
        console.error("Error fetching replies:", error);
      } finally {
        setLoadingReplies((prev) => ({ ...prev, [parentId]: false }));
      }
    },
    [movieSlug],
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
        setReplies((prev) => ({
          ...prev,
          [parentId]: [response.data, ...(prev[parentId] || [])],
        }));
        setReplyingTo(null);

        setComments((prev) =>
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

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, likes: response.data.likes } : c,
        ),
      );
      setReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((c) =>
            c._id === commentId ? { ...c, likes: response.data.likes } : c,
          );
        });
        return updated;
      });
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

      // Backend đã filter isDeleted: false, nên xóa luôn khỏi state
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setReplies((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].filter((c) => c._id !== commentId);
        });
        return updated;
      });

      // Update count
      const newTotal = pagination.total - 1;
      setPagination((prev) => ({ ...prev, total: newTotal }));
      if (onCommentCountChange) {
        onCommentCountChange(newTotal);
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

    if (!isExpanded && !replies[commentId]) {
      fetchReplies(commentId);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = user?.id === comment.userId;
    const isLiking = likingComments.has(comment._id);
    const isDeleting = deletingComments.has(comment._id);

    return (
      <div key={comment._id} className={`flex gap-3 ${isReply ? "mt-3" : ""}`}>
        <Avatar className="size-8">
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
            {/* <Badge variant="secondary" className="text-[9px] px-1 py-0">
              VIP
            </Badge> */}
            <span className="text-[10px] text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm mb-1.5 text-foreground/90">{comment.text}</p>
          {user && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {/* <Button
                size="icon"
                variant="ghost"
                onClick={() => handleLike(comment._id)}
                disabled={isLiking}
                className="flex items-center gap-1 text-[10px] hover:text-foreground transition-colors disabled:opacity-50"
              >
                <ThumbsUp
                  className={`w-3 h-3 ${isLiking ? "fill-current" : ""}`}
                />
                {comment.likes > 0 && comment.likes}
              </Button> */}
              {!isReply && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    setReplyingTo(
                      replyingTo?.parentId === comment._id
                        ? null
                        : { parentId: comment._id, text: "" },
                    )
                  }
                  className="flex items-center gap-1 text-[10px] hover:text-foreground transition-colors"
                >
                  <Reply className="w-3 h-3" /> Trả lời
                </Button>
              )}
              {isOwner && (
                <Button
                  size={"icon"}
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

          {!isReply && replyingTo?.parentId === comment._id && (
            <div className="mt-2 flex gap-2">
              <Textarea
                value={replyingTo.text}
                onChange={(e) =>
                  setReplyingTo((prev) =>
                    prev ? { ...prev, text: e.target.value } : null,
                  )
                }
                placeholder="Viết phản hồi..."
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

          {!isReply && comment.replyCount && comment.replyCount > 0 && (
            <button
              onClick={() => toggleReplies(comment._id)}
              className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              {expandedReplies[comment._id]
                ? "Ẩn phản hồi"
                : `Xem ${comment.replyCount} phản hồi`}
            </button>
          )}

          {!isReply && expandedReplies[comment._id] && (
            <div className="mt-2 pl-4 border-l-2 border-border">
              {loadingReplies[comment._id] ? (
                <p className="text-xs text-muted-foreground">Đang tải...</p>
              ) : (
                replies[comment._id]?.map((reply) => renderComment(reply, true))
              )}
            </div>
          )}
        </div>
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
        comments.map((comment) => renderComment(comment))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </p>
      )}

      {pagination.page < pagination.totalPages && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchComments(pagination.page + 1)}
          className="w-full rounded-full text-xs"
        >
          Xem thêm bình luận
        </Button>
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
