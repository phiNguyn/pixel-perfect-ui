import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react'

const Comment = ({ sampleComments }) => {
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
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">VD</Badge>
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
        </div>
    )
}

export default Comment