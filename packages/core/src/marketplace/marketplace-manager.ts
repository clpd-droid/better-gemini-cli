/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  MarketplaceRegistry,
  MarketplaceServer,
  MarketplaceCategory,
  InstallOptions,
} from './types.js';
import registryData from './registry.json' with { type: 'json' };

/**
 * Manages the MCP marketplace, providing discovery, search, and installation
 * capabilities for MCP servers.
 */
export class MarketplaceManager {
  private registry: MarketplaceRegistry;

  constructor() {
    this.registry = registryData as MarketplaceRegistry;
  }

  /**
   * Get all available servers in the marketplace
   */
  getAllServers(): MarketplaceServer[] {
    return this.registry.servers;
  }

  /**
   * Get all categories
   */
  getCategories(): MarketplaceCategory[] {
    return this.registry.categories;
  }

  /**
   * Search servers by query string (searches name, description, tags)
   */
  searchServers(query: string): MarketplaceServer[] {
    const lowerQuery = query.toLowerCase();
    return this.registry.servers.filter(
      (server) =>
        server.name.toLowerCase().includes(lowerQuery) ||
        server.description.toLowerCase().includes(lowerQuery) ||
        server.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        server.author.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Get servers by category
   */
  getServersByCategory(categoryId: string): MarketplaceServer[] {
    return this.registry.servers.filter(
      (server) => server.category === categoryId,
    );
  }

  /**
   * Get a specific server by ID
   */
  getServerById(id: string): MarketplaceServer | undefined {
    return this.registry.servers.find((server) => server.id === id);
  }

  /**
   * Get verified servers only
   */
  getVerifiedServers(): MarketplaceServer[] {
    return this.registry.servers.filter((server) => server.verified);
  }

  /**
   * Get popular servers (sorted by downloads)
   */
  getPopularServers(limit: number = 10): MarketplaceServer[] {
    return [...this.registry.servers]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  /**
   * Get top-rated servers
   */
  getTopRatedServers(limit: number = 10): MarketplaceServer[] {
    return [...this.registry.servers]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Generate MCP server configuration for installation
   */
  generateServerConfig(
    server: MarketplaceServer,
    options: InstallOptions = {},
  ): {
    command?: string;
    args?: string[];
    env?: Record<string, string>;
    url?: string;
    httpUrl?: string;
    timeout?: number;
    trust?: boolean;
  } {
    const config: {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      url?: string;
      httpUrl?: string;
      timeout?: number;
      trust?: boolean;
    } = {};

    // Handle different transport types
    if (server.transport === 'stdio') {
      config.command = server.installation.command;
      config.args = [...server.installation.args];

      // Replace argument placeholders with provided values
      if (options.args) {
        config.args = config.args.map((arg) => {
          const match = arg.match(/^\{(\w+)\}$/);
          if (match && options.args?.[match[1]]) {
            return options.args[match[1]];
          }
          return arg;
        });
      }

      // Set up environment variables
      if (server.installation.envVars || options.envVars) {
        config.env = { ...options.envVars };
      }
    } else if (server.transport === 'sse') {
      // For SSE servers, the URL would need to be provided
      if (options.args?.['url']) {
        config.url = options.args['url'];
      }
    } else if (server.transport === 'http') {
      // For HTTP servers, the URL would need to be provided
      if (options.args?.['httpUrl']) {
        config.httpUrl = options.args['httpUrl'];
      }
    }

    // Add optional settings
    if (options.timeout) {
      config.timeout = options.timeout;
    }
    if (options.trust !== undefined) {
      config.trust = options.trust;
    }

    return config;
  }

  /**
   * Validate that all required arguments are provided
   */
  validateInstallation(
    server: MarketplaceServer,
    options: InstallOptions,
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    // Check required arguments
    if (server.installation.requiredArgs) {
      for (const arg of server.installation.requiredArgs) {
        if (!options.args?.[arg]) {
          missing.push(arg);
        }
      }
    }

    // Check required environment variables
    if (server.installation.envVars) {
      for (const envVar of server.installation.envVars) {
        if (!options.envVars?.[envVar] && !process.env[envVar]) {
          missing.push(envVar);
        }
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Get installation instructions for a server
   */
  getInstallationInstructions(server: MarketplaceServer): string {
    const lines: string[] = [];

    lines.push(`# ${server.name}`);
    lines.push(`${server.description}\n`);

    if (server.installation.requiredArgs?.length) {
      lines.push('**Required Arguments:**');
      for (const arg of server.installation.requiredArgs) {
        lines.push(`  - ${arg}`);
      }
      lines.push('');
    }

    if (server.installation.envVars?.length) {
      lines.push('**Required Environment Variables:**');
      for (const envVar of server.installation.envVars) {
        lines.push(`  - ${envVar}`);
      }
      lines.push('');
    }

    lines.push('**Installation Command:**');
    lines.push(
      `gemini marketplace install ${server.id} [--scope user|project] [--trust]`,
    );
    lines.push('');

    if (server.tools.length) {
      lines.push('**Available Tools:**');
      for (const tool of server.tools) {
        lines.push(`  - ${tool}`);
      }
      lines.push('');
    }

    lines.push(`**Documentation:** ${server.documentation}`);
    lines.push(`**Repository:** ${server.repository}`);

    return lines.join('\n');
  }
}
