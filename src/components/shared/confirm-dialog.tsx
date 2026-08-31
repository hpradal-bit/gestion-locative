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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "destructive" | "default";
  /** Server Action déjà liée à ses arguments (ex : deleteProperty.bind(null, id)). */
  action: () => Promise<void>;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmer",
  variant = "destructive",
  action,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <form action={action}>
            <AlertDialogAction
              type="submit"
              className={cn(variant === "destructive" && buttonVariants({ variant: "destructive" }))}
            >
              {confirmLabel}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
