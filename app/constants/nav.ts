export interface NavItem {
  to: string
  label: string
  icon: string
  match?: string[]
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Beranda', icon: '<path d="M3 11 12 3l9 8v10H3z"/><path d="M9 21v-7h6v7"/>' },
  { to: '/materi', label: 'Materi', icon: '<path d="M4 4h16v17l-8-4-8 4z"/><path d="M8 9h8"/>' },
  { to: '/bank', label: 'Bank', icon: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8"/>' },
  { to: '/ujian', label: 'Ujian', icon: '<path d="M5 3h14v18H5zM8 9h8M8 13h8"/>' },
  { to: '/kelas', label: 'Kelas', icon: '<path d="M4 12l5 5L20 6"/>', match: ['/kelas', '/cek', '/kuis', '/peringkat'] }
]
