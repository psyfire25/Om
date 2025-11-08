# Mas del Om — Internal (Concertina UI + i18n: EN/ES/CA/FR/IT)

- File-browser style chrome with **concertina columns**
- Multilingual routing via URL: `/en`, `/es`, `/ca`, `/fr`, `/it`
- Robust auth: JWT cookie sessions, password hashing, invite links
- Private modules: Projects, Tasks, Materials, Logs
- Super admin can generate locale-specific invite links

## Run
```bash
cp .env.example .env
npm install
npm run dev
```
Bootstrap the first super-admin:
```bash
curl -X POST http://localhost:3000/api/auth/bootstrap
```
Then open http://localhost:3000/en/login

Data is stored in `data/db.json` (lowdb).

Built 2025-11-08.
