"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, XSquare } from "lucide-react";

interface SelectionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export function SelectionToolbar({
  selectedCount,
  onClearSelection,
}: SelectionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-md animate-in slide-in-from-top-2 duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {selectedCount} setting{selectedCount > 1 ? "s" : ""} selected
              </p>
              <p className="text-sm text-gray-600">
                You can perform bulk actions on selected items
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="border-2 hover:bg-white"
          >
            <XSquare className="w-4 h-4 mr-2" />
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

