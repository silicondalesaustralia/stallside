import type { StepInput, StepOutcome } from "./outcome";
import type { JobStage } from "./state";
import { pagesStep, planStep } from "./steps-ai";
import { applyStep, compileStep, imagesStep, prepareStep } from "./steps-local";

export async function runStage(stage: JobStage, input: StepInput): Promise<StepOutcome> {
  switch (stage) {
    case "prepare":
      return prepareStep(input);
    case "plan":
      return planStep(input);
    case "images":
      return imagesStep(input);
    case "pages":
      return pagesStep(input);
    case "compile":
      return compileStep(input);
    case "apply":
      return applyStep(input);
    case "done":
      return { kind: "failed", code: "already_done", message: "This build already finished." };
  }
}
