export type HatValue =
  | 'founders'
  | 'founders-self'
  | 'shai-sofi'
  | 'shai-sofi-self'
  | 'fighter'
  | 'family'
  | 'general';

export type PlatformValue =
  | 'whatsapp-personal'
  | 'whatsapp-group'
  | 'facebook'
  | 'instagram'
  | 'email';

export interface Hat {
  value: HatValue;
  label: string;
  voice: string;
}

export interface Platform {
  value: PlatformValue;
  label: string;
  guidance: string;
  isPersonal?: boolean;
  isWhatsApp?: boolean;
}

export const HATS: Hat[] = [
  {
    value: 'founders',
    label: 'קרוב של רונן ומירב',
    voice: `אתה כותב/ת בשם שגריר/ה שהוא חבר/ה אישי/ת של רונן ומירב, מייסדי מרכז סוראיה. את/ה מכיר/ה אותם אישית, ראית את המסירות והעבודה שלהם מקרוב. הטון: מכבד, אישי, נוגע. מדגיש/ה שזו עבודת חיים אמיתית של אנשים שאת/ה אוהב/ת ומעריך/ה.`,
  },
  {
    value: 'founders-self',
    label: 'אני רונן או מירב',
    voice: `אתה כותב/ת בגוף ראשון, מנקודת המבט של רונן או מירב - מייסדי ובעלי מרכז סוראיה. הקמתם את המקום בשליחות מלאה, אתם בעצמכם מטפלים, בניתם אותו במו ידיכם, ועושים כל מה שאפשר כדי שללוחמים יהיה הכי טוב. אתם אנשים צנועים שמאמינים שהכל אפשרי, ושייכים למקום הזה ברמה הכי עמוקה - הוא הבית שלכם, הלוחמים הם המשפחה.

הטון: אישי, ענוותני, מבוסס. לא "הקמתי דבר גדול" אלא "יש עבודה, אנחנו עושים אותה". דבר/י מהמקום של מי שיודע מבפנים מה הכי חשוב לעשות. השתמש/י בלשון שייכות עמוקה: "אנחנו בנינו", "המטופלים שלנו", "הבית שלנו". הימנע/י משבחים עצמיים ומכל תחושה של גנדור - תן/י לעבודה לדבר. הצניעות והשליחות הן עצמן המסר.`,
  },
  {
    value: 'shai-sofi',
    label: 'קרוב של שי וסופי',
    voice: `אתה כותב/ת בשם שגריר/ה שהוא חבר/ה אישי/ת של שי וסופי, זוג ישראלי שרתם את הסביבה הקרובה שלהם לקמפיין של מרכז סוראיה. הטון: חברי, חם, אישי. מזכיר/ה את שי וסופי בשם, כי הקשר אליהם הוא הסיבה שאת/ה כותב/ת. לא רשמי. כמו לדבר עם חברים.`,
  },
  {
    value: 'shai-sofi-self',
    label: 'אני שי או סופי',
    voice: `אתה כותב/ת בגוף ראשון, מנקודת המבט של שי או סופי. אתם מנהלים את מרכז סוראיה בחצי השנה האחרונה ונחשפים יום-יום ללוחמים שמגיעים ולתהליך המדהים שהם עוברים. אתם אבא ואמא של המקום, והעבודה הזו היא זכות גדולה עבורכם - לא חובה, לא משימה, זכות.

הטון: חם, נוכח, מעורב רגשית בלי להיות דרמטי. דבר/י מתוך החוויה היומיומית - מה את/ה רואה במו עיניך, מה משנה אותך, מה גורם לך להתאהב במקום הזה כל יום מחדש. דוגמאות לפתיחים מתאימים: "מאז שאנחנו כאן...", "אני רואה כל יום...", "בחצי השנה האחרונה ראיתי דברים שלא חשבתי שאפשר...". ספר/י על הצד האנושי שאת/ה חווה מקרוב - לא רטוריקה ולא הצהרות גדולות, רק עדות אישית מהשטח. הזכרת המילה "זכות" טבעית כאן.`,
  },
  {
    value: 'fighter',
    label: 'לוחם שהיה במרכז',
    voice: `אתה כותב/ת בגוף ראשון, מנקודת המבט של לוחם/לוחמת צה"ל שחזר/ה מהמלחמה פצוע/ה וקיבל/ה ליווי וטיפול במרכז סוראיה. הטון: אישי מאוד, אמיתי, ללא פאתוס. מספר/ת מתוך החוויה - מה היה קשה, מה עזר. "אני" ולא "הם". זהירות עם דרמה: הסיפור עצמו דרמטי מספיק.`,
  },
  {
    value: 'family',
    label: 'בת זוג / משפחה של לוחם',
    voice: `אתה כותב/ת בגוף ראשון, מנקודת מבט של בן/בת זוג או בן/בת משפחה של לוחם שטופל במרכז סוראיה. הטון: אישי, חם, מספר/ת על מה שלא רואים - איך המלחמה לא נגמרת ביום שהלוחם חוזר הביתה, ואיך המרכז עזר לכל המשפחה לנשום שוב. כנות, לא דרמה.`,
  },
  {
    value: 'general',
    label: 'שגריר כללי',
    voice: `אתה כותב/ת בשם שגריר/ה של מרכז סוראיה ללא קשר אישי לאנשים הספציפיים. הטון: כן, חם, מבוסס. מדגיש/ה את הערך והייחודיות של המרכז ואת הצורך הקיים. פחות סיפור אישי, יותר מסר ערכי שמזמין הצטרפות.`,
  },
];

export const PLATFORMS: Platform[] = [
  {
    value: 'whatsapp-personal',
    label: 'וואטסאפ · אישי',
    isPersonal: true,
    isWhatsApp: true,
    guidance: `הודעה אישית בוואטסאפ לאדם ספציפי. פותחים בפנייה אישית (היי [שם]) ובסמול-טוק. אורך: 4-7 שורות. טון אישי וישיר. מסיימים בקריאה רכה לפעולה ובקישור.`,
  },
  {
    value: 'whatsapp-group',
    label: 'וואטסאפ · קבוצה',
    isWhatsApp: true,
    guidance: `הודעה לקבוצת וואטסאפ. פתיחה כללית ("חברים יקרים", "חברים"). לא פונים לאדם בודד. אורך: 5-8 שורות. רשמי יותר מאישי אבל לא יבש. מסיימים בקישור.`,
  },
  {
    value: 'facebook',
    label: 'פייסבוק',
    guidance: `פוסט לפייסבוק. אורך: 8-14 שורות. יש מקום לסיפור או הקשר. ניתן להשתמש בפסקאות. מתאים לקהל רחב יחסית. סוף ברור עם קישור התרומה וקישור החומרים על המרכז (לפי שפת המסר - ראה כלל 3).`,
  },
  {
    value: 'instagram',
    label: 'אינסטגרם',
    guidance: `כיתוב לפוסט באינסטגרם. קצר וקולע: 4-8 שורות. ניתן להוסיף אימוג'י אחד-שניים בטעם טוב (לא יותר). חשוב: באינסטגרם לינקים בכיתוב לא לחיצים - הקישור מוצג כטקסט אבל הקריאה לפעולה צריכה לרמוז להעלאת סטורי עם link sticker, או "קישור בביו".`,
  },
  {
    value: 'email',
    label: 'מייל רשמי',
    isPersonal: true,
    guidance: `מייל רשמי לאיש קשר ספציפי בגוף ארגוני (חברה, תקשורת, HR, קרן, קרן ציבורית).
מבנה הפלט - בדיוק בסדר הזה:
1. שורה ראשונה: "נושא: " ואחריה שורת נושא קצרה ותכליתית (5-9 מילים).
2. שורה ריקה.
3. פנייה: "שלום [שם]," אם סופק שם נמען, אחרת "לכבוד,".
4. שורה ריקה.
5. פסקת פתיחה (1-3 שורות): הצגה עצמית של השגריר ולמה דווקא לגוף הזה.
6. פסקה מרכזית (3-6 שורות): מה מרכז סוראיה עושה, באילו תוצאות, ומה ההזדמנות הקונקרטית לשת"פ (חסות, matching, חשיפה, גרנט, ביקור, שותפות).
7. פסקת סיום (1-2 שורות) עם קריאה ברורה לצעד הבא: פגישה קצרה, שיחת היכרות, פרטים נוספים.
8. שורה ריקה.
9. חתימה: "בברכה,\\n[שם השגריר]" - השאר את "[שם השגריר]" כפלייסהולדר.
אורך כולל: 14-22 שורות. ללא אימוג'י. הקישורים (תרומה, וקישור החומרים על המרכז לפי שפת המסר) משולבים בטבעיות בגוף הטקסט, לא כרשימה.`,
  },
];

export const HAT_VALUES: readonly HatValue[] = HATS.map((h) => h.value);
export const PLATFORM_VALUES: readonly PlatformValue[] = PLATFORMS.map(
  (p) => p.value,
);

export function isHat(value: unknown): value is HatValue {
  return typeof value === 'string' && (HAT_VALUES as readonly string[]).includes(value);
}

export function isPlatform(value: unknown): value is PlatformValue {
  return (
    typeof value === 'string' &&
    (PLATFORM_VALUES as readonly string[]).includes(value)
  );
}

export type RecipientGender = 'male' | 'female' | 'unspecified';

export const RECIPIENT_GENDERS: Array<{ value: RecipientGender; label: string }> = [
  { value: 'unspecified', label: 'לא מצוין' },
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
];

export function isRecipientGender(value: unknown): value is RecipientGender {
  return value === 'male' || value === 'female' || value === 'unspecified';
}

// The ambassador (sender) gender. Affects first-person forms in the message
// ("נרתם" vs "נרתמת", "מאמין" vs "מאמינה"). `unspecified` is the empty initial
// state — the form requires a real selection before allowing generation.
export type SenderGender = 'male' | 'female' | 'unspecified';

export const SENDER_GENDER_OPTIONS: Array<{
  value: Exclude<SenderGender, 'unspecified'>;
  label: string;
}> = [
  { value: 'male', label: 'גבר' },
  { value: 'female', label: 'אישה' },
];

export function isSenderGender(value: unknown): value is SenderGender {
  return value === 'male' || value === 'female' || value === 'unspecified';
}

// Language the generated message is written in.
export type MessageLanguage = 'he' | 'en';

export const MESSAGE_LANGUAGES: Array<{ value: MessageLanguage; label: string }> = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' },
];

export function isMessageLanguage(value: unknown): value is MessageLanguage {
  return value === 'he' || value === 'en';
}
