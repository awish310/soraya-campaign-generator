import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import {
  isHat,
  isMessageLanguage,
  isPlatform,
  isRecipientGender,
  isSenderGender,
  type HatValue,
  type MessageLanguage,
  type PlatformValue,
  type RecipientGender,
  type SenderGender,
} from '@/lib/persona';
import { getKv, todayUtc, COUNTER_KEYS } from '@/lib/kv';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface GenerateRequest {
  hat: HatValue;
  platform: PlatformValue;
  link: string;
  senderGender: SenderGender;
  messageLanguage: MessageLanguage;
  name?: string;
  recipientGender?: RecipientGender;
  smallTalk?: string;
  extraContext?: string;
  personalConnection?: string;
}

let clientInstance: Anthropic | null = null;
function getClient(): Anthropic {
  if (!clientInstance) clientInstance = new Anthropic();
  return clientInstance;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'גוף הבקשה אינו JSON תקין.' }, { status: 400 });
  }

  const parsed = parseBody(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const userPayload = {
    hat: parsed.hat,
    platform: parsed.platform,
    link: parsed.link,
    senderGender: parsed.senderGender,
    messageLanguage: parsed.messageLanguage,
    name: parsed.name ?? '',
    recipientGender: parsed.recipientGender ?? 'unspecified',
    smallTalk: parsed.smallTalk ?? '',
    personalConnection: parsed.personalConnection ?? '',
    extraContext: parsed.extraContext ?? '',
  };

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `צור עבורי מסר. הקלט:\n\n\`\`\`json\n${JSON.stringify(userPayload, null, 2)}\n\`\`\``,
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()
      // Belt-and-suspenders: strip em/en dashes that signal AI-generated text.
      // The system prompt forbids these; this guarantees they never leak.
      .replace(/[—–]/g, '-');

    if (!text) {
      return NextResponse.json(
        { error: 'לא התקבל טקסט מהמודל. נסו שוב.' },
        { status: 502 },
      );
    }

    // Fire-and-forget: increment generation counters. KV errors are logged
    // but never propagate to the user (a transient KV outage shouldn't
    // block a successful generation from being returned).
    const kv = getKv();
    if (kv) {
      const day = todayUtc();
      Promise.all([
        kv.incr(COUNTER_KEYS.total),
        kv.incr(COUNTER_KEYS.day(day)),
        kv.incr(COUNTER_KEYS.hat(parsed.hat)),
        kv.incr(COUNTER_KEYS.platform(parsed.platform)),
        kv.incr(COUNTER_KEYS.language(parsed.messageLanguage)),
      ]).catch((err) => {
        console.error('[generate] KV counter increment failed', err);
      });
    }

    return NextResponse.json({
      message: text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
        cache_creation_input_tokens:
          response.usage.cache_creation_input_tokens ?? 0,
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: 'מפתח ה-API של Anthropic לא מוגדר או שגוי.' },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'נחסם זמנית בגלל יותר מדי בקשות. נסו שוב בעוד דקה.' },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `שגיאת API: ${error.message}` },
        { status: error.status ?? 502 },
      );
    }
    console.error('[generate] unexpected error', error);
    return NextResponse.json(
      { error: 'שגיאה לא צפויה ביצירת המסר.' },
      { status: 500 },
    );
  }
}

type ParseResult = GenerateRequest | { error: string };

function parseBody(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) {
    return { error: 'גוף הבקשה ריק.' };
  }
  const b = body as Record<string, unknown>;

  if (!isHat(b.hat)) {
    return { error: 'יש לבחור "כובע" תקין.' };
  }
  if (!isPlatform(b.platform)) {
    return { error: 'יש לבחור פלטפורמה תקינה.' };
  }

  const link = typeof b.link === 'string' ? b.link.trim() : '';
  if (!link) {
    return { error: 'יש להזין את קישור התרומה האישי.' };
  }

  if (!isSenderGender(b.senderGender) || b.senderGender === 'unspecified') {
    return { error: 'יש לבחור את המגדר שלך (גבר/אישה).' };
  }

  const messageLanguage: MessageLanguage = isMessageLanguage(b.messageLanguage)
    ? b.messageLanguage
    : 'he';

  return {
    hat: b.hat,
    platform: b.platform,
    link,
    senderGender: b.senderGender,
    messageLanguage,
    name: typeof b.name === 'string' ? b.name.trim() : undefined,
    recipientGender: isRecipientGender(b.recipientGender)
      ? b.recipientGender
      : undefined,
    smallTalk: typeof b.smallTalk === 'string' ? b.smallTalk.trim() : undefined,
    extraContext:
      typeof b.extraContext === 'string' ? b.extraContext.trim() : undefined,
    personalConnection:
      typeof b.personalConnection === 'string'
        ? b.personalConnection.trim()
        : undefined,
  };
}
