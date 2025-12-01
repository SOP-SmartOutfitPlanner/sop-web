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
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
        <p className="text-white font-medium">Loading AI settings...</p>
        <p className="text-sm text-white/50 mt-1">
          Please wait while we fetch the data
        </p>
      </div>
    );
  }

  if (filteredSettings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
          <Search className="w-8 h-8 text-white/40" />
        </div>
        <p className="text-lg font-medium text-white mb-1">
          No settings found
        </p>
        <p className="text-sm text-white/50">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <Table>
        <TableHeader>
          <TableRow className="bg-white/5 hover:bg-white/5 border-b border-white/10">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked: boolean) =>
                  checked ? onSelectAll() : onClearSelection()
                }
                className="border-white/30 data-[state=checked]:bg-cyan-500"
              />
            </TableHead>
            <TableHead className="font-semibold text-white/90">ID</TableHead>
            <TableHead className="font-semibold text-white/90">Name</TableHead>
            <TableHead className="font-semibold text-white/90">Type</TableHead>
            <TableHead className="font-semibold text-white/90">Value</TableHead>
            <TableHead className="font-semibold text-white/90">Created</TableHead>
            <TableHead className="font-semibold text-white/90">Updated</TableHead>
            <TableHead className="text-right font-semibold text-white/90">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSettings.map((setting: AISetting) => (
            <TableRow
              key={setting.id}
              className={cn(
                "transition-colors border-b border-white/10 hover:bg-white/5",
                selectedIds.has(setting.id) && "bg-cyan-500/10"
              )}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(setting.id)}
                  onCheckedChange={() => onToggleSelect(setting.id)}
                  className="border-white/30 data-[state=checked]:bg-cyan-500"
                />
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="font-mono font-semibold bg-white/10 border-white/20 text-white/80"
                >
                  {setting.id}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-white">
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
                  <span className="text-sm text-white/70 truncate font-mono">
                    {maskSensitiveValue(setting.value, setting.id)}
                  </span>
                  <div className="flex items-center gap-1">
                    {setting.value.length > 100 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-white/10"
                        onClick={() => onViewValue(setting)}
                        title="View full value"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
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
              <TableCell className="text-white/70 text-sm">
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
              <TableCell className="text-white/70 text-sm">
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
                    className="h-8 w-8 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300"
                    title="Edit setting"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(setting)}
                    className="h-8 w-8 hover:bg-red-500/20 text-red-400 hover:text-red-300"
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
