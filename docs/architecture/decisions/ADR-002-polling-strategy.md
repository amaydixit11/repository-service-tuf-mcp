# ADR 002: Asynchronous Task Polling Strategy

**Status:** Accepted
**Date:** 2026-05-02
**Decider(s):** Amay Dixit, Hermes Agent

## Context
The RSTUF API implements an asynchronous pattern for all mutation operations (POST/PUT/DELETE). When a request is made to add artifacts or rotate metadata, the server returns a `task_id` immediately, while the actual work is performed by a background worker. To determine the result, the client must poll the `/task/{taskId}` endpoint.

For an LLM using MCP, this creates a "chatty" interface where the model would have to call a tool, receive a task ID, then repeatedly call a status tool until completion. This increases token usage and latency.

## Decision
We will implement a **Server-Side Polling Wrapper** within the MCP server. 

Instead of exposing the raw `/task` endpoint as a tool, the MCP server will:
1. Call the mutation endpoint (e.g., `/artifacts`).
2. Enter a `while` loop (using `waitForTask`) that polls the status endpoint at a fixed interval (2 seconds).
3. Block the MCP tool response until the task state is either `SUCCESS` or `FAILED`.
4. Return the final result or the error message directly to the LLM.

## Consequences
### Positive
- **Atomic Operations:** The LLM perceives the operation as a single synchronous call.
- **Reduced Token Overhead:** Eliminates the need for the LLM to manage polling loops.
- **Simplified Prompting:** The model doesn't need to be instructed on how to handle task IDs.

### Negative/Trade-offs
- **Request Blocking:** The MCP server blocks the specific tool execution thread for the duration of the task.
- **Timeout Risk:** If a TUF operation takes longer than the configured timeout (60s), the tool will return an error even if the task eventually succeeds.

### Neutral
- **Interval Tuning:** The 2-second interval is a heuristic balance between API load and response latency.
