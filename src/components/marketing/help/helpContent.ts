import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CircleDollarSign,
  FileText,
  MapPin,
  Megaphone,
  Palette,
  Receipt,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react'
import {
  AI_RECEPTIONIST_CATEGORY,
  HELP_ARTICLE_ALIASES as COMMUNICATIONS_HELP_ARTICLE_ALIASES,
  MISSED_CALL_AI_CATEGORY,
  PHONE_SMS_CATEGORY,
} from '@/components/marketing/help/helpCommunicationsContent'
import {
  ACCOUNTS_BOOKKEEPING_CATEGORY,
  ACCOUNTS_HELP_ARTICLE_ALIASES,
} from '@/components/marketing/help/helpAccountsContent'
import {
  JOBS_SCHEDULING_CATEGORY,
  JOBS_SCHEDULING_HELP_ARTICLE_ALIASES,
} from '@/components/marketing/help/helpCalendarContent'
import {
  CRM_HELP_ARTICLE_ALIASES,
  LEADS_CRM_CATEGORY,
} from '@/components/marketing/help/helpCrmContent'
import {
  GETTING_STARTED_CATEGORY,
  GETTING_STARTED_HELP_ARTICLE_ALIASES,
} from '@/components/marketing/help/helpGettingStartedContent'
import {
  SOCIAL_HELP_ARTICLE_ALIASES,
  SOCIAL_MEDIA_CATEGORY,
} from '@/components/marketing/help/helpSocialContent'

export type HelpFaqQuestion = {
  id: string
  q: string
  a: string
  keywords?: readonly string[]
  /** Optional in-category scan label. Presentation only. */
  group?: string
}

export type HelpFaqCategory = {
  id: string
  title: string
  sidebarLabel: string
  description: string
  icon: LucideIcon
  chipIds: readonly string[]
  keywords?: readonly string[]
  questions: readonly HelpFaqQuestion[]
}

export const HELP_ARTICLE_ALIASES: Record<string, string> = {
  ...COMMUNICATIONS_HELP_ARTICLE_ALIASES,
  ...SOCIAL_HELP_ARTICLE_ALIASES,
  ...ACCOUNTS_HELP_ARTICLE_ALIASES,
  ...GETTING_STARTED_HELP_ARTICLE_ALIASES,
  ...CRM_HELP_ARTICLE_ALIASES,
  ...JOBS_SCHEDULING_HELP_ARTICLE_ALIASES,
}

export const HELP_CHIP_TOPICS = [
  { id: 'all', label: 'All Topics' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'communications', label: 'Communications' },
  { id: 'leads-crm', label: 'Leads & CRM' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'payments', label: 'Payments' },
  { id: 'social', label: 'Social' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'billing-usage', label: 'Billing & Usage' },
  { id: 'pricing', label: 'Pricing' },
] as const

export type HelpChipId = (typeof HELP_CHIP_TOPICS)[number]['id']

export const HELP_FAQ_CATEGORIES: readonly HelpFaqCategory[] = [
  GETTING_STARTED_CATEGORY,
  AI_RECEPTIONIST_CATEGORY,
  MISSED_CALL_AI_CATEGORY,
  PHONE_SMS_CATEGORY,
  LEADS_CRM_CATEGORY,
  {
    id: 'quotes',
    title: 'Quotes',
    sidebarLabel: 'Quotes',
    description: 'Build, brand, send, and get quotes accepted online.',
    icon: FileText,
    chipIds: ['quotes'],
    questions: [
      {
        id: 'build-quotes',
        q: 'Can I build quotes in StitchedUp?',
        a: 'Yes. StitchedUp includes a quote builder designed specifically for trade jobs.',
      },
      {
        id: 'gst',
        q: 'Can I add GST?',
        a: 'Yes. Quotes can include GST.',
      },
      {
        id: 'terms-expiry',
        q: 'Can I add terms and expiry dates?',
        a: 'Yes. Quotes support terms and expiry dates.',
      },
      {
        id: 'online-acceptance',
        q: 'Can customers accept quotes online?',
        a: 'Yes. StitchedUp includes a client quote acceptance flow.',
      },
      {
        id: 'branded-pdfs',
        q: 'Are quote PDFs branded?',
        a: 'Yes. Branded quote PDFs are included.',
      },
      {
        id: 'quote-to-job',
        q: 'Can an accepted quote become a job?',
        a: 'The quote is already tied to a customer and usually to a job. Sending or accepting the quote can update that job’s stage (for example Quote Sent or Quote Accepted). It does not create a new customer or convert a lead into a customer.',
      },
    ],
  },
  JOBS_SCHEDULING_CATEGORY,
  {
    id: 'invoices-payments',
    title: 'Invoices & Payments',
    sidebarLabel: 'Invoices & Payments',
    description: 'Invoice, collect deposits, and track what is paid.',
    icon: Receipt,
    chipIds: ['payments'],
    questions: [
      {
        id: 'invoice-without-quote',
        q: 'Can I invoice without creating a quote?',
        a: 'Yes. StitchedUp includes a standalone invoice builder.',
      },
      {
        id: 'deposit',
        q: 'Can I take a deposit?',
        a: 'Yes. Deposit invoice flows are included.',
      },
      {
        id: 'progress-payments',
        q: 'Can I invoice progress payments?',
        a: 'Yes. StitchedUp supports multiple payment stages through its invoicing and payment workflows.',
      },
      {
        id: 'final-balance',
        q: 'Can I send a final balance invoice?',
        a: 'Yes. Final balance invoice flow is included.',
      },
      {
        id: 'bank-transfer',
        q: 'Can customers pay by bank transfer?',
        a: 'Yes. A direct bank transfer flow is included.',
        keywords: ['customer bank transfer', 'bsb', 'bank transfer'],
      },
      {
        id: 'card-payments',
        q: 'Can customers pay by card?',
        a: 'Yes. Card payments can be handled through connected payment providers.',
      },
      {
        id: 'payment-status',
        q: 'How does payment status tracking work?',
        a: 'On invoices and jobs, StitchedUp shows what has been invoiced, paid, part paid, or still outstanding.\n\nThat is customer money in - not Accounts Profit & Loss, and not supplier bills. For matching a bank line to a customer payment, see Accounts → Banking (if Accounts Banking is enabled).',
      },
      {
        id: 'hold-money',
        q: "Does StitchedUp hold my customer's money?",
        a: 'No. StitchedUp itself is not the payment custodian. Payment processing and protected-payment functionality are handled through connected payment providers.',
      },
      {
        id: 'bank-transfer-default',
        q: 'Is bank transfer the normal way to get paid?',
        keywords: ['customer bank transfer', 'bsb', 'bank transfer'],
        a: 'Yes. The simplest path is invoice on completion with direct bank transfer - no card setup required. Stripe card payment paths (single payment, deposit + balance, or milestones) are optional extras for jobs where you want card authorisation before or during the work. See Payment Protection for when to use those.',
      },
    ],
  },
  {
    id: 'payment-protection',
    title: 'Payment Protection',
    sidebarLabel: 'Payment Protection',
    description: 'Optional Stripe card paths for larger jobs - bank transfer always available.',
    icon: ShieldCheck,
    chipIds: ['payments'],
    questions: [
      {
        id: 'what-is-protection',
        q: 'What is Payment Protection?',
        a: 'Payment Protection is StitchedUp\'s name for optional Stripe card payment flows - not a separate escrow account. When a customer accepts a quote, they can choose card payment (authorised or collected via Stripe) instead of paying by direct bank transfer. StitchedUp does not hold customer funds; Stripe processes the card.',
      },
      {
        id: 'every-job',
        q: 'Do I have to use Payment Protection on every job?',
        a: 'No. Direct bank transfer ("Invoice on completion") is always available and is the default simple path. Card paths are optional per job when the customer accepts the quote - use them when you want card security on larger jobs, not for every invoice.',
      },
      {
        id: 'protected-flow',
        q: 'How do the card payment options work?',
        a: 'When a quote is accepted, the customer (or you on their behalf) picks a path: Single card payment - card authorised up front, charged when the job is complete. Deposit + balance - split percentage via card (e.g. 50/50). Milestones - 2-10 staged card payments with triggers you define. Each path sets the job\'s payment_path in StitchedUp and creates the right invoices/milestones.',
      },
      {
        id: 'threshold',
        q: 'Why does StitchedUp recommend card payment on some quotes?',
        a: 'Settings → Payment & Quoting includes a payment protection threshold. When a quote total is at or above that amount, the quote builder highlights that card payment is recommended for larger jobs. You can change the threshold or ignore the suggestion - it is guidance, not a lock.',
      },
      {
        id: 'money-released',
        q: 'When is the money released?',
        a: 'For Stripe card paths, funds follow Stripe\'s settlement timing after capture/charge - typically a few business days to your connected Stripe account, depending on your Stripe settings. Direct bank transfer jobs are paid outside StitchedUp when the customer pays your BSB/account details on the invoice.',
      },
      {
        id: 'pay-directly',
        q: 'Can the customer still pay me by bank transfer?',
        a: 'Yes. Choose "Invoice on completion" / direct bank transfer at quote acceptance, or send a standard invoice after the job. Most tradies use bank transfer for everyday work and card paths only when they want extra payment certainty.',
      },
      {
        id: 'payment-fees',
        q: 'Are there additional payment fees?',
        a: 'Stripe card processing fees apply to card payment paths (per Stripe\'s pricing). Direct bank transfer has no StitchedUp card-processing fee. Fee visibility depends on your Stripe connection - check before confirming a card path with the customer.',
      },
    ],
  },
  ACCOUNTS_BOOKKEEPING_CATEGORY,
  {
    id: 'reviews-growth',
    title: 'Reviews & Growth',
    sidebarLabel: 'Reviews & Growth',
    description: 'Request reviews and turn completed work into growth.',
    icon: Star,
    chipIds: [],
    questions: [
      {
        id: 'google-reviews',
        q: 'Can StitchedUp request Google reviews?',
        a: 'Yes. Google review automation and review-request templates are included.',
      },
      {
        id: 'when-sent',
        q: 'When is the review request sent?',
        a: 'The review flow is designed to follow job completion.',
      },
      {
        id: 'customise-review',
        q: 'Can I customise the review message?',
        a: 'Yes. Review-request templates can be tailored to your business.',
      },
      {
        id: 'poor-review',
        q: 'What happens if a customer leaves a poor review?',
        a: 'StitchedUp can manage the request workflow, but reviews are ultimately controlled by the external review platform.',
      },
      {
        id: 'marketing-jobs',
        q: 'Can completed jobs be used for marketing?',
        a: 'Yes. Completed jobs and job photos can be used as the basis for marketing content.',
      },
    ],
  },
  SOCIAL_MEDIA_CATEGORY,
  {
    id: 'branding',
    title: 'Branding',
    sidebarLabel: 'Branding',
    description: 'Make quotes, invoices, and emails look like your business.',
    icon: Palette,
    chipIds: [],
    questions: [
      {
        id: 'logo',
        q: 'Can I add my logo?',
        a: 'Yes. Upload a logo under Settings → Business Profile. The Setup Guide ticks the logo item when a file is saved. See Getting Started - How do I add my logo and brand?',
      },
      {
        id: 'colours',
        q: 'Can I customise colours?',
        a: 'Yes. Set brand colour in Settings → Business Profile. Colour alone does not complete the Setup Guide logo item. See Getting Started - How do I add my logo and brand?',
      },
      {
        id: 'quotes-branded',
        q: 'Are quotes branded?',
        a: 'Yes.',
      },
      {
        id: 'invoices-branded',
        q: 'Are invoices branded?',
        a: 'Yes.',
      },
      {
        id: 'emails-branded',
        q: 'Are emails sent under my business branding?',
        a: 'Yes. The email template builder and brand customisation help communication look like it comes from your business rather than a generic software platform.',
      },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting & Profitability',
    sidebarLabel: 'Reporting',
    description: 'Operational job reports - not the same as Accounts Profit & Loss.',
    icon: BarChart3,
    chipIds: [],
    questions: [
      {
        id: 'revenue',
        q: 'Can I see revenue?',
        a: 'Owners, managers, and office / VA can see operational revenue on the dashboard and Reports.\n\nThat is a working snapshot for running the business. Formal period Profit & Loss lives under Accounts when that feature is enabled - see What is Profit & Loss?\n\nField staff do not get Reports or internal costing. Accountants use Accounts, not Reports.',
      },
      {
        id: 'profitability',
        q: 'Can I track job profitability?',
        a: 'Owners, managers, and office / VA can use two operational places: the profitability card on a job (when Job Costing is on in Settings), and the Reports page.\n\nThose views are for day-to-day job profit. They are not Accounts Profit & Loss. Reports, the job card, and P&L use different scope, status, and date rules - so the numbers can differ. See Why don’t my profit numbers match?\n\nField staff do not see internal margin or costing. Accountants do not get Reports. They use Accounts instead.',
      },
      {
        id: 'completed-jobs',
        q: 'Can I see completed jobs?',
        a: 'People who can open Reports can review completed work there. Field staff only see completed jobs that are assigned to them on Jobs. Accountants do not use the jobs list or Reports.',
      },
      {
        id: 'team-activity',
        q: 'Can I see team activity?',
        a: 'Owners, managers, and office / VA get operational visibility across jobs and customers they can open. This is operational reporting, not a bookkeeping ledger. Field staff only see their assigned jobs.',
      },
      {
        id: 'who-can-see-reports',
        q: 'Who can open Reports?',
        keywords: ['reports', 'field', 'accountant', 'office'],
        a: 'Owners, managers, and office / VA can open the operational Reports page.\n\nField staff (tradesperson / apprentice) cannot. Accountants cannot - they use Accounts instead.\n\nQuotes-only and Social-only are limited product modes, not team roles, and do not use Reports as part of their usual work.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    sidebarLabel: 'Pricing',
    description: 'How pricing works and what is included in every plan.',
    icon: CircleDollarSign,
    chipIds: ['pricing'],
    questions: [
      {
        id: 'everything-included',
        q: 'Is everything included?',
        a: 'Yes. Every member gets access to the full StitchedUp platform rather than being pushed into feature tiers.',
      },
      {
        id: 'feature-tiers',
        q: 'Are there feature tiers?',
        a: 'No. The system and feature set remain the same. The difference is the price available when you join.',
      },
      {
        id: 'price-increases',
        q: 'Why does the price increase after each group of members?',
        a: 'Early members receive a lower price for joining during the rollout. Once each allocation is filled, the joining price increases.',
      },
      {
        id: 'price-locked',
        q: 'Is my price locked in?',
        a: 'Founding-member pricing is designed to lock in the price available when you join.',
      },
      {
        id: 'setup-fees',
        q: 'Are there setup fees?',
        a: 'No separate setup fee is currently charged.',
      },
      {
        id: 'processing-fees',
        q: 'Are payment-processing fees separate?',
        a: 'Yes. Third-party payment-processing fees are separate from the StitchedUp platform price where applicable.',
      },
      {
        id: 'if-not-subscribed',
        q: 'What happens if I do not subscribe?',
        a: 'You can create an account and complete setup, but paid product access stays locked until you choose a plan and complete checkout on the Billing page. Nothing is deleted just because you have not subscribed yet.',
      },
      {
        id: 'when-charged',
        q: 'When am I charged?',
        a: 'You are charged when you choose a plan and complete checkout. Your card is then billed monthly. Founding-member pricing locks in the rate available when you join.',
      },
      {
        id: 'past-due-grace',
        q: 'What happens if a subscription payment fails?',
        a: 'If a renewal payment fails, your account enters a past-due state. You keep dashboard access for 14 days while you update your payment method on Billing. After that grace period, access is paused until payment is resolved.',
      },
      {
        id: 'money-back',
        q: 'How does the 30-day money-back guarantee work?',
        a: "StitchedUp is a paid monthly subscription from day one. If it isn't right for you, contact us within 30 days of starting your paid subscription and we'll review your refund request under our 30-day money-back guarantee. Eligibility and timing are shown on your Billing page.",
      },
      {
        id: 'pricing-and-plans',
        q: 'What does StitchedUp cost?',
        a: 'StitchedUp is a paid subscription from day one. Pricing depends on when you join: $97 AUD/month for the first 100 businesses (Founding Member), $197 AUD/month for the next 100 (Growth), then $297 AUD/month (Standard). Every paid plan includes a 30-day money-back guarantee from your first payment.',
      },
      {
        id: 'cancel',
        q: 'Can I cancel anytime?',
        a: 'Yes. You can cancel anytime from Billing. Cancellation stops the next renewal - you keep access until the end of the period you have already paid for. Cancelling does not automatically refund unused time. If you are within 30 days of starting your paid subscription, you can contact us about the money-back guarantee.',
      },
    ],
  },
  {
    id: 'team',
    title: 'Team & Permissions',
    sidebarLabel: 'Team',
    description: 'Invite staff, choose roles, and understand seats, jobs, and access.',
    icon: Users,
    chipIds: [],
    keywords: [
      'team',
      'staff',
      'employee',
      'tradie',
      'tradesperson',
      'apprentice',
      'manager',
      'office',
      'va',
      'accountant',
      'permissions',
      'access',
      'invite',
      'seat',
    ],
    questions: [
      {
        id: 'who-manages-team',
        q: 'Who can invite team members?',
        keywords: ['invite', 'owner', 'team admin'],
        a: 'Only the business owner can send invites, revoke pending invites, and remove members. Go to Settings → Team. Managers and other staff cannot manage Team or Billing.',
      },
      {
        id: 'seat-limit',
        q: 'How many team seats are included?',
        keywords: ['seat', 'five', 'accountant seat'],
        a: 'Your plan includes up to five active team seats. Those seats count tradespeople, apprentices, office / VA, and managers.\n\nThe owner does not use a team seat. Accountants do not use a team seat.\n\nPending invites do not use a seat until the person joins. You still cannot invite another tradesperson, office / VA, or manager if all five seats are already filled - revoke is not required to free a seat, because a pending invite is not counted. Remove an active member first. Accountant invites are allowed even when seats are full.',
      },
      {
        id: 'permission-presets',
        q: 'What roles can I choose when inviting someone?',
        keywords: ['roles', 'manager', 'office', 'va', 'tradesperson', 'apprentice', 'accountant'],
        a: 'Choose a role on Settings → Team:\n- Owner (already on the account) - full access, including team, billing and finance settings.\n- Manager - business-wide jobs, customers, quotes, invoices, and day-to-day operations. Not Billing or Team admin.\n- Office / VA - jobs, customers, quotes, invoices, and calendar across the business, without owner-level admin.\n- Tradesperson - assigned jobs only, with the job details and tools needed on site.\n- Apprentice - same field access as a tradesperson (assigned jobs only).\n- Accountant (when available) - finance-only: Accounts and finance workflows. No jobs, CRM, calendar, quotes, Social, Reports, Billing, or Team admin.\n\nTradesperson and Apprentice are the same field access. Choosing a role sets their access. You cannot flip individual permissions later from Team.',
      },
      {
        id: 'permission-toggles',
        q: 'What do the role permissions cover?',
        keywords: ['permissions', 'send quotes', 'view crm', 'upload photos'],
        a: 'Each role includes a recommended set of permissions:\n- Send quotes - create and send quotes to customers.\n- Mark jobs done - mark assigned or accessible jobs as completed.\n- Upload photos - add job photos and proof of work.\n- Send invoices - create and send invoices to customers.\n- View CRM - view customers and business-wide customer records.\n\nThese are not the whole access model. Role and job assignment rules may also limit what a team member can access. Field staff do not browse every job even if they can open Jobs. You cannot adjust these one-by-one after invite - remove the person and send a new invite with a different role.',
      },
      {
        id: 'send-invite',
        q: 'How do I invite someone?',
        keywords: ['invite', 'email', 'expire'],
        a: 'On Settings → Team, enter their email, choose a role, and send. They receive an email with an accept link. Invites expire after 14 days.\n\nIf that email already has a pending invite, revoke it first to send a new one. If they are already on your team, you cannot invite them again. An email already used on another StitchedUp business cannot join this one yet.',
      },
      {
        id: 'accept-invite',
        q: 'What happens when someone accepts an invite?',
        keywords: ['accept', 'password', 'join'],
        a: 'They open the email link, set a password if needed, then join your business. After they accept they appear under Active members. Tradespeople, office / VA, and managers then use a team seat. Accountants do not.\n\nDo not create a separate owner signup for invited staff - they should accept the invite for your business.',
      },
      {
        id: 'field-staff-jobs',
        q: 'What can a tradesperson or apprentice see?',
        keywords: ['assigned jobs', 'field', 'tradesperson', 'apprentice', 'calendar'],
        a: 'They only see jobs assigned to them. Their calendar shows those assigned jobs. They can use operational job tools on those jobs (update progress, mark done, upload photos) and see the customer and site details they need on site.\n\nThey do not see business-wide CRM, internal margin or costing, Accounts, Billing, Team admin, Social, Reports, or AI / phone settings.',
      },
      {
        id: 'change-role',
        q: 'Can I change someone’s role later?',
        keywords: ['change role', 'edit member', 'permissions'],
        a: 'Not from Team today. You can see their current role on the member list. To change access, remove them and send a new invite with the right role. They lose access as soon as you remove them.',
      },
      {
        id: 'remove-member',
        q: 'How do I remove someone from my team?',
        keywords: ['remove', 'deactivate'],
        a: 'On Settings → Team, use Remove next to the member. They lose access immediately. Removing a tradesperson, office / VA, or manager frees a team seat. Removing an accountant does not change the seat count.',
      },
      {
        id: 'limited-product-access',
        q: 'Are Quotes-only and Social-only staff roles?',
        keywords: ['quotes-only', 'social-only', 'limited access'],
        a: 'No. Those are limited product access modes for some logins - not roles you pick when inviting staff.\n\nQuotes-only is focused on quoting-related work. Social-only is focused on Social tools. They are not the same as Tradesperson, Office / VA, Manager, or Accountant.',
      },
    ],
  },
  {
    id: 'arrival-tracking',
    title: 'Track My Arrival',
    sidebarLabel: 'Track My Arrival',
    description: 'Share a live ETA with customers when you head to a scheduled job.',
    icon: MapPin,
    chipIds: [],
    questions: [
      {
        id: 'what-is-arrival-tracking',
        q: 'What is Track My Arrival?',
        a: 'When you tap On my way on a job, StitchedUp shares your live location with the customer on a branded tracking page. They see an estimated arrival time that updates as you travel - no need to call or text manually.',
      },
      {
        id: 'enable-arrival-tracking',
        q: 'How do I turn it on?',
        a: 'Go to Settings and enable Track My Arrival under customer communication. The On my way button only appears on jobs when this toggle is on.',
      },
      {
        id: 'on-my-way-requirements',
        q: 'Why don\'t I see the On my way button?',
        a: 'The job needs a customer phone number, a site address, and a scheduled start time on the calendar. The job stage must be Contacted, Quote accepted, or In progress. Track My Arrival must also be enabled in Settings.',
      },
      {
        id: 'arrival-sms',
        q: 'Does the customer get an SMS?',
        a: 'Yes - when you start tracking, StitchedUp sends an SMS from your business number with a link to the live map. SMS requires an approved, active business phone number. Until that is set up, you will see a warning on Settings and the job page.',
      },
      {
        id: 'customer-tracking-page',
        q: 'What does the customer see?',
        a: 'They open a public tracking page (no login) showing your business name, destination address, a map, and an ETA such as "About 12 mins away." The page refreshes automatically while your session is active.',
      },
      {
        id: 'tradie-on-the-way-page',
        q: 'What do I see after tapping On my way?',
        a: 'You are taken to an on-the-way screen for that job. Your phone shares location updates while the session runs. Tap Arrived when you reach the site, or Cancel to stop sharing. Sessions auto-expire after about two hours if not ended manually.',
      },
      {
        id: 'arrival-privacy',
        q: 'When does location sharing stop?',
        a: 'Sharing stops when you mark Arrived, cancel the session, or the session expires. Customers cannot see your location after the session ends.',
      },
    ],
  },
  {
    id: 'week-ahead',
    title: 'Your Week Ahead',
    sidebarLabel: 'Week Ahead',
    description: 'Review AI-drafted social posts, follow-up SMS, and jobs waiting to be scheduled.',
    icon: Sparkles,
    chipIds: [],
    questions: [
      {
        id: 'what-is-week-ahead',
        q: 'What is Your Week Ahead?',
        a: 'Your Week Ahead page has two parts: a schedule board for this week’s booked jobs, and an AI suggestions inbox (social drafts, quote follow-up SMS, overdue invoice reminders, and unscheduled jobs).\n\nThe dashboard Week Ahead card is a suggestion count - it is not the week’s calendar. Nothing in the inbox sends or books until you approve it. See Jobs & Scheduling - What is Week Ahead?',
      },
      {
        id: 'when-suggestions-appear',
        q: 'When do new suggestions appear?',
        a: 'A survey runs each Sunday and drafts new suggestions for your business. Open Week Ahead from the dashboard sidebar to review what was found. If everything is handled, the page shows you are caught up.',
      },
      {
        id: 'suggestion-types',
        q: 'What types of suggestions are included?',
        a: 'The inbox has four suggestion types: Social posts (completed jobs from the last seven days with AI captions), Quote follow-ups (quotes sent 5-14 days ago with no response), Invoice reminders (sent invoices past due date), and Unscheduled jobs (active jobs created 3-60 days ago with no scheduled start).\n\nThose suggestions are separate from the Week Ahead schedule board, which shows jobs that already have a start time this week.',
      },
      {
        id: 'approve-first',
        q: 'Do suggestions send automatically?',
        a: 'No. Every suggestion stays pending until you approve or skip it. Approve runs the action - posting/rendering a social image, sending an SMS, or opening the calendar to schedule a job. Skip dismisses it for this survey cycle.',
      },
      {
        id: 'week-ahead-sms',
        q: 'Why can\'t I approve quote or invoice follow-ups?',
        a: 'Quote follow-ups and invoice reminders send SMS from your business phone number. If your number is not active yet, approval is blocked until SMS is set up - use the banner on Week Ahead or go to Settings → Phone Number.',
      },
      {
        id: 'week-ahead-social-credits',
        q: 'Do social post suggestions use renders?',
        a: 'Yes, if approving the suggestion creates a new AI image. That uses one of your included monthly renders (10 per Australia/Sydney calendar month) or a purchased extra render. There is no one-off free trial render. You can still edit the caption in Social without using another render, or use Approve all safe ones when those posts pass the automatic checks and you have usage remaining.',
      },
      {
        id: 'unscheduled-job-approve',
        q: 'What happens when I approve an unscheduled job suggestion?',
        a: 'StitchedUp opens Calendar with that job ready to schedule - it does not book a date for you automatically. Pick a start time on the week grid yourself. A date-only job still will not appear as a block until it has a scheduled start. See Jobs & Scheduling - How do I put a job on the calendar?',
      },
    ],
  },
  {
    id: 'expenses',
    title: 'Expenses & Job Costing',
    sidebarLabel: 'Expenses',
    description: 'Scan receipts, link costs to jobs, and understand what counts on the job card.',
    icon: ScanLine,
    chipIds: ['accounts'],
    keywords: ['job costing', 'receipt scanning'],
    questions: [
      {
        id: 'expenses-hub',
        q: 'Where do I manage expenses?',
        a: 'Open Expenses from the dashboard sidebar for a business-wide view - summary totals, filters, and your full expense list. You can also scan and review receipts from the Expenses section on any job page.\n\nSupplier bills and Profit & Loss live under Accounts when those features are enabled - not on this Expenses list.',
      },
      {
        id: 'add-expense',
        q: 'How do I add an expense?',
        a: 'The usual path is scan-first: tap Scan receipt on the Expenses page or a job page, then upload a photo or PDF. StitchedUp reads the receipt and opens a review screen. Confirm vendor, date, amounts, and category, then save. There is no separate “type a receipt-free expense” button on the Expenses hub.\n\nIf Accounts Banking is enabled, matching or creating an expense from an imported bank line is another way an expense can appear.',
      },
      {
        id: 'expense-file-types',
        q: 'What receipt files can I upload?',
        a: 'JPEG, PNG, WebP, and PDF are supported. Images are compressed before upload; multi-page PDFs count as one scan page per PDF page toward your monthly allowance.',
      },
      {
        id: 'expense-job-link',
        q: 'Can I link an expense to a job?',
        a: 'Yes - optionally. When scanning from a job page, the expense is linked to that job automatically. From the Expenses hub you can leave it as general business overhead or pick a job. You can change the job link later from the expense detail view.',
      },
      {
        id: 'expense-edit',
        q: 'What can I change after saving an expense?',
        a: 'You can edit the category, job link, and notes. Vendor name, dates, and dollar amounts are fixed after save (they come from the scanned receipt). You can delete an expense entirely, which removes the receipt from storage.',
      },
      {
        id: 'expense-margin',
        q: 'How do expenses affect job profitability?',
        a: 'When Job Costing is on in Settings, the job card can include:\n- received supplier bills linked to that job (ex-GST subtotal, if supplier-bill accounting is enabled)\n- job expenses that are not linked to a supplier bill (at the recorded expense total)\n- manual materials, labour, and fee figures on the job\n\nA linked expense is excluded so the same purchase is not counted twice. Purchase orders and supplier payments do not add a job cost.\n\nTurn Job Costing off and expenses still save, but the profitability card is hidden. Formal period profit is Accounts Profit & Loss - not this card.\n\nField staff do not see internal costing or the profitability card.',
      },
      {
        id: 'expense-scan-limit',
        q: 'Is there a limit on receipt scans?',
        a: 'Yes. Your plan includes 100 receipt pages per calendar month (one page per image; PDFs use their page count). When the allowance is used up, scanning is blocked until the next month - there is no paid overage yet. Check remaining pages on Billing under Expense Receipt Scanning.',
      },
    ],
  },
  {
    id: 'billing-usage',
    title: 'Billing & Usage',
    sidebarLabel: 'Billing & Usage',
    description: 'Subscription, usage allowances, render credits, and pass-through charges on your Billing page.',
    icon: CircleDollarSign,
    chipIds: ['billing-usage'],
    questions: [
      {
        id: 'where-usage',
        q: 'Where do I see usage and extra charges?',
        a: 'Go to Billing in your dashboard. Below your subscription details, the Usage & allowances section shows included monthly renders, extra render usage, job voice recording usage, phone number rent, and receipt scan allowance. Payment History lists past charges including subscription renewals and usage invoices.',
      },
      {
        id: 'render-credits',
        q: 'How do AI renders work on Billing?',
        a: 'A render is used when StitchedUp creates new AI artwork - for example AI Designed in Social, or an AI-generated photo in Build a layout. Your plan includes 10 renders each Australia/Sydney calendar month. After that, each extra render is $1 AUD. You can also buy packs that do not expire: 10 renders for $5 AUD, 25 for $10 AUD, or 60 for $20 AUD. Captions, logo changes, saving, downloading, publishing, and current Recreate previews do not use a render. There is no one-off free trial render on this usage model. Social details: How do renders work?',
      },
      {
        id: 'recording-usage',
        q: 'What is Job Voice Recording Usage?',
        a: 'When you record voice memos or conversations on a job, StitchedUp meters transcription cost and shows a pending AUD total on Billing. This is near-cost pass-through - not profit for StitchedUp. Unbilled usage is charged monthly to your card on file once your subscription is active. Totals under $1 AUD roll forward until the minimum is reached.',
      },
      {
        id: 'phone-rent',
        q: 'What is Phone Number Rent on Billing?',
        a: 'If you have an active Mobile or Local business number through StitchedUp, Twilio\'s monthly number rental is passed through to you at near-cost (shown per number on Billing). It is billed separately from your StitchedUp subscription, usually on the same monthly cycle as other usage charges. CallMate A$19.99 includes one StitchedUp messaging number - that included number stays with you if you upgrade to full StitchedUp. Extra numbers are charged separately.',
      },
      {
        id: 'ai-credits',
        q: 'What are AI Credits?',
        a: 'AI Credits are used when StitchedUp generates an AI-powered reply or action - for example a CallMate reply, a quote scope, a social caption, or bill interpretation. CallMate A$19.99 includes 30 AI Credits each Australia/Sydney month. Extra packs (15 for A$9.99, 40 for A$19.99, 100 for A$39.99) do not expire and carry over if you upgrade. Qualification bundled into the same reply does not use an extra credit. Incoming texts do not use AI Credits. Voice AI receptionist charging is unchanged.',
      },
      {
        id: 'sms-credits',
        q: 'What are SMS Credits?',
        a: '1 SMS Credit = 1 outbound text message, not a carrier segment. Missed-call openers, AI replies sent by SMS, manual customer texts, quotes, invoices, reminders, and on-the-way messages use SMS Credits when your plan’s SMS allowance is set. Incoming texts are free. Owner and emergency alerts to you are not charged against customer SMS Credits. An AI reply sent by SMS normally uses 1 AI Credit + 1 SMS Credit. Monthly SMS include is configured in Admin - it is not a locked number yet.',
      },
      {
        id: 'expense-scan-billing',
        q: 'Do I pay for receipt scanning beyond the allowance?',
        a: 'Not currently. Receipt scanning is included up to your monthly page allowance (100 pages by default). Billing shows how many pages you have used and remaining. There is no overage billing yet - when you hit the limit, scanning pauses until the allowance resets.',
      },
      {
        id: 'usage-vs-subscription',
        q: 'Are usage charges part of my monthly plan price?',
        a: 'No. Your StitchedUp subscription covers platform access. Usage items - extra renders after the included monthly allowance, render packs, job voice recording pass-through, and phone number rent - are tracked and charged separately. Receipt scanning is included within your allowance and is not billed as overage today.',
      },
      {
        id: 'usage-before-subscribe',
        q: 'What usage applies before I subscribe?',
        a: 'Paid product features stay locked until you have an active subscription. After you subscribe, usage items such as receipt scans, job recordings, and Social renders follow the same rules as any paid account: 10 included renders per Australia/Sydney month, then $1 AUD per extra render or a purchased pack. There is no one-off free trial render.',
      },
      {
        id: 'recording-charge-failed',
        q: 'What if a usage charge fails?',
        a: 'A failed recording or phone-rent usage invoice does not cancel your dashboard access the way a failed subscription renewal can. You will see the charge in Payment History and can update your payment method on Billing. Subscription status and usage billing are handled separately.',
      },
      {
        id: 'render-credits-how-work',
        q: 'How do renders work, and how many do I get?',
        a: 'Your subscription includes 10 Social/AI image renders each Australia/Sydney calendar month. Unused included renders reset with the Sydney month - they are not a forever prepaid stack. After the 10 are used, each extra render is $1 AUD from purchased usage. Packs add extra renders that do not expire: 10 for $5 AUD, 25 for $10 AUD, 60 for $20 AUD. AI Designed uses 1 render for up to three designs. Build a layout with your own, job, stock, or library photo uses 0 renders; an AI-generated photo uses 1. Current Recreate layout previews do not use a render. Captions and logo changes are free. Buy packs from Billing anytime.',
      },
      {
        id: 'job-recording-usage-charge',
        q: 'What\'s the "Job Recording Usage" charge on my bill?',
        a: 'This only covers voice memos you attach to job pages - it\'s unrelated to AI Receptionist phone calls. It\'s billed close to actual cost and accumulates through the month; you\'re only charged once the pending total reaches $1 AUD, and anything under that rolls forward.',
      },
      {
        id: 'phone-number-cost',
        q: 'How much does a phone number cost?',
        a: 'Phone numbers are billed separately from your subscription: an Australian mobile number is $14.07 AUD/month, a local number is $4.26 AUD/month, charged on purchase and then monthly while active. You need an active paid subscription to purchase or port a number.',
      },
      {
        id: 'expense-scan-allowance',
        q: 'How many expense receipts can I scan?',
        a: 'Every plan includes 100 receipt scans per calendar month. Beyond that, scanning pauses until the next month - there\'s currently no paid overage option.',
      },
    ],
  },
] as const

export function categoryMatchesChip(
  category: HelpFaqCategory,
  chipId: HelpChipId,
): boolean {
  if (chipId === 'all') return true
  return category.chipIds.includes(chipId)
}

export function getCategoryQuestionCount(category: HelpFaqCategory): number {
  return category.questions.length
}

export function helpArticleAnchorId(categoryId: string, questionId: string): string {
  return `${categoryId}-${questionId}`
}

export function listHelpArticleAnchorIds(): string[] {
  return HELP_FAQ_CATEGORIES.flatMap((category) =>
    category.questions.map((question) => helpArticleAnchorId(category.id, question.id)),
  )
}
