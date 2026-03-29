import Image from "next/image";
import fallback from "@/assets/fallback.png";
import { useState } from "react";

export default function MovieImage({ movie }) {
    const [imgSrc, setImgSrc] = useState(
        `https://img.ophim.live/uploads/movies/${movie.thumb_url}?w=1920&q=75`
    );

    return (
        <Image
            width={1920}
            height={1080}
            src={imgSrc}
            alt={movie.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgSrc(fallback.src)}
        />
    );
}