# מילים לנשום · מרכז סוראיה

כלי שגרירים לקמפיין מרכז סוראיה. מייצר מסר מותאם אישית באמצעות Claude (Anthropic) לכל פרסונה ולכל פלטפורמה.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (RTL, עברית)
- **Anthropic SDK** (`claude-sonnet-4-6`) — צד שרת, עם prompt caching של ה-system prompt
- **lucide-react** (אייקונים)

## הפעלה

1. התקנת תלויות:
   ```bash
   npm install
   ```
2. הגדרת מפתח Anthropic:
   ```bash
   cp .env.local.example .env.local
   # ערוך את .env.local והוסף את ANTHROPIC_API_KEY שלך
   ```
3. הפעלה:
   ```bash
   npm run dev
   ```

## מבנה

- `app/page.tsx` — Client component, הטופס וה-UI.
- `app/api/generate/route.ts` — API route. מקבל JSON, קורא ל-Claude עם system prompt caching, מחזיר את הטקסט.
- `lib/persona.ts` — הגדרות "הכובעים" והפלטפורמות.
- `lib/system-prompt.ts` — ה-system prompt עצמו (קבוע, caching-friendly).

## עריכה

- **קישור חומרי מדיה**: `RESOURCES_LINK` בראש `app/page.tsx` (כרגע placeholder).
- **תוכן ה-prompts**: `lib/persona.ts` ו-`lib/system-prompt.ts`.
- **המודל**: `app/api/generate/route.ts` — כרגע `claude-sonnet-4-6`.

## לוח שימוש מוסתר (admin)

יש לוח usage נסתר ב-`/admin/usage` שמציג נתוני שימוש מ-Anthropic Admin API: עלות יומית, טוקנים לאורך זמן, חלוקה לפי מודל, סטטיסטיקות קאש, וחישוב באלאנס נוכחי.

**גישה**: 5 הקשות על הלוגו בכותרת תוך 5 שניות.

**משתני סביבה נדרשים** (Vercel → Project Settings → Environment Variables):

| משתנה | הסבר |
|---|---|
| `ANTHROPIC_ADMIN_KEY` | מפתח Admin API (`sk-ant-admin-...`). שונה מ-`ANTHROPIC_API_KEY` הרגיל. ניתן ליצור בכתובת console.anthropic.com → Settings → Admin keys. |
| `INITIAL_CREDITS_USD` | סכום הקרדיטים שטענת (לדוגמה `100`). משמש לחישוב באלאנס נוכחי = `INITIAL_CREDITS_USD − סך עלויות מאז INITIAL_CREDITS_DATE`. |
| `INITIAL_CREDITS_DATE` | (אופציונלי) תאריך ISO של טעינת הקרדיטים, למשל `2026-01-01T00:00:00Z`. ברירת מחדל: 90 ימים אחורה. |

**הערה אבטחה**: ה-endpoint `/api/admin/metrics` פתוח לכל מי שמגלה את הכתובת. הנתונים שמוחזרים הם אגרגטים של שימוש (טוקנים, עלות), ללא PII. אם אתה רוצה אבטחה אמיתית - שווה להוסיף Basic Auth ב-Vercel או password gate.

## בנייה

```bash
npm run build
npm start
```

## טיפוסים

```bash
npm run typecheck
```
