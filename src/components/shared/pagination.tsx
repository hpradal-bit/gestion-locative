import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  currentPage: number;
  pageCount: number;
  totalCount: number;
  /** Chemin de base (ex : "/documents") ; les paramètres actuels sont conservés. */
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

export function Pagination({
  currentPage,
  pageCount,
  totalCount,
  basePath,
  searchParams,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  function hrefForPage(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="mt-3 flex items-center justify-between px-1">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} sur {pageCount} ({totalCount} lignes)
      </p>
      <div className="flex gap-1">
        <Button size="icon" variant="outline" className="size-8" disabled={currentPage <= 1} asChild={currentPage > 1}>
          {currentPage > 1 ? (
            <Link href={hrefForPage(currentPage - 1)} aria-label="Page précédente">
              <ChevronLeft />
            </Link>
          ) : (
            <span aria-label="Page précédente">
              <ChevronLeft />
            </span>
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="size-8"
          disabled={currentPage >= pageCount}
          asChild={currentPage < pageCount}
        >
          {currentPage < pageCount ? (
            <Link href={hrefForPage(currentPage + 1)} aria-label="Page suivante">
              <ChevronRight />
            </Link>
          ) : (
            <span aria-label="Page suivante">
              <ChevronRight />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
