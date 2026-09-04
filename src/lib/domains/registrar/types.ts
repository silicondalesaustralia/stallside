/** Domain registrar provider contract (Namecheap active candidate). */

export type MoneyCents = {
  currencyCode: string;
  value: number;
};

export type DomainTermPrice = {
  periodYears: number;
  price: MoneyCents;
  renewalPrice?: MoneyCents;
};

export type AvailabilityResult = {
  domain: string;
  available: boolean;
  prices?: DomainTermPrice[];
  premium?: boolean;
};

export type SuggestionItem = {
  domain: string;
  prices?: DomainTermPrice[];
};

export type RegistrantContact = {
  firstName: string;
  lastName: string;
  organization?: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

/** AU extended attributes — map to Namecheap COMAU* fields behind the provider. */
export type AuEligibility = {
  eligibilityType: string;
  eligibilityId?: string;
  eligibilityIdType?: string;
  eligibilityName?: string;
  registrantLegalName?: string;
  policyReason?: string;
};

export type DomainRegistrarProvider = {
  checkAvailability(domain: string): Promise<AvailabilityResult>;
  searchDomains?(query: string, tlds: string[]): Promise<SuggestionItem[]>;
  getRegistrationPrice(
    domain: string,
    periodYears: number,
  ): Promise<MoneyCents>;
  getRenewalPrice(domain: string, periodYears?: number): Promise<MoneyCents>;
  registerDomain(input: {
    domain: string;
    periodYears: number;
    registrant: RegistrantContact;
    admin?: RegistrantContact;
    tech?: RegistrantContact;
    billing?: RegistrantContact;
    au?: AuEligibility;
    nameservers?: string[];
    idempotencyKey: string;
  }): Promise<{ registrarDomainId: string; status: string; raw?: unknown }>;
  getDomain?(domain: string): Promise<unknown>;
  renewDomain?(domain: string, periodYears: number): Promise<unknown>;
  getContacts?(domain: string): Promise<unknown>;
  updateContacts?(
    domain: string,
    contacts: { registrant?: RegistrantContact },
  ): Promise<void>;
  getTransferInfo?(domain: string): Promise<unknown>;
  configureNameservers?(domain: string, nameservers: string[]): Promise<void>;
};
