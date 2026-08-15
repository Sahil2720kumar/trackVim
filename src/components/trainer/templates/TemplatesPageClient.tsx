"use client";

// ============================================================================
// Imports
// ============================================================================

import React, { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Dumbbell,
  FileStack,
  Layers3,
  Clock3,
  Search,
  Plus,
  Download,
  Eye,
  Pencil,
  Copy,
  MoreHorizontal,
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  TrendingUp,
  ArrowLeft,
  Target,
  Zap,
  Activity,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatShortDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTrainerStore } from "@/stores/trainer-store";
import {
  useAllExercises,
  useWorkoutTemplates,
} from "@/hooks/queries/trainer.query";
import { useRouter } from "next/navigation";

// ============================================================================
// Constants
// ============================================================================

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const SORT_OPTIONS = [
  { value: "updated", label: "Recently Updated" },
  { value: "name", label: "Name" },
  { value: "exercises", label: "Exercise Count" },
  { value: "duration", label: "Duration" },
];

const TRAINER_TIPS = [
  "Create separate templates for each training goal.",
  "Reuse templates to save time and maintain consistency.",
  "Keep exercise order logical for efficient workouts.",
  "Review templates regularly and update as needed.",
];

// ============================================================================
// Types
// ============================================================================

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  weight?: string;
  rest: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  status: "Draft" | "Published" | string; // adjust to your templateStatusEnum values
  targetMuscles: string[];
  exercises: Exercise[];
  exerciseCount: number;
  totalSets: number;
  duration: number | null;
  updatedAt: string;
}

// ============================================================================
// Row Mapping
// ============================================================================

function mapTemplateRow(row: any): WorkoutTemplate {
  const templateExercises = row.template_exercises ?? [];

  const exercises: Exercise[] = templateExercises.map((te: any) => ({
    id: te.exercise?.id ?? te.id,
    name: te.exercise?.name ?? "Unknown exercise",
    muscleGroup: te.exercise?.muscle_group ?? "—",
    equipment: te.exercise?.equipment ?? "—",
    sets: te.sets ?? 0,
    reps: te.reps ?? "—",
    weight: te.weight ?? "—",
    rest: te.rest_seconds ? `${te.rest_seconds} sec` : "—",
  }));

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    difficulty: row.difficulty_level ?? null,
    status: row.status,
    targetMuscles: row.target_muscles ?? [],
    exercises,
    exerciseCount: exercises.length,
    totalSets: exercises.reduce((sum, e) => sum + (e.sets ?? 0), 0),
    duration: row.duration_minutes ?? null,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDifficultyColor(difficulty: string | null): string {
  const colors: Record<string, string> = {
    Beginner:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    Intermediate:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    Advanced: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  };
  return difficulty
    ? (colors[difficulty] ?? colors.Intermediate)
    : "bg-muted text-muted-foreground";
}

// ============================================================================
// Icon Mapping Component
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  "trending-up": TrendingUp,
  "arrow-left": ArrowLeft,
  target: Target,
  zap: Zap,
  activity: Activity,
  dumbbell: Dumbbell,
};

function TemplateIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const IconComponent = ICON_MAP[icon] || Dumbbell;
  return <IconComponent className={className} />;
}

// ============================================================================
// Reusable Components
// ============================================================================

interface StatisticCardProps {
  icon: React.ReactNode;
  title: string;
  metric: string | number;
  description: string;
}

function StatisticCard({
  icon,
  title,
  metric,
  description,
}: StatisticCardProps) {
  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{metric}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExpandableRowProps {
  template: WorkoutTemplate;
}

function ExpandableExercisesRow({ template }: ExpandableRowProps) {
  return (
    <TableRow className="bg-muted/30">
      <TableCell colSpan={7}>
        <div className="overflow-x-auto py-4">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="border-0 bg-transparent hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Exercise
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Muscle Group
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Equipment
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                  Sets
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                  Reps
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                  Weight
                </TableHead>
                <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                  Rest
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {template.exercises.map((exercise) => (
                <TableRow
                  key={exercise.id}
                  className="border-0 hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-foreground">
                    {exercise.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {exercise.muscleGroup}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {exercise.equipment}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {exercise.sets}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {exercise.reps}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {exercise.weight}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {exercise.rest}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// Empty State Components
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="rounded-lg bg-muted p-3">
        <FileStack className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">
          No Templates Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first workout template to quickly build future sessions.
        </p>
      </div>
      <Button className="mt-4">
        <Plus className="mr-2 size-4" />
        Create Template
      </Button>
    </div>
  );
}

// ============================================================================
// Analytics Components
// ============================================================================

function PopularTemplatesCard({ templates }: { templates: WorkoutTemplate[] }) {
  const maxUsage = Math.max(
    1,
    ...templates.map((t) => (t as any).usageCount ?? 0),
  );
  const popularTemplates = [...templates]
    .sort((a, b) => ((b as any).usageCount ?? 0) - ((a as any).usageCount ?? 0))
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className="size-5 text-orange-500" />
          Popular Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {popularTemplates.map((template) => (
          <div key={template.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{template.name}</p>
              <p className="text-xs text-muted-foreground">
                Used {(template as any).usageCount ?? 0}x
              </p>
            </div>
            <Progress
              value={(((template as any).usageCount ?? 0) / maxUsage) * 100}
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MuscleGroupDistributionCard({
  templates,
}: {
  templates: WorkoutTemplate[];
}) {
  const muscleGroupCounts: Record<string, number> = {};
  templates.forEach((template) => {
    template.targetMuscles.forEach((mg) => {
      muscleGroupCounts[mg] = (muscleGroupCounts[mg] || 0) + 1;
    });
  });

  const topGroups = Object.entries(muscleGroupCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const total = topGroups.reduce((sum, [, count]) => sum + count, 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dumbbell className="size-5 text-primary" />
          Muscle Group Distribution
        </CardTitle>
        <CardDescription>
          Most targeted muscle groups across templates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {topGroups.map(([group, count]) => {
          const percentage = Math.round((count / total) * 100);
          return (
            <div key={group} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{group}</span>
                <span className="text-xs text-muted-foreground">
                  {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TrainerTipsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="size-5 text-yellow-500" />
          Trainer Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {TRAINER_TIPS.map((tip, index) => (
            <li key={index} className="flex gap-2 text-sm">
              <span className="text-primary">✓</span>
              <span className="text-muted-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function TemplatesPageClient() {
  const { activeGymId } = useTrainerStore();
  const router = useRouter();
  const {
    data: templatesResult,
    isLoading,
    error: queryError,
  } = useWorkoutTemplates(activeGymId);

  const data: WorkoutTemplate[] = useMemo(() => {
    if (!templatesResult?.success) return [];
    return templatesResult.data.map(mapTemplateRow);
  }, [templatesResult]);

  const loadError = !activeGymId
    ? "Gym not found"
    : queryError
      ? "Failed to load templates. Please try again."
      : templatesResult && !templatesResult.success
        ? templatesResult.error
        : undefined;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortValue, setSortValue] = useState("updated");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map((t) => t.category))).sort();
    return [
      { value: "all", label: "All Categories" },
      ...unique.map((c) => ({ value: c, label: c })),
    ];
  }, [data]);

  const resetFilters = () => {
    setSelectedDifficulty("all");
    setSelectedCategory("all");
    setSortValue("updated");
  };

  const activeFilterCount =
    (selectedDifficulty !== "all" ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    (sortValue !== "updated" ? 1 : 0);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (searchValue) {
      filtered = filtered.filter((template) =>
        template.name.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    if (selectedDifficulty && selectedDifficulty !== "all") {
      filtered = filtered.filter(
        (template) => template.difficulty === selectedDifficulty,
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (template) => template.category === selectedCategory,
      );
    }

    filtered.sort((a, b) => {
      switch (sortValue) {
        case "name":
          return a.name.localeCompare(b.name);
        case "exercises":
          return b.exerciseCount - a.exerciseCount;
        case "duration":
          return (b.duration ?? 0) - (a.duration ?? 0);
        case "updated":
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    return filtered;
  }, [data, searchValue, selectedDifficulty, selectedCategory, sortValue]);

  // Table columns
  const columns: ColumnDef<WorkoutTemplate>[] = [
    {
      id: "template",
      header: "Template",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Dumbbell className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {row.original.name}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description ?? "No description"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "muscles",
      header: "Target Muscles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.targetMuscles.map((muscle) => (
            <Badge key={muscle} variant="secondary" className="text-xs">
              {muscle}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => (
        <Badge
          className={cn("text-xs", getDifficultyColor(row.original.difficulty))}
        >
          {row.original.difficulty}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "Published" ? "default" : "outline"}
          className="text-xs"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "exercises",
      header: "Exercises",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-foreground">
            {row.original.exerciseCount} Exercises
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.totalSets} Sets
          </p>
        </div>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <p className="text-sm text-foreground">{row.original.duration} min</p>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">
          {formatShortDate(row.original.updatedAt)}
        </p>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() =>
                  router.push(`/trainer/templates/${row.original.id}`)
                }
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() =>
                  router.push(`/trainer/templates/${row.original.id}/edit`)
                }
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Copy className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  });

  const toggleRowExpansion = (templateId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
    }
    setExpandedRows(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatisticCard
          icon={<FileStack className="size-5" />}
          title="Total Templates"
          metric={data.length}
          description="Saved Templates"
        />
        <StatisticCard
          icon={<Dumbbell className="size-5" />}
          title="Total Exercises"
          metric={data.reduce((sum, t) => sum + t.exerciseCount, 0)}
          description="Across Templates"
        />
        <StatisticCard
          icon={<Layers3 className="size-5" />}
          title="Total Sets"
          metric={data.reduce((sum, t) => sum + t.totalSets, 0)}
          description="Across Templates"
        />
        <StatisticCard
          icon={<Clock3 className="size-5" />}
          title="Average Duration"
          metric={
            data.length > 0
              ? `${Math.round(
                  data.reduce((sum, t) => sum + (t.duration ?? 0), 0) /
                    data.length,
                )} min`
              : "0 min"
          }
          description="Per Template"
        />
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-lg p-3 sm:p-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Button + Popover */}
            <Popover open={showFilterPanel} onOpenChange={setShowFilterPanel}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="relative gap-2 px-3 sm:px-4 py-2 h-auto text-sm font-normal"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden xs:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Advanced filters
                  </h4>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Difficulty Level
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => {
                        setSelectedDifficulty(e.target.value);
                        setPagination((p) => ({ ...p, pageIndex: 0 }));
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Sort By
                    </label>
                    <select
                      value={sortValue}
                      onChange={(e) => {
                        setSortValue(e.target.value);
                        setPagination((p) => ({ ...p, pageIndex: 0 }));
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Reset filters
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Import Button */}
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedCategory(option.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors shrink-0 ${
                selectedCategory === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium">{filteredData.length} templates</span>
        </p>
      </div>

      {/* Templates Table */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-b">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-xs font-semibold"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <React.Fragment key={row.id}>
                        <TableRow className="border-b hover:bg-muted/50">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {expandedRows.has(row.original.id) && (
                          <ExpandableExercisesRow template={row.original} />
                        )}
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell colSpan={7} className="py-0">
                            <button
                              onClick={() =>
                                toggleRowExpansion(row.original.id)
                              }
                              className="inline-flex w-full items-center gap-2 py-2 text-xs font-medium text-muted-foreground hover:text-primary"
                            >
                              {expandedRows.has(row.original.id) ? (
                                <>
                                  <ChevronUp className="size-3" />
                                  Hide Exercises
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="size-3" />
                                  Show Exercises
                                </>
                              )}
                            </button>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  filteredData.length,
                )}{" "}
                of {filteredData.length} templates
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(table.getPageCount())].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => table.setPageIndex(idx)}
                    className={`w-8 h-8 rounded-lg border transition-colors ${
                      idx === pagination.pageIndex
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-gray-50"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-2 border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="px-2 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize} rows
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}

      <Separator />

      {/* Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PopularTemplatesCard templates={data} />
        <MuscleGroupDistributionCard templates={data} />
        <TrainerTipsCard />
      </div>
    </div>
  );
}
