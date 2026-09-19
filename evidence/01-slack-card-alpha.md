# Evidence 01: Slack Churn Risk Card — Tenant Alpha

**Target Channel**: `#pulseguard-alpha` (`C08J8L7C4UG`)  
**Tenant**: Tenant Alpha — Acme Corp (`1d599802-f9ad-4d62-830a-e66854c108c3`)  
**Connector**: Slack (`8de5d696-5289-4c9c-ade4-de918d019d06`)  
**Trigger Event**: Usage dropped 52% WoW (Threshold 40%)  
**Status**: Verified Delivered (2026-09-19 11:09 AM PKT)  

### Block Kit Card Payload
```json
{
  "channel": "#pulseguard-alpha",
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "🚨 PulseGuard: High Churn Risk Alert" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Customer:*\nAcme Corp (acme-corp.com)" },
        { "type": "mrkdwn", "text": "*ARR:*\n$48,000" },
        { "type": "mrkdwn", "text": "*Health Score:*\n38 / 100" },
        { "type": "mrkdwn", "text": "*Usage Drop:*\n-52% WoW" }
      ]
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": "*Diagnosis:*\nAdmin logins absent for 10 days; session count dropped 52% week-over-week." }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "✅ Acknowledge Risk" },
          "style": "primary",
          "url": "http://localhost:3210/api/ack?tenant=tenant-alpha&customer=Acme%20Corp&by=Customer%20Success"
        }
      ]
    }
  ]
}
```
