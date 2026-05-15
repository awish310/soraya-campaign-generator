'use client';

import { useEffect, useRef, useState } from 'react';
import {
  HATS,
  PLATFORMS,
  type HatValue,
  type PlatformValue,
  type RecipientGender,
} from '@/lib/persona';
import { persistLink, readSavedLink } from '@/lib/storage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReelsSection } from '@/components/ReelsSection';
import { CampaignForm } from '@/components/CampaignForm';
import { ResultCard } from '@/components/ResultCard';
import { Toast } from '@/components/Toast';
import { OnboardingModal } from '@/components/OnboardingModal';
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
  const [hat, setHat] = useState<HatValue>(HATS[0].value);
  const [platform, setPlatform] = useState<PlatformValue>(PLATFORMS[0].value);
  const [name, setName] = useState('');
  const [recipientGender, setRecipientGender] =
    useState<RecipientGender>('unspecified');
  const [smallTalk, setSmallTalk] = useState('');
  const [extraContext, setExtraContext] = useState('');

  const [generated, setGenerated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [onboardingOpen, setOnboardingOpen] = useState(true);

  const extraContextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = readSavedLink();
    if (saved) setLink(saved);
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

const handleGenerate = async () => {
    setError('');
    if (!link.trim()) {
      setError('יש להזין את קישור התרומה האישי לפני יצירת המסר.');
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
          name: name.trim(),
          recipientGender,
          smallTalk: smallTalk.trim(),
          extraContext: extraContext.trim(),
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

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      flash('הטקסט הועתק ללוח');
    } catch {
      flash('לא הצלחנו להעתיק. נסו ידנית.');
    }
  };

  const handleWhatsApp = () => {
    if (!generated) return;
    const encoded = encodeURIComponent(generated);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen text-forest-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <CampaignForm
          link={link}
          onLinkChange={handleLinkChange}
          hat={hat}
          onHatChange={setHat}
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
    </div>
  );
}
