import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useQueryResult from "@/hooks/useQueryResult";
import { adminApi } from "@/lib/api/admin/adminApi";
import { useAdminQueryUsers } from "@/lib/api/admin/adminQuery";
import { useAuthStore } from "@/stores";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Shield,
} from "lucide-react";
import { UserDetailDialog } from "./UserDetailDialog";
import { useState } from "react";


const AdminUsers = () => {
   const token = useAuthStore.getState().tokens?.accessToken;
   const { queryResult, searchValue, setSearch } = useQueryResult();
   const { data, isLoading, refetch } = useAdminQueryUsers(token, queryResult);
   const [user, setSelectedUser] = useState< any | null>(null);
   const handleUpdateRole = async (userId: string, role: "user" | "admin") => {
     const token = useAuthStore.getState().tokens?.accessToken;
     if (token) {
       await adminApi.updateUserRole(userId, role, token);
       refetch();
     }
   };

   const handleToggleStatus = async (userId: string, isActive: boolean) => {
     const token = useAuthStore.getState().tokens?.accessToken;
     if (token) {
       await adminApi.toggleUserStatus(userId, isActive, token);
       refetch();
     }
   };

   return (
     <div className="space-y-4">
       {/* Search */}
       <div className="flex gap-2">
         <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Tìm kiếm người dùng..."
             value={searchValue}
             onChange={(e) => setSearch(e.target.value)}
             className="pl-10"
           />
         </div>
       </div>

       {/* Users Table */}
       <div className="rounded-lg border bg-card">
         <div className="overflow-x-auto">
           <table className="w-full">
             <thead>
               <tr className="border-b bg-muted/50">
                 <th className="px-4 py-3 text-left text-sm font-medium">
                   Người dùng
                 </th>
                 <th className="px-4 py-3 text-left text-sm font-medium">
                   Email
                 </th>
                 <th className="px-4 py-3 text-left text-sm font-medium">
                   Vai trò
                 </th>
                 <th className="px-4 py-3 text-left text-sm font-medium">
                   Trạng thái
                 </th>
                 <th className="px-4 py-3 text-left text-sm font-medium">
                   Ngày tạo
                 </th>
                 <th className="px-4 py-3 text-center text-sm font-medium">
                   Hành động
                 </th>
               </tr>
             </thead>
             <tbody>
               {isLoading ? (
                 [...Array(5)].map((_, i) => (
                   <tr key={i}>
                     <td className="px-4 py-3">
                       <Skeleton className="h-4 w-32" />
                     </td>
                     <td className="px-4 py-3">
                       <Skeleton className="h-4 w-40" />
                     </td>
                     <td className="px-4 py-3">
                       <Skeleton className="h-4 w-20" />
                     </td>
                     <td className="px-4 py-3">
                       <Skeleton className="h-4 w-20" />
                     </td>
                     <td className="px-4 py-3">
                       <Skeleton className="h-4 w-24" />
                     </td>
                     <td className="px-4 py-3">
                       <Skeleton className="h-4 w-8" />
                     </td>
                   </tr>
                 ))
               ) : data?.data?.length === 0 ? (
                 <tr>
                   <td
                     colSpan={6}
                     className="px-4 py-8 text-center text-muted-foreground"
                   >
                     Không có người dùng nào
                   </td>
                 </tr>
               ) : (
                 data?.data?.map((user) => (
                   <tr key={user._id} className="border-b hover:bg-muted/50">
                     <td className="px-4 py-3">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                           {user.avatar ? (
                             <img
                               src={user.avatar}
                               alt=""
                               className="w-8 h-8 rounded-full"
                             />
                           ) : (
                             <span className="text-primary font-medium">
                               {user.name?.[0] || user.email[0]}
                             </span>
                           )}
                         </div>
                         <span className="font-medium">
                           {user.name || "Chưa đặt tên"}
                         </span>
                       </div>
                     </td>
                     <td className="px-4 py-3 text-sm text-muted-foreground">
                       {user.email}
                     </td>
                     <td className="px-4 py-3">
                       <Badge
                         variant={
                           user.role === "admin" ? "default" : "secondary"
                         }
                       >
                         {user.role === "admin" ? (
                           <>
                             <Shield className="w-3 h-3 mr-1" /> Admin
                           </>
                         ) : (
                           "User"
                         )}
                       </Badge>
                     </td>
                     <td className="px-4 py-3">
                       <Badge
                         variant={user.isActive ? "default" : "destructive"}
                       >
                         {user.isActive ? "Hoạt động" : "Bị khóa"}
                       </Badge>
                     </td>
                     <td className="px-4 py-3 text-sm text-muted-foreground">
                       {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                     </td>
                     <td className="px-4 py-3 text-center">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setSelectedUser(user)}
                         className="gap-1"
                       >
                         <Eye className="w-4 h-4" />
                         Chi tiết
                       </Button>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>

         {/* Pagination */}
         {data?.pagination && data?.pagination?.totalPages > 1 && (
           <div className="flex items-center justify-between px-4 py-3 border-t">
             <p className="text-sm text-muted-foreground">
               Trang {data?.pagination?.page} / {data?.pagination?.totalPages}
             </p>
             <div className="flex gap-2">
               <Button
                 variant="outline"
                 size="sm"
                 disabled={data?.pagination?.page <= 1}
                 // onClick={() => loadUsers(pagination.page - 1)}
               >
                 <ChevronLeft className="w-4 h-4" />
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 disabled={
                   data?.pagination?.page >= data?.pagination?.totalPages
                 }
                 // onClick={() => loadUsers(pagination.page + 1)}
               >
                 <ChevronRight className="w-4 h-4" />
               </Button>
             </div>
           </div>
         )}
       </div>

       {/* User Detail Dialog */}
       <UserDetailDialog
         user={user}
         onClose={() => setSelectedUser(null)}
         onUpdateRole={handleUpdateRole}
         onToggleStatus={handleToggleStatus}
       />
     </div>
   );
}

export default AdminUsers
