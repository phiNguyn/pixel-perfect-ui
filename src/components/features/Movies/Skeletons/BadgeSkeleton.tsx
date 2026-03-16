import { Skeleton } from "@/components/ui/skeleton"
import { FC } from "react"
interface BadgeSkeletonProps {
    count: number
}
const BadgeSkeleton: FC<BadgeSkeletonProps> = ({ count }) => {
    return (
        <div className="flex w-full gap-2">
            {Array.from({ length: count }).map((_, idx) => (
                <Skeleton
                    key={idx}
                    className={"w-full h-6 px-3 py-1.5 rounded-full text-xs"}
                />
            ))}
        </div>
    )
}

export default BadgeSkeleton