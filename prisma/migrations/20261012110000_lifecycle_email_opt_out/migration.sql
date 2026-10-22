-- Owner unsubscribe from Vendl lifecycle / announcement emails
ALTER TABLE "Owner" ADD COLUMN "lifecycleEmailsOptOutAt" TIMESTAMP(3);
