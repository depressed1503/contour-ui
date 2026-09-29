import { useState } from "react";

import { Plus, Settings } from "lucide-react";

import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import { Dialog } from "./components/ui/dialog";
import { Field } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { Menu } from "./components/ui/menu";
import { Popover } from "./components/ui/popover";
import { Select } from "./components/ui/select";
import { Switch } from "./components/ui/switch";
import { Table } from "./components/ui/table";
import { Tooltip } from "./components/ui/tooltip";

import {
  DataTable,
  defineDataTable,
  type DataTableBulkTarget,
  type DataTableDataSource,
  type DataTableFilter,
  type DataTableFilterValue,
  type DataTableRangeValue,
} from "./components/data-table";

import "./App.css";
import "./styles/tokens.css";
import "./styles/globals.css";

type AssetStatus = "active" | "pending" | "archived";

type Asset = {
  id: number;

  name: string;

  company: {
    id: number;
    name: string;
  };

  status: AssetStatus;

  assetsCount: number;

  priority: number;

  updatedAt: string;

  createdAt: string;

  lastSeenAt: string;

  description?: string;
  featured?: boolean;
  channels?: string[];
};

const assets: Asset[] = [
  {
    id: 1,
    name: "Analytics",
    company: {
      id: 42,
      name: "Acme",
    },
    status: "active",
    assetsCount: 1248,
    priority: 1,
    updatedAt: "2026-09-24",
    createdAt: "2026-01-12",
    lastSeenAt: "2026-09-24T14:30",
  },
  {
    id: 2,
    name: "Billing",
    company: {
      id: 51,
      name: "Umbrella",
    },
    status: "pending",
    assetsCount: 328,
    priority: 2,
    updatedAt: "2026-09-23",
    createdAt: "2026-02-03",
    lastSeenAt: "2026-09-23T09:15",
  },
  {
    id: 3,
    name: "Legacy API",
    company: {
      id: 73,
      name: "Wayne Enterprises",
    },
    status: "archived",
    assetsCount: 84,
    priority: 5,
    updatedAt: "2026-09-18",
    createdAt: "2025-04-17",
    lastSeenAt: "2026-09-18T17:45",
  },
  {
    id: 4,
    name: "Customer Portal",
    company: {
      id: 42,
      name: "Acme",
    },
    status: "active",
    assetsCount: 742,
    priority: 2,
    updatedAt: "2026-09-25",
    createdAt: "2026-03-11",
    lastSeenAt: "2026-09-25T08:20",
  },
  {
    id: 5,
    name: "Identity Service",
    company: {
      id: 88,
      name: "Stark Industries",
    },
    status: "active",
    assetsCount: 2156,
    priority: 1,
    updatedAt: "2026-09-22",
    createdAt: "2025-12-19",
    lastSeenAt: "2026-09-22T21:10",
  },
  {
    id: 6,
    name: "Notifications",
    company: {
      id: 51,
      name: "Umbrella",
    },
    status: "pending",
    assetsCount: 195,
    priority: 3,
    updatedAt: "2026-09-20",
    createdAt: "2026-05-07",
    lastSeenAt: "2026-09-20T11:40",
  },
  {
    id: 7,
    name: "Search Platform",
    company: {
      id: 95,
      name: "Oscorp",
    },
    status: "active",
    assetsCount: 1789,
    priority: 1,
    updatedAt: "2026-09-21",
    createdAt: "2026-01-28",
    lastSeenAt: "2026-09-21T16:05",
  },
  {
    id: 8,
    name: "Data Warehouse",
    company: {
      id: 88,
      name: "Stark Industries",
    },
    status: "active",
    assetsCount: 4872,
    priority: 2,
    updatedAt: "2026-09-19",
    createdAt: "2025-10-09",
    lastSeenAt: "2026-09-19T23:50",
  },
  {
    id: 9,
    name: "Reports",
    company: {
      id: 73,
      name: "Wayne Enterprises",
    },
    status: "archived",
    assetsCount: 64,
    priority: 4,
    updatedAt: "2026-08-30",
    createdAt: "2024-11-22",
    lastSeenAt: "2026-08-30T13:25",
  },
  {
    id: 10,
    name: "Mobile Gateway",
    company: {
      id: 95,
      name: "Oscorp",
    },
    status: "pending",
    assetsCount: 516,
    priority: 3,
    updatedAt: "2026-09-17",
    createdAt: "2026-06-15",
    lastSeenAt: "2026-09-17T07:55",
  },
  {
    id: 11,
    name: "Audit Log",
    company: {
      id: 42,
      name: "Acme",
    },
    status: "active",
    assetsCount: 923,
    priority: 2,
    updatedAt: "2026-09-16",
    createdAt: "2026-04-02",
    lastSeenAt: "2026-09-16T19:35",
  },
  {
    id: 12,
    name: "Payments",
    company: {
      id: 88,
      name: "Stark Industries",
    },
    status: "active",
    assetsCount: 3654,
    priority: 1,
    updatedAt: "2026-09-25",
    createdAt: "2025-08-14",
    lastSeenAt: "2026-09-25T10:45",
  },
  {
    id: 13,
    name: "Import Service",
    company: {
      id: 51,
      name: "Umbrella",
    },
    status: "archived",
    assetsCount: 127,
    priority: 5,
    updatedAt: "2026-07-12",
    createdAt: "2024-06-08",
    lastSeenAt: "2026-07-12T12:00",
  },
  {
    id: 14,
    name: "Fraud Detection",
    company: {
      id: 95,
      name: "Oscorp",
    },
    status: "pending",
    assetsCount: 684,
    priority: 1,
    updatedAt: "2026-09-15",
    createdAt: "2026-07-21",
    lastSeenAt: "2026-09-15T15:15",
  },
  {
    id: 15,
    name: "Document Storage",
    company: {
      id: 73,
      name: "Wayne Enterprises",
    },
    status: "active",
    assetsCount: 1433,
    priority: 3,
    updatedAt: "2026-09-14",
    createdAt: "2025-11-05",
    lastSeenAt: "2026-09-14T18:30",
  },
];

const companies = [
  {
    id: 42,
    name: "Acme",
  },
  {
    id: 51,
    name: "Umbrella",
  },
  {
    id: 73,
    name: "Wayne Enterprises",
  },
  {
    id: 88,
    name: "Stark Industries",
  },
  {
    id: 95,
    name: "Oscorp",
  },
];

const companyItems = companies.map((company) => ({
  value: company.id,
  label: company.name,
}));

const statusItems: { value: AssetStatus; label: string }[] = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

const channelItems = [
  { value: "email", label: "Email" },
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobile" },
];

const assetDataSource: DataTableDataSource<Asset> = {
  async getList(query, signal) {
    await delay(250, signal);

    let result = [...assets];

    for (const filter of query.filters) {
      result = result.filter((asset) => {
        const matches = matchesAssetFilter(asset, filter);

        return filter.operator === "exclude" ? !matches : matches;
      });
    }

    result = sortAssets(result, query.sorting);

    const count = result.length;

    const start = (query.page - 1) * query.pageSize;

    const end = start + query.pageSize;

    return {
      items: result.slice(start, end),

      count,
    };
  },

  async getOne(id, signal) {
    await delay(180, signal);

    const asset = assets.find((item) => String(item.id) === id);

    if (!asset) {
      throw new Error("Asset not found");
    }

    return {
      id: asset.id,
      name: asset.name,
      description: asset.description ?? "",
      company_id: asset.company.id,
      status: asset.status,
      assets_count: asset.assetsCount,
      priority: asset.priority,
      featured: asset.featured ?? false,
      channels: asset.channels ?? [],
      updated_at: asset.updatedAt,
      created_at: asset.createdAt,
      last_seen_at: asset.lastSeenAt,
    };
  },

  async create(payload, signal) {
    await delay(320, signal);

    const company = getCompany(Number(payload.company_id));
    const now = new Date().toISOString().slice(0, 16);
    const today = now.slice(0, 10);
    const id = Math.max(0, ...assets.map((asset) => asset.id)) + 1;

    const asset: Asset = {
      id,
      name: String(payload.name ?? ""),
      description: String(payload.description ?? ""),
      company,
      status: toAssetStatus(payload.status),
      assetsCount: Number(payload.assets_count ?? 0),
      priority: Number(payload.priority ?? 1),
      featured: payload.featured === true,
      channels: toStringArray(payload.channels),
      updatedAt: String(payload.updated_at ?? today),
      createdAt: String(payload.created_at ?? today),
      lastSeenAt: String(payload.last_seen_at ?? now),
    };

    assets.unshift(asset);
    return asset;
  },

  async update(id, payload, signal) {
    await delay(320, signal);

    const asset = assets.find((item) => String(item.id) === id);

    if (!asset) {
      throw new Error("Asset not found");
    }

    asset.name = String(payload.name ?? asset.name);
    asset.description = String(payload.description ?? asset.description ?? "");
    asset.company = getCompany(Number(payload.company_id ?? asset.company.id));
    asset.status = toAssetStatus(payload.status ?? asset.status);
    asset.assetsCount = Number(payload.assets_count ?? asset.assetsCount);
    asset.priority = Number(payload.priority ?? asset.priority);
    asset.featured = payload.featured === true;
    asset.channels = toStringArray(payload.channels ?? asset.channels ?? []);
    asset.updatedAt = String(payload.updated_at ?? asset.updatedAt);
    asset.createdAt = String(payload.created_at ?? asset.createdAt);
    asset.lastSeenAt = String(payload.last_seen_at ?? asset.lastSeenAt);

    return asset;
  },

  async delete(id, signal) {
    await delay(250, signal);

    const index = assets.findIndex((item) => String(item.id) === id);

    if (index < 0) {
      throw new Error("Asset not found");
    }

    assets.splice(index, 1);
  },
};

const assetTable = defineDataTable<Asset>({
  id: "assets",
  selection: true,
  bulkActions: [
    {
      id: "archive",
      label: "Archive",

      onAction: async ({ target, signal }) => {
        console.log("archive", target);

        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(resolve, 800);

          signal.addEventListener(
            "abort",
            () => {
              window.clearTimeout(timeout);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        });
      },
    },

    {
      id: "change-status",
      label: "Change status",
      dialogTitle: "Change status",
      confirmLabel: "Apply",
      initialValues: {
        status: "active" as AssetStatus,
      },

      renderFields: ({ values, setValues }) => {
        const formValues = values as { status: AssetStatus };

        return (
          <Field>
            <Field.Label>Status</Field.Label>

            <Select
              items={statusItems}
              value={formValues.status}
              onValueChange={(status) => {
                if (!status) {
                  return;
                }

                setValues({
                  ...formValues,
                  status,
                });
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select status" />
              </Select.Trigger>

              <Select.Popup>
                {statusItems.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select>
          </Field>
        );
      },

      onAction: async ({ target, values, signal }) => {
        const formValues = values as { status: AssetStatus };

        await delay(500, signal);

        for (const asset of getBulkTargetAssets(target)) {
          asset.status = formValues.status;
        }
      },
    },

    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      dialogTitle: "Delete records",
      confirmLabel: "Delete",

      onAction: async ({ target }) => {
        console.log("delete", target);
      },
    },
  ],
  getRowId: (row) => String(row.id),
  datasource: assetDataSource,
  editor: {
    entityLabel: "asset",
    getRowLabel: (row) => row.name,
    create: true,
    edit: true,
    delete: true,
    fields: {
      name: {
        type: "text",
        label: "Name",
        required: true,
        minLength: 2,
        maxLength: 80,
        placeholder: "Analytics",
      },
      description: {
        type: "textarea",
        label: "Description",
        maxLength: 500,
        placeholder: "Short internal description",
      },
      company: {
        type: "select",
        label: "Company",
        field: "company_id",
        required: true,
        options: companyItems,
      },
      status: {
        type: "select",
        label: "Status",
        required: true,
        defaultValue: "active",
        options: statusItems,
      },
      channels: {
        type: "multiselect",
        label: "Channels",
        options: channelItems,
        defaultValue: [],
      },
      assetsCount: {
        type: "number",
        label: "Assets",
        min: 0,
        defaultValue: 0,
      },
      priority: {
        type: "number",
        label: "Priority",
        required: true,
        min: 1,
        max: 5,
        defaultValue: 3,
        validate: (value) =>
          typeof value === "number" && Number.isInteger(value)
            ? undefined
            : "Priority must be a whole number.",
      },
      featured: {
        type: "checkbox",
        label: "Featured",
        description: "Highlight this asset in internal views.",
      },
      updatedAt: {
        type: "date",
        label: "Updated",
        required: true,
      },
      createdAt: {
        type: "date",
        label: "Created",
        required: true,
      },
      lastSeenAt: {
        type: "datetime",
        label: "Last seen",
      },
    },
    renderAfter: ({ values }) => (
      <div style={{ fontSize: 12, color: "var(--ui-muted)" }}>
        Payload preview uses snake_case by default. Current name: {String(values.name ?? "—")}
      </div>
    ),
  },
  rowActions: [
    {
      id: "log",
      label: "Log row",
      onAction: (row) => {
        console.log("row action", row);
      },
    },
  ],
  pagination: {
    defaultPageSize: 5,

    pageSizeOptions: [5, 10, 15],
  },

  columns: {
    name: {
      label: "Name",

      sortable: true,

      filter: "text",
    },

    company: {
      label: "Company",

      sortable: true,

      filter: {
        type: "multiselect",

        options: companyItems,
      },

      cell: ({ value }) => value.name,
    },

    status: {
      label: "Status",

      sortable: true,

      filter: {
        type: "select",

        options: statusItems,
      },

      cell: ({ value }) => {
        const variant = {
          active: "success",
          pending: "warning",
          archived: "neutral",
        } as const;

        return <Badge variant={variant[value]}>{value}</Badge>;
      },
    },

    assetsCount: {
      label: "Assets",

      sortable: true,

      filter: "number-range",
    },

    priority: {
      label: "Priority",

      sortable: true,

      filter: "number",
    },

    updatedAt: {
      label: "Updated",

      sortable: true,

      filter: "date-range",
    },

    createdAt: {
      label: "Created",

      sortable: true,

      filter: "date",
    },

    lastSeenAt: {
      label: "Last seen",

      sortable: true,

      filter: "datetime-range",
    },
  },
});

export default function App() {
  const [value, setValue] = useState("");

  const [email, setEmail] = useState("");

  const hasEmailError = email.length > 0 && !email.includes("@");

  const [checked, setChecked] = useState(false);

  const [enabled, setEnabled] = useState(false);

  const [companyId, setCompanyId] = useState<number | null>(42);

  return (
    <main className="demo">
      <section className="block">
        <h2>Button</h2>

        <div className="row">
          <Button>Save</Button>

          <Button variant="secondary">Cancel</Button>

          <Button variant="ghost">Settings</Button>
        </div>

        <div className="row">
          <Button size="sm">Small</Button>

          <Button size="md">Medium</Button>

          <Button size="lg">Large</Button>
        </div>

        <div className="row">
          <Button>
            <Plus />
            Create
          </Button>

          <Button iconOnly variant="ghost" aria-label="Settings">
            <Settings />
          </Button>
        </div>

        <div className="row">
          <Button loading>Saving</Button>

          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="block">
        <h2>Input</h2>

        <Input placeholder="Default input" />

        <Input size="sm" placeholder="Small input" />

        <Input size="md" placeholder="Medium input" />

        <Input size="lg" placeholder="Large input" />

        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Controlled input"
        />

        <Input invalid placeholder="Invalid input" />

        <Input disabled placeholder="Disabled input" />
      </section>

      <section className="block">
        <h2>Field</h2>

        <Field>
          <Field.Label>Name</Field.Label>

          <Input placeholder="John Doe" />
        </Field>

        <Field>
          <Field.Label>Username</Field.Label>

          <Input placeholder="john.doe" />

          <Field.Description>
            This name will be visible to other users.
          </Field.Description>
        </Field>

        <Field invalid={hasEmailError}>
          <Field.Label>Email</Field.Label>

          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="user@example.com"
          />

          <Field.Description>Enter your work email address.</Field.Description>

          <Field.Error>Please enter a valid email address.</Field.Error>
        </Field>
      </section>

      <section className="block">
        <h2>Badge</h2>

        <div className="row">
          <Badge>Default</Badge>

          <Badge variant="success">Active</Badge>

          <Badge variant="warning">Pending</Badge>

          <Badge variant="danger">Failed</Badge>
        </div>
      </section>

      <section className="block">
        <h2>Checkbox</h2>

        <div className="row">
          <Checkbox />

          <Checkbox defaultChecked />

          <Checkbox indeterminate />

          <Checkbox disabled />
        </div>

        <div className="row">
          <Checkbox checked={checked} onCheckedChange={setChecked} />

          <span>Controlled: {checked ? "checked" : "unchecked"}</span>
        </div>
      </section>

      <section className="block">
        <h2>Switch</h2>

        <div className="row">
          <Switch />

          <Switch defaultChecked />

          <Switch disabled />
        </div>

        <div className="row">
          <Switch checked={enabled} onCheckedChange={setEnabled} />

          <span>{enabled ? "Enabled" : "Disabled"}</span>
        </div>
      </section>

      <section className="block">
        <h2>Tooltip</h2>

        <Tooltip>
          <Tooltip.Trigger
            render={
              <Button iconOnly variant="ghost" aria-label="Settings">
                <Settings />
              </Button>
            }
          />

          <Tooltip.Popup>Settings</Tooltip.Popup>
        </Tooltip>
      </section>

      <section className="block">
        <h2>Popover</h2>

        <Popover>
          <Popover.Trigger
            render={<Button variant="secondary">Open popover</Button>}
          />

          <Popover.Popup>This is popover content.</Popover.Popup>
        </Popover>
      </section>

      <section className="block">
        <h2>Menu</h2>

        <Menu>
          <Menu.Trigger
            render={
              <Button iconOnly variant="ghost" aria-label="Row actions">
                <Settings />
              </Button>
            }
          />

          <Menu.Popup>
            <Menu.Item>Edit</Menu.Item>

            <Menu.Item>Duplicate</Menu.Item>

            <Menu.Separator />

            <Menu.Item variant="danger">Delete</Menu.Item>
          </Menu.Popup>
        </Menu>
      </section>

      <section className="block">
        <h2>Dialog</h2>

        <Dialog>
          <Dialog.Trigger
            render={<Button variant="secondary">Edit user</Button>}
          />

          <Dialog.Popup>
            <Dialog.Header>
              <Dialog.Title>Edit user</Dialog.Title>

              <Dialog.Description>
                Change the user information below.
              </Dialog.Description>
            </Dialog.Header>

            <Field>
              <Field.Label>Name</Field.Label>

              <Input placeholder="John Doe" />
            </Field>

            <Dialog.Footer>
              <Dialog.Close
                render={<Button variant="secondary">Cancel</Button>}
              />

              <Button>Save</Button>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog>
      </section>

      <section className="block">
        <h2>Select</h2>

        <Select defaultValue="active">
          <Select.Trigger>
            <Select.Value placeholder="Select status" />
          </Select.Trigger>

          <Select.Popup>
            <Select.Item value="active">Active</Select.Item>

            <Select.Item value="inactive">Inactive</Select.Item>

            <Select.Item value="archived">Archived</Select.Item>
          </Select.Popup>
        </Select>

        <Field>
          <Field.Label>Company</Field.Label>

          <Select
            items={companyItems}
            value={companyId}
            onValueChange={setCompanyId}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select company" />
            </Select.Trigger>

            <Select.Popup>
              {companyItems.map((company) => (
                <Select.Item key={company.value} value={company.value}>
                  {company.label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select>

          <Field.Description>Selected ID: {companyId ?? "—"}</Field.Description>
        </Field>
      </section>

      <section className="block">
        <h2>Table</h2>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>

              <Table.Head>Company</Table.Head>

              <Table.Head>Status</Table.Head>

              <Table.Head align="right">Assets</Table.Head>

              <Table.Head>Updated</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {assets.slice(0, 5).map((asset) => (
              <Table.Row key={asset.id}>
                <Table.Cell>{asset.name}</Table.Cell>

                <Table.Cell>{asset.company.name}</Table.Cell>

                <Table.Cell>
                  <Badge
                    variant={
                      asset.status === "active"
                        ? "success"
                        : asset.status === "pending"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {asset.status}
                  </Badge>
                </Table.Cell>

                <Table.Cell align="right">{asset.assetsCount}</Table.Cell>

                <Table.Cell>{asset.updatedAt}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </section>

      <section className="block">
        <h2>DataTable</h2>

        <DataTable definition={assetTable} />
      </section>
    </main>
  );
}


function getBulkTargetAssets(target: DataTableBulkTarget): Asset[] {
  if ("ids" in target) {
    const ids = new Set(target.ids);

    return assets.filter((asset) => ids.has(String(asset.id)));
  }

  return assets.filter((asset) =>
    target.filters.every((filter) => {
      const matches = matchesAssetFilter(asset, filter);

      return filter.operator === "exclude" ? !matches : matches;
    }),
  );
}

function matchesAssetFilter(asset: Asset, filter: DataTableFilter): boolean {
  switch (filter.id) {
    case "name":
      return matchesText(asset.name, filter.value);

    case "company":
      return matchesMultiSelect(asset.company.id, filter.value);

    case "status":
      return matchesSelect(asset.status, filter.value);

    case "assetsCount":
      return matchesNumberRange(asset.assetsCount, filter.value);

    case "priority":
      return matchesNumber(asset.priority, filter.value);

    case "updatedAt":
      return matchesStringRange(asset.updatedAt, filter.value);

    case "createdAt":
      return matchesString(asset.createdAt, filter.value);

    case "lastSeenAt":
      return matchesStringRange(asset.lastSeenAt, filter.value);

    default:
      return true;
  }
}

function matchesText(actual: string, value: DataTableFilterValue): boolean {
  if (typeof value !== "string") {
    return true;
  }

  return actual.toLowerCase().includes(value.toLowerCase());
}

function matchesString(actual: string, value: DataTableFilterValue): boolean {
  if (typeof value !== "string") {
    return true;
  }

  return actual === value;
}

function matchesNumber(actual: number, value: DataTableFilterValue): boolean {
  if (typeof value !== "number") {
    return true;
  }

  return actual === value;
}

function matchesSelect(
  actual: string | number | boolean,
  value: DataTableFilterValue,
): boolean {
  if (Array.isArray(value) || isRangeValue(value)) {
    return true;
  }

  return actual === value;
}

function matchesMultiSelect(
  actual: string | number | boolean,
  value: DataTableFilterValue,
): boolean {
  if (!Array.isArray(value)) {
    return true;
  }

  return value.includes(actual);
}

function matchesNumberRange(
  actual: number,
  value: DataTableFilterValue,
): boolean {
  if (!isNumberRange(value)) {
    return true;
  }

  if (value.from !== null && actual < value.from) {
    return false;
  }

  if (value.to !== null && actual > value.to) {
    return false;
  }

  return true;
}

function matchesStringRange(
  actual: string,
  value: DataTableFilterValue,
): boolean {
  if (!isStringRange(value)) {
    return true;
  }

  if (value.from !== null && actual < value.from) {
    return false;
  }

  if (value.to !== null && actual > value.to) {
    return false;
  }

  return true;
}

function isRangeValue(
  value: DataTableFilterValue,
): value is DataTableRangeValue<string | number> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "from" in value &&
    "to" in value
  );
}

function isNumberRange(
  value: DataTableFilterValue,
): value is DataTableRangeValue<number> {
  if (!isRangeValue(value)) {
    return false;
  }

  return (
    (value.from === null || typeof value.from === "number") &&
    (value.to === null || typeof value.to === "number")
  );
}

function isStringRange(
  value: DataTableFilterValue,
): value is DataTableRangeValue<string> {
  if (!isRangeValue(value)) {
    return false;
  }

  return (
    (value.from === null || typeof value.from === "string") &&
    (value.to === null || typeof value.to === "string")
  );
}

function sortAssets(
  source: Asset[],
  sorting: {
    id: string;
    desc: boolean;
  }[],
): Asset[] {
  const result = [...source];

  result.sort((left, right) => {
    for (const sort of sorting) {
      const comparison = compareAssets(left, right, sort.id);

      if (comparison === 0) {
        continue;
      }

      return sort.desc ? -comparison : comparison;
    }

    return 0;
  });

  return result;
}

function compareAssets(left: Asset, right: Asset, id: string): number {
  switch (id) {
    case "name":
      return left.name.localeCompare(right.name);

    case "company":
      return left.company.name.localeCompare(right.company.name);

    case "status":
      return left.status.localeCompare(right.status);

    case "assetsCount":
      return left.assetsCount - right.assetsCount;

    case "priority":
      return left.priority - right.priority;

    case "updatedAt":
      return left.updatedAt.localeCompare(right.updatedAt);

    case "createdAt":
      return left.createdAt.localeCompare(right.createdAt);

    case "lastSeenAt":
      return left.lastSeenAt.localeCompare(right.lastSeenAt);

    default:
      return 0;
  }
}

function getCompany(id: number): Asset["company"] {
  const company = companies.find((item) => item.id === id);

  if (!company) {
    throw new Error(`Unknown company id: ${id}`);
  }

  return company;
}

function toAssetStatus(value: unknown): AssetStatus {
  if (value === "active" || value === "pending" || value === "archived") {
    return value;
  }

  return "active";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function delay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));

      return;
    }

    const timeoutId = window.setTimeout(resolve, milliseconds);

    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);

        reject(new DOMException("Request aborted", "AbortError"));
      },
      {
        once: true,
      },
    );
  });
}
