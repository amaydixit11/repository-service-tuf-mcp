#################################################
Repository Service for TUF MCP Server
#################################################

.. note::

  This MCP server is designed to provide a high-level, synchronous interface to the 
  Repository Service for TUF (RSTUF) REST API.

The **Repository Service for TUF MCP** is a Model Context Protocol implementation that 
bridges the gap between the asynchronous nature of RSTUF and the interactive capabilities 
of LLMs.

By encapsulating the "Task ID" polling pattern, this server allows AI agents to manage 
TUF repositories as if they were synchronous services.

Using
=====

**Prerequisites**

- Node.js v20+
- An active RSTUF API instance

**Setup**

1. Clone the repository:

   .. code-block:: bash

      git clone https://github.com/your-username/repository-service-tuf-mcp.git
      cd repository-service-tuf-mcp

2. Install dependencies:

   .. code-block:: bash

      npm install

3. Build the project:

   .. code-block:: bash

      npm run build

Configuration
=============

The server requires the following environment variables:

- ``RSTUF_API_URL``: The base URL of your RSTUF API (e.g., ``http://localhost:8080``).
- ``RSTUF_API_TOKEN``: The Bearer token used for authentication.

MCP Client Integration
=======================

Add the following to your MCP client configuration (e.g., ``claude_desktop_config.json``):

.. code-block:: json

   {
     "mcpServers": {
       "repository-service-tuf": {
         "command": "node",
         "args": ["/absolute/path/to/repository-service-tuf-mcp/dist/index.js"],
         "env": {
           "RSTUF_API_URL": "http://your-rstuf-api:8080",
           "RSTUF_API_TOKEN": "your-token-here"
         }
       }
     }
   }

Available Tools
================

.. list-table::
   :widths: 30 70
   :header-rows: 1

   * - Tool
     - Description
   * - ``get_system_status``
     - Checks the bootstrap status of the TUF repository.
   * - ``initialize_repository``
     - Bootstraps the system with signed metadata.
   * - ``add_artifacts``
     - Adds artifacts to the metadata.
   * - ``publish_artifacts``
     - Publishes pending artifacts.
   * - ``rotate_metadata``
     - Rotates role metadata (requires offline signing).
   * - ``get_pending_signatures``
     - Lists roles pending signatures.
   * - ``add_signature``
     - Adds a signature for a metadata role.
   * - ``update_config``
     - Updates configuration settings.
   * - ``manage_delegation``
     - Creates, updates, or deletes TUF delegations.

License
========

This project is licensed under the MIT License.
