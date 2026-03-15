import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

const Cast = ({ loading, peoples, profile_sizes }) => {
    return (
        <div className="mb-8">
            <h3 className="text-base font-semibold text-foreground mb-4">Diễn viên</h3>
            <div className="grid grid-cols-3 sm:grid-cols-8 gap-3">
                {loading ? <Skeleton /> : peoples.map((cast, i) => (
                    <div key={cast.tmdb_people_id} className="flex flex-col items-center text-center">
                        <Avatar className="w-14 h-14 mb-1.5">
                            <AvatarImage src={`${profile_sizes.w185
                                }/${cast.profile_path
                                }`} className="object-cover" />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">{cast.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground font-medium line-clamp-1">{cast.name}</span>
                        <span className="text-[10px] text-muted-foreground">{cast?.character}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Cast