import { Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";
import { Input } from "./input";
import { Button } from "./button";

export interface StatusOption {
  value: string;
  label: string;
}

// One configurable status-update dialog instead of AdminPanel's and
// TechnicianPanel's separately hand-built status+note(+date) forms - the
// `note`/`eta` props are each optional so a screen only renders the fields
// it actually has (AdminPanel: status + admin note; TechnicianPanel: status
// + technician note + ETA).
export function StatusUpdateDialog({
  open,
  onOpenChange,
  title,
  description,
  statusValue,
  onStatusChange,
  statusOptions,
  note,
  eta,
  onSubmit,
  submitting,
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  statusValue: string;
  onStatusChange: (value: string) => void;
  statusOptions: StatusOption[];
  note?: { label: string; value: string; onChange: (value: string) => void; placeholder?: string };
  eta?: { label: string; value: string; onChange: (value: string) => void };
  onSubmit: () => void;
  submitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status-update-select">Status</Label>
            <Select value={statusValue} onValueChange={onStatusChange}>
              <SelectTrigger id="status-update-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {note && (
            <div className="space-y-2">
              <Label htmlFor="status-update-note">{note.label}</Label>
              <Textarea
                id="status-update-note"
                placeholder={note.placeholder}
                value={note.value}
                onChange={(e) => note.onChange(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {eta && (
            <div className="space-y-2">
              <Label htmlFor="status-update-eta">{eta.label}</Label>
              <Input id="status-update-eta" type="date" value={eta.value} onChange={(e) => eta.onChange(e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {cancelLabel}
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
