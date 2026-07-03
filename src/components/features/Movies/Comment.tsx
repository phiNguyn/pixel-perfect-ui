"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, ThumbsUp, Trash2, Reply, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Comment } from "@/lib/api/comment/commentApi";
import {
  useQueryComments,
  useQueryReplies,
  useCreateComment,
  useLikeComment,
  useDeleteComment,
} from "@/lib/api/comment/commentQueries";
import { formatTimeAgo } from "@/services/dateService";
import { getUserInitial } from "@/services/common";
import { useAuth } from "@/components/auth/AuthProvider";

interface CommentProps {
  movieSlug: string;
  onCommentCountChange?: (count: number) => void;
}

interface ReplyTarget {
  /** Comment being directly replied to (sent as parentId). */
  targetId: string;
  targetUserName: string;
  /** Top-level comment of the thread. */
  rootId: string;
  text: string;
}

function CommentSkeleton() {
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

export function CommentComponent({
  movieSlug,
  onCommentCountChange,
}: CommentProps) {
  const { user } = useAuth();

  const commentsQuery = useQueryComments(movieSlug);
  const createComment = useCreateComment(movieSlug);
  const likeComment = useLikeComment(movieSlug);
  const deleteComment = useDeleteComment(movieSlug);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<ReplyTarget | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const rootComments = commentsQuery.data?.data ?? [];
  const totalRootComments = commentsQuery.data?.pagination.total ?? 0;

  useEffect(() => {
    if (commentsQuery.isSuccess) {
      onCommentCountChange?.(totalRootComments);
    }
  }, [commentsQuery.isSuccess, totalRootComments, onCommentCountChange]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text || createComment.isPending) return;

    createComment.mutate({ text }, { onSuccess: () => setNewComment("") });
  };

  const handleSubmitReply = () => {
    if (!replyingTo) return;
    const text = replyingTo.text.trim();
    if (!text || createComment.isPending) return;

    const { targetId, rootId } = replyingTo;
    createComment.mutate(
      { text, parentId: targetId, rootId },
      {
        onSuccess: () => {
          setReplyingTo(null);
          setExpanded((prev) => ({ ...prev, [rootId]: true }));
        },
      },
    );
  };

  const handleLike = (commentId: string) => {
    if (likeComment.isPending) return;
    likeComment.mutate(commentId);
  };

  const handleDelete = (commentId: string, rootId?: string | null) => {
    if (deleteComment.isPending) return;
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    deleteComment.mutate({ commentId, rootId });
  };

  const toggleReplies = (rootId: string) => {
    setExpanded((prev) => ({ ...prev, [rootId]: !prev[rootId] }));
  };

  const isDeleting = (commentId: string) =>
    deleteComment.isPending && deleteComment.variables?.commentId === commentId;

  if (commentsQuery.isLoading) {
    return <CommentSkeleton />;
  }

  if (commentsQuery.isError) {
    return (
      <div className="space-y-3 text-center py-4">
        <p className="text-sm text-muted-foreground">
          Không tải được bình luận.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => commentsQuery.refetch()}
          disabled={commentsQuery.isFetching}
        >
          {commentsQuery.isFetching ? "Đang tải..." : "Thử lại"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rootComments.length > 0 ? (
        rootComments.map((comment) => (
          <CommentThread
            key={comment._id}
            movieSlug={movieSlug}
            root={comment}
            currentUserId={user?.id}
            canInteract={Boolean(user)}
            expanded={Boolean(expanded[comment._id])}
            onToggleReplies={() => toggleReplies(comment._id)}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            onSubmitReply={handleSubmitReply}
            submitting={createComment.isPending}
            onLike={handleLike}
            likePending={likeComment.isPending}
            likeVariable={likeComment.variables}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        ))
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
                  disabled={!newComment.trim() || createComment.isPending}
                >
                  {createComment.isPending ? "Đang gửi..." : "Gửi"} <Send />
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

interface CommentThreadProps {
  movieSlug: string;
  root: Comment;
  currentUserId?: string;
  canInteract: boolean;
  expanded: boolean;
  onToggleReplies: () => void;
  replyingTo: ReplyTarget | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<ReplyTarget | null>>;
  onSubmitReply: () => void;
  submitting: boolean;
  onLike: (commentId: string) => void;
  likePending: boolean;
  likeVariable?: string;
  onDelete: (commentId: string, rootId?: string | null) => void;
  isDeleting: (commentId: string) => boolean;
}

function CommentThread({
  movieSlug,
  root,
  currentUserId,
  canInteract,
  expanded,
  onToggleReplies,
  replyingTo,
  setReplyingTo,
  onSubmitReply,
  submitting,
  onLike,
  likePending,
  likeVariable,
  onDelete,
  isDeleting,
}: CommentThreadProps) {
  const repliesQuery = useQueryReplies(movieSlug, root._id, expanded);
  const replies = repliesQuery.data?.data ?? [];
  const replyCount = root.replyCount ?? 0;

  const openReply = (comment: Comment, rootId: string) =>
    setReplyingTo(
      replyingTo?.targetId === comment._id
        ? null
        : {
            targetId: comment._id,
            targetUserName: comment.userName,
            rootId,
            text: "",
          },
    );

  const renderActions = (comment: Comment, rootId: string) => {
    const isOwner = currentUserId === comment.userId;
    const likingThis = likePending && likeVariable === comment._id;

    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(comment._id)}
          disabled={!canInteract || likingThis}
          className="h-7 flex items-center gap-1 px-2 text-xs hover:text-foreground transition-colors disabled:opacity-50"
        >
          <ThumbsUp className="w-3 h-3" />{" "}
          {comment.likes > 0 ? comment.likes : ""}
        </Button>
        {canInteract && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openReply(comment, rootId)}
            className="h-7 flex items-center gap-1 px-2 text-xs hover:text-foreground transition-colors"
          >
            <Reply className="w-3 h-3" /> Trả lời
          </Button>
        )}
        {isOwner && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(comment._id, comment.rootId ?? rootId)}
            disabled={isDeleting(comment._id)}
            className="size-7 flex items-center gap-1 text-[10px] hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  };

  const renderReplyForm = (target: Comment) => {
    if (replyingTo?.targetId !== target._id) return null;
    return (
      <div className="mt-3 flex gap-2">
        <Textarea
          value={replyingTo.text}
          onChange={(e) =>
            setReplyingTo((prev) =>
              prev ? { ...prev, text: e.target.value } : null,
            )
          }
          placeholder={`Trả lời @${target.userName}...`}
          className="min-h-[60px] text-sm resize-none"
        />
        <div className="flex flex-col gap-1.5">
          <Button
            onClick={onSubmitReply}
            disabled={!replyingTo.text.trim() || submitting}
          >
            Gửi <Send />
          </Button>
          <Button variant="outline" onClick={() => setReplyingTo(null)}>
            Hủy
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Root comment */}
      <div className="flex gap-3">
        <Avatar className="size-8 flex-shrink-0">
          <AvatarImage
            src={root?.userAvatar || ""}
            alt={root?.userName || "User"}
          />
          <AvatarFallback>
            {root?.userName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-foreground">
              {root.userName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatTimeAgo(root.createdAt)}
            </span>
          </div>

          <p className="text-sm mb-1.5 text-foreground/90">{root.text}</p>

          {renderActions(root, root._id)}
          {renderReplyForm(root)}

          {replyCount > 0 && (
            <button
              onClick={onToggleReplies}
              className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              {expanded ? "Ẩn phản hồi" : `Xem ${replyCount} phản hồi`}
            </button>
          )}
        </div>
      </div>

      {/* Flattened replies of the whole thread */}
      {expanded && (
        <div className="ml-4 pl-3 border-l-2 border-border space-y-3">
          {repliesQuery.isLoading ? (
            <CommentSkeleton />
          ) : (
            replies.map((reply) => {
              // Show "@name" only when replying to another reply (not the root).
              const showReplyTo =
                reply.replyToUserName && reply.parentId !== root._id;

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

                    {showReplyTo && (
                      <div className="text-[11px] text-primary mb-1">
                        @{reply.replyToUserName}
                      </div>
                    )}

                    <p className="text-sm mb-1.5 text-foreground/90">
                      {reply.text}
                    </p>

                    {renderActions(reply, root._id)}
                    {renderReplyForm(reply)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CommentComponent;
