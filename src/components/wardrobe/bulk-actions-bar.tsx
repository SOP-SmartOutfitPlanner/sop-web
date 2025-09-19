"use client";

import { X, Trash2, Archive, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAddToCollection: () => void;
  onSetStatus: () => void;
  onDelete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onAddToCollection,
  onSetStatus,
  onDelete,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onAddToCollection}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            disabled // Disabled for now
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            Add to Collection
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onSetStatus}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
            disabled // Disabled for now
          >
            <Archive className="h-4 w-4 mr-1" />
            Set Status
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-gray-400 hover:text-gray-600 p-1 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
