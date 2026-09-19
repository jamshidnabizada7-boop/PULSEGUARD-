# Evidence 04: Fastn Workflows Dashboard Manifest

**Org ID**: `personal_dc05aac8b2c7b361ba84`  
**Host**: `https://app.fastn.dev`  
**Workflows Configured & Verified**:

1. **Risk Engine**: `wf_fe925b124168`
   - Slug: `pulseguard-risk-engine-v2`
   - Status: Active / Published
   - Connectors Bound: HubSpot (`9036a742-6baa-4c72-be3c-3789b34d6f9b`), Slack (`8de5d696-5289-4c9c-ade4-de918d019d06`)
   - Functions: Evaluates usage drop, queries `fastn.state` for deduplication (30 min window), searches HubSpot companies, creates CRM timeline note, posts Slack card.

2. **Ack Loop**: `wf_4afb70d49708`
   - Slug: `pulseguard-ack-loop`
   - Status: Active / Published
   - Functions: Triggered when Customer Success acknowledges risk. Updates CRM timeline note with resolution and clears high-risk flag.

3. **Platform API Util**: `wf_bf65ee4595f7`
   - Slug: `pulseguard-platform-api`
   - Status: Active

4. **Bootstrap**: `wf_1cfc55bdc0cd`
   - Slug: `pulseguard-bootstrap`
   - Status: Active
