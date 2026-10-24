// Shared by the upload page and the admin dashboard

export const MAX_UPLOAD_MB = 5
export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']

// The database stores "approved". People see "Document reviewed", because the
// platform checks a document, it does not prove legal ownership.
const STATUS_LABELS: Record<string, string> = {
  'not submitted': 'Not submitted',
  pending: 'Pending review',
  approved: 'Document reviewed',
  rejected: 'Rejected',
}

const TYPE_LABELS: Record<string, string> = {
  national_id: 'National ID',
  land_document: 'Land document',
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export function docTypeLabel(type: string | null): string {
  return type ? (TYPE_LABELS[type] ?? type) : '-'
}