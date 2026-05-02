
import { RstufClient } from './repository_service_tuf_mcp/client.js';

async function runDemo() {
    const client = new RstufClient({ 
        baseUrl: 'http://localhost:8080', 
        apiToken: 'admin' 
    });

    console.log("--- STEP 1: Checking System Status ---");
    try {
        const status = await client.getBootstrapStatus();
        console.log("Status:", JSON.stringify(status, null, 2));
    } catch (e) {
        console.log("Status Check failed (likely not running/initialized):", e.message);
    }

    console.log("\n--- STEP 2: Deploying Artifact (Workflow) ---");
    try {
        const artifacts = [{ name: 'victory-package', version: '1.0.0', hash: 'sha256:abc', size: 1024 }];
        
        console.log("Adding artifacts...");
        const addRes = await client.postArtifacts({ artifacts });
        console.log(`Task created: ${addRes.taskId}. Waiting...`);
        await client.waitForTask(addRes.taskId);
        console.log("Artifacts added successfully!");

        console.log("Publishing artifacts...");
        const pubRes = await client.postArtifactsPublish({});
        console.log(`Task created: ${pubRes.taskId}. Waiting...`);
        await client.waitForTask(pubRes.taskId);
        console.log("Artifacts published successfully!");
        
        console.log("\n✅ GOLDEN PATH COMPLETE");
    } catch (e) {
        console.log("Demo failed:", e.message);
        console.log("Note: This is expected if the Docker containers are still starting or the API is not yet bootstrapped.");
    }
}

runDemo();
