/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ToolCallConfirmationDetails,
  ToolInvocation,
  ToolResult,
} from './tools.js';
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  ToolConfirmationOutcome,
} from './tools.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { ToolErrorType } from './tool-error.js';
import { getErrorMessage } from '../utils/errors.js';
import type { Config } from '../config/config.js';
import { ApprovalMode } from '../config/config.js';
import { HF_IMAGE_GEN_TOOL_NAME } from './tool-names.js';
import { loadHfApiKey } from '../core/hfApiKeyStorage.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-schnell';

/**
 * Parameters for the HuggingFace Image Generation tool
 */
export interface HfImageGenToolParams {
  /**
   * The text prompt describing the image to generate
   */
  prompt: string;
  /**
   * Optional model to use for image generation
   */
  model?: string;
  /**
   * Optional filename for the generated image (defaults to generated name)
   */
  filename?: string;
}

class HfImageGenToolInvocation extends BaseToolInvocation<
  HfImageGenToolParams,
  ToolResult
> {
  constructor(
    private readonly config: Config,
    params: HfImageGenToolParams,
    messageBus?: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ) {
    super(params, messageBus, _toolName, _toolDisplayName);
  }

  getDescription(): string {
    const displayPrompt =
      this.params.prompt.length > 100
        ? this.params.prompt.substring(0, 97) + '...'
        : this.params.prompt;
    return `Generating image with prompt: "${displayPrompt}"`;
  }

  protected override async getConfirmationDetails(
    _abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    if (this.config.getApprovalMode() === ApprovalMode.AUTO_EDIT) {
      return false;
    }

    const confirmationDetails: ToolCallConfirmationDetails = {
      type: 'info',
      title: `Confirm HuggingFace Image Generation`,
      prompt: `Generate image with prompt: "${this.params.prompt}"`,
      onConfirm: async (outcome: ToolConfirmationOutcome) => {
        if (outcome === ToolConfirmationOutcome.ProceedAlways) {
          this.config.setApprovalMode(ApprovalMode.AUTO_EDIT);
        }
      },
    };
    return confirmationDetails;
  }

  async execute(signal: AbortSignal): Promise<ToolResult> {
    try {
      // Load API key
      const apiKey = await loadHfApiKey();
      if (!apiKey) {
        const errorMessage =
          'HuggingFace API key not configured. Please set it using the /hfkey command.';
        return {
          llmContent: `Error: ${errorMessage}`,
          returnDisplay: `Error: ${errorMessage}`,
          error: {
            message: errorMessage,
            type: ToolErrorType.HF_IMAGE_GEN_NO_API_KEY,
          },
        };
      }

      const model = this.params.model || DEFAULT_MODEL;
      const prompt = this.params.prompt;

      // Make request to HuggingFace Inference API
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
          }),
          signal,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HuggingFace API request failed with status ${response.status}`;

        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage += `: ${errorJson.error}`;
          }
        } catch {
          errorMessage += `: ${errorText}`;
        }

        return {
          llmContent: `Error: ${errorMessage}`,
          returnDisplay: `Error: ${errorMessage}`,
          error: {
            message: errorMessage,
            type: ToolErrorType.HF_IMAGE_GEN_API_ERROR,
          },
        };
      }

      // Get image data as buffer
      const imageBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);

      // Generate filename if not provided
      const filename =
        this.params.filename || `generated_image_${Date.now()}.png`;

      // Get workspace root directory
      const workspaceRoot = this.config.getTargetDir();
      if (!workspaceRoot) {
        const errorMessage = 'No workspace root directory found';
        return {
          llmContent: `Error: ${errorMessage}`,
          returnDisplay: `Error: ${errorMessage}`,
          error: {
            message: errorMessage,
            type: ToolErrorType.HF_IMAGE_GEN_SAVE_ERROR,
          },
        };
      }

      // Ensure the directory exists
      const filepath = join(workspaceRoot, filename);
      const dir = dirname(filepath);
      await mkdir(dir, { recursive: true });

      // Write the image file
      await writeFile(filepath, buffer);

      const successMessage = `Image generated and saved to: ${filename}`;
      return {
        llmContent: successMessage,
        returnDisplay: successMessage,
      };
    } catch (error: unknown) {
      if (signal.aborted) {
        const errorMessage = 'Image generation was cancelled';
        return {
          llmContent: `Error: ${errorMessage}`,
          returnDisplay: `Error: ${errorMessage}`,
          error: {
            message: errorMessage,
            type: ToolErrorType.HF_IMAGE_GEN_CANCELLED,
          },
        };
      }

      const errorMessage = `Error generating image: ${getErrorMessage(error)}`;
      return {
        llmContent: `Error: ${errorMessage}`,
        returnDisplay: `Error: ${errorMessage}`,
        error: {
          message: errorMessage,
          type: ToolErrorType.HF_IMAGE_GEN_EXECUTION_ERROR,
        },
      };
    }
  }
}

/**
 * Implementation of the HuggingFace Image Generation tool
 */
export class HfImageGenTool extends BaseDeclarativeTool<
  HfImageGenToolParams,
  ToolResult
> {
  static readonly Name = HF_IMAGE_GEN_TOOL_NAME;

  constructor(
    private readonly config: Config,
    messageBus?: MessageBus,
  ) {
    super(
      HfImageGenTool.Name,
      'HuggingFace Image Generation',
      'Generates images from text prompts using HuggingFace Inference API. Requires a HuggingFace API key to be configured (use /hfkey command). The generated image will be saved to the workspace directory.',
      Kind.Other,
      {
        properties: {
          prompt: {
            description:
              'The text prompt describing the image you want to generate. Be descriptive and specific for best results.',
            type: 'string',
          },
          model: {
            description:
              'Optional: The HuggingFace model to use for image generation. Defaults to "black-forest-labs/FLUX.1-schnell" if not specified.',
            type: 'string',
          },
          filename: {
            description:
              'Optional: The filename for the saved image (e.g., "cat.png"). If not provided, a timestamp-based filename will be generated.',
            type: 'string',
          },
        },
        required: ['prompt'],
        type: 'object',
      },
      false, // isOutputMarkdown
      false, // canUpdateOutput
      messageBus,
    );
  }

  protected override validateToolParamValues(
    params: HfImageGenToolParams,
  ): string | null {
    if (!params.prompt || params.prompt.trim() === '') {
      return "The 'prompt' parameter cannot be empty.";
    }

    if (
      params.filename &&
      !/^[a-zA-Z0-9_\-.]+\.(png|jpg|jpeg)$/i.test(params.filename)
    ) {
      return "The 'filename' parameter must be a valid filename ending with .png, .jpg, or .jpeg";
    }

    return null;
  }

  protected createInvocation(
    params: HfImageGenToolParams,
    messageBus?: MessageBus,
    _toolName?: string,
    _toolDisplayName?: string,
  ): ToolInvocation<HfImageGenToolParams, ToolResult> {
    return new HfImageGenToolInvocation(
      this.config,
      params,
      messageBus,
      _toolName,
      _toolDisplayName,
    );
  }
}
