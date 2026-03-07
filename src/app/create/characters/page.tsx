'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionJSON, getSessionText, setSessionJSON } from '@/lib/storage';
import { getClientUserId } from '@/lib/client-user';
import { updateBible } from '@/lib/bible';

interface Character {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age: number;
  bioShort: string;
  bioFull: string;
  physicalDescription: string;
  visualPrompt: string;
  speechPattern: string;
  personalityTraits: string[];
  relationships: string[];
  portraitUrl?: string;
  isGeneratingPortrait?: boolean;
}

interface CreateConfig {
  userId?: string;
  style: string;
  contentRating: string;
  artDetail: string;
  colorMode: string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  protagonist: { bg: 'bg-gold-premium/15', text: 'text-gold-premium', label: 'Protagonist' },
  antagonist: { bg: 'bg-manga-red/15', text: 'text-manga-red', label: 'Antagonist' },
  supporting: { bg: 'bg-cyan/15', text: 'text-cyan', label: 'Supporting' },
  minor: { bg: 'bg-ink-light/15', text: 'text-ink-light', label: 'Minor' },
};

function CharacterCard({
  character,
  index,
  onRegenPortrait,
}: {
  character: Character;
  index: number;
  onRegenPortrait: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const role = ROLE_COLORS[character.role] || ROLE_COLORS.minor;

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, type: 'spring' }}
      className="glass-card overflow-hidden group cursor-pointer hover:border-violet/30 transition-all"
      onClick={() => setExpanded((open) => !open)}
    >
      <div className="relative h-64 bg-gradient-to-br from-ink-wash to-ink-deep overflow-hidden">
        {character.isGeneratingPortrait ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-violet/30 animate-spin-slow" />
            <div className="absolute w-10 h-10 rounded-full border border-cyan/30 animate-spin-reverse" />
          </div>
        ) : character.portraitUrl ? (
          <img
            src={character.portraitUrl}
            alt={character.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center shimmer">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-transparent to-transparent" />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-mono ${role.bg} ${role.text} backdrop-blur-sm border border-current/15`}>
          {role.label}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium mb-1">{character.name}</h3>
        <p className="text-ink-light/70 text-sm mb-3">{character.bioShort}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {character.personalityTraits.slice(0, 4).map((trait) => (
            <span key={trait} className="px-2 py-0.5 text-xs rounded-full bg-ink-wash/60 text-ink-light/75 border border-ink-mid/20">
              {trait}
            </span>
          ))}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-ink-mid/20">
                <p className="text-sm text-ink-light/75 leading-relaxed whitespace-pre-line mb-3">
                  {character.bioFull}
                </p>
                <div className="flex items-center gap-2 text-xs text-ink-light/55">
                  <span>Age: {character.age}</span>
                  <span>·</span>
                  <span className="italic">“{character.speechPattern}”</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-4" onClick={(event) => event.stopPropagation()}>
          <button onClick={onRegenPortrait} className="flex-1 py-2 rounded-lg text-xs font-mono btn-ghost">
            New Portrait
          </button>
          <button className="flex-1 py-2 rounded-lg text-xs font-mono btn-ghost">Edit</button>
        </div>
      </div>
    </motion.div>
  );
}

async function generatePortraitInBackground(
  character: Character,
  style: string,
  userId: string
): Promise<string | null> {
  try {
    const response = await fetch('/api/generate-portrait', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        visualPrompt: character.visualPrompt,
        style,
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { image?: string };
    return data.image || null;
  } catch {
    return null;
  }
}

export default function CharactersPage() {
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const synopsis = getSessionJSON<Record<string, unknown>>('synopsis');
    const config = getSessionJSON<CreateConfig>('config');

    if (!synopsis || !config) {
      router.push('/create');
      return;
    }

    const userId = config.userId || getClientUserId();

    async function generateCharacters() {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch('/api/generate-characters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            userId,
            synopsis,
            style: config.style,
            contentRating: config.contentRating,
            artDetail: config.artDetail,
            colorMode: config.colorMode,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || 'Could not generate characters');
        }

        const data = (await response.json()) as { characters?: Character[] };
        const generated = (data.characters || []).slice(0, 8).map((character) => ({
          ...character,
          portraitUrl: undefined,
          isGeneratingPortrait: true,
        }));

        setCharacters(generated);
        setIsGenerating(false);

        const updatedCharacters = [...generated];
        for (let index = 0; index < generated.length; index += 1) {
          const imageUrl = await generatePortraitInBackground(generated[index], config.style, userId);
          updatedCharacters[index] = {
            ...updatedCharacters[index],
            portraitUrl: imageUrl || undefined,
            isGeneratingPortrait: false,
          };
          setCharacters([...updatedCharacters]);
        }
      } catch (err) {
        setError((err as Error).message || 'Could not generate characters');

        const fallback: Character[] = [
          {
            name: 'Ari Solane',
            role: 'protagonist',
            age: 19,
            bioShort: 'A restless creator who can draw portals between memories and reality.',
            bioFull:
              'Ari survived the collapse of the Archive District and now chases lost pages that rewrite fate. Every sketch they complete alters the world in subtle ways, but each edit costs a memory.',
            physicalDescription: 'Short dark hair, asymmetrical jacket, silver ink marks on fingers',
            visualPrompt:
              'Young androgynous hero, short dark hair, confident posture, silver ink patterns on hands, dynamic comic lighting',
            speechPattern: 'Fast, metaphor-heavy, emotionally guarded',
            personalityTraits: ['Inventive', 'Impulsive', 'Loyal', 'Curious', 'Haunted'],
            relationships: [],
            portraitUrl: undefined,
            isGeneratingPortrait: false,
          },
          {
            name: 'Marshal Veyra',
            role: 'antagonist',
            age: 41,
            bioShort: 'Commander of the Red Ledger, determined to control all narrative anomalies.',
            bioFull:
              'Veyra believes chaos can only be stopped by strict control of creative power. She sees Ari as both a threat and the final key to stabilizing the fractured city.',
            physicalDescription: 'Tall, precise posture, crimson coat, mechanical monocle',
            visualPrompt:
              'Severe woman in crimson military coat, mechanical monocle, imposing posture, dramatic shadows',
            speechPattern: 'Measured, formal, razor-sharp',
            personalityTraits: ['Disciplined', 'Strategic', 'Severe', 'Protective', 'Ruthless'],
            relationships: [],
            portraitUrl: undefined,
            isGeneratingPortrait: false,
          },
        ];

        setCharacters(fallback);
        setIsGenerating(false);
      }
    }

    generateCharacters();
  }, [router]);

  const handleRegenPortrait = async (index: number) => {
    const config = getSessionJSON<CreateConfig>('config');
    if (!config) return;

    const userId = config.userId || getClientUserId();
    setCharacters((previous) =>
      previous.map((character, characterIndex) =>
        characterIndex === index ? { ...character, isGeneratingPortrait: true } : character
      )
    );

    const imageUrl = await generatePortraitInBackground(characters[index], config.style, userId);

    setCharacters((previous) =>
      previous.map((character, characterIndex) =>
        characterIndex === index
          ? { ...character, portraitUrl: imageUrl || undefined, isGeneratingPortrait: false }
          : character
      )
    );
  };

  const handleBeginChapter = async () => {
    if (!characters.length) return;

    const config = getSessionJSON<CreateConfig>('config');
    if (!config) return;

    const userId = config.userId || getClientUserId();

    setSessionJSON('characters', characters);
    updateBible({ characters });

    const draftProjectId = getSessionText('draftProjectId');
    if (draftProjectId) {
      fetch(`/api/library/${draftProjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ characters }),
      }).catch(() => {
        // Non-blocking update.
      });
    }

    router.push('/create/chapter');
  };

  return (
    <main className="min-h-screen relative mesh-gradient">
      <div className="fixed top-6 left-6 z-50">
        <Link href="/create/synopsis" className="flex items-center gap-2 text-ink-light hover:text-paper-warm transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back to synopsis</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-28">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-mono text-gold-premium mb-3 tracking-wider uppercase">Characters</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light mb-3">
            Build the <span className="gradient-text font-semibold">Cast</span>
          </h1>
          <p className="text-ink-light/70 text-lg font-light">Generate memorable protagonists, antagonists, and supporting voices.</p>
        </motion.div>

        {error && <div className="glass-card p-4 border border-red-400/30 text-red-200 text-sm mb-6">{error}</div>}

        {isGenerating ? (
          <motion.div className="flex flex-col items-center justify-center min-h-[40vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border border-violet/30 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-cyan/30 animate-spin-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20 animate-pulse" />
              </div>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-xl text-paper-warm/80 font-light">
              Designing your cast…
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {characters.map((character, index) => (
                <CharacterCard
                  key={`${character.name}-${index}`}
                  character={character}
                  index={index}
                  onRegenPortrait={() => handleRegenPortrait(index)}
                />
              ))}
            </div>

            <div className="text-center relative z-20 mt-6">
              <button
                onClick={handleBeginChapter}
                disabled={!characters.length}
                className={`px-14 py-5 rounded-2xl font-[family-name:var(--font-heading)] font-bold text-xl transition-all duration-500 ${
                  characters.length
                    ? 'btn-primary glow-pulse-cta hover:scale-105 active:scale-95'
                    : 'bg-ink-wash/50 text-ink-light/30 cursor-not-allowed'
                }`}
              >
                Continue to Chapter Builder
              </button>
              <p className="mt-4 text-sm text-ink-light/45">⚡ Character generation cost: ~3 credits</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
