import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DEFAULT_COLORS, SEASONS, PATTERNS, FABRICS, CONDITIONS, TAG_SUGGESTIONS } from './constants';
import type { WizardFormData, ColorOption } from './types';

interface StepCategorizeProps {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
}

export function StepCategorize({ formData, updateFormData }: StepCategorizeProps) {
  const [customColor, setCustomColor] = useState('#000000');
  const [tagInput, setTagInput] = useState('');

  const toggleColor = (color: ColorOption) => {
    const exists = formData.colors.find(c => c.hex === color.hex);
    if (exists) {
      updateFormData({ colors: formData.colors.filter(c => c.hex !== color.hex) });
    } else if (formData.colors.length < 3) {
      updateFormData({ colors: [...formData.colors, color] });
    }
  };

  const addCustomColor = () => {
    if (formData.colors.length >= 3) {
      return;
    }
    
    const colorName = prompt('Enter color name:');
    if (!colorName) return;

    const newColor: ColorOption = { name: colorName, hex: customColor };
    updateFormData({ colors: [...formData.colors, newColor] });
  };

  const toggleSeason = (season: string) => {
    const exists = formData.seasons.includes(season);
    if (exists) {
      updateFormData({ seasons: formData.seasons.filter(s => s !== season) });
    } else {
      updateFormData({ seasons: [...formData.seasons, season] });
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      updateFormData({ tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateFormData({ tags: formData.tags.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Colors */}
      <div>
        <Label>Color (maximum 3)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {DEFAULT_COLORS.map(color => {
            const isSelected = formData.colors.some(c => c.hex === color.hex);
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => toggleColor(color)}
                className={cn(
                  'w-12 h-12 rounded-lg border-2 transition-all',
                  isSelected ? 'border-primary scale-110' : 'border-border hover:scale-105'
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            );
          })}
          
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-12 h-12 rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center transition-colors"
                disabled={formData.colors.length >= 3}
              >
                <Plus className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <Label>Custom color</Label>
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-12"
                />
                <Button onClick={addCustomColor} className="w-full" size="sm">
                  Add color
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.colors.map(color => (
            <Badge key={color.hex} variant="secondary" className="gap-2">
              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: color.hex }} />
              {color.name}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => toggleColor(color)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Seasons/Weather */}
      <div>
        <Label>Season / Weather</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {SEASONS.map(season => {
            const isSelected = formData.seasons.includes(season.name);
            return (
              <button
                key={season.name}
                type="button"
                onClick={() => toggleSeason(season.name)}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span>{season.emoji}</span>
                <span className="text-sm font-medium">{season.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pattern */}
      <div>
        <Label>Pattern</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {PATTERNS.map(pattern => (
            <button
              key={pattern}
              type="button"
              onClick={() => updateFormData({ pattern })}
              className={cn(
                'px-4 py-2 rounded-lg border-2 transition-all text-sm',
                formData.pattern === pattern
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {pattern}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric */}
      <div>
        <Label htmlFor="fabric">Fabric</Label>
        <Select value={formData.fabric} onValueChange={(value) => updateFormData({ fabric: value })}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select fabric..." />
          </SelectTrigger>
          <SelectContent>
            {FABRICS.map(fabric => (
              <SelectItem key={fabric} value={fabric}>
                {fabric}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div>
        <Label>Condition</Label>
        <RadioGroup value={formData.condition} onValueChange={(value) => updateFormData({ condition: value })} className="mt-2">
          <div className="flex gap-4">
            {CONDITIONS.map(condition => (
              <div key={condition} className="flex items-center space-x-2">
                <RadioGroupItem value={condition} id={condition} />
                <Label htmlFor={condition} className="cursor-pointer">{condition}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {TAG_SUGGESTIONS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (!formData.tags.includes(tag)) {
                  updateFormData({ tags: [...formData.tags, tag] });
                }
              }}
              className="px-2 py-1 text-xs rounded border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag}
              <X
                className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Worn Today */}
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div>
          <Label htmlFor="wornToday" className="cursor-pointer">
            Mark as worn today
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Will increase worn count by 1
          </p>
        </div>
        <Switch
          id="wornToday"
          checked={formData.wornToday}
          onCheckedChange={(checked) => updateFormData({ wornToday: checked })}
        />
      </div>
    </div>
  );
}


