/** Fixed platform credit; deliberately not tied to any footer setting. */
export default function StudioFooterPoweredBy() {
  return (
    <p className="w-full text-xs opacity-70">
      <a href="https://vendl.app" target="_blank" rel="noopener" className="hover:underline">
        Powered by Vendl.app
      </a>
    </p>
  );
}
