/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// File for 'gemini marketplace install' command
import type { CommandModule } from 'yargs';
import {
  MarketplaceManager,
  debugLogger,
  type MCPServerConfig,
} from '@google/gemini-cli-core';
import { loadSettings, SettingScope } from '../../config/settings.js';
import prompts from 'prompts';

const COLOR_CYAN = '\x1b[36m';
const COLOR_GREEN = '\x1b[32m';
const COLOR_RED = '\x1b[31m';
const COLOR_YELLOW = '\x1b[33m';
const COLOR_GRAY = '\x1b[90m';
const RESET_COLOR = '\x1b[0m';
const BOLD = '\x1b[1m';

async function installServer(
  serverId: string,
  options: {
    scope: string;
    trust?: boolean;
    timeout?: number;
    yes?: boolean;
  },
) {
  const marketplace = new MarketplaceManager();
  const server = marketplace.getServerById(serverId);

  if (!server) {
    debugLogger.error(`Server "${serverId}" not found in marketplace.`);
    debugLogger.log(
      `\n${COLOR_GRAY}💡 Use ${COLOR_CYAN}gemini marketplace browse${COLOR_GRAY} to see all available servers${RESET_COLOR}\n`,
    );
    process.exit(1);
  }

  debugLogger.log(
    `\n${BOLD}${COLOR_CYAN}Installing: ${server.name}${RESET_COLOR}\n`,
  );
  debugLogger.log(`${server.description}\n`);

  // Collect required arguments
  const args: Record<string, string> = {};
  if (server.installation.requiredArgs && !options.yes) {
    debugLogger.log(`${BOLD}Required Configuration:${RESET_COLOR}\n`);

    for (const arg of server.installation.requiredArgs) {
      const response = await prompts({
        type: 'text',
        name: 'value',
        message: `Enter value for ${COLOR_CYAN}${arg}${RESET_COLOR}:`,
        validate: (value) => (value.trim() ? true : `${arg} is required`),
      });

      if (!response.value) {
        debugLogger.log(
          `\n${COLOR_RED}Installation cancelled.${RESET_COLOR}\n`,
        );
        process.exit(0);
      }

      args[arg] = response.value;
    }
    debugLogger.log('');
  }

  // Collect environment variables
  const envVars: Record<string, string> = {};
  if (server.installation.envVars && !options.yes) {
    debugLogger.log(`${BOLD}Environment Variables:${RESET_COLOR}\n`);

    for (const envVar of server.installation.envVars) {
      const existingValue = process.env[envVar];
      if (existingValue) {
        debugLogger.log(
          `  ${COLOR_GREEN}✓${RESET_COLOR} ${envVar} (found in environment)`,
        );
        envVars[envVar] = existingValue;
      } else {
        const response = await prompts({
          type: 'password',
          name: 'value',
          message: `Enter value for ${COLOR_CYAN}${envVar}${RESET_COLOR}:`,
          validate: (value) => (value.trim() ? true : `${envVar} is required`),
        });

        if (!response.value) {
          debugLogger.log(
            `\n${COLOR_RED}Installation cancelled.${RESET_COLOR}\n`,
          );
          process.exit(0);
        }

        envVars[envVar] = response.value;
      }
    }
    debugLogger.log('');
  }

  // Validate installation
  const validation = marketplace.validateInstallation(server, {
    args,
    envVars,
  });

  if (!validation.valid && !options.yes) {
    debugLogger.error(
      `${COLOR_RED}Missing required configuration:${RESET_COLOR}`,
    );
    for (const missing of validation.missing) {
      debugLogger.log(`  • ${missing}`);
    }
    debugLogger.log('');
    process.exit(1);
  }

  // Generate server configuration
  const config = marketplace.generateServerConfig(server, {
    scope: options.scope as 'user' | 'project',
    trust: options.trust,
    timeout: options.timeout,
    args,
    envVars,
  });

  // Confirm installation
  if (!options.yes) {
    debugLogger.log(`${BOLD}Configuration Summary:${RESET_COLOR}\n`);
    debugLogger.log(`  ${COLOR_CYAN}Server:${RESET_COLOR} ${server.name}`);
    debugLogger.log(`  ${COLOR_CYAN}Scope:${RESET_COLOR} ${options.scope}`);
    if (config.command) {
      debugLogger.log(
        `  ${COLOR_CYAN}Command:${RESET_COLOR} ${config.command} ${config.args?.join(' ') || ''}`,
      );
    }
    if (options.trust) {
      debugLogger.log(
        `  ${COLOR_YELLOW}⚠ Trust:${RESET_COLOR} All tool calls will be auto-approved`,
      );
    }
    debugLogger.log('');

    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: 'Proceed with installation?',
      initial: true,
    });

    if (!confirm.value) {
      debugLogger.log(`\n${COLOR_RED}Installation cancelled.${RESET_COLOR}\n`);
      process.exit(0);
    }
  }

  // Save to settings
  const settings = loadSettings(process.cwd());
  const inHome = settings.workspace.path === settings.user.path;

  if (options.scope === 'project' && inHome) {
    debugLogger.error(
      'Error: Please use --scope user to edit settings in the home directory.',
    );
    process.exit(1);
  }

  const settingsScope =
    options.scope === 'user' ? SettingScope.User : SettingScope.Workspace;

  const existingSettings = settings.forScope(settingsScope).settings;
  const mcpServers = existingSettings.mcpServers || {};

  mcpServers[serverId] = config as MCPServerConfig;

  settings.setValue(settingsScope, 'mcpServers', mcpServers);

  debugLogger.log(
    `\n${COLOR_GREEN}✓ Successfully installed ${server.name}!${RESET_COLOR}\n`,
  );
  debugLogger.log(
    `${COLOR_GRAY}The server will be available the next time you start Gemini CLI.${RESET_COLOR}\n`,
  );
}

export const installCommand: CommandModule = {
  command: 'install <id>',
  describe: 'Install an MCP server from the marketplace',
  builder: (yargs) =>
    yargs
      .usage('Usage: gemini marketplace install [options] <id>')
      .positional('id', {
        describe: 'Server ID',
        type: 'string',
        demandOption: true,
      })
      .option('scope', {
        alias: 's',
        describe: 'Configuration scope (user or project)',
        type: 'string',
        default: 'project',
        choices: ['user', 'project'],
      })
      .option('trust', {
        describe:
          'Trust the server (bypass all tool call confirmation prompts)',
        type: 'boolean',
      })
      .option('timeout', {
        describe: 'Set connection timeout in milliseconds',
        type: 'number',
      })
      .option('yes', {
        alias: 'y',
        describe: 'Skip confirmation prompts (use defaults)',
        type: 'boolean',
        default: false,
      }),
  handler: async (argv) => {
    await installServer(argv['id'] as string, {
      scope: argv['scope'] as string,
      trust: argv['trust'] as boolean | undefined,
      timeout: argv['timeout'] as number | undefined,
      yes: argv['yes'] as boolean,
    });
  },
};
