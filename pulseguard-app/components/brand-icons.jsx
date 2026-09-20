// PulseGuard Brand Logos & Tiles
// Real inline SVGs: HubSpot sprocket (#FF7A29), Slack hash (#4A154B / multi-color),
// Gmail red/multi-color M (#EA4335), Google G (#4285F4).

export function HubSpotLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="#FF7A29"
      className={className}
      aria-label="HubSpot"
    >
      <path d="M22.8 11.2V8.4c1.1-.5 1.9-1.6 1.9-2.9 0-1.8-1.4-3.2-3.2-3.2s-3.2 1.4-3.2 3.2c0 1.3.8 2.4 1.9 2.9v2.8a8.3 8.3 0 0 0-3.1 1.7L9.9 8.2c.1-.4.2-.8.2-1.2 0-2.3-1.9-4.2-4.2-4.2S1.7 4.7 1.7 7s1.9 4.2 4.2 4.2c.8 0 1.5-.2 2.1-.6l7.1 4.7c-.3.8-.5 1.7-.5 2.7 0 .9.2 1.8.5 2.7l-7.1 4.7c-.6-.4-1.3-.6-2.1-.6-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2 4.2-1.9 4.2-4.2c0-.4-.1-.8-.2-1.2l7.2-4.7a8.3 8.3 0 0 0 3.1 1.7v2.8c-1.1.5-1.9 1.6-1.9 2.9 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2c0-1.3-.8-2.4-1.9-2.9v-2.8a8.5 8.5 0 0 0 0-15.6zm-6.3 7.8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
    </svg>
  );
}

export function SlackLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Slack"
    >
      <path
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"
        fill="#E01E5A"
      />
      <path
        d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
        fill="#E01E5A"
      />
      <path
        d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z"
        fill="#36C5F0"
      />
      <path
        d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
        fill="#36C5F0"
      />
      <path
        d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z"
        fill="#2EB67D"
      />
      <path
        d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
        fill="#2EB67D"
      />
      <path
        d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z"
        fill="#ECB22E"
      />
      <path
        d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
        fill="#ECB22E"
      />
    </svg>
  );
}

export function GmailLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Gmail"
    >
      <path d="M3.5 19h2.8v-8.4L2 7.4v10.1c0 .8.7 1.5 1.5 1.5z" fill="#4285F4" />
      <path d="M17.7 19h2.8c.8 0 1.5-.7 1.5-1.5V7.4l-4.3 3.2V19z" fill="#34A853" />
      <path
        d="M17.7 10.6l4.3-3.2c.7-.5.7-1.5 0-2l-2-1.5c-.7-.5-1.7-.5-2.3 0L12 8.3 6.3 3.9c-.6-.5-1.6-.5-2.3 0l-2 1.5c-.7.5-.7 1.5 0 2l4.3 3.2v-3.7l5.7 4.3 5.7-4.3v3.7z"
        fill="#EA4335"
      />
      <path d="M17.7 6.9V10.6L12 14.9l-5.7-4.3V6.9l5.7 4.3 5.7-4.3z" fill="#FBBC05" />
    </svg>
  );
}

export function GoogleGLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Google"
    >
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.1C3.25 21.36 7.34 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.14-1.6.38-2.32V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.1z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function BrandLogo({ name, size = 20, className = '' }) {
  const key = String(name || '').toLowerCase();
  if (key.includes('hubspot')) return <HubSpotLogo size={size} className={className} />;
  if (key.includes('slack')) return <SlackLogo size={size} className={className} />;
  if (key.includes('gmail')) return <GmailLogo size={size} className={className} />;
  if (key.includes('google')) return <GoogleGLogo size={size} className={className} />;
  return null;
}

export function BrandLogoTile({ name, size = 20, className = '' }) {
  return (
    <div
      className={`brand-logo-tile ${className}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: 9,
        background: '#FFFFFF',
        padding: 6,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
      }}
    >
      <BrandLogo name={name} size={size} />
    </div>
  );
}
