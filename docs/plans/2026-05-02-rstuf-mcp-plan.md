# repository-service-tuf-mcp Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a Model Context Protocol (MCP) server that provides a synchronous, high-level interface for managing a Repository Service for TUF (RSTUF) instance.

**Architecture:** The server will act as a proxy between an MCP client (e.g., Claude Desktop) and the RSTUF REST API. It will encapsulate the asynchronous "Task ID" pattern of RSTUF, providing synchronous tools that poll for completion before returning results to the LLM.

**Tech Stack:** 
- Language: TypeScript
- Runtime: Node.js
- SDK: `@modelcontextprotocol/sdk`
- HTTP Client: `axios`
- Environment: Linux (Ubuntu)

---

## Phase 1: Project Setup & Infrastructure

### Task 1: Initialize Project and Dependencies
**Objective:** Set up the basic TypeScript environment and install MCP SDK.

**Files:**
- Create: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/package.json`
- Create: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/tsconfig.json`

**Steps:**
1. Initialize npm and install dependencies:
   `npm init -y`
   `npm install @modelcontextprotocol/sdk axios`
   `npm install -D typescript @types/node ts-node`
2. Configure `tsconfig.json` for Node 20+ and ESNext.
3. Add build and start scripts to `package.json`.

**Verification:**
Run `npm run build` (after creating basic src/index.ts) and ensure no TS errors.

---

## Phase 2: Core API Client

### Task 2: Implement RSTUF API Client
**Objective:** Create a robust client to handle HTTP requests to the RSTUF server.

**Files:**
- Create: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/src/client.ts`

**Implementation:**
- Create a class `RstufClient` that takes `baseUrl` and `apiToken`.
- Implement generic `request` method with axios.
- Implement specific methods for each endpoint discovered in docs:
    - `getBootstrapStatus()` $\rightarrow$ `GET /bootstrap`
    - `postBootstrap(payload)` $\rightarrow$ `POST /bootstrap`
    - `getTaskStatus(taskId)` $\rightarrow$ `GET /task`
    - `postArtifacts(payload)` $\rightarrow$ `POST /artifacts`
    - `postMetadata(payload)` $\rightarrow$ `POST /metadata`
    - ... (etc for all endpoints)

**Verification:**
Write a standalone test script `tests/client_test.ts` that calls `getBootstrapStatus` against a dummy/live server.

### Task 3: Implement Asynchronous Task Polling Logic
**Objective:** Add a helper to the client that polls a task until it is complete or fails.

**Files:**
- Modify: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/src/client.ts`

**Implementation:**
- Create a method `waitForTask(taskId, timeout=60000, interval=2000)`.
- Loop using `getTaskStatus` until state is `SUCCESS` or `FAILED`.
- Throw an error with the task result if `FAILED`.

**Verification:**
TDD: Mock the API to return `PENDING` twice then `SUCCESS`. Verify `waitForTask` resolves correctly.

---

## Phase 3: MCP Server Implementation

### Task 4: Initialize MCP Server Boilerplate
**Objective:** Setup the MCP server instance and standard communication.

**Files:**
- Create: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/src/index.ts`

**Implementation:**
- Initialize `Server` from `@modelcontextprotocol/sdk`.
- Define server metadata (name: "repository-service-tuf-mcp", version: "1.0.0").
- Setup `StdioServerTransport`.

**Verification:**
Run server and verify it starts without crashing.

### Task 5: Implement "System Status" Tool
**Objective:** Expose the bootstrap status to the LLM.

**Files:**
- Modify: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/src/index.ts`

**Implementation:**
- Add tool `get_system_status` to the server.
- Call `client.getBootstrapStatus()`.
- Return result as a `TextContent` block.

**Verification:**
Use `mcp-inspector` to call `get_system_status` and verify output.

### Task 6: Implement "Add Artifact" Tool (with Polling)
**Objective:** Allow LLM to add artifacts and wait for the result.

**Files:**
- Modify: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/src/index.ts`

**Implementation:**
- Add tool `add_artifacts` with arguments `artifacts` (array of objects).
- Logic: `res = client.postArtifacts(payload)` $\rightarrow$ `client.waitForTask(res.taskId)` $\rightarrow$ return success.

**Verification:**
TDD: Verify that the tool does not return until the task is finished.

### Task 7: Implement remaining tools
**Objective:** Map all remaining RSTUF API functions to MCP tools.

**Tools to implement:**
- `initialize_repository` $\rightarrow$ `POST /bootstrap` + polling.
- `publish_artifacts` $\rightarrow$ `POST /artifacts/publish` + polling.
- `rotate_metadata` $\rightarrow$ `POST /metadata` + polling.
- `get_pending_signatures` $\rightarrow$ `GET /metadata/sign`.
- `add_signature` $\rightarrow$ `POST /metadata/sign` + polling.
- `update_config` $\rightarrow$ `PUT /config` + polling.
- `manage_delegation` $\rightarrow$ `POST/PUT/DELETE /delegations` + polling.

---

## Phase 4: Finalization & Docs

### Task 8: Configuration Management
**Objective:** Allow the server to be configured via environment variables.

**Files:**
- Create: `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp/src/config.ts`

**Implementation:**
- Load `RSTUF_API_URL` and `RSTUF_API_TOKEN` from `process.env`.
- Validate presence of these variables on startup.

### Task 9: Final Integration Testing & Documentation
**Objective:** Ensure the server works in a real MCP client.

**Steps:**
1. Add server to `claude_desktop_config.json`.
2. Test a full workflow: "Check status $\rightarrow$ Add Artifact $\rightarrow$ Publish $\rightarrow$ Verify".
3. Create `README.md` with setup and usage instructions.

**Final Deliverable:**
- Fully functional MCP server in `/home/amaydixit11/Desktop/dev/repository-service-tuf-mcp`
- Comprehensive `README.md`
- Validated Tool Schema
