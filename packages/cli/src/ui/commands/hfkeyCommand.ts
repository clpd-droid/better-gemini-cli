/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CommandContext,
  MessageActionReturn,
  SlashCommand,
} from './types.js';
import { CommandKind } from './types.js';
import { saveHfApiKey, loadHfApiKey } from '@google/gemini-cli-core';

/**
 * Slash command to configure the HuggingFace API key
 */
export const hfkeyCommand: SlashCommand = {
  name: 'hfkey',
  description: 'Set or view HuggingFace API key for image generation',
  kind: CommandKind.BUILT_IN,
  action: async (
    _context: CommandContext,
    args: string,
  ): Promise<MessageActionReturn> => {
    const trimmedArgs = args.trim();

    if (!trimmedArgs) {
      // Show current status
      const currentKey = await loadHfApiKey();
      if (currentKey) {
        // Mask the key for display
        const masked =
          currentKey.substring(0, 7) +
          '*'.repeat(Math.max(0, currentKey.length - 10)) +
          currentKey.substring(Math.max(7, currentKey.length - 3));

        return {
          type: 'message',
          messageType: 'info',
          content: `HuggingFace API key is set: ${masked}\n\nTo update: /hfkey <new-api-key>\nTo clear: /hfkey clear`,
        };
      } else {
        return {
          type: 'message',
          messageType: 'info',
          content:
            'No HuggingFace API key configured.\n\nTo set your API key: /hfkey <your-api-key>\n\nGet a free API key at: https://huggingface.co/settings/tokens\n\nWith a free account, you can generate up to 100 images per day.',
        };
      }
    }

    if (trimmedArgs.toLowerCase() === 'clear') {
      await saveHfApiKey(null);
      return {
        type: 'message',
        messageType: 'info',
        content: 'HuggingFace API key cleared.',
      };
    }

    // Set the API key
    await saveHfApiKey(trimmedArgs);
    return {
      type: 'message',
      messageType: 'info',
      content:
        'HuggingFace API key saved successfully!\n\nYou can now use the generate_image tool to create images from text prompts.',
    };
  },
};
