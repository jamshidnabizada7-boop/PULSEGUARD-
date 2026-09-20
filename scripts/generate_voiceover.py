import asyncio
import os
import edge_tts

VOICE = "en-US-ChristopherNeural"  # Authoritative, polished, clear tech executive voice

SCENES = [
    {
        "id": "scene0_intro",
        "text": "Customers rarely cancel out of nowhere — product usage fades weeks earlier. This is PulseGuard: an autonomous customer retention engine built entirely on Fastn's governed runtime for the Build with Fastn Hackathon.",
        "rate": "+2%"
    },
    {
        "id": "scene1_dashboard_ai",
        "text": "Notice Acme Corp: weekly usage dropped sixteen percent, crossing our retention threshold with forty-eight thousand dollars ARR at risk. When we trigger Sync Telemetry, Fastn ingests customer telemetry, evaluates the threshold, writes a diagnosis to HubSpot CRM, and alerts Slack and email. Opening the AI assistant dock, we ask which account needs attention. The assistant evaluates live telemetry and renders an interactive Fastn tool card to execute the closed loop.",
        "rate": "+2%"
    },
    {
        "id": "scene2_integrations",
        "text": "Navigating to Integrations: Fastn's 8-connector MCP catalog manages live connections across Slack, HubSpot, Gmail, Calendar, Maps, Stripe, and Resend. Real-time glowing status pills show operational health, while diagnostic pings verify tenant-isolated routing.",
        "rate": "+2%"
    },
    {
        "id": "scene3_emails",
        "text": "In our Email Operations console, every outbound retention alert is tracked with full auditability. Opening the decoupled Email Reader reveals a live delivery stepper from sent to delivered, alongside the exact visual alert rendered for account owners.",
        "rate": "+2%"
    },
    {
        "id": "scene4_activity",
        "text": "On the Activity page, PulseGuard provides a granular audit trail. Every step — from diagnostic probes and inbound webhooks to Fastn runtime executions — is recorded with precise timestamps and tenant isolation.",
        "rate": "+2%"
    },
    {
        "id": "scene5_closing",
        "text": "Behind PulseGuard is an enterprise architecture orchestrated through Fastn's MCP gateway with strict multi-tenant security. Explore our live deployment on Vercel and our open-source GitHub repository. PulseGuard: from telemetry to retained customers, powered by Fastn.",
        "rate": "+2%"
    }
]

async def main():
    out_dir = os.path.join(os.path.dirname(__file__), "..", "video-project", "public", "audio")
    os.makedirs(out_dir, exist_ok=True)
    
    for scene in SCENES:
        out_path = os.path.join(out_dir, f"{scene['id']}.mp3")
        print(f"Generating {scene['id']}...")
        communicate = edge_tts.Communicate(scene['text'], VOICE, rate=scene.get('rate', '+0%'))
        await communicate.save(out_path)
        print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    asyncio.run(main())
