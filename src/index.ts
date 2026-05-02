import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { RstufClient, type TaskResponse } from './client.js';

// Load .env file before reading environment variables
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config();

const baseUrl = process.env.RSTUF_API_URL;
const apiToken = process.env.RSTUF_API_TOKEN;
const server = new Server(
  {
    name: 'repository-service-tuf-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Config from env - Eager validation


if (!baseUrl || !apiToken) {
  console.error('FATAL: RSTUF_API_URL and RSTUF_API_TOKEN environment variables must be set');
  process.exit(1);
}

const client = new RstufClient({ baseUrl, apiToken });

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_system_status',
        description: 'Get the bootstrap status of the TUF repository service',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'initialize_repository',
        description: 'Initialize the TUF repository with initial signed metadata and settings',
        inputSchema: {
          type: 'object',
          properties: {
            payload: {
              type: 'object',
              description: 'Bootstrap payload containing initial metadata and settings',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'add_artifacts',
        description: 'Add artifacts to the TUF repository',
        inputSchema: {
          type: 'object',
          properties: {
            artifacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  version: { type: 'string' },
                  hash: { type: 'string' },
                  size: { type: 'number' },
                },
                required: ['name', 'version', 'hash', 'size'],
              },
            },
          },
          required: ['artifacts'],
        },
      },
      {
        name: 'publish_artifacts',
        description: 'Publish artifacts in the TUF repository',
        inputSchema: {
          type: 'object',
          properties: {
            payload: {
              type: 'object',
              description: 'Payload for publishing artifacts',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'deploy_artifacts',
        description: 'Workflow: Add artifacts and then publish them in one operation',
        inputSchema: {
          type: 'object',
          properties: {
            artifacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  version: { type: 'string' },
                  hash: { type: 'string' },
                  size: { type: 'number' },
                },
                required: ['name', 'version', 'hash', 'size'],
              },
            },
            publishPayload: {
              type: 'object',
              description: 'Payload for publishing the artifacts after adding them',
            },
          },
          required: ['artifacts', 'publishPayload'],
        },
      },
      {
        name: 'rotate_metadata',
        description: 'Rotate role metadata that requires offline signing',
        inputSchema: {
          type: 'object',
          properties: {
            payload: {
              type: 'object',
              description: 'Payload for rotating metadata',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'get_pending_signatures',
        description: 'Get all metadata roles pending signatures',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'add_signature',
        description: 'Add a signature for a metadata role',
        inputSchema: {
          type: 'object',
          properties: {
            payload: {
              type: 'object',
              description: 'Payload for adding a signature',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'update_config',
        description: 'Update configuration settings',
        inputSchema: {
          type: 'object',
          properties: {
            payload: {
              type: 'object',
              description: 'Payload for updating config',
            },
          },
          required: ['payload'],
        },
      },
      {
        name: 'manage_delegation',
        description: 'Create, update, or delete delegations',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'update', 'delete'],
            },
            payload: {
              type: 'object',
              description: 'Payload for the delegation action',
            },
          },
          required: ['action', 'payload'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_system_status': {
        const status = await client.getBootstrapStatus();
        return {
          content: [{ type: 'text', text: JSON.stringify(status, null, 2) }],
        };
      }

      case 'initialize_repository': {
        const payload = args?.payload;
        if (!payload) throw new Error('Missing required argument: payload');
        const response = await client.postBootstrap(payload);
        if (response && 'taskId' in response) {
          const result = await client.waitForTask((response as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
        };
      }

      case 'add_artifacts': {
        const artifacts = args?.artifacts;
        if (!artifacts) throw new Error('Missing required argument: artifacts');
        const response = await client.postArtifacts({ artifacts });
        if (response && 'taskId' in response) {
          const result = await client.waitForTask((response as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
        };
      }

      case 'publish_artifacts': {
        const payload = args?.payload;
        if (!payload) throw new Error('Missing required argument: payload');
        const response = await client.postArtifactsPublish(payload);
        if (response && 'taskId' in response) {
          const result = await client.waitForTask((response as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
        };
      }

      case 'deploy_artifacts': {
        const { artifacts, publishPayload } = args || {};
        if (!artifacts || !publishPayload) throw new Error('Missing required arguments: artifacts and publishPayload');

        // Step 1: Add artifacts
        const addResponse = await client.postArtifacts({ artifacts });
        if (addResponse && 'taskId' in addResponse) {
          await client.waitForTask((addResponse as TaskResponse).taskId);
        }

        // Step 2: Publish artifacts
        const pubResponse = await client.postArtifactsPublish(publishPayload);
        if (pubResponse && 'taskId' in pubResponse) {
          const result = await client.waitForTask((pubResponse as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify({ status: 'Deployed', result }, null, 2) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ status: 'Deployed', result: pubResponse }, null, 2) }],
        };
      }

      case 'rotate_metadata': {
        const payload = args?.payload;
        if (!payload) throw new Error('Missing required argument: payload');
        const response = await client.postMetadata(payload);
        if (response && 'taskId' in response) {
          const result = await client.waitForTask((response as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
        };
      }

      case 'get_pending_signatures': {
        const signatures = await client.getMetadataSign();
        return {
          content: [{ type: 'text', text: JSON.stringify(signatures, null, 2) }],
        };
      }

      case 'add_signature': {
        const payload = args?.payload;
        if (!payload) throw new Error('Missing required argument: payload');
        const response = await client.postMetadataSign(payload);
        if (response && 'taskId' in response) {
          const result = await client.waitForTask((response as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
        };
      }

      case 'update_config': {
        const payload = args?.payload;
        if (!payload) throw new Error('Missing required argument: payload');
        const response = await client.putConfig(payload);
        if (response && 'taskId' in response) {
          const result = await client.waitForTask((response as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
        };
      }

      case 'manage_delegation': {
        const { action, payload } = args || {};
        if (!action || !payload) throw new Error('Missing required arguments: action and payload');
        
        let response;
        if (action === 'create') {
          response = await client.postDelegation(payload);
        } else if (action === 'update') {
          response = await client.putDelegation(payload);
        } else if (action === 'delete') {
          response = await client.postDelegationDelete(payload);
        } else {
          throw new Error(`Invalid action: ${action}. Must be 'create', 'update', or 'delete'.`);
        }

        if (response && 'taskId' in response) {
          const result = await client.waitForTask((response as TaskResponse).taskId);
          return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          };
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
        };
      }

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('RSTUF MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main:', error);
  process.exit(1);
});
