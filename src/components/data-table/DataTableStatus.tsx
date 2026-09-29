import { RefreshCw } from "lucide-react";

import { Button } from "../ui/button";

interface DataTableStatusProps {
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export function DataTableStatus({
  loading,
  error,
  onRefresh,
}: DataTableStatusProps) {
  if (error) {
    return (
      <div role="alert">
        <span>Failed to load data.</span>

        <Button variant="secondary" size="sm" onClick={onRefresh}>
          <RefreshCw aria-hidden />
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        Loading…
      </div>
    );
  }

  return null;
}
