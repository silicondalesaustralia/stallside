-- Primary QR should open the website by default (custom domain / subdomain /shop).
ALTER TABLE "Stand" ALTER COLUMN "qrLinkMode" SET DEFAULT 'WEBSITE_HOME';
