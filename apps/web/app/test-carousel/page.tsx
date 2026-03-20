'use client';

import { InputPrompt } from '@/components/chat/InputPrompt';
import { useState } from 'react';

const MOCK_MILK_CARDS = [
  { id: 'p1', label: 'Amul Taaza Toned Milk', subtitle: '₹29 · 500 ml', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/435070a.jpg' },
  { id: 'p2', label: 'Country Delight Cow Fresh Milk', subtitle: '₹44 · 450 ml', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/504874a.jpg', badge: '8% OFF' },
  { id: 'p3', label: 'Heritage Daily Health Toned Milk', subtitle: '₹32 · 500 ml', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/504632a.jpg' },
  { id: 'p4', label: 'Amul Gold Full Cream Milk', subtitle: '₹36 · 500 ml', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/435079a.jpg' },
  { id: 'p5', label: 'Heritage Full Cream Milk', subtitle: '₹42 · 500 ml', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/504633a.jpg' },
  { id: 'p6', label: 'Amul Taaza Toned Milk', subtitle: '₹75 · 1 ltr', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/435070a.jpg', badge: 'Value Pack' },
  { id: 'p7', label: 'Nandini Goodlife Toned Milk', subtitle: '₹68 · 1 ltr', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/504632a.jpg' },
  { id: 'p8', label: 'Amul Buffalo A2 Milk', subtitle: '₹40 · 500 ml', image: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/435079a.jpg', badge: 'New' },
];

export default function TestCarouselPage() {
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<'carousel' | 'card_grid'>('card_grid');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">🧪 Product UI Test</h1>
          <p className="mt-1 text-sm text-white/50">Testing carousel &amp; card grid with mock Blinkit milk data</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('card_grid'); setResult(null); }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              mode === 'card_grid'
                ? 'bg-primary text-white'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1]'
            }`}
          >
            Card Grid (multi-select + qty)
          </button>
          <button
            onClick={() => { setMode('carousel'); setResult(null); }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              mode === 'carousel'
                ? 'bg-primary text-white'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1]'
            }`}
          >
            Carousel (single select)
          </button>
        </div>

        {/* The actual component */}
        <InputPrompt
          key={mode}
          question="🥛 Here are the milk options on Blinkit (21 min delivery to Honer Aquantis, Tellapur). Pick the ones you'd like:"
          inputType={mode}
          cards={MOCK_MILK_CARDS}
          show_quantity={mode === 'card_grid'}
          multi_select={mode === 'card_grid'}
          allow_custom={true}
          onSubmit={(val) => setResult(val)}
        />

        {/* Result display */}
        {result && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold text-emerald-400 mb-1">✓ User submitted:</p>
            <pre className="text-sm text-white/80 whitespace-pre-wrap break-all">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
