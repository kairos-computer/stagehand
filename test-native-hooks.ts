/**
 * Test script for native agent step hooks in Stagehand
 *
 * Demonstrates the new on_step_start and on_step_end hooks
 * that are built directly into Stagehand's core.
 *
 * Usage:
 *   export GEMINI_API_KEY="your-key-here"
 *   tsx test-native-hooks.ts
 */

import { Stagehand } from "./packages/core/lib/v3";
import chalk from "chalk";

async function main() {
  console.log(chalk.bold.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          🪝 STAGEHAND NATIVE HOOKS TEST 🪝                   ║
║                                                               ║
║  Testing on_step_start and on_step_end hooks                ║
║  Using: Google Gemini 2.5 Computer Use                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `));

  const stagehand = new Stagehand({
    env: "LOCAL",
    verbose: 1,

    // 🪝 Native hooks built into Stagehand!
    hooks: {
      on_step_start: async (stepInfo) => {
        console.log(chalk.bgBlue.white(` 🚀 STEP START `));
        console.log(chalk.blue(`   Step: ${stepInfo.stepNumber}/${stepInfo.maxSteps}`));
        console.log(chalk.blue(`   Instruction: "${stepInfo.instruction}"`));
        console.log(chalk.bgBlue.white(` ────────────── `));
        console.log();

        // Example: Send webhook when step starts
        // await fetch('https://your-api.com/step-start', {
        //   method: 'POST',
        //   body: JSON.stringify(stepInfo)
        // });
      },

      on_step_end: async (stepInfo) => {
        console.log(chalk.bgGreen.white(` ✅ STEP END `));
        console.log(chalk.green(`   Step: ${stepInfo.stepNumber}/${stepInfo.maxSteps}`));
        console.log(chalk.green(`   Actions Performed: ${stepInfo.actionsPerformed}`));
        console.log(chalk.green(`   Completed: ${stepInfo.completed}`));
        console.log(chalk.bgGreen.white(` ──────────── `));
        console.log();

        // Example: Send notification when step completes
        // await fetch('https://your-api.com/step-end', {
        //   method: 'POST',
        //   body: JSON.stringify(stepInfo)
        // });
      }
    }
  });

  try {
    await stagehand.init();
    console.log(chalk.green(`✅ Stagehand initialized\n`));

    const page = stagehand.context.pages()[0];
    await page.goto("https://www.google.com");

    // Create agent with Computer Use (using Gemini)
    const agent = stagehand.agent({
      cua: true,
      model: {
        modelName: "google/gemini-2.5-computer-use-preview-10-2025",
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
      },
      systemPrompt: `You are a helpful assistant. Today's date is ${new Date().toLocaleDateString()}.`
    });

    console.log(chalk.cyan(`\n🤖 Starting agent task...\n`));
    console.log(chalk.dim(`${'─'.repeat(70)}\n`));

    // Execute the agent - hooks will fire automatically!
    const result = await agent.execute({
      instruction: "search for the weather in Paris",
      maxSteps: 8
    });

    console.log(chalk.dim(`\n${'─'.repeat(70)}`));
    console.log(chalk.green(`\n✅ Agent completed!\n`));

    console.log(chalk.yellow(`📊 Result:`));
    console.log(chalk.white(`   Success: ${result.success}`));
    console.log(chalk.white(`   Actions: ${result.actions.length}`));
    console.log(chalk.white(`   Message: ${result.message.substring(0, 200)}...`));
    console.log();

  } catch (error) {
    console.log(chalk.red(`\n❌ Error:`));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    if (error instanceof Error && error.stack) {
      console.log(chalk.dim(error.stack.split("\n").slice(1).join("\n")));
    }
  } finally {
    await stagehand.close();
    console.log(chalk.gray(`\n🔚 Browser closed\n`));
  }

  console.log(chalk.bold.cyan(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                   ✨ TEST COMPLETE! ✨                       ║
║                                                               ║
║  The hooks were called natively from Stagehand's core!       ║
║  No wrappers, no logger parsing - just clean, direct hooks.  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `));
}

main().catch((error) => {
  console.log(chalk.red(`\n💥 Unhandled error:`));
  console.log(chalk.red(error));
  process.exit(1);
});
