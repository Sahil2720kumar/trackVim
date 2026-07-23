"use client";

import React, { useState, useCallback } from "react";
import {
  ChevronRight,
  Plus,
  Copy,
  Trash2,
  GripVertical,
  Edit2,
  Clock,
  Target,
  Dumbbell,
  Layers,
  NotebookPen,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  Save,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface Exercise {
  id: string;
  name: string;
  equipment: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight: string;
  rest: string;
  tempo?: string;
  rpe: number;
}

interface Template {
  id: string;
  name: string;
  type: string;
  goal: string;
  difficulty: string;
  targetMuscles: string[];
  description: string;
  duration: number;
  restBetweenSets: string;
  equipment: string[];
  exercises: Exercise[];
  notes: string;
  createdBy: string;
  lastUpdated: string;
  status: "draft" | "active";
}

// ============================================================================
// Constants
// ============================================================================

const EXERCISE_LIBRARY = [
  { name: "Deadlift", equipment: "Barbell", muscleGroup: "Back" },
  { name: "Pull Up", equipment: "Bodyweight", muscleGroup: "Back" },
  { name: "Bent Over Row", equipment: "Barbell", muscleGroup: "Back" },
  { name: "Lat Pulldown", equipment: "Cable", muscleGroup: "Back" },
  { name: "Seated Cable Row", equipment: "Cable", muscleGroup: "Back" },
  { name: "Face Pull", equipment: "Cable", muscleGroup: "Rear Delts" },
  { name: "Barbell Curl", equipment: "Barbell", muscleGroup: "Biceps" },
  { name: "Hammer Curl", equipment: "Dumbbell", muscleGroup: "Biceps" },
  { name: "Dumbbell Row", equipment: "Dumbbell", muscleGroup: "Back" },
  { name: "Machine Leg Press", equipment: "Machine", muscleGroup: "Quads" },
  { name: "Leg Curl", equipment: "Machine", muscleGroup: "Hamstrings" },
  { name: "Leg Extension", equipment: "Machine", muscleGroup: "Quads" },
];

const MUSCLE_GROUPS = [
  "Back",
  "Biceps",
  "Rear Delts",
  "Chest",
  "Shoulders",
  "Triceps",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Glutes",
];
const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Resistance Band",
];

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_TEMPLATE: Template = {
  id: "pull-day-001",
  name: "Pull Day",
  type: "Strength Training",
  goal: "Muscle Gain",
  difficulty: "Intermediate",
  targetMuscles: ["Back", "Biceps", "Rear Delts"],
  description:
    "A focused pulling workout to build back thickness, improve posture, and develop strong biceps.",
  duration: 60,
  restBetweenSets: "60",
  equipment: ["Barbell", "Cable", "Bodyweight"],
  exercises: [
    {
      id: "1",
      name: "Deadlift",
      equipment: "Barbell",
      muscleGroup: "Back",
      sets: 4,
      reps: "6 - 8",
      weight: "100 kg",
      rest: "120 sec",
      tempo: "2-0-2",
      rpe: 8,
    },
    {
      id: "2",
      name: "Pull Up",
      equipment: "Bodyweight",
      muscleGroup: "Back",
      sets: 4,
      reps: "8 - 10",
      weight: "Bodyweight",
      rest: "90 sec",
      tempo: "2-0-2",
      rpe: 8,
    },
    {
      id: "3",
      name: "Bent Over Row",
      equipment: "Barbell",
      muscleGroup: "Back",
      sets: 4,
      reps: "8 - 10",
      weight: "70 kg",
      rest: "90 sec",
      tempo: "2-0-2",
      rpe: 8,
    },
    {
      id: "4",
      name: "Lat Pulldown",
      equipment: "Cable",
      muscleGroup: "Back",
      sets: 3,
      reps: "10 - 12",
      weight: "60 kg",
      rest: "75 sec",
      tempo: "2-1-2",
      rpe: 7,
    },
    {
      id: "5",
      name: "Seated Cable Row",
      equipment: "Cable",
      muscleGroup: "Back",
      sets: 3,
      reps: "10 - 12",
      weight: "55 kg",
      rest: "75 sec",
      tempo: "2-1-2",
      rpe: 7,
    },
    {
      id: "6",
      name: "Face Pull",
      equipment: "Cable",
      muscleGroup: "Rear Delts",
      sets: 3,
      reps: "12 - 15",
      weight: "20 kg",
      rest: "60 sec",
      tempo: "2-1-2",
      rpe: 7,
    },
    {
      id: "7",
      name: "Barbell Curl",
      equipment: "Barbell",
      muscleGroup: "Biceps",
      sets: 3,
      reps: "8 - 12",
      weight: "30 kg",
      rest: "60 sec",
      tempo: "2-0-2",
      rpe: 8,
    },
    {
      id: "8",
      name: "Hammer Curl",
      equipment: "Dumbbell",
      muscleGroup: "Biceps",
      sets: 3,
      reps: "10 - 12",
      weight: "12.5 kg",
      rest: "60 sec",
      tempo: "2-0-2",
      rpe: 7,
    },
  ],
  notes:
    "Use this workout for intermediate members focusing on hypertrophy and back development. Keep rest periods strict for best results.",
  createdBy: "Rahul Sharma",
  lastUpdated: "20 Jul 2026",
  status: "active",
};

// ============================================================================
// Helper Functions
// ============================================================================

function getMuscleGroupColor(muscleGroup: string): string {
  const colors: Record<string, string> = {
    Back: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Biceps:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "Rear Delts":
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    Chest: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Shoulders:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Triceps: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    Forearms:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    Quads: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    Hamstrings:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    Glutes: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  };
  return (
    colors[muscleGroup] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  );
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "Beginner":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "Intermediate":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Advanced":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

// ============================================================================
// Reusable Components
// ============================================================================

interface BreadcrumbProps {}

function Breadcrumb({}: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <a
        href="/trainer/templates"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Templates
      </a>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
      <a
        href="/trainer/templates/pull-day"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Pull Day
      </a>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
      <span className="text-foreground font-medium">Edit Template</span>
    </div>
  );
}

interface HeaderProps {
  onCancel: () => void;
  onSave: () => void;
}

function Header({ onCancel, onSave }: HeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Edit Template
        </h1>
        <p className="text-muted-foreground">
          Update the workout template, exercises, and training configuration.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

function ExerciseRow({
  exercise,
  index,
  onUpdate,
  onDuplicate,
  onDelete,
}: ExerciseRowProps) {
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState(exercise.name);

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelectExercise = (
    selectedExercise: (typeof EXERCISE_LIBRARY)[0],
  ) => {
    onUpdate(index, "name", selectedExercise.name);
    onUpdate(index, "equipment", selectedExercise.equipment);
    onUpdate(index, "muscleGroup", selectedExercise.muscleGroup);
    setShowExerciseSearch(false);
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="w-6">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
      </TableCell>
      <TableCell className="font-medium text-sm">
        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowExerciseSearch(!showExerciseSearch)}
          >
            <div>
              <p className="font-semibold text-foreground">{exercise.name}</p>
              <p className="text-xs text-muted-foreground">
                {exercise.equipment}
              </p>
            </div>
          </div>
          {showExerciseSearch && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              <div className="p-2">
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredExercises.map((ex) => (
                    <button
                      key={`${ex.name}-${ex.equipment}`}
                      onClick={() => handleSelectExercise(ex)}
                      className="w-full text-left px-2 py-2 hover:bg-muted rounded text-sm transition-colors"
                    >
                      <p className="font-medium">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ex.equipment}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={getMuscleGroupColor(exercise.muscleGroup)}
        >
          {exercise.muscleGroup}
        </Badge>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={exercise.sets}
          onChange={(e) => onUpdate(index, "sets", parseInt(e.target.value))}
          className="w-16 text-center"
          min="1"
          max="10"
        />
      </TableCell>
      <TableCell>
        <Input
          type="text"
          value={exercise.reps}
          onChange={(e) => onUpdate(index, "reps", e.target.value)}
          placeholder="6-8"
          className="w-24 text-center text-sm"
        />
      </TableCell>
      <TableCell>
        <Input
          type="text"
          value={exercise.weight}
          onChange={(e) => onUpdate(index, "weight", e.target.value)}
          placeholder="80 kg"
          className="w-28 text-center text-sm"
        />
      </TableCell>
      <TableCell>
        <Select
          value={exercise.rest}
          onValueChange={(value) => onUpdate(index, "rest", value)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 sec</SelectItem>
            <SelectItem value="45">45 sec</SelectItem>
            <SelectItem value="60">60 sec</SelectItem>
            <SelectItem value="75">75 sec</SelectItem>
            <SelectItem value="90">90 sec</SelectItem>
            <SelectItem value="120">120 sec</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          type="text"
          value={exercise.tempo || ""}
          onChange={(e) => onUpdate(index, "tempo", e.target.value)}
          placeholder="2-0-2"
          className="w-20 text-center text-sm"
        />
      </TableCell>
      <TableCell>
        <Select
          value={exercise.rpe.toString()}
          onValueChange={(value) => onUpdate(index, "rpe", parseInt(value))}
        >
          <SelectTrigger className="w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
              <SelectItem key={i} value={i.toString()}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(index)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(index)}
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface ExerciseCardProps {
  isMobile: boolean;
  exercise: Exercise;
  index: number;
  onUpdate: (index: number, field: string, value: any) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

function ExerciseCard({
  isMobile,
  exercise,
  index,
  onUpdate,
  onDuplicate,
  onDelete,
}: ExerciseCardProps) {
  if (!isMobile) return null;

  return (
    <Card className="border border-border mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{exercise.name}</p>
              <p className="text-xs text-muted-foreground">
                {exercise.equipment}
              </p>
            </div>
            <Badge
              variant="outline"
              className={getMuscleGroupColor(exercise.muscleGroup)}
            >
              {exercise.muscleGroup}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Sets
              </label>
              <Input
                type="number"
                value={exercise.sets}
                onChange={(e) =>
                  onUpdate(index, "sets", parseInt(e.target.value))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Reps
              </label>
              <Input
                type="text"
                value={exercise.reps}
                onChange={(e) => onUpdate(index, "reps", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Weight
              </label>
              <Input
                type="text"
                value={exercise.weight}
                onChange={(e) => onUpdate(index, "weight", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Rest
              </label>
              <Select
                value={exercise.rest}
                onValueChange={(value) => onUpdate(index, "rest", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 sec</SelectItem>
                  <SelectItem value="45">45 sec</SelectItem>
                  <SelectItem value="60">60 sec</SelectItem>
                  <SelectItem value="75">75 sec</SelectItem>
                  <SelectItem value="90">90 sec</SelectItem>
                  <SelectItem value="120">120 sec</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Tempo
              </label>
              <Input
                type="text"
                value={exercise.tempo || ""}
                onChange={(e) => onUpdate(index, "tempo", e.target.value)}
                placeholder="2-0-2"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                RPE
              </label>
              <Select
                value={exercise.rpe.toString()}
                onValueChange={(value) =>
                  onUpdate(index, "rpe", parseInt(value))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(index)}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(index)}
              className="flex-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TemplateSummaryProps {
  template: Template;
}

function TemplateSummary({ template }: TemplateSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Template Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Template Name</span>
            <span className="font-semibold">{template.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-semibold">{template.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Goal</span>
            <span className="font-semibold">{template.goal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Difficulty</span>
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
          </div>
          <div className="flex items-start justify-between pt-2">
            <span className="text-muted-foreground">Target Muscles</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {template.targetMuscles.map((muscle) => (
                <Badge key={muscle} variant="secondary" className="text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-start justify-between pt-2">
            <span className="text-muted-foreground">Equipment</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {template.equipment.map((equip) => (
                <Badge key={equip} variant="outline" className="text-xs">
                  {equip}
                </Badge>
              ))}
            </div>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Exercises</span>
            <span className="font-semibold">{template.exercises.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Sets</span>
            <span className="font-semibold">
              {template.exercises.reduce((sum, ex) => sum + ex.sets, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Est. Duration</span>
            <span className="font-semibold">{template.duration} min</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Status</span>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EditingTipsProps {}

function EditingTips({}: EditingTipsProps) {
  const tips = [
    "Place compound exercises first.",
    "Balance push and pull movements.",
    "Review rest periods.",
    "Keep workout duration realistic.",
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Tips for Editing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓
              </span>
              <span className="text-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {}

function QuickActions({}: QuickActionsProps) {
  const actions = [
    { label: "Preview Template", icon: Eye },
    { label: "Duplicate Template", icon: Copy },
    { label: "Export Template", icon: Download },
    { label: "Assign to Session", icon: Calendar },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
        <Separator className="my-3" />
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
          Delete Template
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function EditTemplatePage() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [template, setTemplate] = useState<Template>(MOCK_TEMPLATE);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(
    template.targetMuscles,
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    template.equipment,
  );
  const [descriptionLength, setDescriptionLength] = useState(
    template.description.length,
  );
  const [notesLength, setNotesLength] = useState(template.notes.length);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExerciseUpdate = useCallback(
    (index: number, field: string, value: any) => {
      setTemplate((prev) => {
        const newExercises = [...prev.exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        return { ...prev, exercises: newExercises };
      });
    },
    [],
  );

  const handleAddExercise = useCallback(() => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
      equipment: "",
      muscleGroup: "",
      sets: 3,
      reps: "8-10",
      weight: "",
      rest: "60",
      tempo: "",
      rpe: 7,
    };
    setTemplate((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  }, []);

  const handleDuplicateExercise = useCallback(
    (index: number) => {
      const exerciseToDuplicate = template.exercises[index];
      const newExercise: Exercise = {
        ...exerciseToDuplicate,
        id: Date.now().toString(),
      };
      setTemplate((prev) => {
        const newExercises = [...prev.exercises];
        newExercises.splice(index + 1, 0, newExercise);
        return { ...prev, exercises: newExercises };
      });
    },
    [template.exercises],
  );

  const handleDeleteExercise = useCallback((index: number) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  }, []);

  const handleCancel = () => {
    window.history.back();
  };

  const handleSave = () => {
    console.log("Saving template:", template);
    alert("Template saved successfully!");
  };

  const totalSets = template.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1400px] mx-auto">
      <Breadcrumb />
      <Header onCancel={handleCancel} onSave={handleSave} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Template Details
              </CardTitle>
              <CardDescription>
                Configure the basic information for this workout template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Template Name
                  </label>
                  <Input
                    value={template.name}
                    onChange={(e) =>
                      setTemplate({ ...template, name: e.target.value })
                    }
                    placeholder="Pull Day"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Workout Type
                  </label>
                  <Select
                    value={template.type}
                    onValueChange={(value) =>
                      setTemplate({ ...template, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Strength Training">
                        Strength Training
                      </SelectItem>
                      <SelectItem value="Hypertrophy">Hypertrophy</SelectItem>
                      <SelectItem value="Functional">Functional</SelectItem>
                      <SelectItem value="Powerlifting">Powerlifting</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Primary Goal
                  </label>
                  <Select
                    value={template.goal}
                    onValueChange={(value) =>
                      setTemplate({ ...template, goal: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                      <SelectItem value="Fat Loss">Fat Loss</SelectItem>
                      <SelectItem value="Strength">Strength</SelectItem>
                      <SelectItem value="Endurance">Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Difficulty Level
                  </label>
                  <Select
                    value={template.difficulty}
                    onValueChange={(value) =>
                      setTemplate({ ...template, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Target Muscle Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() =>
                        setSelectedMuscles((prev) =>
                          prev.includes(muscle)
                            ? prev.filter((m) => m !== muscle)
                            : [...prev, muscle],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedMuscles.includes(muscle)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {muscle}
                      {selectedMuscles.includes(muscle) && (
                        <X className="w-3 h-3 ml-1 inline" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Select the primary muscle groups this template focuses on.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Description (Optional)
                </label>
                <Textarea
                  value={template.description}
                  onChange={(e) => {
                    setTemplate({ ...template, description: e.target.value });
                    setDescriptionLength(e.target.value.length);
                  }}
                  placeholder="Add a description of this workout template..."
                  className="min-h-24"
                  maxLength={250}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {descriptionLength}/250
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Estimated Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={template.duration}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          duration: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                      min="5"
                      max="180"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Rest Between Sets
                  </label>
                  <Select
                    value={template.restBetweenSets}
                    onValueChange={(value) =>
                      setTemplate({ ...template, restBetweenSets: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 sec</SelectItem>
                      <SelectItem value="45">45 sec</SelectItem>
                      <SelectItem value="60">60 sec</SelectItem>
                      <SelectItem value="75">75 sec</SelectItem>
                      <SelectItem value="90">90 sec</SelectItem>
                      <SelectItem value="120">120 sec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Equipment
                  </label>
                  <Select
                    value={selectedEquipment[0] || ""}
                    onValueChange={(value) => {
                      if (!selectedEquipment.includes(value)) {
                        setSelectedEquipment([...selectedEquipment, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add equipment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_OPTIONS.map((equip) => (
                        <SelectItem key={equip} value={equip}>
                          {equip}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedEquipment.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                  {selectedEquipment.map((equip) => (
                    <Badge
                      key={equip}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedEquipment(
                          selectedEquipment.filter((e) => e !== equip),
                        )
                      }
                    >
                      {equip}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercises Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Exercises ({template.exercises.length})
                </CardTitle>
                <CardDescription>
                  Manage the exercises included in this workout template.
                </CardDescription>
              </div>
              <Button onClick={handleAddExercise} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Exercise
              </Button>
            </CardHeader>
            <CardContent>
              {template.exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Dumbbell className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold text-foreground mb-2">
                    No Exercises Added
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Click "Add Exercise" to build this workout template.
                  </p>
                  <Button onClick={handleAddExercise} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Exercise
                  </Button>
                </div>
              ) : isMobile ? (
                <div className="space-y-4">
                  {template.exercises.map((exercise, index) => (
                    <ExerciseCard
                      key={exercise.id}
                      isMobile={true}
                      exercise={exercise}
                      index={index}
                      onUpdate={handleExerciseUpdate}
                      onDuplicate={handleDuplicateExercise}
                      onDelete={handleDeleteExercise}
                    />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-6"></TableHead>
                        <TableHead>Exercise</TableHead>
                        <TableHead>Muscle Group</TableHead>
                        <TableHead className="text-center">Sets</TableHead>
                        <TableHead className="text-center">Reps</TableHead>
                        <TableHead className="text-center">Weight</TableHead>
                        <TableHead className="text-center">Rest</TableHead>
                        <TableHead className="text-center">Tempo</TableHead>
                        <TableHead className="text-center">RPE</TableHead>
                        <TableHead className="w-20 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {template.exercises.map((exercise, index) => (
                        <ExerciseRow
                          key={exercise.id}
                          exercise={exercise}
                          index={index}
                          onUpdate={handleExerciseUpdate}
                          onDuplicate={handleDuplicateExercise}
                          onDelete={handleDeleteExercise}
                        />
                      ))}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-center">
                          {totalSets} sets
                        </TableCell>
                        <TableCell colSpan={3}></TableCell>
                        <TableCell colSpan={2} className="text-center">
                          Est. Duration: {template.duration} min
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trainer Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5" />
                Trainer Notes (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={template.notes}
                onChange={(e) => {
                  setTemplate({ ...template, notes: e.target.value });
                  setNotesLength(e.target.value.length);
                }}
                placeholder="Add coaching notes or special instructions..."
                className="min-h-32"
                maxLength={500}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>{notesLength}/500</p>
                <p>
                  Added by {template.createdBy} • {template.lastUpdated}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <TemplateSummary template={template} />
          <EditingTips />
          <QuickActions />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-border">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
