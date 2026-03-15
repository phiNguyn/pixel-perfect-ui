import { Play, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

export default function HeroBanner() {
  return (
    <section className="relative w-full h-[420px] md:h-[500px] overflow-hidden">
      <img
        src={heroBanner}
        alt="Featured movie banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Hot</span>
            <span className="text-muted-foreground text-xs">2025</span>
            <span className="flex items-center gap-1 text-yellow-400 text-xs">
              <Star className="w-3 h-3 fill-current" /> 9.1
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-2 text-shadow-lg">
            Trao Em Cả Vũ Trụ
          </h1>
          <p className="text-sm text-secondary-foreground max-w-md mb-4 leading-relaxed">
            Lương Tĩnh · Trần Phi Vũ · Tập 24/36 · Tình Cảm, Lãng Mạn
          </p>
          <div className="flex items-center gap-3">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg">
              <Play className="w-4 h-4 fill-current" />
              Xem Ngay
            </button>
            <button className="bg-secondary/80 hover:bg-secondary text-secondary-foreground px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors backdrop-blur-sm">
              <Plus className="w-4 h-4" />
              Theo dõi
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
