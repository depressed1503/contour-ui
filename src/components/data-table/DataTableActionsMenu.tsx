import { ChevronDown } from "lucide-react";

import { Button } from "../ui/button";
import { Menu } from "../ui/menu";

import type { DataTableBulkAction } from "./DataTable.types";

interface DataTableActionsMenuProps {
  actions: DataTableBulkAction<unknown>[];
  onActionSelect: (action: DataTableBulkAction<unknown>) => void;
}

export function DataTableActionsMenu({
  actions,
  onActionSelect,
}: DataTableActionsMenuProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Menu>
      <Menu.Trigger
        render={
          <Button type="button" variant="secondary" size="sm">
            Actions
            <ChevronDown aria-hidden />
          </Button>
        }
      />

      <Menu.Popup>
        {actions.map((action) => (
          <Menu.Item
            key={action.id}
            variant={action.variant === "danger" ? "danger" : "default"}
            onClick={() => onActionSelect(action)}
          >
            {action.label}
          </Menu.Item>
        ))}
      </Menu.Popup>
    </Menu>
  );
}
