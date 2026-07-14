"use client";

import { useId, useState } from "react";
import { deleteAccountAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAccountDialog() {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setConfirmation("");
          setError(null);
        }
      }}
    >
      <DialogTrigger render={<Button variant="destructive" />}>Cerrar cuenta</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cerrar tu cuenta?</DialogTitle>
          <DialogDescription>
            Se eliminarán permanentemente tus mascotas, reservas, visitas,
            informes, reseñas y fotos. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setIsSubmitting(true);

            const formData = new FormData();
            formData.set("confirmation", confirmation);

            const result = await deleteAccountAction({}, formData);
            setIsSubmitting(false);

            if (result?.error) {
              setError(result.error);
            }
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-confirmation`}>
              Escribe ELIMINAR para confirmar
            </Label>
            <Input
              id={`${formId}-confirmation`}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || confirmation !== "ELIMINAR"}
            >
              {isSubmitting ? "Eliminando…" : "Eliminar mi cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
