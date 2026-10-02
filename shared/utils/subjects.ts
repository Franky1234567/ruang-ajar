export const MADRASAH_SUBJECTS = [
  'Al-Qur\'an Hadis',
  'Akidah Akhlak',
  'Fikih',
  'Sejarah Kebudayaan Islam (SKI)',
  'Bahasa Arab'
] as const

export const GENERAL_SUBJECTS = [
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika',
  'IPA',
  'IPS',
  'Pendidikan Pancasila'
] as const

// Ejaan guru beda-beda (fiqih/fikih, aqidah/akidah, hadits/hadis), jadi cocokkan akar katanya.
const MADRASAH_PATTERN = /qur'?an|hadi[st]|aq?[ie]dah|akhlak|fi[kq]i?h|\bski\b|kebudayaan islam|bahasa arab|\bpai\b/i

export const isMadrasahSubject = (focus?: string) => !!focus && MADRASAH_PATTERN.test(focus)
