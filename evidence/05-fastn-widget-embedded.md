# Evidence 05: Embedded Fastn Widget

**Widget ID**: `wgt_fa0d339f81d4`  
**Widget Name**: PulseGuard Integrations  
**Type**: `APP`  
**Embedded Location**: PulseGrid Analytics (`/integrations`)  
**Mount Mechanism**: Dual-mode (Server-minted 8h token + Resilient direct iframe fallback)  

### Widget Spec
- **Connector Refs**: `hubspot` (`9036a742-6baa-4c72-be3c-3789b34d6f9b`), `slack` (`8de5d696-5289-4c9c-ade4-de918d019d06`)
- **Workflow Refs**: `pulseguard-risk-engine-v2` (`wf_fe925b124168`), `pulseguard-ack-loop` (`wf_4afb70d49708`)
- **Form Schema**:
  - `slackChannel` (Alert channel)
  - `riskThreshold` (Churn risk threshold %)
- **Tenant Installations**:
  - Tenant Alpha (`1d599802-f9ad-4d62-830a-e66854c108c3`): `inst_001013f1daf0`
  - Tenant Beta (`8d8b6c6c-ec68-454c-99c6-a549b7b7e28b`): `inst_5cc2e6ec7487`
