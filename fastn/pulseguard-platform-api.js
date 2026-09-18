/**
 * PulseGuard Platform API — utility workflow exposing needed Fastn Workspace connector
 * actions (deploy/test/publish/versions) through executeWorkflow. One literal call per op
 * so the platform resolves every action into the workflow manifest.
 */
export default async function (ctx) {
  const fastn = new Fastn({ connectors: { fastnPlatform: { orgId: "custom" } } });
  const op = String((ctx.input && ctx.input.op) || "");
  const id = (ctx.input && ctx.input.id) || "";
  try {
    if (op === "deploy") return { op, result: await fastn.connector.fastnPlatform.deployWorkflowVersion({ id: id, versionId: ctx.input.versionId }) };
    if (op === "publish") return { op, result: await fastn.connector.fastnPlatform.publishWorkflow({ id: id }) };
    if (op === "versions") return { op, result: await fastn.connector.fastnPlatform.listWorkflowVersions({ id: id }) };
    if (op === "deployments") return { op, result: await fastn.connector.fastnPlatform.listWorkflowDeployments({ id: id }) };
    if (op === "test") return { op, result: await fastn.connector.fastnPlatform.testSavedWorkflow({ id: id, input: (ctx.input && ctx.input.input) || {}, headers: (ctx.input && ctx.input.headers) || {} }) };
    return { error: "unknown op", op };
  } catch (e) {
    return { error: (e && e.message) || String(e), op };
  }
}
