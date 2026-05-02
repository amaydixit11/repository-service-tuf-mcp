# ADR 001: Tech Stack and Architecture for repository-service-tuf-mcp

**Status:** Accepted
**Date:** 2026-05-02
**Decider(s):** Amay Dixit, Hermes Agent

## Context
We need to build an MCP (Model Context Protocol) server to interface with the Repository Service for TUF (RSTUF). RSTUF provides a REST API that is heavily asynchronous, returning task IDs for most write operations. Using this directly from an LLM is inefficient as it requires multiple turns of polling.

## Decision
We will implement the MCP server using:
- **Language:** TypeScript
- **Runtime:** Node.js
- **SDK:** `@modelcontextprotocol/sdk`
- **HTTP Client:** `axios`
- **Architectural Pattern:** Synchronous Proxy. The MCP server will encapsulate the polling logic, waiting for RSTUF tasks to complete before returning the final result to the MCP client.

## Consequences
### Positive
- **Simplified LLM Interaction:** The LLM sees synchronous tools rather than managing task IDs and polling.
- **Type Safety:** TypeScript provides strong typing for the API payloads and MCP tool definitions.
- **Standardization:** Using the official MCP SDK ensures compatibility with Claude Desktop and other MCP clients.

### Negative/Trade-offs
- **Blocking Calls:** The MCP server will hold a connection open while polling, which could lead to timeouts if RSTUF tasks take an exceptionally long time.
- **Runtime Dependency:** Requires Node.js on the host machine.

### Neutral
- **Configuration:** Will rely on environment variables for API credentials.
