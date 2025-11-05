/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// File for 'gemini marketplace search' command
import type { CommandModule } from 'yargs';
import { MarketplaceManager, debugLogger } from '@google/gemini-cli-core';

const COLOR_CYAN = '\x1b[36m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_BLUE = '\x1b[34m';
const COLOR_GRAY = '\x1b[90m';
const RESET_COLOR = '\x1b[0m';
const BOLD = '\x1b[1m';

async function searchMarketplace(query: string) {
  const marketplace = new MarketplaceManager();
  const results = marketplace.searchServers(query);

  debugLogger.log(
    `\n${BOLD}${COLOR_CYAN}🔍 Search Results for "${query}"${RESET_COLOR}\n`,
  );

  if (results.length === 0) {
    debugLogger.log('No servers found matching your search.\n');
    return;
  }

  debugLogger.log(`Found ${results.length} server(s):\n`);

  for (const server of results) {
    const verified = server.verified ? `${COLOR_GREEN}✓${RESET_COLOR}` : ' ';
    const rating = '⭐'.repeat(Math.round(server.rating));

    debugLogger.log(
      `  ${verified} ${COLOR_BLUE}${server.id}${RESET_COLOR} - ${BOLD}${server.name}${RESET_COLOR}`,
    );
    debugLogger.log(`    ${server.description}`);
    debugLogger.log(
      `    ${rating} ${COLOR_GRAY}(${server.rating}) • ${server.category}${RESET_COLOR}`,
    );
    debugLogger.log(
      `    ${COLOR_GRAY}Tags: ${server.tags.slice(0, 5).join(', ')}${RESET_COLOR}`,
    );
    debugLogger.log('');
  }

  debugLogger.log(
    `${COLOR_GRAY}💡 Use ${COLOR_CYAN}gemini marketplace info <id>${COLOR_GRAY} for more details${RESET_COLOR}`,
  );
  debugLogger.log(
    `${COLOR_GRAY}💡 Use ${COLOR_CYAN}gemini marketplace install <id>${COLOR_GRAY} to install a server${RESET_COLOR}\n`,
  );
}

export const searchCommand: CommandModule = {
  command: 'search <query>',
  describe: 'Search for MCP servers in the marketplace',
  builder: (yargs) =>
    yargs
      .usage('Usage: gemini marketplace search <query>')
      .positional('query', {
        describe: 'Search query (searches name, description, tags, author)',
        type: 'string',
        demandOption: true,
      }),
  handler: async (argv) => {
    await searchMarketplace(argv['query'] as string);
  },
};
