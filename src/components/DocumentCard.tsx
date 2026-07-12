import { Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { toggleBookmark, type Document } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DocumentCard({
  doc,
  bookmarked: initialBookmarked,
  onToggled,
}: {
  doc: Document;
  bookmarked?: boolean;
  onToggled?: (b: boolean) => void;
}) {
  const [bookmarked, setBookmarked] = useState(!!initialBookmarked);
  const [pending, setPending] = useState(false);

  const onToggle = async () => {
    setPending(true);
    try {
      await toggleBookmark(doc.id, bookmarked);
      const next = !bookmarked;
      setBookmarked(next);
      onToggled?.(next);
      toast.success(next ? "Bookmarked" : "Removed from bookmarks");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="secondary" className="rounded-full">{doc.category}</Badge>
        <button
          onClick={onToggle}
          disabled={pending}
          aria-label="Bookmark"
          className="grid h-9 w-9 place-items-center rounded-full border transition hover:bg-accent"
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{doc.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{doc.description}</p>

      {doc.ai_summary && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Summary
          </div>
          <p className="mt-1.5 line-clamp-3 text-sm text-foreground/80">{doc.ai_summary}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {doc.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-primary hover:text-primary">
              Read more →
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">{doc.category}</Badge>
              </div>
              <DialogTitle className="font-display text-2xl leading-tight">{doc.title}</DialogTitle>
            </DialogHeader>
            {doc.ai_summary && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" /> AI Summary
                </div>
                <p className="mt-2 text-sm">{doc.ai_summary}</p>
              </div>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">{doc.content}</p>
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}
