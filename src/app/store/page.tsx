'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const VoxelBackground = dynamic(() => import('@/components/voxel-background'), { ssr: false });

interface StoreListing {
  id: string;
  title: string;
  creator: string;
  style: string;
  styleIcon: string;
  rating: number;
  reviews: number;
  price: number;
  coverColor: string;
  genre: string;
  chapters: number;
  contentRating: string;
  featured?: boolean;
}

const FEATURED: StoreListing[] = [
  { id: 'f1', title: 'Chronicle of the Crimson Blade', creator: 'AkiraWrites', style: 'Shōnen', styleIcon: '⚡', rating: 4.9, reviews: 2340, price: 0, coverColor: '#DC2626', genre: 'Action', chapters: 48, contentRating: 'PG-13', featured: true },
  { id: 'f2', title: 'Whispers in the Sakura Snow', creator: 'MoonlitManga', style: 'Shōjo', styleIcon: '🌸', rating: 4.8, reviews: 1890, price: 15, coverColor: '#EC4899', genre: 'Romance', chapters: 36, contentRating: 'PG', featured: true },
];

const TRENDING: StoreListing[] = [
  { id: 't1', title: 'Zero Signal', creator: 'NeonScribe', style: 'Manhwa', styleIcon: '💎', rating: 4.7, reviews: 890, price: 10, coverColor: '#3B82F6', genre: 'Sci-Fi', chapters: 22, contentRating: 'PG-13' },
  { id: 't2', title: 'The Last Alchemist', creator: 'InkMaster99', style: 'Seinen', styleIcon: '🗡️', rating: 4.6, reviews: 560, price: 12, coverColor: '#8B5CF6', genre: 'Fantasy', chapters: 18, contentRating: 'R' },
  { id: 't3', title: 'Café Cosmos', creator: 'PixelDreams', style: 'Josei', styleIcon: '✨', rating: 4.8, reviews: 1200, price: 8, coverColor: '#F59E0B', genre: 'Slice of Life', chapters: 30, contentRating: 'PG' },
  { id: 't4', title: 'Dragon Pulse Academy', creator: 'ManhuaKing', style: 'Manhua', styleIcon: '🐉', rating: 4.5, reviews: 430, price: 10, coverColor: '#EF4444', genre: 'Cultivation', chapters: 56, contentRating: 'PG-13' },
  { id: 't5', title: 'Neon Saints', creator: 'CyberInk', style: 'Cyberpunk', styleIcon: '🌆', rating: 4.4, reviews: 320, price: 15, coverColor: '#06B6D4', genre: 'Action', chapters: 14, contentRating: 'R' },
  { id: 't6', title: 'Petit Monde', creator: 'BDcreator', style: 'BD', styleIcon: '🎭', rating: 4.9, reviews: 780, price: 20, coverColor: '#10B981', genre: 'Adventure', chapters: 5, contentRating: 'PG' },
];

const GENRES = ['All', 'Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Horror', 'Slice of Life', 'Comedy', 'Drama', 'Mystery', 'Cultivation'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-xs ${i < Math.floor(rating) ? 'text-gold-premium' : 'text-ink-mid'}`}>★</span>
      ))}
      <span className="text-xs text-ink-light ml-1">{rating}</span>
    </div>
  );
}

function StoreCard({ listing }: { listing: StoreListing }) {
  return (
    <Link href={`/store/${listing.id}`}>
      <motion.div
        className="glass-card overflow-hidden group cursor-pointer hover:border-sakura-pink/30 transition-all"
        whileHover={{ y: -4 }}
      >
        <div
          className="h-48 flex items-center justify-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${listing.coverColor}25, ${listing.coverColor}08, transparent)` }}
        >
          <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{listing.styleIcon}</span>
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs bg-ink-void/80 text-ink-light font-mono">
            {listing.contentRating}
          </div>
          {listing.price === 0 && (
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 font-mono">
              FREE
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-[family-name:var(--font-heading)] text-sm mb-1 group-hover:text-sakura-pink transition-colors truncate">{listing.title}</h3>
          <p className="text-xs text-ink-light mb-2">by {listing.creator}</p>
          <div className="flex items-center justify-between">
            <StarRating rating={listing.rating} />
            <span className="text-xs text-ink-light/50">({listing.reviews})</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-ink-light/50">{listing.chapters} ch · {listing.style}</span>
            {listing.price > 0 ? (
              <span className="text-sm font-mono text-neon-cyan">⚡ {listing.price}</span>
            ) : (
              <span className="text-sm font-mono text-green-400">Free</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function StorePage() {
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrending = activeGenre === 'All'
    ? TRENDING
    : TRENDING.filter(l => l.genre === activeGenre);

  return (
    <main className="min-h-screen relative">
      <VoxelBackground />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-void/80 backdrop-blur-xl border-b border-ink-mid/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-heading)] text-sakura-pink text-lg">MangaForge</Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/create" className="text-ink-light hover:text-paper-warm transition-colors">Create</Link>
            <Link href="/library" className="text-ink-light hover:text-paper-warm transition-colors">Library</Link>
            <Link href="/store" className="text-paper-warm">Store</Link>
            <div className="flex items-center gap-1 text-neon-cyan font-mono">
              <span>⚡</span><span>247</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        {/* Header + Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl mb-2">
              The <span className="text-sakura-pink">Market</span>
            </h1>
            <p className="text-ink-light">Discover manga from creators worldwide</p>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search titles, creators, genres..."
              className="w-72 px-4 py-2.5 rounded-xl bg-ink-deep border border-ink-mid focus:border-neon-cyan/50 text-sm text-paper-warm placeholder-ink-light/50 outline-none transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light/30">🔍</span>
          </div>
        </div>

        {/* Featured Carousel */}
        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-heading)] text-xl mb-6 flex items-center gap-2">
            <span className="text-gold-premium">⭐</span> Featured
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURED.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Link href={`/store/${f.id}`}>
                  <div
                    className="relative rounded-2xl overflow-hidden h-64 group cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${f.coverColor}30, ${f.coverColor}10, transparent)` }}
                  >
                    <div className="absolute inset-0 flex items-center p-8">
                      <div className="flex-1">
                        <div className="text-xs font-mono text-gold-premium mb-2">⭐ FEATURED</div>
                        <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-black mb-2 group-hover:text-sakura-pink transition-colors">{f.title}</h3>
                        <p className="text-sm text-ink-light mb-3">by {f.creator} · {f.chapters} chapters</p>
                        <div className="flex items-center gap-4">
                          <StarRating rating={f.rating} />
                          <span className="text-xs text-ink-light/50">{f.reviews} reviews</span>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button className="px-6 py-2 rounded-xl bg-sakura-pink text-paper-pure text-sm font-semibold hover:bg-sakura-soft transition-colors">
                            {f.price === 0 ? 'Read Free' : `Buy ⚡ ${f.price}`}
                          </button>
                          <button className="px-4 py-2 rounded-xl bg-ink-wash text-ink-light text-sm hover:bg-ink-mid transition-colors">
                            Preview
                          </button>
                        </div>
                      </div>
                      <div className="text-8xl opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all hidden md:block">
                        {f.styleIcon}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Genre Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeGenre === g
                  ? 'bg-sakura-pink text-paper-pure'
                  : 'bg-ink-deep text-ink-light hover:bg-ink-wash border border-ink-mid/30'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Trending */}
        <section className="mb-16">
          <h2 className="font-[family-name:var(--font-heading)] text-xl mb-6 flex items-center gap-2">
            🔥 Trending Now
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredTrending.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <StoreCard listing={l} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Creators */}
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl mb-6 flex items-center gap-2">
            👑 Top Creators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'AkiraWrites', works: 12, followers: '23.4K', avatar: '🎌', topWork: 'Crimson Blade' },
              { name: 'MoonlitManga', works: 8, followers: '18.9K', avatar: '🌙', topWork: 'Sakura Snow' },
              { name: 'NeonScribe', works: 15, followers: '15.2K', avatar: '⚡', topWork: 'Zero Signal' },
              { name: 'InkMaster99', works: 6, followers: '12.1K', avatar: '🖋️', topWork: 'Last Alchemist' },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 text-center hover:border-gold-premium/30 transition-colors cursor-pointer"
              >
                <div className="text-4xl mb-3">{c.avatar}</div>
                <h4 className="font-[family-name:var(--font-heading)] text-sm">{c.name}</h4>
                <p className="text-xs text-ink-light mt-1">{c.works} works · {c.followers} followers</p>
                <p className="text-xs text-gold-premium mt-2">Top: {c.topWork}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
