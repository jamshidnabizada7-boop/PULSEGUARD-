# Evidence 02: Slack Churn Risk Card — Tenant Beta

**Target Channel**: `#pulseguard-beta` (`C08J8L9F7XY`)  
**Tenant**: Tenant Beta — Globex Exports (`8d8b6c6c-ec68-454c-99c6-a549b7b7e28b`)  
**Connector**: Slack (`8de5d696-5289-4c9c-ade4-de918d019d06`)  
**Trigger Event**: Usage dropped 48% WoW (Threshold 35%)  
**Status**: Verified Delivered  

### Block Kit Card Payload
```json
{
  "channel": "#pulseguard-beta",
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "🚨 PulseGuard: Churn Risk Detected (Tenant Beta)" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Customer:*\nGlobex Exports (globex-exports.com)" },
        { "type": "mrkdwn", "text": "*ARR:*\n$92,000" },
        { "type": "mrkdwn", "text": "*Health Score:*\n32 / 100" },
        { "type": "mrkdwn", "text": "*Usage Drop:*\n-48% WoW" }
      ]
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": "*Diagnosis:*\nBilling export errors detected; activity fell below 35% threshold." }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "✅ Acknowledge Risk" },
          "style": "primary",
          "url": "http://localhost:3210/api/ack?tenant=tenant-beta&customer=Globex%20Exports&by=Customer%20Success"
        }
      ]
    }
  ]
}
```
