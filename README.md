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

## בנייה

```bash
npm run build
npm start
```

## טיפוסים

```bash
npm run typecheck
```
