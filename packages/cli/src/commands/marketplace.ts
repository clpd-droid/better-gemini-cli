/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// File for 'gemini marketplace' command
import type { CommandModule, Argv } from 'yargs';
import {
  browseCommand,
  searchCommand,
  installCommand,
  infoCommand,
} from './marketplace/index.js';

export const marketplaceCommand: CommandModule = {
  command: 'marketplace',
  describe: 'Browse and install MCP servers from the marketplace',
  builder: (yargs: Argv) =>
    yargs
      .command(browseCommand)
      .command(searchCommand)
      .command(installCommand)
      .command(infoCommand)
      .demandCommand(1, 'You need at least one command before continuing.')
      .version(false),
  handler: () => {
    // yargs will automatically show help if no subcommand is provided
    // thanks to demandCommand(1) in the builder.
  },
};
