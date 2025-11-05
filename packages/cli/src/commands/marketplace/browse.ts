/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// File for 'gemini marketplace browse' command
import type { CommandModule } from 'yargs';
import { MarketplaceManager, debugLogger } from '@google/gemini-cli-core';

const COLOR_CYAN = '\x1b[36m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_BLUE = '\x1b[34m';
const COLOR_GRAY = '\x1b[90m';
const RESET_COLOR = '\x1b[0m';
const BOLD = '\x1b[1m';

async function browseMarketplace(options: {
  category?: string;
  verified?: boolean;
  popular?: boolean;
  topRated?: boolean;
}) {
  const marketplace = new MarketplaceManager();

  let servers;
  let title;

  if (options.popular) {
    servers = marketplace.getPopularServers(20);
    title = '🔥 Popular MCP Servers';
  } else if (options.topRated) {
    servers = marketplace.getTopRatedServers(20);
    title = '⭐ Top Rated MCP Servers';
  } else if (options.verified) {
    servers = marketplace.getVerifiedServers();
    title = '✓ Verified MCP Servers';
  } else if (options.category) {
    servers = marketplace.getServersByCategory(options.category);
    const categories = marketplace.getCategories();
    const cat = categories.find((c) => c.id === options.category);
    title = `${cat?.icon || '📦'} ${cat?.name || options.category} Servers`;
  } else {
    servers = marketplace.getAllServers();
    title = '📦 MCP Marketplace';
  }

  debugLogger.log(`\n${BOLD}${COLOR_CYAN}${title}${RESET_COLOR}\n`);

  if (servers.length === 0) {
    debugLogger.log('No servers found matching your criteria.\n');
    return;
  }

  // Group by category if showing all
  if (!options.category && !options.popular && !options.topRated) {
    const categories = marketplace.getCategories();
    for (const category of categories as Array<{
      id: string;
      name: string;
      icon: string;
    }>) {
      const categoryServers = servers.filter(
        (s: { category: string }) => s.category === category.id,
      );
      if (categoryServers.length > 0) {
        debugLogger.log(
          `${BOLD}${category.icon} ${category.name}${RESET_COLOR}`,
        );
        for (const server of categoryServers) {
          displayServer(server);
        }
        debugLogger.log('');
      }
    }
  } else {
    // Display servers in a list
    for (const server of servers) {
      displayServer(server);
    }
  }

  debugLogger.log(
    `\n${COLOR_GRAY}💡 Use ${COLOR_CYAN}gemini marketplace info <id>${COLOR_GRAY} for more details${RESET_COLOR}`,
  );
  debugLogger.log(
    `${COLOR_GRAY}💡 Use ${COLOR_CYAN}gemini marketplace install <id>${COLOR_GRAY} to install a server${RESET_COLOR}\n`,
  );

  // Show available categories
  if (!options.category) {
    const categories = marketplace.getCategories();
    debugLogger.log(`${BOLD}Categories:${RESET_COLOR}`);
    const categoryList = categories
      .map((c: { icon: string; id: string }) => `${c.icon} ${c.id}`)
      .join(', ');
    debugLogger.log(`${COLOR_GRAY}${categoryList}${RESET_COLOR}\n`);
  }
}

function displayServer(server: {
  id: string;
  name: string;
  description: string;
  verified: boolean;
  downloads: number;
  rating: number;
  tags: string[];
}) {
  const verified = server.verified ? `${COLOR_GREEN}✓${RESET_COLOR}` : ' ';
  const rating = '⭐'.repeat(Math.round(server.rating));
  const downloads = formatNumber(server.downloads);

  debugLogger.log(
    `  ${verified} ${COLOR_BLUE}${server.id}${RESET_COLOR} - ${BOLD}${server.name}${RESET_COLOR}`,
  );
  debugLogger.log(`    ${server.description}`);
  debugLogger.log(
    `    ${rating} ${COLOR_GRAY}(${server.rating}) • ${downloads} downloads${RESET_COLOR}`,
  );
  debugLogger.log(
    `    ${COLOR_GRAY}Tags: ${server.tags.slice(0, 5).join(', ')}${RESET_COLOR}`,
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export const browseCommand: CommandModule = {
  command: 'browse',
  describe: 'Browse available MCP servers in the marketplace',
  builder: (yargs) =>
    yargs
      .usage('Usage: gemini marketplace browse [options]')
      .option('category', {
        alias: 'c',
        describe: 'Filter by category',
        type: 'string',
      })
      .option('verified', {
        alias: 'v',
        describe: 'Show only verified servers',
        type: 'boolean',
        default: false,
      })
      .option('popular', {
        alias: 'p',
        describe: 'Show popular servers',
        type: 'boolean',
        default: false,
      })
      .option('top-rated', {
        alias: 't',
        describe: 'Show top-rated servers',
        type: 'boolean',
        default: false,
      }),
  handler: async (argv) => {
    await browseMarketplace({
      category: argv['category'] as string | undefined,
      verified: argv['verified'] as boolean,
      popular: argv['popular'] as boolean,
      topRated: argv['topRated'] as boolean,
    });
  },
};
