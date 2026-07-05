import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from '@phosphor-icons/react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';

interface HomeProps {
  onNavigate: (page: string, category?: Category | 'all') => void;
  products: Product[];
  wishlist: string[];
  onToggleSave: (productId: string, e?: React.MouseEvent) => void;
  recentlyViewed: string[];
  handleProductClick: (product: Product) => void;
  renderRecentlyViewedSection: () => React.ReactNode;
}

export default function Home({
  onNavigate,
  products,
  wishlist,
  onToggleSave,
  recentlyViewed,
  handleProductClick,
  renderRecentlyViewedSection
}: HomeProps) {
  return (
    <div className="w-full flex flex-col gap-16 pb-16" id="homepage-view">
      {/* Full-Bleed Minimal Hero — premium editorial typography, everything else stripped away */}
      <div className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-bg-primary select-none">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero2.png"
            alt="ETZ A Shoppe Lookbook Cover Model"
            className="w-full h-full object-cover scale-101 filter brightness-[0.82] contrast-[1.05] saturate-[0.8]"
          />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        {/* The Statement */}
        <div className="relative z-10 w-full px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Bodoni Moda', serif",
              letterSpacing: '-0.03em',
              lineHeight: 0.96,
            }}
            className="text-[13vw] sm:text-7xl md:text-8xl lg:text-[7.5rem] font-normal text-white text-balance"
          >
            Good clothes.
            <br />
            <span
              style={{ fontFamily: "'Bodoni Moda', serif", fontStyle: 'italic', fontWeight: 400 }}
              className="text-accent-warm"
            >
              Already lived in.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.01em' }}
            className="mt-7 text-[15px] sm:text-base text-white/70 max-w-md mx-auto leading-relaxed font-light"
          >
            Hand-checked in Tabogon, Cebu.
            <br />
            One piece, one buyer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => onNavigate('shop', 'all')}
              style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.08em' }}
              className="bg-white hover:bg-white/90 text-text-primary font-medium px-8 py-3 rounded-md transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer text-[12px] uppercase"
            >
              Shop the Rack
            </button>
            <button
              onClick={() => onNavigate('how-it-works')}
              style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.08em' }}
              className="group flex items-center gap-1.5 text-white/80 hover:text-white text-[12px] uppercase font-medium transition-colors duration-300 cursor-pointer bg-transparent"
            >
              <span>How It Works</span>
              <ArrowRight
                weight="regular"
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Contained content wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-24">
        {/* Why Shop Here Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start py-12">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl text-text-primary tracking-tight font-light leading-[1.1] text-balance">
              You know exactly<br />
              <span className="italic font-normal text-accent">what you are getting</span>
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-sm text-balance">
              Every item is inspected under high-intensity light for holes, stains, and wear, then flat-measured in inches so it fits right.
            </p>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#EBE9E3]/40 border border-border rounded-[2rem] p-1.5 transition-all duration-500 hover:scale-[1.01]">
              <div className="bg-white p-6 rounded-[calc(2rem-0.375rem)] border border-border/10 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-accent/8 flex items-center justify-center text-accent">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-xl text-text-primary font-medium tracking-tight">100% Hand-Checked</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  No dusty piles or surprise stains. If an item has a minor wear detail, we describe it honestly in the condition notes.
                </p>
              </div>
            </div>

            <div className="bg-[#EBE9E3]/40 border border-border rounded-[2rem] p-1.5 transition-all duration-500 hover:scale-[1.01]">
              <div className="bg-white p-6 rounded-[calc(2rem-0.375rem)] border border-border/10 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-accent/8 flex items-center justify-center text-accent">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-xl text-text-primary font-medium tracking-tight">Honest Sizing Details</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Vintage and secondhand tags lie. We measure each piece flat so you can match it against your own clothes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shop By Category Bento Grid */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-6">
            <div>
              <h2 className="font-heading text-4xl sm:text-5xl font-light text-text-primary tracking-tight">
                Find your size, <span className="italic font-normal text-accent">your style</span>
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop', 'all')}
              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 group cursor-pointer border-none bg-transparent"
            >
              <span>View all collections</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => onNavigate('shop', 'mens')}
              className="md:col-span-2 group cursor-pointer bg-white border border-border rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="relative aspect-[16/9] md:aspect-[21/9] bg-surface-tint overflow-hidden">
                <img
                  src="/images/mens_vintage_jacket_1783176811459.jpg"
                  alt="Men's collection"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-accent-warm">01 // CURATED</span>
                  <h4 className="font-heading text-3xl font-light italic text-white leading-none">Men's Collection</h4>
                  <p className="text-xs text-white/70">Vintage jackets, corduroy pieces, button-ups & denim</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => onNavigate('shop', 'womens')}
              className="group cursor-pointer bg-white border border-border rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative flex-grow min-h-[240px] md:min-h-0 md:h-full bg-surface-tint overflow-hidden">
                <img
                  src="/images/womens_floral_dress_1783176824055.jpg"
                  alt="Women's collection"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-accent-warm">02 // CLEAN</span>
                  <h4 className="font-heading text-3xl font-light italic text-white leading-none">Women's Section</h4>
                  <p className="text-xs text-white/70">Flax linen dresses, skirts & casual tops</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => onNavigate('shop', 'kids')}
              className="group cursor-pointer bg-white border border-border rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative flex-grow min-h-[240px] md:min-h-0 md:h-full bg-surface-tint overflow-hidden">
                <img
                  src="/images/kids_denim_overalls_1783176838795.jpg"
                  alt="Kids clothing"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-accent-warm">03 // DURABLE</span>
                  <h4 className="font-heading text-2xl font-light italic text-white leading-none">Kids' Clothing</h4>
                  <p className="text-xs text-white/70">Comfortable overalls & playwear</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => onNavigate('shop', 'accessories')}
              className="md:col-span-2 group cursor-pointer bg-white border border-border rounded-3xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className="relative aspect-[16/9] bg-surface-tint overflow-hidden">
                <img
                  src="/images/vintage_leather_bag_1783176854555.jpg"
                  alt="Accessories"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-[9px] font-mono tracking-widest uppercase text-accent-warm">04 // TIMELESS</span>
                  <h4 className="font-heading text-2xl font-light italic text-white leading-none">Accessories</h4>
                  <p className="text-xs text-white/70">Woven totes, leather messenger satchels & straw bags</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-surface-tint border border-border p-8 sm:p-12 rounded-3xl space-y-8">
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-accent">Process</span>
            <h3 className="font-heading text-2xl sm:text-3xl text-text-primary tracking-tight font-extrabold">Ordering is completely direct</h3>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              No third-party processors or automatic credit card billing. Everything is personal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-border space-y-3">
              <span className="font-mono text-xs font-bold text-accent">01 // REQUEST</span>
              <h4 className="font-heading text-base font-bold text-text-primary">Add items & Checkout</h4>
              <p className="text-xs text-text-secondary leading-normal">
                Since everything is 1-of-1, add your piece to the cart and submit your details. You pay ₱0 upfront.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border space-y-3">
              <span className="font-mono text-xs font-bold text-accent">02 // CONFIRM</span>
              <h4 className="font-heading text-base font-bold text-text-primary">Owner checks & texts</h4>
              <p className="text-xs text-text-secondary leading-normal">
                We verify availability and message you personally via SMS or Messenger to coordinate your order.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border space-y-3">
              <span className="font-mono text-xs font-bold text-accent">03 // HANDOVER</span>
              <h4 className="font-heading text-base font-bold text-text-primary">GCash or Cash on pickup</h4>
              <p className="text-xs text-text-secondary leading-normal">
                Pay securely via GCash transfer or cash when picking up in Loong, Tabogon. We also arrange Cebu shipping.
              </p>
            </div>
          </div>
        </div>

        {/* Recently Viewed Items */}
        {renderRecentlyViewedSection()}

        {/* Location and Closing CTA */}
        <div className="bg-bg-deep text-white p-8 sm:p-12 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 select-none shadow-[0_10px_30px_rgba(45,106,79,0.15)] border-none">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-accent-warm">Loong, Tabogon, Cebu</span>
            <h3 className="font-heading text-2xl sm:text-3xl text-white font-bold tracking-tight">Pickup locally or shipped straight to you</h3>
            <p className="text-xs text-white/80 leading-relaxed font-normal">
              Save on shipping fees by picking up your clean garments in Tabogon! Or we can arrange courier delivery across nearby Cebu towns.
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop', 'all')}
            className="w-full md:w-auto bg-[#2D6A4F] hover:bg-[#245840] text-white font-semibold px-8 py-3.5 rounded-full shrink-0 cursor-pointer transition-all duration-300 active:scale-[0.98] shadow-md border-none"
          >
            Start shopping
          </button>
        </div>
      </div>
    </div>
  );
}