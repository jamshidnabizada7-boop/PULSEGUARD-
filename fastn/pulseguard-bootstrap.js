/**
 * PulseGuard Bootstrap — publishes workflows via the platform API (one-shot utility).
 * Input: { targets: ["pulseguard-risk-engine", ...] }  -> publishes each by slug.
 */
export default async function (ctx) {
  const fastn = new Fastn({ connectors: { fastnPlatform: { orgId: "custom" } } });
  const targets = (ctx.input && ctx.input.targets) || [];
  const results = [];
  for (const t of targets) {
    try {
      const r = await fastn.connector.fastnPlatform.publishWorkflow({ id: t });
      results.push({ target: t, ok: true, out: r && r.output });
    } catch (e) {
      results.push({ target: t, ok: false, error: e && e.message });
    }
  }
  return { results };
}
