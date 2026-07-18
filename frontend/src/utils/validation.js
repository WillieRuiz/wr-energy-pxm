export const PHONE_RE = /^\+?[\d\s\-(). ]{10,}$/

// Shared by Screen1 (lead capture before the equipment list) and Screen3
// (guards the conversion handlers) so both stay in sync.
export function validateLead(lead, t) {
  const errs = {}
  if (!lead.nombre || lead.nombre.trim().length < 2) errs.nombre = t('screen3.error_nombre')
  if (!lead.whatsapp || !PHONE_RE.test(lead.whatsapp)) errs.whatsapp = t('screen3.error_whatsapp')
  return errs
}
