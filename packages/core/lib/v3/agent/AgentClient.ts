/*
 * Copyright 2025 Original Stagehand Contributors
 *
 * Modified by Kairos Computer, 2025
 * - Added setHooks() method for agent step lifecycle callbacks
 * - Added protected hooks property for step notifications
 */

import {
  AgentAction,
  AgentResult,
  AgentType,
  AgentExecutionOptions,
} from "../types/public/agent";

/**
 * Abstract base class for agent clients
 * This provides a common interface for all agent implementations
 */
export abstract class AgentClient {
  public type: AgentType;
  public modelName: string;
  public clientOptions: Record<string, unknown>;
  public userProvidedInstructions?: string;
  protected hooks?: {
    on_step_start?: (stepInfo: {
      stepNumber: number;
      maxSteps: number;
      instruction: string;
    }) => void | Promise<void>;
    on_step_end?: (stepInfo: {
      stepNumber: number;
      maxSteps: number;
      instruction: string;
      actionsPerformed: number;
      completed: boolean;
    }) => void | Promise<void>;
  };

  constructor(
    type: AgentType,
    modelName: string,
    userProvidedInstructions?: string,
  ) {
    this.type = type;
    this.modelName = modelName;
    this.userProvidedInstructions = userProvidedInstructions;
    this.clientOptions = {};
  }

  setHooks(hooks?: {
    on_step_start?: (stepInfo: {
      stepNumber: number;
      maxSteps: number;
      instruction: string;
    }) => void | Promise<void>;
    on_step_end?: (stepInfo: {
      stepNumber: number;
      maxSteps: number;
      instruction: string;
      actionsPerformed: number;
      completed: boolean;
    }) => void | Promise<void>;
  }): void {
    this.hooks = hooks;
  }

  abstract execute(options: AgentExecutionOptions): Promise<AgentResult>;

  abstract captureScreenshot(
    options?: Record<string, unknown>,
  ): Promise<unknown>;

  abstract setViewport(width: number, height: number): void;

  abstract setCurrentUrl(url: string): void;

  abstract setScreenshotProvider(provider: () => Promise<string>): void;

  abstract setActionHandler(
    handler: (action: AgentAction) => Promise<void>,
  ): void;
}
