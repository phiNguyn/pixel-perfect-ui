import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Modal = ({
  children,
  title,
  trigger,
}: {
  children: React.ReactNode;
  title?: string;
  trigger: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
