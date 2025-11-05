/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketplaceServer {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  repository: string;
  documentation: string;
  transport: 'stdio' | 'sse' | 'http';
  installation: {
    type: 'npx' | 'npm' | 'custom';
    command: string;
    args: string[];
    requiredArgs?: string[];
    envVars?: string[];
  };
  tools: string[];
  verified: boolean;
  downloads: number;
  rating: number;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface MarketplaceRegistry {
  version: string;
  servers: MarketplaceServer[];
  categories: MarketplaceCategory[];
}

export interface InstallOptions {
  scope?: 'user' | 'project';
  trust?: boolean;
  timeout?: number;
  args?: Record<string, string>;
  envVars?: Record<string, string>;
}
