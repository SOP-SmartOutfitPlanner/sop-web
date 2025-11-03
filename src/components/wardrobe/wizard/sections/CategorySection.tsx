/**
 * CategorySection Component
 * Category selection with Nested Combobox (Parent > Children)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORM_ANIMATIONS } from "../form-config";
import type { AISuggestions } from "../types";

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  parentName?: string | null;
}

interface CategorySectionProps {
  categoryId: number;
  categoryName: string;
  availableCategories: Category[];
  errors: Record<string, string>;
  aiSuggestions: AISuggestions | null;
  onCategoryChange: (categoryId: number, categoryName: string) => void;
}

export function CategorySection({
  categoryId,
  categoryName,
  availableCategories,
  errors,
  aiSuggestions,
  onCategoryChange,
}: CategorySectionProps) {
  const [open, setOpen] = useState(false);

  // Group categories by parent
  const groupedCategories = useMemo(() => {
    const groups: Record<string, Category[]> = {};

    // Separate root categories (parentId === null) and children
    const rootCategories: Category[] = [];
    const childCategories: Category[] = [];

    availableCategories.forEach((cat) => {
      if (cat.parentId === null || cat.parentId === undefined) {
        rootCategories.push(cat);
      } else {
        childCategories.push(cat);
      }
    });

    // Group children by parent name
    childCategories.forEach((cat) => {
      const parentKey = cat.parentName || "Other";
      if (!groups[parentKey]) {
        groups[parentKey] = [];
      }
      groups[parentKey].push(cat);
    });

    // Add root categories that have no children as separate group
    const rootsWithoutChildren = rootCategories.filter(
      (root) => !Object.keys(groups).includes(root.name)
    );

    if (rootsWithoutChildren.length > 0) {
      groups["General"] = rootsWithoutChildren;
    }

    return groups;
  }, [availableCategories]);

  // Get display name (show parent > child if exists)
  const getDisplayName = (catId: number, catName: string) => {
    const category = availableCategories.find((c) => c.id === catId);
    if (category?.parentName) {
      return `${category.parentName} > ${catName}`;
    }
    return catName;
  };

  return (
    <motion.div variants={FORM_ANIMATIONS.item}>
      <Label className="text-sm font-semibold text-white/90 mb-2">
        Category *
      </Label>

      {/* AI Suggestion Badge */}
      {aiSuggestions?.category && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-400/20">
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-xs text-white/60">AI Detected:</span>
          <span className="text-sm text-blue-300 font-medium">
            {aiSuggestions.category.name}
          </span>
        </div>
      )}

      {/* Nested Combobox Dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
              !categoryName && "text-white/50"
            )}
          >
            {categoryName
              ? getDisplayName(categoryId, categoryName)
              : "Select category..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-slate-900 border-white/10">
          <Command className="bg-transparent">
            <CommandInput
              placeholder="Search categories..."
              className="text-white placeholder:text-white/40"
            />
            <CommandList className="max-h-[350px]">
              <CommandEmpty className="text-white/50 text-sm py-6 text-center">
                No category found.
              </CommandEmpty>

              {/* AI Suggested Group */}
              {aiSuggestions?.category && (
                <CommandGroup
                  heading="✨ AI Suggested"
                  className="text-blue-400 font-semibold"
                >
                  <CommandItem
                    value={aiSuggestions.category.name}
                    onSelect={() => {
                      onCategoryChange(
                        aiSuggestions.category.id,
                        aiSuggestions.category.name
                      );
                      setOpen(false);
                    }}
                    className="text-white hover:bg-blue-500/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>{aiSuggestions.category.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        categoryId === aiSuggestions.category.id
                          ? "opacity-100 text-blue-400"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                </CommandGroup>
              )}

              {/* Grouped Categories by Parent */}
              {Object.entries(groupedCategories).map(
                ([parentName, children]) => (
                  <CommandGroup
                    key={parentName}
                    heading={parentName}
                    className="text-white/70 font-semibold"
                  >
                    {children.map((cat) => {
                      // Skip if already in AI suggested
                      if (cat.id === aiSuggestions?.category?.id) return null;

                      return (
                        <CommandItem
                          key={cat.id}
                          value={`${parentName} ${cat.name}`}
                          onSelect={() => {
                            onCategoryChange(cat.id, cat.name);
                            setOpen(false);
                          }}
                          className="text-white/80 hover:bg-white/10 cursor-pointer pl-6"
                        >
                          <span className="flex-1">{cat.name}</span>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              categoryId === cat.id
                                ? "opacity-100 text-white"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {errors.category && (
        <p className="mt-2 text-xs text-red-400 font-medium">
          {errors.category}
        </p>
      )}
    </motion.div>
  );
}
