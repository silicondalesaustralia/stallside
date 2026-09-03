import { prisma } from "@/lib/prisma";
import {
  StorefrontDomainStatus,
  StorefrontDomainType,
} from "@/generated/prisma/client";
import {
  cloudflareConfigured,
  cloudflareSaasCnameTarget,
  customDomainsFeatureEnabled,
} from "./config";
import {
  isLikelyApexHostname,
  isValidCustomHostname,
  normalizeDomainHostname,
} from "./normalize";
import { ownerCanUseCustomDomains } from "./entitlements";
import {
  cloudflareCreateCustomHostname,
  cloudflareDeleteCustomHostname,
  cloudflareGetCustomHostname,
  cloudflareHostnameProductionReady,
  defaultCnameInstructions,
} from "./provider/cloudflare";

export type DomainActionError =
  | "feature_disabled"
  | "not_entitled"
  | "invalid_hostname"
  | "apex_use_www"
  | "conflict"
  | "not_found"
  | "cloudflare_unconfigured"
  | "cloudflare_error";

export class DomainActionFailure extends Error {
  constructor(
    public readonly code: DomainActionError,
    message: string,
  ) {
    super(message);
    this.name = "DomainActionFailure";
  }
}

type OwnerEntitlement = Parameters<typeof ownerCanUseCustomDomains>[0] & {
  user?: { email?: string | null; role?: string | null };
};

export async function connectCustomDomain(input: {
  storefrontId: string;
  owner: OwnerEntitlement;
  hostname: string;
}) {
  if (!customDomainsFeatureEnabled()) {
    throw new DomainActionFailure(
      "feature_disabled",
      "Custom domains are not enabled yet.",
    );
  }
  if (
    !ownerCanUseCustomDomains(input.owner, {
      email: input.owner.user?.email,
      role: input.owner.user?.role,
      lifetimeAccess: input.owner.lifetimeAccess,
    })
  ) {
    throw new DomainActionFailure(
      "not_entitled",
      "Custom domains are included with Vendl Pro.",
    );
  }

  const hostname = normalizeDomainHostname(input.hostname);
  if (!isValidCustomHostname(hostname)) {
    throw new DomainActionFailure(
      "invalid_hostname",
      "Enter a hostname such as www.yourdomain.com.",
    );
  }
  if (isLikelyApexHostname(hostname)) {
    throw new DomainActionFailure(
      "apex_use_www",
      "Connect www.yourdomain.com for now (not the bare domain).",
    );
  }
  const conflict = await prisma.storefrontDomain.findUnique({
    where: { hostname },
    select: { storefrontId: true },
  });
  if (conflict && conflict.storefrontId !== input.storefrontId) {
    throw new DomainActionFailure(
      "conflict",
      "This domain is already connected to another Vendl store.",
    );
  }

  const cname = defaultCnameInstructions(hostname);
  let cfId: string | null = null;
  let hostnameStatus: string | null = "pending";
  let sslStatus: string | null = null;
  let verificationMethod: string | null = "cname";
  let verificationName: string | null = cname.name;
  let verificationValue: string | null = cname.value;

  if (cloudflareConfigured()) {
    try {
      const created = await cloudflareCreateCustomHostname(hostname);
      cfId = created.id;
      hostnameStatus = created.status;
      sslStatus = created.sslStatus;
      if (created.ownershipVerification?.name) {
        verificationMethod = created.ownershipVerification.type ?? "txt";
        verificationName = created.ownershipVerification.name;
        verificationValue = created.ownershipVerification.value;
      }
    } catch (e) {
      throw new DomainActionFailure(
        "cloudflare_error",
        e instanceof Error ? e.message : "Cloudflare could not create the hostname.",
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new DomainActionFailure(
      "cloudflare_unconfigured",
      "Custom domain infrastructure is not configured.",
    );
  }

  const existing = await prisma.storefrontDomain.findFirst({
    where: { storefrontId: input.storefrontId, hostname },
  });

  const data = {
    type: StorefrontDomainType.CUSTOM,
    status: StorefrontDomainStatus.VERIFYING,
    cloudflareCustomHostnameId: cfId,
    hostnameStatus,
    sslStatus,
    verificationMethod,
    verificationName,
    verificationValue,
    cnameTarget: cloudflareSaasCnameTarget(),
    lastCheckedAt: new Date(),
    errorCode: null as string | null,
    errorMessage: null as string | null,
  };

  if (existing) {
    return prisma.storefrontDomain.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.storefrontDomain.create({
    data: {
      storefrontId: input.storefrontId,
      hostname,
      isPrimary: false,
      ...data,
    },
  });
}

export async function verifyCustomDomain(input: {
  storefrontId: string;
  domainId: string;
}) {
  const row = await prisma.storefrontDomain.findFirst({
    where: {
      id: input.domainId,
      storefrontId: input.storefrontId,
      type: StorefrontDomainType.CUSTOM,
    },
  });
  if (!row) {
    throw new DomainActionFailure("not_found", "Domain not found.");
  }

  let hostnameStatus = row.hostnameStatus;
  let sslStatus = row.sslStatus;
  let status = row.status;
  let errorMessage: string | null = null;
  let verifiedAt = row.verifiedAt;
  let activatedAt = row.activatedAt;

  if (row.cloudflareCustomHostnameId && cloudflareConfigured()) {
    try {
      const cf = await cloudflareGetCustomHostname(row.cloudflareCustomHostnameId);
      hostnameStatus = cf.status;
      sslStatus = cf.sslStatus;
      if (cloudflareHostnameProductionReady(cf)) {
        status = StorefrontDomainStatus.ACTIVE;
        verifiedAt = verifiedAt ?? new Date();
        activatedAt = activatedAt ?? new Date();
      } else {
        status = StorefrontDomainStatus.VERIFYING;
        if (cf.verificationErrors.length) {
          errorMessage = cf.verificationErrors.join("; ");
        }
      }
    } catch (e) {
      status = StorefrontDomainStatus.ERROR;
      errorMessage =
        e instanceof Error ? e.message : "Could not refresh Cloudflare status.";
    }
  } else if (!cloudflareConfigured() && process.env.NODE_ENV !== "production") {
    // Local/dev without CF: allow marking active for UX testing
    status = StorefrontDomainStatus.ACTIVE;
    hostnameStatus = "active";
    sslStatus = "active";
    verifiedAt = new Date();
    activatedAt = new Date();
  }

  return prisma.storefrontDomain.update({
    where: { id: row.id },
    data: {
      status,
      hostnameStatus,
      sslStatus,
      lastCheckedAt: new Date(),
      verifiedAt,
      activatedAt,
      errorCode: status === StorefrontDomainStatus.ERROR ? "cf_status" : null,
      errorMessage,
    },
  });
}

export async function setPrimaryCustomDomain(input: {
  storefrontId: string;
  domainId: string;
}) {
  const row = await prisma.storefrontDomain.findFirst({
    where: {
      id: input.domainId,
      storefrontId: input.storefrontId,
      type: StorefrontDomainType.CUSTOM,
      status: StorefrontDomainStatus.ACTIVE,
    },
  });
  if (!row) {
    throw new DomainActionFailure(
      "not_found",
      "Only an active custom domain can be primary.",
    );
  }

  await prisma.$transaction([
    prisma.storefrontDomain.updateMany({
      where: { storefrontId: input.storefrontId, isPrimary: true },
      data: { isPrimary: false },
    }),
    prisma.storefrontDomain.update({
      where: { id: row.id },
      data: { isPrimary: true },
    }),
    // Keep Vendl subdomain rows non-primary when custom is primary
    prisma.storefrontDomain.updateMany({
      where: {
        storefrontId: input.storefrontId,
        type: StorefrontDomainType.VENDL_SUBDOMAIN,
      },
      data: { isPrimary: false },
    }),
  ]);

  return row.hostname;
}

export async function disconnectCustomDomain(input: {
  storefrontId: string;
  domainId: string;
}) {
  const row = await prisma.storefrontDomain.findFirst({
    where: {
      id: input.domainId,
      storefrontId: input.storefrontId,
      type: StorefrontDomainType.CUSTOM,
    },
  });
  if (!row) {
    throw new DomainActionFailure("not_found", "Domain not found.");
  }

  if (row.cloudflareCustomHostnameId && cloudflareConfigured()) {
    try {
      await cloudflareDeleteCustomHostname(row.cloudflareCustomHostnameId);
    } catch {
      // Still disconnect locally; CF cleanup can be retried
    }
  }

  await prisma.storefrontDomain.update({
    where: { id: row.id },
    data: {
      status: StorefrontDomainStatus.DISCONNECTED,
      isPrimary: false,
      cloudflareCustomHostnameId: null,
    },
  });

  // Restore Vendl subdomain as primary if no other custom primary
  const stillPrimary = await prisma.storefrontDomain.findFirst({
    where: {
      storefrontId: input.storefrontId,
      isPrimary: true,
      status: StorefrontDomainStatus.ACTIVE,
    },
  });
  if (!stillPrimary) {
    await prisma.storefrontDomain.updateMany({
      where: {
        storefrontId: input.storefrontId,
        type: StorefrontDomainType.VENDL_SUBDOMAIN,
      },
      data: { isPrimary: true, status: StorefrontDomainStatus.ACTIVE },
    });
  }
}
