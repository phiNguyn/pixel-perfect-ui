"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react'

interface CommentProps {
  movieSlug: string;
}

// Sample comments for display
const sampleComments = [
  {
    user: "Minh Anh",
    text: "Phim hay quá, diễn xuất tuyệt vời!",
    time: "2 giờ trước",
    likes: 15,
  },
  {
    user: "Hoàng Long",
    text: "Cốt truyện rất cuốn, xem mãi không chán.",
    time: "5 giờ trước",
    likes: 23,
  },
  {
    user: "Thu Hà",
    text: "Recommend mọi người xem nha, phim quá đỉnh!",
    time: "1 ngày trước",
    likes: 42,
  },
];

export function Comment({ movieSlug }: CommentProps) {
  return (
    <div className="space-y-4">
      {sampleComments.map((comment, i) => (
        <div key={i} className="flex gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
              {comment.user[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-foreground">{comment.user}</span>
              <Badge variant="secondary" className="text-[9px] px-1 py-0">VIP</Badge>
              <span className="text-[10px] text-muted-foreground">{comment.time}</span>
            </div>
            <p className="text-sm text-foreground/90 mb-1.5">{comment.text}</p>
            <div className="flex items-center gap-3 text-muted-foreground">
              <button className="flex items-center gap-1 text-[10px] hover:text-foreground transition-colors">
                <ThumbsUp className="w-3 h-3" /> {comment.likes}
              </button>
              <button className="flex items-center gap-1 text-[10px] hover:text-foreground transition-colors">
                <ThumbsDown className="w-3 h-3" />
              </button>
              <button className="flex items-center gap-1 text-[10px] hover:text-foreground transition-colors">
                <MessageCircle className="w-3 h-3" /> Trả lời
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Đăng nhập để bình luận
        </p>
      </div>
    </div>
  );
}

export default Comment;
