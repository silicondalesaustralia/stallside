import { Bot, MessageSquare, Phone } from 'lucide-react'
import type { HelpFaqCategory } from '@/components/marketing/help/helpContent'

export const AI_RECEPTIONIST_CATEGORY: HelpFaqCategory = {
  id: 'ai-receptionist',
  title: 'AI Receptionist',
  sidebarLabel: 'AI Receptionist',
  description: 'Live voice and website chat that answers while you are on the tools.',
  icon: Bot,
  chipIds: ['communications'],
  keywords: ['ai receptionist', 'voice', 'widget', 'live', 'booking', 'vapi'],
  questions: [
    {
      id: 'what-is',
      q: 'What is the AI Receptionist?',
      a: 'The AI Receptionist answers people who reach you on the website chat widget, or on a live inbound call to your StitchedUp business number when Live is on. It uses the greeting, services, hours, and instructions you save under Communications → AI Receptionist. Conversations appear in Conversations. When a name and phone are captured, a CRM contact is created and linked to the thread.',
      keywords: ['ai receptionist', 'widget', 'voice', 'chat'],
    },
    {
      id: 'setup',
      q: 'How do I set up the AI Receptionist?',
      a: 'Open Communications → AI Receptionist (or Settings → AI Receptionist). Work through setup: business details, services, hours, voice, and call-flow instructions. Publish those settings when you are happy. Live answering is a separate switch - you can configure everything first, test, then turn Live on.',
      keywords: ['setup', 'wizard', 'publish'],
    },
    {
      id: 'live-vs-off',
      q: 'What is the difference between Live and Off?',
      a: 'Live and Off control whether inbound calls to your assigned StitchedUp number are answered by the AI. Off does not wipe your setup. Website chat can still work from the widget. Live also needs an active assigned business number - turning Live on without a number does not make your personal mobile answer as the AI.',
      keywords: ['live', 'off', 'go live'],
    },
    {
      id: 'assigned-number',
      q: 'Does the AI Receptionist need a StitchedUp phone number?',
      a: 'Website chat does not. Live inbound call answering does - it uses the active StitchedUp business number assigned to the receptionist. If you have not bought or ported a number yet, callers to your ordinary mobile will not reach this AI. For texts after a missed call on your existing number, use Missed Call AI and call forwarding instead.',
      keywords: ['phone number', 'assigned number', 'no number', 'widget vs phone'],
    },
    {
      id: 'voice-knowledge',
      q: 'How do voice, instructions, and knowledge work?',
      a: 'Pick a voice in AI Receptionist settings. Add the services you offer, pricing notes, hours, and any call-flow instructions (what to say, what not to promise). Publish after you change them so the live assistant uses the latest version. Hours here are guidance for the AI - they are not the same as Missed Call booking hours.',
      keywords: ['voice', 'knowledge', 'instructions', 'policy', 'hours'],
    },
    {
      id: 'bookings',
      q: 'Can the AI book jobs for me?',
      a: 'Yes, when Agent booking is turned on (off by default) under AI Receptionist behaviour. The AI must successfully create the booking in StitchedUp before it should say you are booked. That applies to live voice and, when booking is on, to Missed Call SMS as well. Quoting, site visits, and sending formal quotes stay with you.',
      keywords: ['book', 'booking', 'appointment', 'agent booking'],
    },
    {
      id: 'calendar-source-of-truth',
      q: 'Which calendar does booking use?',
      a: 'StitchedUp Calendar is the source of truth. Availability checks and new jobs are created there using your business timezone. If a booking tool fails, you get a needs-attention alert so you can finish it - the thread is not silently switched to Human handling.',
      keywords: ['calendar', 'availability', 'timezone'],
    },
    {
      id: 'google-calendar',
      q: 'Does Google Calendar replace StitchedUp Calendar?',
      a: 'No. Connect Google Calendar under Integrations if you want booked jobs copied out after they exist in StitchedUp. Turn the sync off and bookings still live in StitchedUp. A Google sync hiccup does not undo the StitchedUp job. See Jobs & Scheduling for one-way export and what happens if you edit the Google event.',
      keywords: ['google calendar', 'sync'],
    },
    {
      id: 'emergency',
      q: 'What happens on an emergency or urgent call?',
      a: 'The AI follows your emergency instructions and StitchedUp can alert you (in-app, push, email, or SMS, depending on your notification settings). That is a critical alert, not an automatic Human handling switch. The AI can still give a safe acknowledgement until someone on your team takes over.',
      keywords: ['emergency', 'urgent', 'safety'],
    },
    {
      id: 'testing',
      q: 'How do I test the AI Receptionist?',
      a: 'Use the test panel on Communications → AI Receptionist, or the widget test page from that settings area. Test calls are stored separately from your customer inbox. They do not create live customer leads the way a real enquiry does.',
      keywords: ['test', 'widget test', 'test call'],
    },
    {
      id: 'vs-missed-call',
      q: 'How is this different from Missed Call AI?',
      a: 'AI Receptionist answers live - chat on your website, or a call that reaches your StitchedUp number while Live is on. Missed Call AI starts after a missed call: StitchedUp texts the caller and can continue the conversation by SMS. You can use both. They are not the same switch.',
      keywords: ['missed call', 'difference', 'vs'],
    },
  ],
}

const MISSED_CALL_AI_CATEGORY_RAW: HelpFaqCategory = {
  id: 'missed-call-ai',
  title: 'Missed Call AI & Conversations',
  sidebarLabel: 'Missed Call AI',
  description: 'Texts after a missed call, qualification, and how Conversations handling works.',
  icon: MessageSquare,
  chipIds: ['communications'],
  keywords: [
    'missed call',
    'sms',
    'forwarding',
    'takeover',
    'hand back',
    'human handling',
    'ai handling',
    'callback',
    'draft',
    'manual',
    'auto',
    'stop',
    'opt out',
    'emergency',
    'notification',
    'next step',
    'qualification',
  ],
  questions: [
    {
      id: 'what-is',
      q: 'What is Missed Call AI?',
      a: 'When a call is missed, StitchedUp can text the caller from your StitchedUp business number, then continue the chat in Conversations. The AI can collect the job, suburb, and name, and - if you allow it - request a callback or book into your StitchedUp calendar. Open Communications → Missed Call AI to turn it on and choose Auto, Draft, or Manual.',
      keywords: ['missed call', 'text back', 'sms'],
    },
    {
      id: 'vs-ai-receptionist',
      q: 'Missed Call AI vs AI Receptionist - which do I need?',
      a: 'Use AI Receptionist when you want the AI to answer a live call or website chat. Use Missed Call AI when the call was missed and you want a text follow-up. Many businesses use both: Live voice on a StitchedUp number, plus missed-call texts if a call still goes unanswered.',
      keywords: ['vs', 'difference', 'ai receptionist'],
    },
    {
      id: 'existing-or-stitchedup-number',
      q: 'Should I use my existing number or a StitchedUp number?',
      a: 'Existing number: keep the number customers already call, and set carrier forwarding so unanswered/busy/unreachable calls reach StitchedUp. StitchedUp number: buy or port a number in Phone & SMS and advertise that number. Either way, outbound SMS is sent from an active StitchedUp-controlled number - not from your personal mobile.',
      keywords: ['existing number', 'stitchedup number', 'buy', 'port'],
    },
    {
      id: 'existing-number-forwarding',
      q: 'How does existing-number call forwarding work?',
      a: 'The customer still dials your current business or mobile number. If you do not answer, are busy, or cannot be reached, your carrier forwards the call to StitchedUp. StitchedUp then runs the missed-call workflow and can send the SMS. Forwarding does not let StitchedUp send texts from your original mobile - the text still comes from your StitchedUp number.',
      keywords: ['forwarding', 'call forwarding', 'conditional forwarding', 'divert'],
    },
    {
      id: 'why-no-text',
      q: 'Why didn’t the customer get a text?',
      a: 'Check these in order: Missed Call AI is on; you have an active StitchedUp number that can send SMS; forwarding is set if they called your old number; they did not text STOP; the thread is not in Human handling; and this is not a duplicate of a send that is already in progress. A brand-new missed call still gets a text even if you already texted this customer earlier. You can also set a short text-back delay - that waits before the first SMS, it does not skip the call.',
      keywords: ['no sms', 'didn’t get a text', 'blocked', 'why no text'],
    },
    {
      id: 'auto-draft-manual',
      q: 'What do Auto, Draft, and Manual modes do?',
      a: 'Auto: the AI sends replies for you. Draft: the AI writes a reply for you to approve in Conversations - nothing goes out until you send it. Manual: StitchedUp can still send the first missed-call text if follow-up SMS is on, but the AI will not keep the conversation going. Mode is how the business wants Missed Call AI to operate. It is not the same as Human handling on one thread.',
      keywords: ['auto', 'draft', 'manual', 'mode'],
    },
    {
      id: 'ai-vs-human-handling',
      q: 'What is AI handling vs Human handling?',
      a: 'The header shows your reply mode plus who owns the thread, for example Auto mode · AI handling. Human handling means your team is writing - the AI will not send automatic replies on that conversation. A callback request, a “can I speak to someone?”, an emergency flag, or an AI hiccup can raise Needs attention without changing that ownership.',
      keywords: ['ai handling', 'human handling', 'ownership'],
    },
    {
      id: 'take-over-hand-back',
      q: 'How do Take over and Hand back to AI work?',
      a: 'Take over (or sending a manual SMS) puts the thread on Human handling immediately - no Save button. Hand back to AI returns it to AI handling immediately. That choice sticks. A later missed call, callback, or attention banner will not silently flip it back to Human handling.',
      keywords: ['take over', 'takeover', 'hand back', 'handback'],
    },
    {
      id: 'needs-attention-next-step',
      q: 'What do Needs attention and Next Step mean?',
      a: 'Needs attention is a banner for this current missed-call chat - for example “Customer requested a callback”. Next Step tells you the action, such as Call customer. You can have Auto mode · AI handling, a callback banner, and a Call customer next step at the same time. Mark handled when you have dealt with that banner. Old banners from an earlier job on the same phone number should not stay current after a new missed call.',
      keywords: ['needs attention', 'next step', 'next action'],
    },
    {
      id: 'qualification',
      q: 'How does qualification work?',
      a: 'The AI gathers useful context in a normal chat - it should not feel like a long form. It asks for what it still needs, such as name, suburb, or what is going on. You set questions for each service under Missed Call AI → Qualification.',
      keywords: ['qualification', 'questions', 'context'],
    },
    {
      id: 'configured-and-general',
      q: 'What if the job is not one of my configured services?',
      a: 'Configured services (for example blocked drain) use your qualification questions. If the customer describes something you have not set up - “Gutter leak” - the AI uses General / Other and can still collect the issue, suburb, name, urgency, and whether they want a call back. That is a normal path, not a failure.',
      keywords: ['general', 'other', 'unconfigured', 'gutter'],
    },
    {
      id: 'callbacks-and-bookings',
      q: 'How do callbacks and bookings work?',
      a: 'A callback is a successful outcome. If they ask someone to call them, you get a notification and a Call customer next step. The AI can keep helping until you Take over. A booking needs enough detail and a successful book action on the StitchedUp calendar. The AI should not say “you’re booked” until that succeeds. If booking fails, you get attention to finish it - ownership does not flip by itself.',
      keywords: ['callback', 'booking', 'book job', 'calendar'],
    },
    {
      id: 'customer-asks-for-person',
      q: 'What happens when a customer asks for a person?',
      a: 'If they say they want to speak with someone, StitchedUp raises Needs attention and a Take over next step, and can notify you. The AI stays available to keep helping until a teammate actually takes over or sends a manual message.',
      keywords: ['speak to someone', 'real person', 'human'],
    },
    {
      id: 'repeat-missed-calls',
      q: 'What happens if the same customer misses you again?',
      a: 'The first miss uses your opener SMS. A later genuine missed call on the same conversation uses a short re-engagement text - asking if it is the same issue or something else - instead of repeating the first opener. History stays on one Conversations thread.',
      keywords: ['repeat', 'again', 're-engagement', 'opener'],
    },
    {
      id: 'same-issue-vs-something-else',
      q: 'Same issue vs something else - what is kept?',
      a: 'If they are still on the same job, the AI can reuse useful facts such as name and suburb. If they say it is something else, or describe a new kind of job, service-specific details from the last job are cleared. Name and phone stay.',
      keywords: ['same issue', 'something else', 'new issue'],
    },
    {
      id: 'when-another-call-texts',
      q: 'When does another missed call send a text?',
      a: 'Every genuine new missed call can get a text. StitchedUp does not wait out a five-minute quiet window after a successful SMS. It will skip a second text only when a send for that same miss is already in progress (or the same call is processed twice). You can still set a short delay before the first SMS goes out.',
      keywords: ['cooldown', 'always text', 'another call', 'delay'],
    },
    {
      id: 'no-response-follow-up',
      q: 'What is the no-response follow-up?',
      a: 'Optional. If the opener sent and the customer has not replied, StitchedUp can send one follow-up after the delay you set (default 15 minutes). It is cancelled if they reply, text STOP, a callback or booking is recorded, or you take over the conversation. Test threads do not send this follow-up.',
      keywords: ['follow-up', 'no response', 'follow up'],
    },
    {
      id: 'notification-preferences',
      q: 'How do notification preferences work?',
      a: 'On Missed Call AI you choose In-app, Push, Email, and SMS for each event - callback requested, ready to book, asked for a person, emergency, AI or tool trouble, SMS failed, draft ready, and qualification complete. SMS alerts to you are optional (emergencies default on). A notification tells you what to do. It does not put the thread on Human handling.',
      keywords: ['notification', 'push', 'email', 'in-app', 'alerts'],
    },
    {
      id: 'emergencies',
      q: 'How are emergencies and urgent enquiries handled?',
      a: 'Urgent chats raise a critical Needs attention item and can notify you on the channels you chose. The AI can still send a safe acknowledgement. That is not the same as Take over. If you have emergency routing set for live voice, that is configured under AI Receptionist - it is separate from Missed Call SMS ownership.',
      keywords: ['emergency', 'urgent'],
    },
    {
      id: 'stop-opt-out',
      q: 'What happens if a customer texts STOP?',
      a: 'STOP (and similar words such as Unsubscribe) is a compliance opt-out. Automated SMS to that number stops. It is not Human handling. To write to them again you need a lawful reason and they typically need to opt back in. Hand back to AI will not override an opt-out.',
      keywords: ['stop', 'opt out', 'opt-out', 'unsubscribe'],
    },
    {
      id: 'test-centre-simulator',
      q: 'What is Live Demo?',
      a: 'Live Demo on Missed Call AI lets you call the demo number from your own mobile and see the missed-call text, conversation, and captured job details. Nothing here affects real customers. Internal simulator tools are for StitchedUp staff only.',
      keywords: ['test centre', 'simulator', 'test mode'],
    },
    {
      id: 'common-setup-mistakes',
      q: 'What are the common setup mistakes?',
      a: 'Forwarding not set, so the miss never reaches StitchedUp. Testing your personal mobile and expecting a text from that same mobile. Waiting for AI replies in Manual mode, or auto-send in Draft mode. Leaving the conversation on Human handling. Customer already opted out. Notification channels turned off, or no owner mobile/email for alerts. Expecting a quiet period after the last SMS - a new miss should still text. Remember: SMS always comes from your StitchedUp number, not the number the customer originally dialled.',
      keywords: ['mistakes', 'not working', 'troubleshooting'],
    },
  ],
}

const MISSED_CALL_QUESTION_GROUPS: Record<string, string> = {
  'what-is': 'Getting started',
  'vs-ai-receptionist': 'Getting started',
  'existing-or-stitchedup-number': 'Getting started',
  'existing-number-forwarding': 'Getting started',
  'why-no-text': 'Getting started',
  'auto-draft-manual': 'Getting started',
  'ai-vs-human-handling': 'Handling conversations',
  'take-over-hand-back': 'Handling conversations',
  'needs-attention-next-step': 'Handling conversations',
  qualification: 'Handling conversations',
  'configured-and-general': 'Handling conversations',
  'customer-asks-for-person': 'Handling conversations',
  'callbacks-and-bookings': 'Follow-up & alerts',
  'repeat-missed-calls': 'Follow-up & alerts',
  'same-issue-vs-something-else': 'Follow-up & alerts',
  'when-another-call-texts': 'Follow-up & alerts',
  'no-response-follow-up': 'Follow-up & alerts',
  'notification-preferences': 'Follow-up & alerts',
  emergencies: 'Follow-up & alerts',
  'stop-opt-out': 'Follow-up & alerts',
  'test-centre-simulator': 'Testing',
  'common-setup-mistakes': 'Testing',
}

export const MISSED_CALL_AI_CATEGORY: HelpFaqCategory = {
  ...MISSED_CALL_AI_CATEGORY_RAW,
  questions: Object.keys(MISSED_CALL_QUESTION_GROUPS).flatMap((id) => {
    const question = MISSED_CALL_AI_CATEGORY_RAW.questions.find((row) => row.id === id)
    if (!question) return []
    return [{ ...question, group: MISSED_CALL_QUESTION_GROUPS[id] }]
  }),
}

export const PHONE_SMS_CATEGORY: HelpFaqCategory = {
  id: 'phone-sms',
  title: 'Phone Number & SMS',
  sidebarLabel: 'Phone & SMS',
  description: 'Business numbers, compliance, forwarding, and why SMS sends from StitchedUp.',
  icon: Phone,
  chipIds: ['communications'],
  keywords: ['phone', 'sms', 'twilio', 'forwarding', 'port', 'stop', 'opt out'],
  questions: [
    {
      id: 'why-sms-blocked',
      q: 'Why can’t I send SMS to customers?',
      a: 'Customer SMS is sent from your own approved StitchedUp business number - not a shared platform number, and not your personal mobile. Until that number is active, missed-call texts, quote follow-ups, review requests, appointment reminders, and On my way texts stay off. Check Settings → Phone Number.',
      keywords: ['blocked', 'can’t send', 'sms blocked'],
    },
    {
      id: 'setup-phone',
      q: 'How do I set up a business phone number?',
      a: 'Go to Settings → Phone Number. Choose Mobile or Local, submit compliance documents, then buy or port a number after approval. Twilio review is usually 1-3 business days. You need an active paid subscription to purchase or port. For missed calls on a number you already advertise, also set existing-number forwarding under Missed Call AI.',
      keywords: ['setup', 'buy number', 'compliance'],
    },
    {
      id: 'mobile-vs-local',
      q: 'What is the difference between Mobile and Local numbers?',
      a: 'Mobile numbers (+614…) use lighter Australian business compliance. Local landline numbers use a stricter path and extra documents. You set each type up on the Phone Number page. SMS still only unlocks when a number is active.',
      keywords: ['mobile', 'local', 'landline'],
    },
    {
      id: 'approved-but-no-sms',
      q: 'Compliance is approved - why is SMS still blocked?',
      a: 'Approval and an active sending number are different steps. After the bundle is approved you still need to buy or port a number and have it marked active. Buying requires an active subscription.',
      keywords: ['approved', 'still blocked'],
    },
    {
      id: 'compliance-rejected',
      q: 'My compliance application was rejected - what now?',
      a: 'Open Settings → Phone Number and read the reasons on the Mobile or Local card. Fix the document or name mismatch, resubmit, or contact Support if it is unclear.',
      keywords: ['rejected', 'resubmit'],
    },
    {
      id: 'what-sms-sends',
      q: 'What types of SMS does StitchedUp send?',
      a: 'Transactional SMS only, from your StitchedUp number to people who already called or already have a job with you. That includes Missed Call AI openers and replies, no-response follow-ups, quote and invoice follow-ups, booking messages, and On my way links. Marketing blasts to cold lists are not supported. Owner alert SMS (optional) is configured under Missed Call AI notifications.',
      keywords: ['what sms', 'transactional', 'missed call sms'],
    },
    {
      id: 'sms-sender',
      q: 'Which number do texts come from?',
      a: 'Always an active StitchedUp-controlled number. If the customer called your existing mobile and forwarding sent the miss to StitchedUp, they still receive the SMS from the StitchedUp number - not from the mobile they dialled.',
      keywords: ['from number', 'sender', 'caller id'],
    },
    {
      id: 'existing-number-forwarding',
      q: 'Can I keep my existing number and still use Missed Call AI?',
      a: 'Yes. Choose the existing-number option in Missed Call AI and set carrier forwarding for no-answer, busy, and unreachable. StitchedUp then runs the missed-call texts. See Missed Call AI → How existing-number call forwarding works.',
      keywords: ['forwarding', 'call forwarding', 'existing number'],
    },
    {
      id: 'port-number',
      q: 'Can I port my existing phone number?',
      a: 'Yes. Port an Australian number instead of buying new after compliance for that number type is approved. Ports can take weeks. Do not cancel the old number until the port completes. Track it on Settings → Phone Number.',
      keywords: ['port', 'porting', 'transfer number'],
    },
    {
      id: 'stop-opt-out',
      q: 'What if a customer texts STOP?',
      a: 'Automated SMS to that number stops. That is an opt-out, not Human handling. Details are under Missed Call AI → STOP and opt-out.',
      keywords: ['stop', 'opt out', 'opt-out'],
    },
  ],
}

/** Old /help#leads-crm-* and similar hashes still open the moved article. */
export const HELP_ARTICLE_ALIASES: Record<string, string> = {
  'leads-crm-ai-receptionist': 'ai-receptionist-what-is',
  'leads-crm-ai-receptionist-widget-vs-phone': 'ai-receptionist-assigned-number',
  'leads-crm-ai-receptionist-booking': 'ai-receptionist-bookings',
  'leads-crm-ai-receptionist-human': 'ai-receptionist-live-vs-off',
  'leads-crm-ai-receptionist-no-number': 'ai-receptionist-assigned-number',
}
