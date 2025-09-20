"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Shirt, TrendingUp, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  type: "item_count" | "category_fill" | "seasonal_prep" | "style_diversity";
  title: string;
  description: string;
  target: number;
  current: number;
  category?: string;
  season?: string;
  deadline?: Date;
  reward?: string;
  status: "active" | "completed" | "paused";
}

interface FillGoalProps {
  totalItems: number;
  itemsByCategory: Record<string, number>;
  className?: string;
}

const defaultGoals: Goal[] = [
  {
    id: "1",
    type: "item_count",
    title: "Build Basic Wardrobe",
    description: "Reach 30 essential items",
    target: 30,
    current: 0,
    reward: "50 style points",
    status: "active",
  },
  {
    id: "2",
    type: "category_fill",
    title: "Complete Tops Collection",
    description: "Add 10 versatile tops",
    target: 10,
    current: 0,
    category: "top",
    reward: "Styling tips badge",
    status: "active",
  },
];

export function FillGoal({
  totalItems,
  itemsByCategory,
  className,
}: FillGoalProps) {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: "item_count" as Goal["type"],
    title: "",
    description: "",
    target: 10,
    category: "",
    season: "",
    deadline: "",
    reward: "",
  });

  // Update current progress for goals
  const updatedGoals = goals.map((goal) => {
    let current = goal.current;

    if (goal.type === "item_count") {
      current = totalItems;
    } else if (goal.type === "category_fill" && goal.category) {
      current = itemsByCategory[goal.category] || 0;
    }

    return {
      ...goal,
      current,
      status: current >= goal.target ? ("completed" as const) : goal.status,
    };
  });

  const activeGoals = updatedGoals.filter((goal) => goal.status === "active");
  const completedGoals = updatedGoals.filter(
    (goal) => goal.status === "completed"
  );

  const handleCreateGoal = () => {
    if (!newGoal.title.trim() || !newGoal.description.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      current: 0,
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : undefined,
      status: "active",
    };

    setGoals((prev) => [...prev, goal]);
    setNewGoal({
      type: "item_count",
      title: "",
      description: "",
      target: 10,
      category: "",
      season: "",
      deadline: "",
      reward: "",
    });
    setShowGoalDialog(false);
  };

  const getGoalIcon = (type: Goal["type"]) => {
    switch (type) {
      case "item_count":
        return Target;
      case "category_fill":
        return Shirt;
      case "seasonal_prep":
        return Calendar;
      case "style_diversity":
        return TrendingUp;
      default:
        return Target;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-orange-500";
  };

  // Animated Progress Component
  const AnimatedProgress = ({
    value,
    className,
  }: {
    value: number;
    className?: string;
  }) => (
    <div
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-gray-200/80",
        className
      )}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{
          duration: 1.5,
          ease: "easeOut",
          delay: 0.2,
        }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={cn(
          "bg-white/60 backdrop-blur-md border-white/20 shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.12)]",
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Target className="h-5 w-5 text-primary" />
              </motion.div>
              Wardrobe Goals
            </CardTitle>
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Goal Type</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={(value: Goal["type"]) =>
                        setNewGoal((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="item_count">
                          Total Item Count
                        </SelectItem>
                        <SelectItem value="category_fill">
                          Category Fill
                        </SelectItem>
                        <SelectItem value="seasonal_prep">
                          Seasonal Prep
                        </SelectItem>
                        <SelectItem value="style_diversity">
                          Style Diversity
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Goal title"
                      value={newGoal.title}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Goal description"
                      value={newGoal.description}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label>Target Number</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newGoal.target}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          target: parseInt(e.target.value) || 10,
                        }))
                      }
                    />
                  </div>

                  {newGoal.type === "category_fill" && (
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newGoal.category}
                        onValueChange={(value) =>
                          setNewGoal((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="top">Tops</SelectItem>
                          <SelectItem value="bottom">Bottoms</SelectItem>
                          <SelectItem value="shoes">Shoes</SelectItem>
                          <SelectItem value="outer">Outerwear</SelectItem>
                          <SelectItem value="accessory">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Reward (Optional)</Label>
                    <Input
                      placeholder="e.g., 50 style points"
                      value={newGoal.reward}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          reward: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowGoalDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGoal} className="flex-1">
                      Create Goal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Active Goals
              </h4>
              {activeGoals.map((goal) => {
                const progress = Math.round((goal.current / goal.target) * 100);
                const Icon = getGoalIcon(goal.type);

                return (
                  <motion.div
                    key={goal.id}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {goal.title}
                        </span>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {goal.current}/{goal.target}
                        </Badge>
                      </motion.div>
                    </div>

                    <AnimatedProgress value={progress} />

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{goal.description}</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1.0 }}
                      >
                        {progress}%
                      </motion.span>
                    </div>

                    {goal.reward && (
                      <motion.div
                        className="flex items-center gap-1 text-xs text-primary"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                      >
                        <Award className="h-3 w-3" />
                        <span>{goal.reward}</span>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Completed
              </h4>
              {completedGoals.slice(0, 2).map((goal) => {
                const Icon = getGoalIcon(goal.type);

                return (
                  <motion.div
                    key={goal.id}
                    className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <Icon className="h-4 w-4 text-green-600" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-green-800">
                        {goal.title}
                      </div>
                      {goal.reward && (
                        <motion.div
                          className="flex items-center gap-1 text-xs text-green-600"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                        >
                          <Award className="h-3 w-3" />
                          <span>{goal.reward}</span>
                        </motion.div>
                      )}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                        Completed
                      </Badge>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-muted-foreground mb-3">
                No goals set yet
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGoalDialog(true)}
                >
                  Create Your First Goal
                </Button>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
