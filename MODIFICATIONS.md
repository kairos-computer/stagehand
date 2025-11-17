# Modifications to Stagehand

This fork contains the following modifications from the original Stagehand library:

## Changes by Kairos Computer (Nov 17, 2025)

### Native Agent Step Hooks

Added native lifecycle hooks for agent step execution, allowing developers to receive notifications when agent steps start and complete.

#### Modified Files

##### Core Type Definitions (`packages/core/lib/v3/types/public/options.ts`)
- Added `hooks` field to `V3Options` interface
- Defined `on_step_start` hook type (called before agent processes current state)
- Defined `on_step_end` hook type (called after agent executes actions for current step)

##### Agent Client Base Class (`packages/core/lib/v3/agent/AgentClient.ts`)
- Added protected `hooks` property for step lifecycle callbacks
- Added `setHooks()` method to configure hooks on agent clients

##### Agent Handlers
**V3AgentHandler** (`packages/core/lib/v3/handlers/v3AgentHandler.ts`)
- Added hooks parameter to constructor
- Implemented `on_step_start` hook call in `onStepFinish` callback (before step processing)
- Implemented `on_step_end` hook call in `onStepFinish` callback (after actions complete)
- Added step number tracking for hook notifications

**V3CuaAgentHandler** (`packages/core/lib/v3/handlers/v3CuaAgentHandler.ts`)
- Added hooks parameter to constructor
- Pass hooks to AgentClient via `setHooks()` method

##### CUA Client Implementations
**AnthropicCUAClient** (`packages/core/lib/v3/agent/AnthropicCUAClient.ts`)
- Implemented `on_step_start` hook before `executeStep()`
- Implemented `on_step_end` hook after step completes
- Added step number tracking and actions count per step

**GoogleCUAClient** (`packages/core/lib/v3/agent/GoogleCUAClient.ts`)
- Implemented `on_step_start` hook before `executeStep()`
- Implemented `on_step_end` hook after step completes
- Added step number tracking and actions count per step

**OpenAICUAClient** (`packages/core/lib/v3/agent/OpenAICUAClient.ts`)
- Implemented `on_step_start` hook before `executeStep()`
- Implemented `on_step_end` hook after step completes
- Added step number tracking and actions count per step

##### Main V3 Class (`packages/core/lib/v3/v3.ts`)
- Modified `agent()` method to pass `this.opts.hooks` to V3AgentHandler constructor
- Modified `agent()` method to pass `this.opts.hooks` to V3CuaAgentHandler constructor

#### New Files

##### Test Script (`test-native-hooks.ts`)
- Demonstrates hook usage with Google Gemini 2.5 Computer Use model
- Shows step-by-step notifications with colored output
- Example of integrating hooks with external notification systems

#### Features Added

1. **on_step_start Hook**
   - Called before the agent processes the current state and decides on the next action
   - Receives: `stepNumber`, `maxSteps`, `instruction`
   - Use case: Progress tracking, sending start notifications

2. **on_step_end Hook**
   - Called after the agent has executed all actions for the current step
   - Receives: `stepNumber`, `maxSteps`, `instruction`, `actionsPerformed`, `completed`
   - Use case: Action completion notifications, progress updates, logging

3. **Universal Compatibility**
   - Works with all CUA models (Anthropic Claude, Google Gemini, OpenAI)
   - Works with non-CUA agents (AISDK tools-based agents)
   - Type-safe with full TypeScript support
   - Error handling ensures hooks don't break agent execution

#### Technical Details

- **Implementation**: Native injection at step boundaries (not wrapper-based)
- **Error Handling**: Hook errors are caught and logged, don't interrupt execution
- **Async Support**: Hooks can be async and will be awaited
- **Type Safety**: Full TypeScript types for all hook parameters
- **Performance**: Minimal overhead, hooks only called when provided

---

## Original Repository

Original repository: https://github.com/browserbase/stagehand
License: Apache 2.0 (see LICENSE file)
