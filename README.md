# Pixel Perfect UI — Website Xem Phim

Website xem phim trực tuyến với giao diện hiện đại, hỗ trợ nhiều nguồn phim và tính năng tìm kiếm.

## Tính năng

- **Xem phim với link** — Hỗ trợ phát video qua link M3U8 hoặc Embed
- **Tìm kiếm phim** — Tìm kiếm từ nhiều nguồn (nguonc, ophim, phimapi)
- **Lịch sử tìm kiếm** — Lưu lại lịch sử tìm kiếm local
- **Giao diện đẹp** — Dark mode, responsive, tối ưu trải nghiệm người dùng

## Tech Stack

- **Next.js 14** — App Router, Server Components
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — UI component library
- **TanStack Query** — Server state management

## Setup

```sh
# Clone repository
git clone <YOUR_GIT_URL>
cd pixel-perfect-ui

# Install dependencies
npm i

# Start development server
npm run dev
```

## Cấu trúc thư mục

```
src/
├── app/                    # Next.js App Router
│   ├── xem-phim-link/      # Trang xem phim với link
│   └── phim/[slug]/        # Trang chi tiết phim
├── components/             # React components
│   ├── features/           # Feature-based components
│   │   ├── Home/           # Trang chủ
│   │   ├── Movies/         # Danh sách phim
│   │   └── WatchMovieLink/ # Xem phim với link
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── api/                # API integration (nguonc, ophim, phimapi)
│   └── client/             # HTTP client
├── hooks/                  # Custom React hooks
├── stores/                 # State management (Zustand)
└── services/               # Utility services
```

## API Sources

- **nguonc** — https://phim.nguonc.com/api/
- **ophim** — https://ophim.com/api/
- **phimapi** — https://phimapi.com/api/