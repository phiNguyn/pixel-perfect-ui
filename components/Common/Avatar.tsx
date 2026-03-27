import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const AvatarComponent = () => {
    return (
        <div className="flex items-center gap-3">
            <Link href={'/'} className="flex items-center gap-2">
                <Avatar>
                    <AvatarImage src={`https://api-sandbox.vnhub.com/resource/2026/02/27/1772203272485-1000003143.png`} className="object-cover" />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">PF</AvatarFallback>
                </Avatar>
                <span className="text-foreground font-bold text-lg tracking-tight">Pinuss Flix</span>
            </Link>
        </div>
    )
}

export default AvatarComponent
