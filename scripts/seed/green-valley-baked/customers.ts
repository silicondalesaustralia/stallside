import { CUSTOMER_SOURCE, EMAIL_SUFFIX, LIST_NAME, TAG_NAMES, weekStart, type Db, type Scope } from "./context";

export type CustomerRef = { id: string; name: string; email: string; phone: string };

const NAMES = [
  "Olivia Hart", "Liam Brooks", "Ava Thompson", "Noah Ramirez", "Mia Collins", "Ethan Park",
  "Chloe Bennett", "Lucas Grant", "Zoe Mitchell", "Mason Reed", "Lily Foster", "Jack Turner",
  "Harper Lane", "Leo Sullivan", "Ella Morgan", "Henry Walsh", "Grace Kim", "Owen Price",
  "Ruby Hayes", "Sam Delgado",
];

/** 20 shoppers (example.com addresses only), two tags and a static "Friday regulars" list. */
export async function seedCustomers(db: Db, { ownerId }: Scope): Promise<CustomerRef[]> {
  const joined = weekStart(7);
  const customers: CustomerRef[] = [];
  for (const [i, name] of NAMES.entries()) {
    const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}${EMAIL_SUFFIX}`;
    const phone = `+1 541 555 ${String(1100 + i * 37).padStart(4, "0")}`;
    const consent = i % 3 !== 2;
    const createdAt = new Date(joined.getTime() + i * 2 * 86400000);
    const row = await db.customer.create({
      data: {
        ownerId,
        email,
        name,
        phone,
        source: CUSTOMER_SOURCE,
        marketingConsent: consent,
        marketingConsentAt: consent ? createdAt : null,
        notes: i === 0 ? "Always takes two loaves; prefers the corner pieces." : null,
        createdAt,
      },
      select: { id: true },
    });
    customers.push({ id: row.id, name, email, phone });
  }

  const [regularTag, clubTag] = await Promise.all(
    TAG_NAMES.map((name) => db.customerTag.create({ data: { ownerId, name }, select: { id: true } })),
  );
  const regulars = customers.slice(0, 8);
  await db.customerTagLink.createMany({
    data: [
      ...regulars.map((c) => ({ customerId: c.id, tagId: regularTag.id })),
      ...customers.slice(8, 11).map((c) => ({ customerId: c.id, tagId: clubTag.id })),
    ],
  });
  await db.customerSegment.create({
    data: {
      ownerId,
      name: LIST_NAME,
      description: "Shoppers who pre-order the Friday bake most weeks",
      presetKey: "csv",
      rules: { staticCustomerIds: regulars.map((c) => c.id), requireEmail: true },
    },
  });
  console.log(`Customers: ${customers.length}`);
  return customers;
}
