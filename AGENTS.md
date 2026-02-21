# Agent Guardrails

Gunakan quality gate ini sebelum menganggap task selesai:

- Fast check: `bun run check:fast`
- Full check: `bun run check`

Aturan:

- Jika ada lint error, perbaiki dulu; jangan biarkan warning/error tertinggal.
- Jangan commit jika `bun run fmt:check` gagal.
- CI adalah sumber kebenaran terakhir; jika CI merah, perubahan dianggap gagal.
