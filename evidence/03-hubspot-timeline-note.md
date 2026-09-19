# Evidence 03: HubSpot Timeline Note Creation

**Target Portal**: Tenant Alpha HubSpot Connection (`45e0c3c0-fb8b-48c8-938b-b257bb954123`)  
**Target Company ID**: `347506893507` (Acme Corp)  
**Fastn Connector**: HubSpot (`9036a742-6baa-4c72-be3c-3789b34d6f9b`)  
**Status**: Verified Live via Fastn Workflow `wf_fe925b124168`  

### Timeline Note Object Created
```json
{
  "properties": {
    "hs_note_body": "<h3>[PulseGuard Churn Radar]</h3><p><strong>Status:</strong> HIGH CHURN RISK</p><p><strong>Trigger:</strong> Usage dropped 52% WoW (Threshold 40%). Current Health Score: 38/100.</p><p><strong>Diagnostics:</strong> Admin logins absent 10 days; API usage decreased 44%.</p><p><strong>Action:</strong> Automated alert sent to #pulseguard-alpha. Awaiting Customer Success acknowledgement.</p>",
    "hs_timestamp": "2026-09-19T06:09:12.441Z"
  },
  "associations": [
    {
      "to": { "id": "347506893507" },
      "types": [{ "associationCategory": "HUBSPOT_DEFINED", "associationTypeId": 190 }]
    }
  ]
}
```
