"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AISetting } from "@/lib/api/admin-api";

interface SettingsTableProps {
  isLoading: boolean;
  filteredSettings: AISetting[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEdit: (setting: AISetting) => void;
  onDelete: (setting: AISetting) => void;
  onViewValue: (setting: AISetting) => void;
  maskSensitiveValue: (value: string, id: number) => string;
  getTypeColor: (type: string) => string;
}

export function SettingsTable({
  isLoading,
  filteredSettings,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onDelete,
  onViewValue,
  maskSensitiveValue,
  getTypeColor,
}: SettingsTableProps) {
  const allSelected =
    filteredSettings.length > 0 &&
    filteredSettings.every((setting) => selectedIds.has(setting.id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">Loading AI settings...</p>
        <p className="text-sm text-gray-400 mt-1">
          Please wait while we fetch the data
        </p>
      </div>
    );
  }

  if (filteredSettings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-900 mb-1">
          No settings found
        </p>
        <p className="text-sm text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked: boolean) =>
                  checked ? onSelectAll() : onClearSelection()
                }
              />
            </TableHead>
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Value</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="font-semibold">Updated</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSettings.map((setting: AISetting) => (
            <TableRow
              key={setting.id}
              className={cn(
                "transition-colors",
                selectedIds.has(setting.id) && "bg-blue-50/30"
              )}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(setting.id)}
                  onCheckedChange={() => onToggleSelect(setting.id)}
                />
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="font-mono font-semibold border-2"
                >
                  {setting.id}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-gray-900">
                {setting.name}
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    "font-semibold border-0 shadow-sm",
                    getTypeColor(setting.type)
                  )}
                >
                  {setting.type.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 truncate font-mono">
                    {maskSensitiveValue(setting.value, setting.id)}
                  </span>
                  <div className="flex items-center gap-1">
                    {setting.value.length > 100 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-blue-100"
                        onClick={() => onViewValue(setting)}
                        title="View full value"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                      </Button>
                    )}
                    {/* {(setting.value.startsWith("AIza") ||
                      setting.value.startsWith("sk-") ||
                      setting.value.length > 50) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-gray-100"
                        onClick={() => onToggleShowValue(setting.id)}
                        title={
                          showSensitiveValues.has(setting.id)
                            ? "Hide value"
                            : "Show value"
                        }
                      >
                        {showSensitiveValues.has(setting.id) ? (
                          <EyeOff className="w-3.5 h-3.5 text-gray-600" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-gray-600" />
                        )}
                      </Button>
                    )} */}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {setting.createdDate
                  ? new Date(setting.createdDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {setting.updatedDate
                  ? new Date(setting.updatedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(setting)}
                    className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700"
                    title="Edit setting"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(setting)}
                    className="h-8 w-8 hover:bg-red-100 hover:text-red-700"
                    title="Delete setting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
