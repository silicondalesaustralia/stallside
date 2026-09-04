const ERROR_COPY: Record<string, string> = {
  feature_disabled: "Custom domains are not enabled on this environment yet.",
  not_entitled: "Custom domains are included with Vendl Pro.",
  invalid_hostname: "Enter a hostname such as www.yourdomain.com.",
  apex_use_www:
    "Connect www.yourdomain.com for now — bare domains (yourdomain.com) aren’t supported yet. You can redirect the bare domain to www at your DNS host.",
  conflict: "This domain is already connected to another Vendl store.",
  cloudflare_unconfigured: "Domain infrastructure is not configured yet.",
  cloudflare_error: "Cloudflare could not process that domain. Try again shortly.",
  not_found: "Domain not found.",
};

export default function DomainsFlash({
  purchased,
  connected,
  checked,
  primary,
  disconnected,
  error,
}: {
  purchased?: string;
  connected?: string;
  checked?: string;
  primary?: string;
  disconnected?: string;
  error?: string;
}) {
  return (
    <>
      {purchased ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Payment received — we&apos;re registering and connecting your domain.
        </p>
      ) : null}
      {connected ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Domain connected — add the DNS record below.
        </p>
      ) : null}
      {checked ? (
        <p className="text-sm text-[var(--leaf-dark)]">Status refreshed.</p>
      ) : null}
      {primary ? (
        <p className="text-sm text-[var(--leaf-dark)]">Primary domain updated.</p>
      ) : null}
      {disconnected ? (
        <p className="text-sm text-[var(--leaf-dark)]">Domain disconnected.</p>
      ) : null}
      {error && ERROR_COPY[error] ? (
        <p className="text-sm text-[var(--gone)]">{ERROR_COPY[error]}</p>
      ) : null}
    </>
  );
}
