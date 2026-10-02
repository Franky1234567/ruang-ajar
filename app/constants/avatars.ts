// 20 karakter madrasah: 10 kerudung (cewe) + 10 kopiah (cowo). Aset di public/avatars/.
export const AVATARS = [
  'kerudung-01', 'kerudung-02', 'kerudung-03', 'kerudung-04', 'kerudung-05',
  'kerudung-06', 'kerudung-07', 'kerudung-08', 'kerudung-09', 'kerudung-10',
  'kopiah-01', 'kopiah-02', 'kopiah-03', 'kopiah-04', 'kopiah-05',
  'kopiah-06', 'kopiah-07', 'kopiah-08', 'kopiah-09', 'kopiah-10'
]

// Pilih karakter tetap per nama murid (deterministik). Kalau L/P diketahui dari daftar siswa,
// pilihnya cuma dari kopiah (L) atau kerudung (P).
export function avatarFor(name: string, gender?: string | null): string {
  const pool = gender === 'P'
    ? AVATARS.filter(a => a.startsWith('kerudung'))
    : gender === 'L' ? AVATARS.filter(a => a.startsWith('kopiah')) : AVATARS
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return `/avatars/${pool[h % pool.length]}.webp`
}
