import WebsiteMobileSubnav from "@/components/website/WebsiteMobileSubnav";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebsiteMobileSubnav />
      {children}
    </>
  );
}
