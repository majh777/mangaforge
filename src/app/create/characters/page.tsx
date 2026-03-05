'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  protagonist: { bg: 'bg-gold-premium/10', text: 'text-gold-premium', label: 'Protagonist' },
  antagonist: { bg: 'bg-manga-red/10', text: 'text-manga-red', label: 'Antagonist' },
  supporting: { bg: 'bg-cyan/10', text: 'text-cyan', label: 'Supporting' },
  minor: { bg: 'bg-ink-light/10', text: 'text-ink-light', label: 'Minor' },
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
      transition={{ delay: index * 0.3, duration: 0.6, type: 'spring' }}
      className="glass-card overflow-hidden group cursor-pointer hover:border-violet/20 transition-all"
      onClick={() => setExpanded(!expanded)}
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
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-mono ${role.bg} ${role.text} backdrop-blur-sm border border-current/10`}>
          {role.label}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium mb-1">{character.name}</h3>
        <p className="text-ink-light/50 text-sm mb-3">{character.bioShort}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {character.personalityTraits.slice(0, 4).map((trait) => (
            <span key={trait} className="px-2 py-0.5 text-xs rounded-full bg-ink-wash/50 text-ink-light/50 border border-ink-mid/10">
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
              <div className="pt-3 border-t border-ink-mid/10">
                <p className="text-sm text-ink-light/50 leading-relaxed whitespace-pre-line mb-3">
                  {character.bioFull}
                </p>
                <div className="flex items-center gap-2 text-xs text-ink-light/30">
                  <span>Age: {character.age}</span>
                  <span>&middot;</span>
                  <span className="italic">&ldquo;{character.speechPattern}&rdquo;</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onRegenPortrait}
            className="flex-1 py-2 rounded-lg text-xs font-mono btn-ghost"
          >
            New Portrait
          </button>
          <button className="flex-1 py-2 rounded-lg text-xs font-mono btn-ghost">
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CharactersPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [revealIndex, setRevealIndex] = useState(-1);

  useEffect(() => {
    const synopsisData = sessionStorage.getItem('mangaforge_synopsis');
    const configData = sessionStorage.getItem('mangaforge_config');

    if (!synopsisData || !configData) {
      router.push('/create');
      return;
    }

    const synopsis = JSON.parse(synopsisData);
    const config = JSON.parse(configData);

    const generate = async () => {
      try {
        const res = await fetch('/api/generate-characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ synopsis, style: config.style }),
        });

        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const chars: Character[] = (data.characters || []).map((c: Character) => ({
          ...c,
          portraitUrl: undefined,
          isGeneratingPortrait: true,
        }));

        setCharacters(chars);
        setIsGenerating(false);

        for (let i = 0; i < chars.length; i++) {
          await new Promise(r => setTimeout(r, 300));
          setRevealIndex(i);
        }

        const portraitPromises = chars.map(async (char, idx) => {
          try {
            const pRes = await fetch('/api/generate-portrait', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                visualPrompt: char.visualPrompt,
                style: config.style,
              }),
            });
            if (pRes.ok) {
              const pData = await pRes.json();
              setCharacters(prev => prev.map((c, i) =>
                i === idx ? { ...c, portraitUrl: pData.image, isGeneratingPortrait: false } : c
              ));
            }
          } catch {
            setCharacters(prev => prev.map((c, i) =>
              i === idx ? { ...c, isGeneratingPortrait: false } : c
            ));
          }
        });
        await Promise.all(portraitPromises);
      } catch (err) {
        console.error('Character generation error:', err);
        const demo: Character[] = [
          {
            name: 'Akari Kurogane',
            role: 'protagonist',
            age: 15,
            bioShort: 'A determined young blacksmith who discovers her forge can reshape reality itself.',
            bioFull: 'Born in the mountain city of Kurogane, Akari inherited her grandfather\'s ancient forge after his mysterious disappearance. She\'s stubborn, fiercely independent, and has an innate talent for working with metal that goes beyond normal craftsmanship.\n\nWhat she doesn\'t know is that her bloodline carries the Primordial Flame \u2014 a power that hasn\'t manifested in a thousand years.',
            physicalDescription: 'Short messy black hair with silver streaks, amber eyes, lean athletic build, burn scars on hands',
            visualPrompt: 'Young female blacksmith, 15 years old, short messy black hair with silver streaks, fierce amber eyes, lean athletic build, burn scars on hands, wearing a leather apron over simple clothes, confident stance',
            speechPattern: 'Direct and blunt, uses forge metaphors, rarely asks for help',
            personalityTraits: ['Determined', 'Independent', 'Hot-tempered', 'Creative', 'Loyal'],
            relationships: [],
            isGeneratingPortrait: false,
          },
          {
            name: 'Rei Shimizu',
            role: 'supporting',
            age: 17,
            bioShort: 'A cool-headed Shadow Weaver apprentice assigned to watch Akari.',
            bioFull: 'Rei was raised by the Shadow Weavers since childhood, trained to guard the boundaries between worlds. She was sent to Kurogane to observe Akari and report back.\n\nBeneath her calm exterior, Rei harbors doubts about the Shadow Weavers\' true intentions.',
            physicalDescription: 'Long silver hair in a braid, ice-blue eyes, tall and graceful, wears dark traditional robes',
            visualPrompt: 'Tall graceful young woman, 17 years old, long silver hair in a braid, piercing ice-blue eyes, wearing dark traditional Japanese robes with subtle silver embroidery, mysterious calm expression',
            speechPattern: 'Formal, measured, occasionally lets warmth slip through',
            personalityTraits: ['Calm', 'Observant', 'Conflicted', 'Skilled', 'Secretive'],
            relationships: [],
            isGeneratingPortrait: false,
          },
          {
            name: 'The Hollow King',
            role: 'antagonist',
            age: 0,
            bioShort: 'An ancient entity seeking the Primordial Flame to merge all realities.',
            bioFull: 'Once a craftsman like Akari, the Hollow King transcended his mortal form centuries ago by consuming dimensional energy. Now he exists between worlds \u2014 a shadow of immense power.\n\nHe doesn\'t see himself as evil. He believes merging all realities into one unified existence would end all suffering.',
            physicalDescription: 'Towering figure in cracked obsidian armor, face obscured by a mask of swirling void, hands that phase between solid and shadow',
            visualPrompt: 'Towering dark figure in cracked obsidian armor, face hidden behind a mask of swirling void energy, ethereal shadow hands, intimidating presence, dark fantasy villain design',
            speechPattern: 'Philosophical, patient, speaks in metaphors about unity and wholeness',
            personalityTraits: ['Patient', 'Philosophical', 'Relentless', 'Tragic', 'Visionary'],
            relationships: [],
            isGeneratingPortrait: false,
          },
        ];
        setCharacters(demo);
        setIsGenerating(false);
        for (let i = 0; i < demo.length; i++) {
          await new Promise(r => setTimeout(r, 400));
          setRevealIndex(i);
        }
      }
    };

    setTimeout(generate, 1500);
  }, [router]);

  const handleRegenPortrait = async (index: number) => {
    const config = JSON.parse(sessionStorage.getItem('mangaforge_config') || '{}');
    setCharacters(prev => prev.map((c, i) => i === index ? { ...c, isGeneratingPortrait: true } : c));

    try {
      const res = await fetch('/api/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualPrompt: characters[index].visualPrompt,
          style: config.style,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCharacters(prev => prev.map((c, i) =>
          i === index ? { ...c, portraitUrl: data.image, isGeneratingPortrait: false } : c
        ));
      }
    } catch {
      setCharacters(prev => prev.map((c, i) =>
        i === index ? { ...c, isGeneratingPortrait: false } : c
      ));
    }
  };

  const handleBeginChapter = () => {
    console.log('Begin Chapter clicked, chars:', characters.length);
    sessionStorage.setItem('mangaforge_characters', JSON.stringify(characters));
    // Force navigation with window.location as fallback
    try {
      router.push('/create/chapter');
    } catch {
      window.location.href = '/create/chapter';
    }
    // Fallback: if router.push doesn't navigate within 500ms, force it
    setTimeout(() => {
      if (window.location.pathname !== '/create/chapter') {
        window.location.href = '/create/chapter';
      }
    }, 500);
  };

  const canBegin = characters.length >= 1;

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

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-32">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-mono text-gold-premium mb-3 tracking-wider uppercase">Characters</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-light mb-3">
            The <span className="gradient-text font-semibold">Cast</span>
          </h1>
          <p className="text-ink-light/50 text-lg font-light">Your characters, forged from narrative fire</p>
        </motion.div>

        {isGenerating ? (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[40vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border border-violet/20 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-cyan/20 animate-spin-reverse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet/20 to-cyan/20 animate-pulse" />
              </div>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-xl text-paper-warm/60 font-light">
              Drawing the cards of fate&hellip;
            </p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {characters.map((char, i) => (
                i <= revealIndex && (
                  <CharacterCard
                    key={char.name}
                    character={char}
                    index={i}
                    onRegenPortrait={() => handleRegenPortrait(i)}
                  />
                )
              ))}
            </div>

            <div
              className="text-center relative z-20 mt-8"
            >
              <button
                onClick={handleBeginChapter}
                disabled={!canBegin}
                style={{ position: 'relative', zIndex: 50, cursor: canBegin ? 'pointer' : 'not-allowed' }}
                className={`px-16 py-6 rounded-2xl font-[family-name:var(--font-heading)] font-bold text-2xl transition-all duration-500 ${
                  canBegin
                    ? 'btn-primary glow-pulse-cta hover:scale-105 active:scale-95'
                    : 'bg-ink-wash/50 text-ink-light/30 cursor-not-allowed'
                }`}
              >
                📖 Begin Chapter 1
              </button>
              <p className="mt-4 text-sm text-ink-light/30">&#9889; ~8 credits per chapter</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
