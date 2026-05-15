import { TriangleAlert, PhoneCall } from 'lucide-react';
import { type RefObject } from 'react';
import {
  HATS,
  MESSAGE_LANGUAGES,
  PLATFORMS,
  RECIPIENT_GENDERS,
  SENDER_GENDER_OPTIONS,
  type HatValue,
  type MessageLanguage,
  type PlatformValue,
  type RecipientGender,
  type SenderGender,
} from '@/lib/persona';
import { Card, Label } from './ui';

const SMALL_TALK_PRESETS = [
  'הרבה זמן לא דיברנו',
  'ראיתי פוסט שלך לאחרונה',
  'מקווה שאת/ה ומשפחתך בסדר',
  'חשבתי עליך לאחרונה',
];

export interface CampaignFormProps {
  link: string;
  onLinkChange: (value: string) => void;
  senderGender: SenderGender;
  onSenderGenderChange: (value: SenderGender) => void;
  hat: HatValue;
  onHatChange: (value: HatValue) => void;
  platform: PlatformValue;
  onPlatformChange: (value: PlatformValue) => void;
  name: string;
  onNameChange: (value: string) => void;
  recipientGender: RecipientGender;
  onRecipientGenderChange: (value: RecipientGender) => void;
  smallTalk: string;
  onSmallTalkChange: (value: string) => void;
  extraContext: string;
  onExtraContextChange: (value: string) => void;
  extraContextRef: RefObject<HTMLTextAreaElement | null>;
  personalConnection: string;
  onPersonalConnectionChange: (value: string) => void;
  messageLanguage: MessageLanguage;
  onMessageLanguageChange: (value: MessageLanguage) => void;
}

export function CampaignForm({
  link,
  onLinkChange,
  senderGender,
  onSenderGenderChange,
  hat,
  onHatChange,
  platform,
  onPlatformChange,
  name,
  onNameChange,
  recipientGender,
  onRecipientGenderChange,
  smallTalk,
  onSmallTalkChange,
  extraContext,
  onExtraContextChange,
  extraContextRef,
  personalConnection,
  onPersonalConnectionChange,
  messageLanguage,
  onMessageLanguageChange,
}: CampaignFormProps) {
  const platformMeta = PLATFORMS.find((p) => p.value === platform);
  const isPersonal = !!platformMeta?.isPersonal;
  const isInstagram = platform === 'instagram';

  return (
    <>
      <Card>
        <p className="text-xs text-sage-700 mb-1.5">
          קישור התרומה (Givechak) <span className="text-terracotta-600">*</span>
        </p>
        <input
          type="url"
          dir="ltr"
          required
          value={link}
          onChange={(e) => onLinkChange(e.target.value)}
          placeholder="https://www.jgive.com/new/he/ils/..."
          aria-label="קישור התרומה האישי"
          aria-invalid={!link.trim()}
          className={`w-full px-3 py-2 rounded-lg bg-cream-50 focus:ring-2 focus:ring-sage-200/60 outline-none transition text-left placeholder:text-sage-400 text-sm ${
            !link.trim()
              ? 'border-2 border-red-500 focus:border-red-600'
              : 'border border-cream-200 focus:border-sage-500'
          }`}
        />
      </Card>

      <Card>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-forest-700 mb-1">הזהות שלך</p>
            <p className="text-xs text-sage-600 mb-2">
              המגדר, הכובע וההקשר האישי שלך - שמורים בדפדפן ולא צריך למלא שוב.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="sm:w-72 shrink-0">
              <p className="text-xs text-sage-700 mb-1.5">
                המגדר שלך <span className="text-terracotta-600">*</span>
              </p>
              <div
                role="radiogroup"
                aria-label="המגדר שלך"
                aria-required="true"
                aria-invalid={senderGender === 'unspecified'}
                className={`grid grid-cols-2 gap-1 rounded-lg ${
                  senderGender === 'unspecified'
                    ? 'ring-2 ring-red-500'
                    : ''
                }`}
              >
                {SENDER_GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    role="radio"
                    aria-checked={senderGender === g.value}
                    onClick={() => onSenderGenderChange(g.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                      senderGender === g.value
                        ? 'bg-forest-800 text-cream-50 border-forest-800'
                        : 'bg-cream-50 text-forest-800 border-cream-200 hover:border-sage-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-sage-700 mb-1.5">הכובע שלך</p>
              <select
                value={hat}
                onChange={(e) => onHatChange(e.target.value as HatValue)}
                aria-label="הכובע שלך"
                className="w-full px-3 py-2 rounded-lg bg-cream-50 border border-cream-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200/60 outline-none transition text-sm"
              >
                {HATS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p className="text-xs text-sage-700 mb-1.5">
              ההקשר האישי שלך לקמפיין (חופשי)
            </p>
            <textarea
              value={personalConnection}
              onChange={(e) => onPersonalConnectionChange(e.target.value)}
              placeholder="לדוגמה: אני חברת ילדות של סופי / רונן היה המפקד שלי בצבא / היכרתי את מירב בטיול בהודו לפני 10 שנים / אני לוחם שהיה בסוראיה וחשוב לי לתמוך ולעזור עד כמה שאפשר..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200/60 outline-none transition resize-y placeholder:text-sage-400 leading-relaxed"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <div className="sm:w-44 shrink-0 mb-2">
            <h2 className="text-sm font-bold text-forest-800 mb-1">שפת המסר</h2>
            <div
              role="radiogroup"
              aria-label="שפת המסר"
              className="grid grid-cols-2 gap-1 rounded-lg"
            >
              {MESSAGE_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  role="radio"
                  aria-checked={messageLanguage === lang.value}
                  onClick={() => onMessageLanguageChange(lang.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                    messageLanguage === lang.value
                      ? 'bg-forest-800 text-cream-50 border-forest-800'
                      : 'bg-cream-50 text-forest-800 border-cream-200 hover:border-sage-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
          <Label hint="בחר את הפלטפורמה שעליה תפיץ את המסר">
            איפה תפיץ את המסר?
          </Label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPlatformChange(p.value)}
              className={`px-3 py-3 rounded-xl text-sm font-medium transition border-2 ${
                platform === p.value
                  ? 'bg-forest-800 text-cream-50 border-forest-800 shadow-sm'
                  : 'bg-cream-50 text-forest-800 border-cream-200 hover:border-sage-400 hover:bg-sage-50/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-3 bg-terracotta-50 border border-terracotta-200 rounded-xl p-3 flex items-start gap-2.5">
          <PhoneCall
            size={18}
            className="shrink-0 mt-0.5 text-terracotta-600"
            aria-hidden
          />
          <p className="text-sm text-terracotta-900 leading-relaxed">
            <strong>זכרו את כלל ה-2:1:</strong> אחרי כל מסר טקסט - עדיף לתפוס
            את האדם בשיחת טלפון או הודעה קולית אישית. הקול שלך משכנע יותר מכל
            טקסט.
          </p>
        </div>
      </Card>

      {isPersonal && (
        <Card>
          <Label hint="מסר אישי תמיד עובד יותר טוב">פרסונליזציה</Label>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-sage-700 mb-1.5">שם הנמען</p>
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="לדוגמה: דנה"
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200/60 outline-none transition placeholder:text-sage-400"
              />
            </div>
            <div>
              <p className="text-xs text-sage-700 mb-1.5">
                מגדר הנמען{' '}
                <span className="text-sage-500">
                  (משפר את ניסוח הפנייה בעברית)
                </span>
              </p>
              <div className="flex gap-1.5">
                {RECIPIENT_GENDERS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => onRecipientGenderChange(g.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border-2 transition ${
                      recipientGender === g.value
                        ? 'bg-forest-800 text-cream-50 border-forest-800'
                        : 'bg-cream-50 text-forest-800 border-cream-200 hover:border-sage-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-sage-700 mb-1.5">פתיח / סמול-טוק</p>
              <input
                type="text"
                value={smallTalk}
                onChange={(e) => onSmallTalkChange(e.target.value)}
                placeholder="לדוגמה: הרבה זמן לא דיברנו"
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200/60 outline-none transition placeholder:text-sage-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SMALL_TALK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onSmallTalkChange(preset)}
                    className="px-3 py-1.5 text-xs rounded-full bg-terracotta-50 text-terracotta-800 border border-terracotta-200 hover:bg-terracotta-100 hover:border-terracotta-300 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Label hint="פרטים על הנמען הספציפי או דגשים נקודתיים למסר הזה - לא הקשר קבוע שלך, אלא משהו שיעזור למסר הזה.">
          פרטים על הנמען / על המסר (חופשי)
        </Label>
        <textarea
          ref={extraContextRef}
          value={extraContext}
          onChange={(e) => onExtraContextChange(e.target.value)}
          placeholder="לדוגמה: דנה מנהלת קרן צדקה; הוא תרם בעבר ואני רוצה להזכיר את זה; היא דווקא תיכנס יותר מהקשר משפחתי..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-cream-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-200/60 outline-none transition resize-y placeholder:text-sage-400 leading-relaxed"
        />
      </Card>

      {isInstagram && <InstagramNotice />}
    </>
  );
}

function InstagramNotice() {
  return (
    <div className="bg-terracotta-50 border-r-4 border-terracotta-500 rounded-xl p-4 text-terracotta-900 shadow-sm">
      <div className="flex gap-3 items-start">
        <TriangleAlert size={22} className="shrink-0 mt-0.5 text-terracotta-600" />
        <div>
          <h3 className="font-bold mb-1">שימו לב לגבי אינסטגרם</h3>
          <p className="text-sm leading-relaxed">
            באינסטגרם לינקים בפוסטים לא עובדים. מומלץ להעלות סטורי ולהשתמש
            בסטיקר לינק (Link Sticker) עם הקישור האישי שלך.
          </p>
        </div>
      </div>
    </div>
  );
}
