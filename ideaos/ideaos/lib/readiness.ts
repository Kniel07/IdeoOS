import type { Requirement, Task, Question } from "./types";

export interface ReadinessInput {
  requirements: Requirement[];
  tasks: Task[];
  questions: Question[];
}

export interface Readiness {
  score: number; // 0-100
  openQuestions: number;
  pendingItems: number;
}

/**
 * Readiness is deliberately simple: fewer unanswered questions and fewer
 * open requirements pushes the score up. No hidden weighting knobs —
 * one formula, easy to reason about and to change later.
 */
export function computeReadiness(input: ReadinessInput): Readiness {
  const { requirements, tasks, questions } = input;
  const openQuestions = questions.filter((q) => !q.answered).length;
  const openRequirements = requirements.filter((r) => r.status === "open").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const pendingItems = openQuestions + openRequirements;

  const totalSignals = requirements.length + questions.length + tasks.length;
  if (totalSignals === 0) {
    return { score: 0, openQuestions, pendingItems };
  }

  const resolvedSignals =
    requirements.filter((r) => r.status === "addressed").length +
    questions.filter((q) => q.answered).length +
    tasks.filter((t) => t.status === "completed").length;

  const score = Math.round((resolvedSignals / totalSignals) * 100);
  return { score, openQuestions, pendingItems: pendingItems + pendingTasks };
}
