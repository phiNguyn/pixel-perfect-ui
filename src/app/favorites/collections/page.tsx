"use client";

import { useState } from "react";
import { FolderOpen, Plus, Trash2, Edit2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Empty from "@/components/Common/Empty";
import LoginBenefitsCard from "@/components/Common/LoginBenefitsCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from "@/lib/api/collections/collectionQueries";
import { toast } from "sonner";

export default function CollectionsPage() {
  const { data, isLoading } = useCollections();
  const createMutation = useCreateCollection();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const collections = data?.data ?? [];

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Vui lòng nhập tên bộ sưu tập");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });

      if (result.success) {
        toast.success("Đã tạo bộ sưu tập mới");
        setNewName("");
        setNewDesc("");
        setCreateOpen(false);
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/9] rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="space-y-6">
        <LoginBenefitsCard
          storageKey="collections-empty-benefits"
          variant="inline"
          className="mb-6"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tạo bộ sưu tập để nhóm các phim yêu thích theo chủ đề
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo bộ sưu tập
          </Button>
        </div>
        <Empty
          icon={FolderOpen}
          title="Chưa có bộ sưu tập"
          description="Tạo bộ sưu tập để nhóm các phim yêu thích theo chủ đề, thể loại hoặc bất kỳ tiêu chí nào bạn muốn"
          action={{
            label: "Tạo bộ sưu tập đầu tiên",
            onClick: () => setCreateOpen(true),
          }}
        />

        <CreateCollectionDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          name={newName}
          onNameChange={setNewName}
          description={newDesc}
          onDescriptionChange={setNewDesc}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data?.pagination?.total || 0} bộ sưu tập
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo bộ sưu tập
            </Button>
          </DialogTrigger>
          <CreateCollectionDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            name={newName}
            onNameChange={setNewName}
            description={newDesc}
            onDescriptionChange={setNewDesc}
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {collections.map((collection) => (
            <CollectionCard key={collection._id} collection={collection} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface CollectionCardProps {
  collection: {
    _id: string;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
    itemCount: number;
    createdAt: string;
  };
}

function CollectionCard({ collection }: CollectionCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editDesc, setEditDesc] = useState(collection.description || "");
  const [editPublic, setEditPublic] = useState(collection.isPublic);

  const updateMutation = useUpdateCollection();
  const deleteMutation = useDeleteCollection();

  const handleUpdate = async () => {
    try {
      const result = await updateMutation.mutateAsync({
        collectionId: collection._id,
        data: {
          name: editName.trim(),
          description: editDesc.trim() || undefined,
          isPublic: editPublic,
        },
      });

      if (result.success) {
        toast.success("Đã cập nhật bộ sưu tập");
        setEditOpen(false);
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteMutation.mutateAsync(collection._id);
      if (result.success) {
        toast.success("Đã xóa bộ sưu tập");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group relative bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-colors"
      >
        <Link
          href={`/favorites/collections/${collection._id}`}
          className="block"
        >
          {/* Cover image area */}
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
            {collection.coverImage ? (
              <img
                src={collection.coverImage}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Item count badge */}
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-xs font-medium">{collection.itemCount} phim</span>
            </div>

            {/* Public badge */}
            {collection.isPublic && (
              <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs font-medium">Công khai</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {collection.name}
            </h3>
            {collection.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {collection.description}
              </p>
            )}
          </div>
        </Link>

        {/* Action buttons */}
        <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              setEditOpen(true);
            }}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => e.preventDefault()}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa bộ sưu tập?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này sẽ xóa &quot;{collection.name}&quot; và tất cả phim trong bộ sưu tập.
                  Bạn không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bộ sưu tập</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên bộ sưu tập</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Mô tả</Label>
              <Textarea
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <Label htmlFor="edit-public" className="cursor-pointer">
                  Công khai
                </Label>
              </div>
              <Switch
                id="edit-public"
                checked={editPublic}
                onCheckedChange={setEditPublic}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                Lưu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

function CreateCollectionDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  onSubmit,
  isLoading,
}: CreateCollectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Tạo bộ sưu tập mới
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Tên bộ sưu tập</Label>
            <Input
              id="create-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="VD: Phim hay tháng này"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-desc">Mô tả (tùy chọn)</Label>
            <Textarea
              id="create-desc"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Mô tả bộ sưu tập của bạn..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              Tạo bộ sưu tập
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
