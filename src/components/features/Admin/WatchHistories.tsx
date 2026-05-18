// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// export const   WatchHistoryContent = () => {
// //   const [history, setHistory] = useState<WatchHistoryItem[]>([]);
// //   const [pagination, setPagination] = useState<PaginationInfo | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

// //   useEffect(() => {
// //     if (selectedUserId) {
// //       loadHistory();
// //     } else {
// //       setLoading(false);
// //     }
// //   }, [selectedUserId]);

// //   const loadHistory = async (page = 1) => {
// //     if (!selectedUserId) return;
// //     setLoading(true);
// //     const token = useAuthStore.getState().tokens?.accessToken;
// //     if (token) {
// //       const result = await adminApi.getUserWatchHistory(selectedUserId, token, {
// //         page,
// //       });
// //       if (result.success) {
// //         setHistory(result.data);
// //         setPagination(result.pagination);
// //       }
// //     }
// //     setLoading(false);
// //   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-4">
//         <div className="flex-1">
//           <Input
//             placeholder="Nhập User ID để xem lịch sử..."
//             value={selectedUserId || ""}
//             onChange={(e) => setSelectedUserId(e.target.value || null)}
//           />
//         </div>
//         <Button onClick={() => loadHistory(1)} disabled={!selectedUserId}>
//           <Search className="w-4 h-4 mr-2" />
//           Tìm
//         </Button>
//       </div>

//       {selectedUserId && (
//         <div className="rounded-lg border bg-card">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b bg-muted/50">
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Phim
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Tập
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Tiến độ
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Trạng thái
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-medium">
//                     Ngày xem
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   [...Array(5)].map((_, i) => (
//                     <tr key={i}>
//                       <td className="px-4 py-3">
//                         <Skeleton className="h-4 w-40" />
//                       </td>
//                       <td className="px-4 py-3">
//                         <Skeleton className="h-4 w-20" />
//                       </td>
//                       <td className="px-4 py-3">
//                         <Skeleton className="h-4 w-24" />
//                       </td>
//                       <td className="px-4 py-3">
//                         <Skeleton className="h-4 w-16" />
//                       </td>
//                       <td className="px-4 py-3">
//                         <Skeleton className="h-4 w-24" />
//                       </td>
//                     </tr>
//                   ))
//                 ) : history.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="px-4 py-8 text-center text-muted-foreground"
//                     >
//                       Không có lịch sử xem
//                     </td>
//                   </tr>
//                 ) : (
//                   history.map((item) => (
//                     <tr key={item._id} className="border-b hover:bg-muted/50">
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           {item.moviePoster && (
//                             <img
//                               src={`https://img.ophim.live/uploads/movies/${item.moviePoster}`}
//                               alt=""
//                               className="w-10 h-14 rounded object-cover"
//                             />
//                           )}
//                           <div>
//                             <p className="font-medium">{item.movieTitle}</p>
//                             <p className="text-xs text-muted-foreground">
//                               {item.year} • {item.quality}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         {item.currentEpName || item.currentEpSlug || "-"}
//                       </td>
//                       <td className="px-4 py-3 text-sm">
//                         {Math.round((item.progress / item.duration) * 100) || 0}
//                         %
//                       </td>
//                       <td className="px-4 py-3">
//                         {item.deletedAt ? (
//                           <Badge variant="destructive" className="text-xs">
//                             <Trash2 className="w-3 h-3 mr-1" />
//                             Đã xóa
//                           </Badge>
//                         ) : item.completed ? (
//                           <Badge variant="default" className="text-xs">
//                             <CheckCircle className="w-3 h-3 mr-1" />
//                             Hoàn thành
//                           </Badge>
//                         ) : (
//                           <Badge variant="secondary" className="text-xs">
//                             Đang xem
//                           </Badge>
//                         )}
//                       </td>
//                       <td className="px-4 py-3 text-sm text-muted-foreground">
//                         {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {pagination && pagination.totalPages > 1 && (
//             <div className="flex items-center justify-between px-4 py-3 border-t">
//               <p className="text-sm text-muted-foreground">
//                 Trang {pagination.page} / {pagination.totalPages}
//               </p>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={pagination.page <= 1}
//                   onClick={() => loadHistory(pagination.page - 1)}
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   disabled={pagination.page >= pagination.totalPages}
//                   onClick={() => loadHistory(pagination.page + 1)}
//                 >
//                   <ChevronRight className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
