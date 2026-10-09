/**
 * Namecheap registrar provider — Sandbox/production via XML API.
 */
import { allTagAttrs, attr, namecheapCall } from "./client";
import { namecheapAuExtendedAttrs, domainTld } from "./au-attrs";
import { namecheapContactParams } from "./contacts";
import { namecheapPricing, premiumPricesFromCheck } from "./pricing";
import type {
  AvailabilityResult,
  DomainRegistrarProvider,
  DomainTermPrice,
} from "../types";

export function createNamecheapRegistrar(): DomainRegistrarProvider {
  return {
    async checkAvailability(domain: string): Promise<AvailabilityResult> {
      const host = domain.trim().toLowerCase();
      const xml = await namecheapCall("namecheap.domains.check", {
        DomainList: host,
      });
      const rows = allTagAttrs(xml, "DomainCheckResult");
      const row =
        rows.find((r) => (r.Domain || "").toLowerCase() === host) || rows[0];
      if (!row) return { domain: host, available: false };
      const available = (row.Available || "").toLowerCase() === "true";
      const premium = (row.IsPremiumName || "").toLowerCase() === "true";
      const prices: DomainTermPrice[] = [];
      const prem = premium ? premiumPricesFromCheck(row) : null;
      if (prem) {
        prices.push({
          periodYears: 1,
          price: prem.price,
          renewalPrice: prem.renewal,
        });
      }
      return { domain: host, available, prices, premium };
    },

    async getRegistrationPrice(domain, periodYears) {
      return namecheapPricing(domain, "REGISTER", periodYears);
    },

    async getRenewalPrice(domain, periodYears = 1) {
      return namecheapPricing(domain, "RENEW", periodYears);
    },

    async registerDomain(input) {
      const domain = input.domain.trim().toLowerCase();
      const tld = domainTld(domain);
      const params: Record<string, string> = {
        DomainName: domain,
        Years: String(input.periodYears),
        ...namecheapContactParams(input),
        ...namecheapAuExtendedAttrs(tld, input.au),
        AddWhoisguard: "no",
        WGEnabled: "no",
      };
      if (input.nameservers?.length) {
        params.Nameservers = input.nameservers.join(",");
      }
      const xml = await namecheapCall("namecheap.domains.create", params);
      const created = allTagAttrs(xml, "DomainCreateResult")[0];
      const id =
        created?.DomainID ||
        created?.OrderID ||
        attr(xml, "DomainCreateResult", "DomainID") ||
        domain;
      return {
        registrarDomainId: String(id),
        status:
          (created?.Registered || "").toLowerCase() === "true"
            ? "registered"
            : "submitted",
        raw: {
          orderId: created?.OrderID,
          transactionId: created?.TransactionID,
        },
      };
    },

    async getDomain(domain: string) {
      const xml = await namecheapCall("namecheap.domains.getInfo", {
        DomainName: domain.trim().toLowerCase(),
      });
      const info = allTagAttrs(xml, "DomainGetInfoResult")[0] || {};
      return {
        domain: info.DomainName || domain,
        ownerName: info.OwnerName,
        status: info.Status,
        expires: info.ExpiredDate || info.ExpirationDate,
      };
    },

    async getContacts(domain: string) {
      const xml = await namecheapCall("namecheap.domains.getContacts", {
        DomainName: domain.trim().toLowerCase(),
      });
      const block =
        xml.match(/<Registrant\b[^>]*>([\s\S]*?)<\/Registrant>/i)?.[1] || xml;
      return {
        registrantEmail: firstTagText(block, "EmailAddress"),
        registrantOrg: firstTagText(block, "OrganizationName"),
        registrantFirst: firstTagText(block, "FirstName"),
        registrantLast: firstTagText(block, "LastName"),
      };
    },

    async configureNameservers(domain: string, nameservers: string[]) {
      await namecheapCall("namecheap.domains.dns.setCustom", {
        SLD: domain.split(".")[0]!,
        TLD: domainTld(domain),
        Nameservers: nameservers.join(","),
      });
    },
  };
}

function firstTagText(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return m?.[1]?.trim() || undefined;
}

export async function namecheapListTlds(): Promise<string[]> {
  const xml = await namecheapCall("namecheap.domains.getTldList");
  return allTagAttrs(xml, "Tld")
    .map((t) => (t.Name || "").toLowerCase())
    .filter(Boolean);
}
