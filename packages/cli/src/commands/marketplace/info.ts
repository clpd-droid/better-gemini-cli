/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// File for 'gemini marketplace info' command
import type { CommandModule } from 'yargs';
import { MarketplaceManager, debugLogger } from '@google/gemini-cli-core';

const COLOR_CYAN = '\x1b[36m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_BLUE = '\x1b[34m';
const COLOR_GRAY = '\x1b[90m';
const RESET_COLOR = '\x1b[0m';
const BOLD = '\x1b[1m';

async function showServerInfo(serverId: string) {
  const marketplace = new MarketplaceManager();
  const server = marketplace.getServerById(serverId);

  if (!server) {
    debugLogger.error(`Server "${serverId}" not found in marketplace.`);
    debugLogger.log(
      `\n${COLOR_GRAY}💡 Use ${COLOR_CYAN}gemini marketplace browse${COLOR_GRAY} to see all available servers${RESET_COLOR}\n`,
    );
    return;
  }

  const verified = server.verified
    ? `${COLOR_GREEN}✓ Verified${RESET_COLOR}`
    : '';
  const rating = '⭐'.repeat(Math.round(server.rating));

  debugLogger.log(
    `\n${BOLD}${COLOR_CYAN}${server.name}${RESET_COLOR} ${verified}\n`,
  );
  debugLogger.log(`${server.description}\n`);

  debugLogger.log(`${BOLD}Details:${RESET_COLOR}`);
  debugLogger.log(`  ${COLOR_BLUE}ID:${RESET_COLOR} ${server.id}`);
  debugLogger.log(`  ${COLOR_BLUE}Author:${RESET_COLOR} ${server.author}`);
  debugLogger.log(`  ${COLOR_BLUE}Category:${RESET_COLOR} ${server.category}`);
  debugLogger.log(
    `  ${COLOR_BLUE}Rating:${RESET_COLOR} ${rating} (${server.rating}/5.0)`,
  );
  debugLogger.log(
    `  ${COLOR_BLUE}Downloads:${RESET_COLOR} ${server.downloads.toLocaleString()}`,
  );
  debugLogger.log(
    `  ${COLOR_BLUE}Transport:${RESET_COLOR} ${server.transport}`,
  );
  debugLogger.log('');

  debugLogger.log(`${BOLD}Tags:${RESET_COLOR}`);
  debugLogger.log(`  ${server.tags.join(', ')}`);
  debugLogger.log('');

  if (server.tools.length > 0) {
    debugLogger.log(
      `${BOLD}Available Tools (${server.tools.length}):${RESET_COLOR}`,
    );
    for (const tool of server.tools) {
      debugLogger.log(`  • ${tool}`);
    }
    debugLogger.log('');
  }

  if (server.installation.requiredArgs?.length) {
    debugLogger.log(`${BOLD}Required Arguments:${RESET_COLOR}`);
    for (const arg of server.installation.requiredArgs) {
      debugLogger.log(`  • ${arg}`);
    }
    debugLogger.log('');
  }

  if (server.installation.envVars?.length) {
    debugLogger.log(`${BOLD}Required Environment Variables:${RESET_COLOR}`);
    for (const envVar of server.installation.envVars) {
      debugLogger.log(`  • ${envVar}`);
    }
    debugLogger.log('');
  }

  debugLogger.log(`${BOLD}Installation:${RESET_COLOR}`);
  debugLogger.log(
    `  ${COLOR_CYAN}gemini marketplace install ${server.id}${RESET_COLOR}`,
  );
  debugLogger.log('');

  debugLogger.log(`${BOLD}Resources:${RESET_COLOR}`);
  debugLogger.log(
    `  ${COLOR_BLUE}Repository:${RESET_COLOR} ${server.repository}`,
  );
  debugLogger.log(
    `  ${COLOR_BLUE}Documentation:${RESET_COLOR} ${server.documentation}`,
  );
  debugLogger.log('');
}

export const infoCommand: CommandModule = {
  command: 'info <id>',
  describe: 'Show detailed information about an MCP server',
  builder: (yargs) =>
    yargs.usage('Usage: gemini marketplace info <id>').positional('id', {
      describe: 'Server ID',
      type: 'string',
      demandOption: true,
    }),
  handler: async (argv) => {
    await showServerInfo(argv['id'] as string);
  },
};
