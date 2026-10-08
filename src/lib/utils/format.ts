import { format, formatDistanceToNow } from 'date-fns'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'd MMM yyyy')
}

export function formatDateShort(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy')
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

export function formatPhoneAU(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('61')) {
    return '+61 ' + cleaned.slice(2).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
  }
  return phone
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    new_lead: 'New Lead',
    contacted: 'Contacted',
    quote_sent: 'Quote Sent',
    quote_accepted: 'Quote Accepted',
    in_progress: 'In Progress',
    job_done: 'Job Done',
    invoice_sent: 'Invoice Sent',
    paid: 'Paid',
    cancelled: 'Cancelled',
  }
  return labels[stage] ?? stage
}
