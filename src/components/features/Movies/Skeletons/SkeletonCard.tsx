import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { FC } from "react"
interface SkeletonCardProps {
    count: number
    className?: string
}
export const SkeletonCard: FC<SkeletonCardProps> = ({ count, className }) => {
    return (
        Array.from({ length: count }).map((_, idx) => (
            <Card key={idx} className={cn("min-w-[140px] md:w-[170px] h-100", className)}>
                <CardHeader>
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full" />
                </CardContent>
            </Card>
        ))
    )
}
