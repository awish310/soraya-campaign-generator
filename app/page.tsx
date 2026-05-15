'use client';

import { useEffect, useRef, useState } from 'react';
import {
  HATS,
  PLATFORMS,
  type HatValue,
  type MessageLanguage,
  type PlatformValue,
  type RecipientGender,
  type SenderGender,
} from '@/lib/persona';
import {
  persistHat,
  persistLink,
  persistMessageLanguage,
  persistPersonalConnection,
  persistSenderGender,
  readSavedHat,
  readSavedLink,
  readSavedMessageLanguage,
  readSavedPersonalConnection,
  readSavedSenderGender,
} from '@/lib/storage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReelsSection } from '@/components/ReelsSection';
import { CampaignForm } from '@/components/CampaignForm';
import { ResultCard } from '@/components/ResultCard';
import { Toast } from '@/components/Toast';
import { OnboardingModal } from '@/components/OnboardingModal';
import { CopyReviewModal, type CopyReviewAction } from '@/components/CopyReviewModal';
import { FacebookShareTip } from '@/components/FacebookShareTip';

interface GenerateResponse {
  message: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
}

interface GenerateError {
  error: string;
}

export default function Page() {
  const [link, setLink] = useState('');
  const [senderGender, setSenderGender] = useState<SenderGender>('unspecified');
  const [hat, setHat] = useState<HatValue>(HATS[0].value);
  const [platform, setPlatform] = useState<PlatformValue>(PLATFORMS[0].value);
  const [name, setName] = useState('');
  const [recipientGender, setRecipientGender] =
    useState<RecipientGender>('unspecified');
  const [smallTalk, setSmallTalk] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [personalConnection, setPersonalConnection] = useState('');
  const [messageLanguage, setMessageLanguage] = useState<MessageLanguage>('he');

  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [pendingAction, setPendingAction] = useState<CopyReviewAction | null>(null);

  const extraContextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedLink = readSavedLink();
    if (savedLink) setLink(savedLink);
    const savedGender = readSavedSenderGender();
    if (savedGender) setSenderGender(savedGender);
    const savedHat = readSavedHat();
    if (savedHat) setHat(savedHat);
    const savedConnection = readSavedPersonalConnection();
    if (savedConnection) setPersonalConnection(savedConnection);
    const savedLanguage = readSavedMessageLanguage();
    if (savedLanguage) setMessageLanguage(savedLanguage);
  }, []);

  const platformMeta = PLATFORMS.find((p) => p.value === platform);
  const isWhatsApp = !!platformMeta?.isWhatsApp;
  const reelSource: 'facebook' | 'instagram' | null =
    platform === 'facebook'
      ? 'facebook'
      : platform === 'instagram'
        ? 'instagram'
        : null;
  const isFacebook = platform === 'facebook';

  const scrollToReels = () => {
    document
      .getElementById('reels-grid')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const flash = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 2200);
  };

  const handleLinkChange = (value: string) => {
    setLink(value);
    persistLink(value.trim());
  };

  const handleSenderGenderChange = (value: SenderGender) => {
    setSenderGender(value);
    persistSenderGender(value === 'unspecified' ? null : value);
  };

  const handleHatChange = (value: HatValue) => {
    setHat(value);
    persistHat(value);
  };

  const handlePersonalConnectionChange = (value: string) => {
    setPersonalConnection(value);
    persistPersonalConnection(value);
  };

  const handleMessageLanguageChange = (value: MessageLanguage) => {
    setMessageLanguage(value);
    persistMessageLanguage(value);
  };

const handleGenerate = async () => {
    setError('');
    if (!link.trim()) {
      setError('יש להזין את קישור התרומה האישי לפני יצירת המסר.');
      return;
    }
    if (senderGender === 'unspecified') {
      setError('יש לבחור את המגדר שלך (גבר/אישה) לפני יצירת המסר.');
      return;
    }
    setLoading(true);
    setGenerated('');
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          hat,
          platform,
          link: link.trim(),
          senderGender,
          name: name.trim(),
          recipientGender,
          smallTalk: smallTalk.trim(),
          extraContext: extraContext.trim(),
          personalConnection: personalConnection.trim(),
          messageLanguage,
        }),
      });
      const data = (await resp.json()) as GenerateResponse | GenerateError;
      if (!resp.ok || 'error' in data) {
        setError('error' in data ? data.error : 'שגיאה לא צפויה ביצירת המסר.');
        return;
      }
      setGenerated(data.message);
    } catch {
      setError('שגיאת רשת. בדקו את החיבור ונסו שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generated) return;
    setPendingAction('copy');
  };

  const handleWhatsApp = () => {
    if (!generated) return;
    setPendingAction('whatsapp');
  };

  const handleReviewConfirm = async () => {
    if (!generated || !pendingAction) {
      setPendingAction(null);
      return;
    }
    if (pendingAction === 'copy') {
      try {
        await navigator.clipboard.writeText(generated);
        flash('הטקסט הועתק ללוח');
      } catch {
        flash('לא הצלחנו להעתיק. נסו ידנית.');
      }
    } else if (pendingAction === 'whatsapp') {
      const encoded = encodeURIComponent(generated);
      window.open(
        `https://wa.me/?text=${encoded}`,
        '_blank',
        'noopener,noreferrer',
      );
    }
    setPendingAction(null);
  };

  const handleReviewCancel = () => {
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen text-forest-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <CampaignForm
          link={link}
          onLinkChange={handleLinkChange}
          senderGender={senderGender}
          onSenderGenderChange={handleSenderGenderChange}
          hat={hat}
          onHatChange={handleHatChange}
          platform={platform}
          onPlatformChange={setPlatform}
          name={name}
          onNameChange={setName}
          recipientGender={recipientGender}
          onRecipientGenderChange={setRecipientGender}
          smallTalk={smallTalk}
          onSmallTalkChange={setSmallTalk}
          extraContext={extraContext}
          onExtraContextChange={setExtraContext}
          personalConnection={personalConnection}
          onPersonalConnectionChange={handlePersonalConnectionChange}
          messageLanguage={messageLanguage}
          onMessageLanguageChange={handleMessageLanguageChange}
          extraContextRef={extraContextRef}
        />

        {reelSource && <ReelsSection source={reelSource} />}

        <ResultCard
          loading={loading}
          error={error}
          generated={generated}
          isWhatsApp={isWhatsApp}
          onGenerate={handleGenerate}
          onCopy={handleCopy}
          onWhatsApp={handleWhatsApp}
        />

        {isFacebook && generated && !loading && (
          <FacebookShareTip onScrollToReels={scrollToReels} />
        )}
      </main>

      <Footer />

      <Toast message={toast} />

      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      <CopyReviewModal
        open={pendingAction !== null}
        action={pendingAction ?? 'copy'}
        onConfirm={handleReviewConfirm}
        onClose={handleReviewCancel}
      />
    </div>
  );
}
