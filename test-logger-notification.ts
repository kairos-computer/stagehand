/**
 * Test script for Stagehand logger notifications
 *
 * This script demonstrates the logger callback system for getting notified
 * when actions complete. Uses Claude Haiku 4.5 in Computer Use Agent (CUA) mode.
 *
 * Usage:
 *   tsx test-logger-notification.ts "search for the weather in San Francisco"
 *
 * Or run with default prompt:
 *   tsx test-logger-notification.ts
 */

import { Stagehand } from "./packages/core/lib/v3";
import type { LogLine } from "./packages/core/lib/v3/types/public/logs";
import chalk from "chalk";

// Get prompt from command line or use default
const userPrompt = process.argv[2] || "search for the weather in San Francisco";

// Track action completions
let actionCount = 0;

// Custom notification function (you can replace this with email, webhook, etc.)
function sendNotification(message: string, category?: string) {
  console.log(chalk.bgGreen.black(` 🔔 NOTIFICATION `));
  console.log(chalk.green(`   Category: ${category || 'general'}`));
  console.log(chalk.green(`   Message: ${message}`));
  console.log(chalk.bgGreen.black(` ──────────────── `));
  console.log();
}

async function main() {
  console.log(chalk.bold(`\n🧪 Stagehand Logger Notification Test\n`));
  console.log(chalk.cyan(`📝 User Prompt: "${userPrompt}"\n`));
  console.log(chalk.yellow(`🤖 Using: Claude Haiku 4.5 (Computer Use Mode)\n`));
  console.log(chalk.dim(`─`.repeat(60)));
  console.log();

  // Initialize Stagehand with logger callback
  const stagehand = new Stagehand({
    env: "LOCAL",
    verbose: 2,

    // 🔔 Logger callback - this is where you get notified!
    logger: (logLine: LogLine) => {
      // Log everything for debugging
      const prefix = logLine.category ? `[${logLine.category}]` : '[log]';
      const levelColor = logLine.level === 0 ? chalk.red :
                        logLine.level === 1 ? chalk.yellow :
                        chalk.gray;

      console.log(levelColor(`${prefix} ${logLine.message}`));

      // 🔔 Send notifications for important events
      // You can customize this to filter for specific categories or messages

      // Notify on agent steps
      if (logLine.category === "agent") {
        if (logLine.message.includes("Step finished") ||
            logLine.message.includes("completed")) {
          actionCount++;
          sendNotification(
            `Agent step ${actionCount} completed: ${logLine.message}`,
            "agent"
          );
        }
      }

      // Notify on act/extract/observe completions
      if (logLine.category === "act" ||
          logLine.category === "extract" ||
          logLine.category === "observe") {
        sendNotification(
          `${logLine.category.toUpperCase()} action: ${logLine.message}`,
          logLine.category
        );
      }

      // Notify on errors
      if (logLine.level === 0) {
        sendNotification(
          `⚠️ ERROR: ${logLine.message}`,
          "error"
        );
      }
    }
  });

  try {
    await stagehand.init();
    console.log(chalk.green(`✅ Stagehand initialized successfully\n`));

    const page = stagehand.context.pages()[0];

    // Create a Computer Use Agent with Claude Haiku 4.5
    const agent = stagehand.agent({
      cua: true, // Enable Computer Use Agent mode
      model: {
        modelName: "anthropic/claude-haiku-4-5-20251001",
        apiKey: process.env.ANTHROPIC_API_KEY,
      },
      systemPrompt: `You are a helpful assistant that can use a web browser.
      Do not ask follow up questions, the user will trust your judgement.
      Today's date is ${new Date().toLocaleDateString()}.`,
    });

    // Navigate to Google
    await page.goto("https://www.google.com");
    console.log(chalk.blue(`🌐 Navigated to Google\n`));

    // Execute the user's instruction
    console.log(chalk.cyan(`🚀 Executing instruction: "${userPrompt}"\n`));
    console.log(chalk.dim(`─`.repeat(60)));
    console.log();

    const result = await agent.execute({
      instruction: userPrompt,
      maxSteps: 15,
    });

    console.log();
    console.log(chalk.dim(`─`.repeat(60)));
    console.log(chalk.green(`\n✅ Agent execution complete!\n`));

    // Final notification
    sendNotification(
      `Task completed! Total steps: ${actionCount}. Result: ${result.message}`,
      "completion"
    );

    console.log(chalk.yellow(`📊 Result:`));
    console.log(chalk.white(JSON.stringify(result, null, 2)));
    console.log();
    console.log(chalk.yellow(`📈 Total actions tracked: ${actionCount}\n`));

  } catch (error) {
    console.log(chalk.red(`\n❌ Error during execution:`));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    if (error instanceof Error && error.stack) {
      console.log(chalk.dim(error.stack.split("\n").slice(1).join("\n")));
    }
  } finally {
    // Close the browser
    await stagehand.close();
    console.log(chalk.gray(`\n🔚 Browser closed\n`));
  }
}

// Run the script
main().catch((error) => {
  console.log(chalk.red(`\n💥 Unhandled error:`));
  console.log(chalk.red(error));
  process.exit(1);
});
