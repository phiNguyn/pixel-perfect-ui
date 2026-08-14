"use client";

import { useState } from "react";
import { BookmarkPlus, Check, FolderOpen, Plus, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  useCollections,
  useAddMovieToCollection,
  useCreateCollection,
} from "@/lib/api/collections/collectionQueries";
import { FavoriteSource } from "@/lib/api/favorites/favoriteInterface";
import { toast } from "sonner";

interface AddToCollectionDialogProps {
  movieId: string;
  movieSlug: string;
  movieTitle: string;
  moviePoster?: string;
  movieYear?: number;
  movieType?: "single" | "series";
  source?: FavoriteSource;
  trigger?: React.ReactNode;
  className?: string;
}

export function AddToCollectionDialog({
  movieId,
  movieSlug,
  movieTitle,
  moviePoster,
  movieYear,
  movieType,
  source = "ophim",
  trigger,
  className,
}: AddToCollectionDialogProps) {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [open, setOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");

  const { data: collectionsData, isLoading } = useCollections();
  const addMovieMutation = useAddMovieToCollection();
  const createCollectionMutation = useCreateCollection();

  const collections = collectionsData?.data ?? [];

  // Track which collections contain this movie in current session
  const [addedCollectionIds, setAddedCollectionIds] = useState<Set<string>>(new Set());

  const handleAddToCollection = async (collectionId: string, collectionName: string) => {
    try {
      const result = await addMovieMutation.mutateAsync({
        collectionId,
        data: {
          movieId,
          movieSlug,
          movieTitle,
          moviePoster,
          movieYear,
          movieType,
          source,
        },
      });

      if (result.success) {
        // Update local state to show checkmark
        setAddedCollectionIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(collectionId);
          return newSet;
        });

        toast.success(
          result.isNew
            ? `Đã thêm vào "${collectionName}"`
            : result.restored
            ? `Đã khôi phục trong "${collectionName}"`
            : `Phim đã có trong "${collectionName}"`
        );

        // Close dialog after short delay
        setTimeout(() => {
          if (!result.isNew) setOpen(false);
        }, 500);
      }
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error("Vui lòng nhập tên bộ sưu tập");
      return;
    }

    try {
      const result = await createCollectionMutation.mutateAsync({
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim() || undefined,
      });

      if (result.success && result.data) {
        toast.success("Đã tạo bộ sưu tập mới");
        setNewCollectionName("");
        setNewCollectionDesc("");
        setShowCreateForm(false);
        await handleAddToCollection(result.data._id, newCollectionName.trim());
      }
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setOpen(newOpen);
    if (!newOpen) {
      setShowCreateForm(false);
      setAddedCollectionIds(new Set());
    }
  };

  // Check if this collection already contains the movie (by checking items)
  const isInCollection = (collectionId: string) => addedCollectionIds.has(collectionId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Lưu vào bộ sưu tập
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Lưu vào bộ sưu tập
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Bạn chưa có bộ sưu tập nào
              </p>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo bộ sưu tập đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {collections.map((collection) => {
                const isAdded = isInCollection(collection._id);

                return (
                  <button
                    key={collection._id}
                    onClick={() => handleAddToCollection(collection._id, collection.name)}
                    disabled={addMovieMutation.isPending}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                      isAdded
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "hover:bg-muted/50 hover:border-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded flex items-center justify-center transition-colors",
                        isAdded
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isAdded ? (
                        <Bookmark className="w-5 h-5 fill-current" />
                      ) : (
                        <FolderOpen className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={cn("font-medium", isAdded && "text-primary")}>
                        {collection.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collection.itemCount} phim
                      </p>
                    </div>
                    {isAdded ? (
                      <Check className="w-5 h-5 text-primary" />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showCreateForm ? (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="collection-name">Tên bộ sưu tập</Label>
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="VD: Phim hay tháng này"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-desc">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="collection-desc"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Mô tả bộ sưu tập..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateCollection}
                  disabled={createCollectionMutation.isPending}
                  className="flex-1"
                >
                  Tạo & Thêm
                </Button>
              </div>
            </div>
          ) : (
            collections.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setShowCreateForm(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo bộ sưu tập mới
              </Button>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
