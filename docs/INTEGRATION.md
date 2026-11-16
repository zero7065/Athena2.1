# SIS Integration Guide — EduManager & Other School Systems

> Prepared after reviewing public information about "EduManager" (Nov 2026).
> This document is the technical basis for a partnership conversation. It is
> **not** a legal or commercial agreement, and it does not claim that
> EduManager has endorsed or certified anything.

---

## 1. What I could verify online

**"EduManager" is not a single product.** Several unrelated vendors use the
name. The relevant candidates and what their public sites show:

| Candidate | Market | Public API docs? | Notes |
|---|---|---|---|
| [edumanager.ng](https://edumanager.ng) | Nigerian schools | ❌ None found | Has an explicit **"Partner With Us"** page: `edumanager.ng/partner-registration`. Features: students, admissions, attendance, fees, results, CBT, teachers, classes, parent comms, analytics, RBAC. |
| [edumanagerinfo.com](http://www.edumanagerinfo.com) | Nigerian Nursery/Primary/Secondary | ❌ None found | Student records, fees, results, CBT, attendance, parent portal, Android app. Contact: `info@edumanagerinfo.com`, `+234-803-636-8690`. |
| [edumanagerbd.com](https://edumanagerbd.com) | Bangladesh | ❌ None found | Cloud school ERP incl. universities. |
| [edumanager.net](https://edumanager.net) | Bangladesh (Aamra) | ❌ None found | School/college/university ERP. |
| GitHub `EduManager` projects | Open source | N/A | Demo/academic projects, not the commercial products. |

**Honest verdict:**
- There is **no public API documentation** for any of the commercial
  EduManager products I could find.
- Therefore I **cannot confirm** an API-level integration exists today.
- Everything below is **integration-ready on our side**, so it can be wired up
  quickly once EduManager answers the checklist in §3.
- Also note: the two Nigerian EduManager products describe **Nursery/Primary/
  Secondary** focus. For a **university** partnership, confirm they support
  higher-ed entities (faculty → department → programme → course → semester,
  GPA/transcripts, matric numbers).

---

## 2. What AcademiaIQ already supports (built, tested)

### A. CSV import — works today, no API needed
`Admin → Integrations → CSV Import`

| Import | Required columns (aliases accepted) |
|---|---|
| **Students** | `name` (or `full_name`), `email` (or `student_email`), `student_id` (or `matric_no`, `admission_no`), `department` (or `program`), `level` (or `year`) |
| **Courses** | `code` (or `course_code`), `title`, `department`, `credits`/`units`, `year`, `level`, `skills` (semicolon-separated) |
| **Results** | `student_name`, `student_id`, `course`, `score` (0–100, clamped) |

Imported students appear immediately in **Admin → Users**, **Social → Add
Friend**, and **Find Fellow Students**. Results appear in the Lecturer Portal.
Templates can be downloaded from the same screen.

### B. REST API adapter — configurable, vendor-agnostic
`Admin → Integrations → Connection Settings`

- Base URL, API key/token, custom auth header & prefix
- Health path (connection test), students path (pull)
- **Test connection** distinguishes: success, 401/403 (reachable but bad key),
  404 (wrong path), timeout/CORS (network)
- **Pull students** normalises common field names and de-duplicates

### C. Readiness checklist (live status)
`Admin → Integrations` shows exactly what is still missing:
provider set, base URL, credentials, CSV path available, last successful sync.

---

## 3. Checklist for EduManager (ask them these)

1. **API availability** — Do you expose a REST (or GraphQL) API for:
   students, staff, courses, classes/programmes, enrollments, results?
2. **Authentication** — API key, OAuth 2.0 client credentials, or JWT? Token
   lifetime and refresh?
3. **Base URL + environment** — Sandbox/staging URL separate from production?
4. **OpenAPI/Swagger spec** — Please share a spec or Postman collection.
5. **Rate limits** — Requests/minute and burst limits.
6. **Field schemas** — Exact JSON field names for student, course, enrollment,
   result objects (send a sample payload).
7. **Identifiers** — The canonical student key (matric no? UUID?) and whether
   email is guaranteed unique.
8. **Higher-ed support** — Faculty/department/programme/semester model, GPA and
   transcript export.
9. **Webhooks** — Can you push events (new student, result published) to our
   endpoint? Event list + payload shapes.
10. **SSO** — Do you support SAML 2.0 or OIDC for single sign-on, and
    deep-linking into our app with a signed token?
11. **CORS / IP allow-list** — For browser calls, or do you require a server
    proxy (we recommend the latter)?
12. **Data protection** — NDPR/NDPA compliance, retention, and a DPA template.
13. **Support contact** — Technical escalation contact + SLA.

---

## 4. Recommended integration architecture

```
EduManager ──(REST API, server-to-server)──▶ AcademiaIQ backend (/backend)
     │                                            │
     │                                            ▼
     └──(CSV export, fallback)──────────────▶ Admin → Integrations
                                                  │
                                                  ▼
                                       Local directory / courses / results
```

- Prefer **server-to-server** calls from `/backend` (holds the API key) rather
  than exposing credentials in the browser.
- Keep **CSV import** as the guaranteed fallback — it works even if the vendor
  has no API.
- Use **SSO (SAML/OIDC)** for identity so students don't create duplicate
  accounts.

---

## 5. Data contract (our side)

```ts
// Student
{ name: string; email: string; studentId: string; department: string; level?: number; role: 'student' }

// Course
{ code: string; title: string; department: string; credits: number; yearOfStudy: number; level: number; skills: string[] }

// Result
{ studentName: string; studentId: string; course: string; score: number /* 0-100 */ }
```

Aliases are normalised automatically (see `src/lib/integration.ts`).

---

## 6. Partnership next steps (practical order)

1. **Contact EduManager** — use `edumanager.ng/partner-registration` and
   `info@edumanagerinfo.com` / `+234-803-636-8690`. Send them this document
   and the §3 checklist.
2. **Request a sandbox** + API spec. Even a CSV export sample is enough to
   demonstrate end-to-end sync.
3. **Pilot** with one department: import students + courses, publish results.
4. **Harden**: move the API key to the backend, add SSO, agree the DPA.
5. **Go live** term-by-term with a named support contact on both sides.

---

## 7. Where this lives in the code

| Purpose | File |
|---|---|
| Config, CSV parsing, importers, REST adapter, readiness | `src/lib/integration.ts` |
| Admin UI (connection test, pull, CSV import) | `src/components/IntegrationsPanel.tsx` |
| Tests | `src/lib/integration.test.ts` (13 tests) |
