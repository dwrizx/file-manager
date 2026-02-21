# AGENTS.md

Panduan ini wajib diikuti oleh agent/coding assistant yang bekerja di repo ini.

## Tujuan

- Menjaga perubahan tetap konsisten, aman, dan mudah di-review.
- Memastikan semua perubahan lolos quality gate lokal dan CI.

## Perintah Wajib

- Fast check: `bun run check:fast`
- Full check: `bun run check`

## Aturan Eksekusi

1. Jalankan `bun run check:fast` saat iterasi.
2. Jalankan `bun run check` sebelum menyatakan task selesai.
3. Jika gagal, perbaiki akar masalah lalu jalankan ulang hingga hijau.

## Aturan Kualitas

- Jangan tinggalkan lint warning/error.
- Jangan commit jika `bun run fmt:check` gagal.
- Jangan klaim selesai tanpa bukti output verifikasi terbaru.
- CI adalah hakim terakhir; jika CI merah, anggap perubahan belum selesai.

## Aturan Git

- Hindari command destruktif (contoh: `git reset --hard`) kecuali diminta eksplisit.
- Commit message harus ringkas dan menjelaskan intent perubahan.
- Jangan push perubahan yang belum lolos `bun run check`.
