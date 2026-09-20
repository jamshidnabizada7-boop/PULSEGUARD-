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

export function SlackLogo({ size = 20, className = '', monochrome = false }) {
  if (monochrome) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="#4A154B"
        className={className}
        aria-label="Slack"
      >
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Slack"
      data-aubergine="#4A154B"
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

export { GoogleGLogo as GoogleLogo };

export function GoogleCalendarLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Google Calendar"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#FFFFFF" />
      <path d="M18 4H6a3 3 0 0 0-3 3v2h18V7a3 3 0 0 0-3-3z" fill="#4285F4" />
      <rect x="7" y="2" width="2" height="3.5" rx="1" fill="#EA4335" />
      <rect x="15" y="2" width="2" height="3.5" rx="1" fill="#EA4335" />
      <path d="M21 9v9a3 3 0 0 1-3 3h-4v-2h4a1 1 0 0 0 1-1V9h2z" fill="#34A853" />
      <path d="M3 18a3 3 0 0 0 3 3h4v-2H6a1 1 0 0 1-1-1v-9H3v9z" fill="#FBBC05" />
      <text
        x="12"
        y="17"
        fill="#1e293b"
        fontSize="7.5"
        fontWeight="800"
        textAnchor="middle"
        fontFamily="Inter, -apple-system, sans-serif"
      >
        31
      </text>
    </svg>
  );
}

export function GoogleMapsLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Google Maps"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      <path
        d="M12 2C9.4 2 7.2 3.4 6 5.5l6 7.5 6-7.5C16.8 3.4 14.6 2 12 2z"
        fill="#4285F4"
      />
      <path
        d="M12 13l-6-7.5C5.4 6.6 5 7.7 5 9c0 3.3 3.1 8 7 13V13z"
        fill="#34A853"
      />
      <path
        d="M12 13v9c3.9-5 7-9.7 7-13 0-1.3-.4-2.4-1-3.5L12 13z"
        fill="#FBBC05"
      />
      <circle cx="12" cy="9" r="2.75" fill="#FFFFFF" />
    </svg>
  );
}

export function StripeLogo({ size = 20, className = '', color = '#635BFF' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Stripe"
    >
      <path
        d="M13.976 9.15c0-.853-.7-1.428-1.841-1.428-1.637 0-3.705.673-3.705.673l-.53-2.607s1.868-.788 4.254-.788c3.551 0 5.556 1.77 5.556 4.792 0 4.673-6.425 3.918-6.425 5.929 0 .977.854 1.517 2.052 1.517 1.895 0 4.218-.838 4.218-.838l.542 2.651s-2.023.864-4.761.864C9.52 20.915 7.5 19.144 7.5 16.21c0-4.624 6.476-3.877 6.476-7.06z"
        fill={color}
      />
    </svg>
  );
}

export function FastnMCPLogo({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Fastn MCP"
    >
      <path
        d="M13.5 2L3 13.5h7.5L9 22l12-11.5h-7.5L13.5 2z"
        fill="url(#fastn-brand-grad)"
      />
      <circle cx="9" cy="8" r="1.5" fill="#00F5D4" />
      <circle cx="15" cy="16" r="1.5" fill="#A78BFA" />
      <defs>
        <linearGradient id="fastn-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F5D4" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
export { FastnMCPLogo as FastnLogo };

export function ResendLogo({ size = 20, className = '', color = '#09090b' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Resend"
    >
      <path
        d="M5 19V5h6.5a4.5 4.5 0 0 1 4.5 4.5 4.47 4.47 0 0 1-2.5 4l3.5 5.5h-3.4l-3-4.8H8v4.8H5zm3-7.5h3.5a1.8 1.8 0 1 0 0-3.6H8v3.6z"
        fill={color}
      />
    </svg>
  );
}

export function BrandLogo({ name, size = 20, className = '', color }) {
  const key = String(name || '').toLowerCase();
  if (key.includes('hubspot')) return <HubSpotLogo size={size} className={className} />;
  if (key.includes('slack')) return <SlackLogo size={size} className={className} />;
  if (key.includes('gmail')) return <GmailLogo size={size} className={className} />;
  if (key.includes('calendar')) return <GoogleCalendarLogo size={size} className={className} />;
  if (key.includes('map')) return <GoogleMapsLogo size={size} className={className} />;
  if (key.includes('stripe')) return <StripeLogo size={size} className={className} color={color || '#635BFF'} />;
  if (key.includes('fastn')) return <FastnMCPLogo size={size} className={className} />;
  if (key.includes('resend')) return <ResendLogo size={size} className={className} color={color || '#09090b'} />;
  if (key.includes('google')) return <GoogleGLogo size={size} className={className} />;
  return null;
}

export function BrandLogoTile({ name, size = 20, className = '', tileBg }) {
  const key = String(name || '').toLowerCase();
  let defaultBg = '#FFFFFF';
  let defaultBorder = '1px solid rgba(255, 255, 255, 0.12)';
  let logoColor = undefined;

  if (key.includes('fastn')) {
    defaultBg = '#141322';
    defaultBorder = '1px solid rgba(139, 92, 246, 0.3)';
  } else if (key.includes('resend')) {
    defaultBg = '#09090b';
    defaultBorder = '1px solid rgba(255, 255, 255, 0.15)';
    logoColor = '#FFFFFF';
  } else if (key.includes('stripe')) {
    defaultBg = '#635BFF';
    defaultBorder = '1px solid rgba(99, 91, 255, 0.4)';
    logoColor = '#FFFFFF';
  }

  const bg = tileBg || defaultBg;
  const border = tileBg ? 'none' : defaultBorder;

  return (
    <div
      className={`brand-logo-tile ${className}`}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: bg,
        border,
        padding: 7,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 6px rgba(0, 0, 0, 0.28)',
      }}
    >
      <BrandLogo name={name} size={size} color={logoColor} />
    </div>
  );
}
