import { useState } from 'react';
import { Sparkles, Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CATEGORY_OPTIONS, BRAND_OPTIONS } from './constants';
import type { WizardFormData, AISuggestions } from './types';

interface StepBasicsProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  aiSuggestions: AISuggestions | null;
}

export function StepBasics({ formData, updateFormData, aiSuggestions }: StepBasicsProps) {
  const [openBrand, setOpenBrand] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleNameChange = (value: string) => {
    updateFormData({ name: value });
    if (errors.includes('name-or-photo') && value.trim()) {
      setErrors(errors.filter(e => e !== 'name-or-photo'));
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    const category = CATEGORY_OPTIONS.find(c => c.name === categoryName);
    if (category) {
      updateFormData({ categoryName: category.name, categoryId: category.id });
      if (errors.includes('type')) {
        setErrors(errors.filter(e => e !== 'type'));
      }
    }
  };

  const suggestName = () => {
    if (!aiSuggestions) return;
    
    const colors = formData.colors.map(c => c.name).join(' ');
    const suggestedName = `${colors} ${formData.brand} ${formData.categoryName}`.trim();
    updateFormData({ name: suggestedName || 'New Item' });
  };

  const hasError = (field: string) => errors.includes(field);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Name */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="name">Item name *</Label>
          {aiSuggestions && formData.colors.length > 0 && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={suggestName}
              className="h-7 text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Suggest name
            </Button>
          )}
        </div>
        <Input
          id="name"
          placeholder="e.g: White Uniqlo T-shirt"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={cn(hasError('name-or-photo') && 'border-destructive')}
        />
        {hasError('name-or-photo') && (
          <p className="text-xs text-destructive mt-1">
            Name or photo is required
          </p>
        )}
      </div>

      {/* Category/Type */}
      <div>
        <Label htmlFor="category">Type / Category *</Label>
        <Select value={formData.categoryName} onValueChange={handleCategoryChange}>
          <SelectTrigger className={cn(hasError('type') && 'border-destructive', 'mt-2')}>
            <SelectValue placeholder="Select type..." />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(category => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasError('type') && (
          <p className="text-xs text-destructive mt-1">
            Category is required
          </p>
        )}
      </div>

      {/* Brand - Hybrid: Select từ list phổ biến hoặc tự nhập */}
      <div>
        <Label>Brand</Label>
        <Popover open={openBrand} onOpenChange={setOpenBrand}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openBrand}
              className="w-full justify-between mt-2"
            >
              {formData.brand || "Select or enter brand..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Search or enter new brand..." 
                value={formData.brand}
                onValueChange={(value) => updateFormData({ brand: value })}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Not found in list
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        // Keep the current input value as custom brand
                        setOpenBrand(false);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Use &ldquo;{formData.brand}&rdquo;
                    </Button>
                  </div>
                </CommandEmpty>
                <CommandGroup heading="Thương hiệu phổ biến">
                  {BRAND_OPTIONS.map((brand) => (
                    <CommandItem
                      key={brand}
                      value={brand}
                      onSelect={() => {
                        updateFormData({ brand });
                        setOpenBrand(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.brand === brand ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {brand}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {formData.brand && !BRAND_OPTIONS.includes(formData.brand) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            Custom brand: &ldquo;{formData.brand}&rdquo;
          </p>
        )}
      </div>

      {/* Notes/Description */}
      {/* <div>
        <Label htmlFor="notes">Note / Description</Label>
        <Textarea
          id="notes"
          placeholder="Add detailed description of the item..."
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          rows={3}
          className="mt-2"
        />
        {aiSuggestions?.aiDescription && formData.notes !== aiSuggestions.aiDescription && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => updateFormData({ notes: aiSuggestions.aiDescription })}
            className="mt-2 h-7 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Use description from AI
          </Button>
        )}
      </div> */}

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          * Required field. Name or photo is required.
        </p>
      </div>
    </div>
  );
}


