import movie1 from "@/assets/movie1.jpg";
import movie2 from "@/assets/movie2.jpg";
import movie3 from "@/assets/movie3.jpg";
import movie4 from "@/assets/movie4.jpg";
import movie5 from "@/assets/movie5.jpg";
import movie6 from "@/assets/movie6.jpg";
import movie7 from "@/assets/movie7.jpg";
import movie8 from "@/assets/movie8.jpg";

export interface Movie {
  id: number;
  title: string;
  image: string;
  year: string;
  rating: string;
  episodes?: string;
  genre: string;
  country: string;
}

const allPosters = [movie1, movie2, movie3, movie4, movie5, movie6, movie7, movie8];

function poster(i: number) {
  return allPosters[i % allPosters.length];
}

export const featuredMovies: Movie[] = [
  { id: 1, title: "Kiếm Khách Vô Danh", image: poster(0), year: "2025", rating: "8.5", episodes: "Tập 24", genre: "Hành Động", country: "Trung Quốc" },
  { id: 2, title: "Phong Vân Tái Khởi 2", image: poster(1), year: "2025", rating: "9.1", episodes: "Tập 36", genre: "Võ Thuật", country: "Trung Quốc" },
  { id: 3, title: "Mưa Nhớ Thương", image: poster(2), year: "2024", rating: "8.8", genre: "Tình Cảm", country: "Hàn Quốc" },
  { id: 4, title: "Bóng Đêm Sài Gòn", image: poster(3), year: "2025", rating: "7.9", genre: "Trinh Thám", country: "Việt Nam" },
  { id: 5, title: "Rồng Thiêng Trỗi Dậy", image: poster(4), year: "2024", rating: "8.2", episodes: "Tập 40", genre: "Fantasy", country: "Trung Quốc" },
  { id: 6, title: "Ngôi Nhà Ma Ám", image: poster(5), year: "2025", rating: "7.5", genre: "Kinh Dị", country: "Nhật Bản" },
];

export const koreanMovies: Movie[] = [
  { id: 10, title: "Tình Yêu Vĩnh Cửu", image: poster(2), year: "2025", rating: "9.0", episodes: "Tập 16", genre: "Tình Cảm", country: "Hàn Quốc" },
  { id: 11, title: "Bác Sĩ Lương Tâm", image: poster(3), year: "2024", rating: "8.7", episodes: "Tập 20", genre: "Y Khoa", country: "Hàn Quốc" },
  { id: 12, title: "Hoàng Cung Bí Ẩn", image: poster(4), year: "2025", rating: "8.3", episodes: "Tập 24", genre: "Cổ Trang", country: "Hàn Quốc" },
  { id: 13, title: "Trái Tim Băng Giá", image: poster(5), year: "2024", rating: "8.9", episodes: "Tập 12", genre: "Tình Cảm", country: "Hàn Quốc" },
  { id: 14, title: "Cuộc Chiến Tình Yêu", image: poster(6), year: "2025", rating: "8.1", episodes: "Tập 16", genre: "Hài Hước", country: "Hàn Quốc" },
  { id: 15, title: "Ngôi Sao Cô Đơn", image: poster(7), year: "2024", rating: "8.6", episodes: "Tập 18", genre: "Drama", country: "Hàn Quốc" },
];

export const chineseMovies: Movie[] = [
  { id: 20, title: "Thiên Long Bát Bộ", image: poster(0), year: "2025", rating: "9.2", episodes: "Tập 50", genre: "Võ Thuật", country: "Trung Quốc" },
  { id: 21, title: "Tiên Hiệp Truyền Kỳ", image: poster(1), year: "2024", rating: "8.4", episodes: "Tập 40", genre: "Tiên Hiệp", country: "Trung Quốc" },
  { id: 22, title: "Hoàn Châu Cách Cách", image: poster(2), year: "2025", rating: "8.0", episodes: "Tập 36", genre: "Cổ Trang", country: "Trung Quốc" },
  { id: 23, title: "Chiến Binh Đại Mạc", image: poster(3), year: "2024", rating: "7.8", episodes: "Tập 30", genre: "Hành Động", country: "Trung Quốc" },
  { id: 24, title: "Nữ Hoàng Nước Mắt", image: poster(4), year: "2025", rating: "9.0", episodes: "Tập 24", genre: "Cung Đấu", country: "Trung Quốc" },
  { id: 25, title: "Vương Triều Bí Sử", image: poster(5), year: "2024", rating: "8.5", episodes: "Tập 45", genre: "Lịch Sử", country: "Trung Quốc" },
];

export const usMovies: Movie[] = [
  { id: 30, title: "Kẻ Hủy Diệt: Tái Sinh", image: poster(7), year: "2025", rating: "7.6", genre: "Hành Động", country: "Mỹ" },
  { id: 31, title: "Vùng Đất Chết", image: poster(5), year: "2024", rating: "8.1", genre: "Kinh Dị", country: "Mỹ" },
  { id: 32, title: "Không Gian Vô Tận", image: poster(7), year: "2025", rating: "8.8", genre: "Sci-Fi", country: "Mỹ" },
  { id: 33, title: "Cuộc Đua Sinh Tử", image: poster(6), year: "2024", rating: "7.9", genre: "Hành Động", country: "Mỹ" },
  { id: 34, title: "Siêu Anh Hùng X", image: poster(4), year: "2025", rating: "8.3", genre: "Siêu Anh Hùng", country: "Mỹ" },
  { id: 35, title: "Bí Mật CIA", image: poster(3), year: "2024", rating: "8.0", genre: "Trinh Thám", country: "Mỹ" },
];

export const animeMovies: Movie[] = [
  { id: 40, title: "Thanh Gươm Diệt Quỷ S5", image: poster(6), year: "2025", rating: "9.5", episodes: "Tập 12", genre: "Anime", country: "Nhật Bản" },
  { id: 41, title: "Thám Tử Lừng Danh", image: poster(7), year: "2024", rating: "9.0", episodes: "Tập 1000+", genre: "Anime", country: "Nhật Bản" },
  { id: 42, title: "Cuộc Chiến Titan", image: poster(0), year: "2025", rating: "9.3", episodes: "Tập 87", genre: "Anime", country: "Nhật Bản" },
  { id: 43, title: "Naruto: Thế Hệ Mới", image: poster(6), year: "2024", rating: "8.7", episodes: "Tập 200+", genre: "Anime", country: "Nhật Bản" },
  { id: 44, title: "One Piece: Đảo Hải Tặc", image: poster(7), year: "2025", rating: "9.4", episodes: "Tập 1100+", genre: "Anime", country: "Nhật Bản" },
  { id: 45, title: "Jujutsu Kaisen S3", image: poster(6), year: "2024", rating: "9.1", episodes: "Tập 24", genre: "Anime", country: "Nhật Bản" },
];

export const topMovies: Movie[] = [
  { id: 50, title: "Phong Vân Tái Khởi 2", image: poster(1), year: "2025", rating: "9.5", episodes: "Tập 36", genre: "Võ Thuật", country: "Trung Quốc" },
  { id: 51, title: "Mưa Nhớ Thương", image: poster(2), year: "2024", rating: "9.3", genre: "Tình Cảm", country: "Hàn Quốc" },
  { id: 52, title: "Thiên Long Bát Bộ", image: poster(0), year: "2025", rating: "9.2", episodes: "Tập 50", genre: "Võ Thuật", country: "Trung Quốc" },
  { id: 53, title: "Thanh Gươm Diệt Quỷ S5", image: poster(6), year: "2025", rating: "9.5", episodes: "Tập 12", genre: "Anime", country: "Nhật Bản" },
  { id: 54, title: "Rồng Thiêng Trỗi Dậy", image: poster(4), year: "2024", rating: "9.1", episodes: "Tập 40", genre: "Fantasy", country: "Trung Quốc" },
];

export const categories = [
  "Phim Hay", "Phim Mới", "Phim Bộ", "Phim Lẻ", "Phim Chiếu Rạp", "TV Shows", "Hoạt Hình"
];

export const genres = [
  "Hành Động", "Tình Cảm", "Hài Hước", "Kinh Dị", "Võ Thuật", "Cổ Trang", "Viễn Tưởng", "Tâm Lý", "Phiêu Lưu"
];

export const countries = [
  "Trung Quốc", "Hàn Quốc", "Nhật Bản", "Mỹ", "Thái Lan", "Việt Nam", "Ấn Độ", "Đài Loan"
];

export const moods = [
  { label: "Nổi nóng", color: "destructive" as const },
  { label: "Muốn khóc", color: "accent" as const },
  { label: "Cần động lực", color: "primary" as const },
  { label: "Vui nhộn", color: "secondary" as const },
];
