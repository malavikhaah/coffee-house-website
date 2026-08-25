import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Bean, CalendarDays, Check, Clock3, Coffee, Instagram, MapPin, Menu as MenuIcon, Minus, Plus, ShoppingBag, Star, Utensils, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type MenuItem = {
  id: string;
  name: string;
  detail: string;
  price: string;
  category: 'coffee' | 'not-coffee' | 'from-the-oven';
  art: string;
  seasonal?: boolean;
};

const menuItems: MenuItem[] = [
  { id: '1', name: 'The House Cortado', detail: 'Red bourbon · brown sugar · velvet', price: '$5.50', category: 'coffee', art: 'art-cortado' },
  { id: '2', name: 'Oat Miso Latte', detail: 'Toasted oat · white miso caramel', price: '$6.25', category: 'coffee', art: 'art-latte', seasonal: true },
  { id: '3', name: 'Slow Bloom', detail: 'Guatemala Huehuetenango · pour over', price: '$6.00', category: 'coffee', art: 'art-pour' },
  { id: '4', name: 'Cardamom Tonic', detail: 'Espresso · cardamom · bright citrus', price: '$5.75', category: 'not-coffee', art: 'art-tonic' },
  { id: '5', name: 'Sesame Morning Bun', detail: 'Tahini sugar · flaky laminated dough', price: '$5.00', category: 'from-the-oven', art: 'art-bun' },
  { id: '6', name: 'Olive Oil Banana Bread', detail: 'Maldon salt · toasted walnut', price: '$4.75', category: 'from-the-oven', art: 'art-bread' },
];

function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MenuItem['category']>('coffee');
  const [orderOpen, setOrderOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderSent, setOrderSent] = useState(false);
  const [visitSent, setVisitSent] = useState(false);
  const observed = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => {
      if (!observed.current.has(element)) {
        observed.current.add(element);
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, [activeCategory]);

  const visibleMenu = useMemo(() => menuItems.filter((item) => item.category === activeCategory), [activeCategory]);
  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const cartItems = menuItems.filter((item) => cart[item.id]);
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price.replace('$', '')) * (cart[item.id] ?? 0), 0);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const addToCart = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  const removeFromCart = (id: string) => setCart((current) => {
    const next = { ...current };
    if ((next[id] ?? 0) <= 1) delete next[id];
    else next[id] = next[id] - 1;
    return next;
  });

  return (
    <main className="page-grain min-h-[100dvh] bg-[#f3eadc] text-[#2b211c]">
      <header className="absolute inset-x-0 top-0 z-30 px-5 py-5 sm:px-8 lg:px-12">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between text-[#f7f0e5]" aria-label="Main navigation">
          <button onClick={() => scrollTo('top')} className="group flex items-center gap-3" data-testid="button-logo">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f7f0e5]/40 transition-colors group-hover:bg-[#e7a96d] group-hover:border-[#e7a96d]">
              <Bean size={17} strokeWidth={1.5} />
            </span>
            <span className="font-display text-xl tracking-[-.03em]">Kindred<span className="text-[#e7a96d]">.</span></span>
          </button>
          <div className="hidden items-center gap-8 md:flex">
            <button onClick={() => scrollTo('menu')} className="text-xs font-semibold uppercase tracking-[.19em] text-[#f7f0e5]/75 transition-colors hover:text-[#e7a96d]" data-testid="link-menu">Menu</button>
            <button onClick={() => scrollTo('story')} className="text-xs font-semibold uppercase tracking-[.19em] text-[#f7f0e5]/75 transition-colors hover:text-[#e7a96d]" data-testid="link-story">Our coffee</button>
            <button onClick={() => scrollTo('visit')} className="text-xs font-semibold uppercase tracking-[.19em] text-[#f7f0e5]/75 transition-colors hover:text-[#e7a96d]" data-testid="link-visit">Visit</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setOrderOpen(true)} className="hidden items-center gap-2 rounded-full border border-[#f7f0e5]/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-[.13em] transition-all hover:border-[#e7a96d] hover:bg-[#e7a96d] hover:text-[#2b211c] sm:flex" data-testid="button-order-nav">
              <ShoppingBag size={14} /> Order ahead {cartCount > 0 && <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e7a96d] px-1 text-[10px] text-[#2b211c]">{cartCount}</span>}
            </button>
            <button onClick={() => setMobileOpen((open) => !open)} className="rounded-full border border-[#f7f0e5]/40 p-2.5 md:hidden" aria-label="Toggle menu" data-testid="button-mobile-menu">
              {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </nav>
        {mobileOpen && (
          <div className="mx-auto mt-4 max-w-[1400px] rounded-2xl border border-[#f7f0e5]/15 bg-[#30231d]/95 p-5 shadow-2xl md:hidden" data-testid="mobile-navigation">
            <div className="grid gap-1">
              <button onClick={() => scrollTo('menu')} className="border-b border-[#f7f0e5]/10 py-3 text-left font-display text-2xl text-[#f7f0e5]" data-testid="mobile-link-menu">The menu</button>
              <button onClick={() => scrollTo('story')} className="border-b border-[#f7f0e5]/10 py-3 text-left font-display text-2xl text-[#f7f0e5]" data-testid="mobile-link-story">Our coffee</button>
              <button onClick={() => scrollTo('visit')} className="py-3 text-left font-display text-2xl text-[#f7f0e5]" data-testid="mobile-link-visit">Come say hi</button>
            </div>
          </div>
        )}
      </header>

      <section id="top" className="relative min-h-[720px] overflow-hidden bg-[#30231d] text-[#f7f0e5] sm:min-h-[790px]">
        <div className="absolute -right-[20%] top-[5%] h-[620px] w-[620px] rounded-full border border-[#e7a96d]/15 sm:-right-[9%] sm:top-[7%]" />
        <div className="absolute -right-[12%] top-[14%] h-[470px] w-[470px] rounded-full border border-[#e7a96d]/10" />
        <div className="absolute bottom-[-25%] left-[-8%] h-[420px] w-[420px] rounded-full bg-[#50382a]/40 blur-3xl" />
        <div className="relative mx-auto grid min-h-[720px] max-w-[1400px] items-center px-5 pb-12 pt-32 sm:min-h-[790px] sm:px-10 lg:grid-cols-[1fr_.82fr] lg:gap-10 lg:px-20 lg:pt-24">
          <div className="relative z-10 max-w-[700px]">
            <p className="hero-entrance mb-7 flex items-center gap-3 font-mono-custom text-[10px] uppercase tracking-[.23em] text-[#e7a96d]"><span className="h-px w-9 bg-[#e7a96d]" /> 47.6062° N / 122.3321° W</p>
            <h1 className="hero-entrance-2 font-display text-[clamp(4.3rem,10.8vw,9.4rem)] leading-[.84] tracking-[-.075em]">
              Make room<br /><em className="text-[#e7a96d]">for good.</em>
            </h1>
            <p className="hero-entrance-3 mt-9 max-w-[430px] text-[15px] leading-7 text-[#f7f0e5]/68 sm:text-[17px]">
              Coffee for slow starts, long catch-ups, and the five quiet minutes that make the rest of the day feel possible.
            </p>
            <div className="hero-entrance-3 mt-9 flex flex-wrap items-center gap-5">
              <button onClick={() => scrollTo('menu')} className="group flex items-center gap-3 rounded-full bg-[#e7a96d] px-5 py-3.5 text-sm font-semibold text-[#2b211c] transition-transform hover:-translate-y-1" data-testid="button-explore-menu">
                Explore the menu <ArrowDownRight size={17} className="transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
              <button onClick={() => scrollTo('visit')} className="line-link text-sm font-medium text-[#f7f0e5]/80" data-testid="link-find-us">Find your way here</button>
            </div>
          </div>
          <div className="relative mt-14 flex min-h-[255px] items-center justify-center lg:mt-0">
            <div className="absolute right-[5%] top-[-6%] font-display text-[clamp(7rem,18vw,15rem)] leading-none text-[#f7f0e5]/[.035]">01</div>
            <div className="coffee-cup relative z-10 flex h-[225px] w-[225px] items-center justify-center rounded-full border-[14px] border-[#e5d0b9] bg-[#b96d49] shadow-[20px_28px_0_#1e1714,0_22px_60px_rgba(0,0,0,.32)] sm:h-[290px] sm:w-[290px]">
              <div className="absolute left-[19%] top-[24%] h-4 w-4 rounded-full bg-[#f5dfbe]/55 blur-[1px]" />
              <div className="absolute left-[30%] top-[35%] h-3 w-3 rounded-full bg-[#f5dfbe]/40" />
              <div className="h-[54%] w-[54%] rounded-full border-[18px] border-[#6d3a29] bg-[#221815] shadow-inner sm:border-[23px]" />
              <div className="steam absolute -top-14 left-[38%] h-12 w-4 rounded-full border-l-2 border-[#f7f0e5]/45" />
              <div className="steam absolute -top-16 left-[52%] h-14 w-3 rounded-full border-l-2 border-[#f7f0e5]/30 [animation-delay:1.2s]" />
              <div className="steam absolute -top-11 left-[62%] h-10 w-3 rounded-full border-l-2 border-[#f7f0e5]/35 [animation-delay:2.1s]" />
            </div>
            <div className="absolute bottom-[4%] right-[8%] hidden max-w-[150px] rotate-6 font-mono-custom text-[10px] uppercase leading-4 tracking-[.16em] text-[#e7a96d]/75 sm:block">Roasted with care<br />served with time</div>
          </div>
        </div>
        <button onClick={() => scrollTo('ritual')} className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[#f7f0e5]/45 transition-colors hover:text-[#e7a96d]" data-testid="button-scroll-story">
          <span className="font-mono-custom text-[9px] uppercase tracking-[.2em]">Take your time</span><ArrowDownRight size={15} />
        </button>
      </section>

      <div className="overflow-hidden border-b border-[#2b211c]/10 bg-[#d58b61] py-4 text-[#2b211c]">
        <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
          {[...Array(2)].flatMap((_, group) => ['small batch /', 'sun on the table /', 'one more chapter /', 'made for lingering /'].map((label, index) => <span key={`${group}-${index}`} className="flex items-center gap-8 font-display text-xl italic sm:text-2xl">{label}<span className="font-sans text-base not-italic">·</span></span>))}
        </div>
      </div>

      <section id="ritual" className="mx-auto max-w-[1400px] px-5 py-24 sm:px-10 sm:py-32 lg:px-20">
        <div className="grid gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
          <div className="reveal">
            <p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#b96d49]">A neighborhood ritual</p>
            <h2 className="mt-5 max-w-[430px] font-display text-[clamp(3rem,6vw,5.8rem)] leading-[.9] tracking-[-.06em]">The day gets softer <em>in here.</em></h2>
          </div>
          <div className="reveal delay-1 grid max-w-[620px] gap-7 self-end text-[17px] leading-8 text-[#604e42] sm:grid-cols-2 sm:gap-x-12">
            <p>Kindred is a coffee house for the in-between moments. A corner table, a warm cup, a familiar face behind the bar.</p>
            <p>We source with curiosity, make things by hand, and leave enough room for the morning to unfold at its own pace.</p>
          </div>
        </div>
        <div className="mt-20 grid gap-5 sm:grid-cols-3">
          {[
            { number: '07:12', title: 'First light', copy: 'The grinder starts before the neighborhood does.' },
            { number: '03', title: 'Ways to linger', copy: 'Window seats, communal tables, or a walk around the block.' },
            { number: '∞', title: 'Good conversations', copy: 'Some are planned. The best ones usually are not.' },
          ].map((item, index) => (
            <div key={item.title} className={`reveal delay-${index + 1} border-t border-[#2b211c]/20 pt-5`}>
              <p className="font-mono-custom text-2xl text-[#b96d49]">{item.number}</p>
              <h3 className="mt-9 font-display text-2xl">{item.title}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#765f50]">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="menu" className="bg-[#e7dccb] px-5 py-24 sm:px-10 sm:py-32 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="reveal flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#b96d49]">Today at Kindred</p>
              <h2 className="mt-4 font-display text-[clamp(3.6rem,7vw,6.5rem)] leading-[.87] tracking-[-.07em]">Made to<br /><em>be savored.</em></h2>
            </div>
            <p className="max-w-[270px] text-sm leading-6 text-[#765f50]">Our menu changes with the season, but the good part stays the same: excellent ingredients, no rush.</p>
          </div>
          <div className="reveal delay-1 mt-14 flex flex-wrap gap-2 border-b border-[#2b211c]/15 pb-4">
            {[
              { key: 'coffee', label: 'Coffee & espresso' },
              { key: 'not-coffee', label: 'Not coffee' },
              { key: 'from-the-oven', label: 'From the oven' },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveCategory(tab.key as MenuItem['category'])} className={`rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[.12em] transition-colors ${activeCategory === tab.key ? 'bg-[#30231d] text-[#f7f0e5]' : 'text-[#765f50] hover:bg-[#d5c4af]'}`} data-testid={`button-category-${tab.key}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMenu.map((item, index) => (
              <article key={item.id} className={`menu-card reveal delay-${(index % 3) + 1} group relative overflow-hidden rounded-[1.25rem] border border-[#2b211c]/10 bg-[#f3eadc] p-3 transition-shadow hover:shadow-[0_18px_35px_rgba(71,44,29,.12)]`} data-testid={`card-menu-${item.id}`}>
                <div className={`menu-art relative flex h-48 items-center justify-center overflow-hidden rounded-[.85rem] ${item.art}`} style={{ background: item.art === 'art-bun' ? '#c67c4d' : item.art === 'art-bread' ? '#bea27b' : item.art === 'art-tonic' ? '#a5b7a2' : '#b97d5c' }}>
                  <span className="absolute left-4 top-4 rounded-full bg-[#f3eadc]/75 px-2.5 py-1 font-mono-custom text-[9px] uppercase tracking-[.15em] text-[#2b211c]">{item.seasonal ? 'seasonal' : item.category === 'coffee' ? 'bar favorite' : 'baked today'}</span>
                  <div className={`relative ${item.art.includes('bun') || item.art.includes('bread') ? 'h-28 w-36 rotate-[-9deg] rounded-[48%] bg-[#8f4d31] shadow-[inset_10px_-8px_0_rgba(69,35,24,.25),10px_14px_0_rgba(77,43,28,.16)]' : item.art === 'art-tonic' ? 'h-36 w-20 rounded-b-[1.4rem] rounded-t-[.35rem] border-4 border-[#f3eadc]/70 bg-[#d9b36b]/80 shadow-[10px_12px_0_rgba(47,72,62,.14)]' : 'h-28 w-32 rounded-full border-[11px] border-[#e5d0b9] bg-[#40251c] shadow-[12px_14px_0_rgba(66,35,23,.2)]'}`}>
                    {(item.art.includes('bun') || item.art.includes('bread')) && <><span className="absolute left-7 top-9 h-3 w-20 rounded-full bg-[#dba067]/70" /><span className="absolute left-10 top-16 h-3 w-16 rounded-full bg-[#dba067]/60" /></>}
                    {item.art === 'art-tonic' && <span className="absolute left-6 top-10 h-2 w-2 rounded-full bg-[#f5dfbe] shadow-[13px_24px_0_#f5dfbe,3px_55px_0_#f5dfbe]" />}
                    {item.art === 'art-latte' && <span className="absolute left-10 top-9 h-8 w-12 rounded-full border-2 border-[#e7a96d] rotate-12" />}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3 px-2 pb-2 pt-5">
                  <div>
                    <h3 className="font-display text-[23px] leading-none">{item.name}</h3>
                    <p className="mt-2 max-w-[190px] text-xs leading-5 text-[#765f50]">{item.detail}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="font-mono-custom text-sm text-[#b96d49]">{item.price}</span>
                    <button onClick={() => addToCart(item.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#30231d] text-[#f7f0e5] transition-transform hover:scale-110" aria-label={`Add ${item.name} to order`} data-testid={`button-add-${item.id}`}><Plus size={15} /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="reveal mt-12 flex flex-col items-start justify-between gap-5 border-t border-[#2b211c]/15 pt-7 sm:flex-row sm:items-center">
            <p className="font-mono-custom text-[10px] uppercase tracking-[.17em] text-[#765f50]">All coffee is available as espresso, filter, or at home.</p>
            <button onClick={() => setOrderOpen(true)} className="group flex items-center gap-3 rounded-full border border-[#2b211c]/30 px-5 py-3 text-xs font-semibold uppercase tracking-[.14em] transition-all hover:bg-[#30231d] hover:text-[#f7f0e5]" data-testid="button-start-order">Start an order <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button>
          </div>
        </div>
      </section>

      <section id="story" className="relative overflow-hidden bg-[#30231d] px-5 py-24 text-[#f7f0e5] sm:px-10 sm:py-32 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div className="reveal">
              <p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#e7a96d]">The long way around</p>
              <h2 className="mt-5 max-w-[720px] font-display text-[clamp(3.8rem,8vw,8.5rem)] leading-[.83] tracking-[-.08em]">Good coffee<br /><em className="text-[#e7a96d]">takes its time.</em></h2>
            </div>
            <div className="reveal delay-1 max-w-[390px] text-[16px] leading-8 text-[#f7f0e5]/65">
              <p>Our beans travel a long way to meet us. We think the least we can do is give them the attention they deserve.</p>
              <button onClick={() => scrollTo('visit')} className="line-link mt-8 inline-block text-sm font-medium text-[#e7a96d]" data-testid="link-meet-roasters">Meet us at the bar</button>
            </div>
          </div>
          <div className="relative mt-20 grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
            <div className="reveal relative min-h-[340px] overflow-hidden rounded-[1.4rem] bg-[#8d513a] p-7 sm:min-h-[470px]">
              <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full border-[35px] border-[#d58b61]/30" />
              <div className="absolute left-[15%] top-[18%] h-44 w-44 rounded-full border border-[#f7f0e5]/25" />
              <span className="relative font-mono-custom text-[10px] uppercase tracking-[.18em] text-[#f7f0e5]/70">01 / Source</span>
              <p className="absolute bottom-7 left-7 max-w-[260px] font-display text-3xl leading-[.95]">Small farms.<br />Clear relationships.</p>
            </div>
            <div className="reveal delay-1 relative min-h-[340px] overflow-hidden rounded-[1.4rem] bg-[#d58b61] p-7 text-[#30231d] sm:min-h-[470px]">
              <div className="absolute -right-5 top-8 h-44 w-44 rounded-full border-[22px] border-[#30231d]/10" />
              <span className="relative font-mono-custom text-[10px] uppercase tracking-[.18em] text-[#30231d]/60">02 / Make</span>
              <p className="absolute bottom-7 left-7 max-w-[260px] font-display text-3xl leading-[.95]">A practiced hand.<br />An open mind.</p>
              <div className="absolute right-8 top-1/2 h-24 w-20 -rotate-12 rounded-b-3xl border-4 border-[#30231d]/45" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#d8e0d3] px-5 py-24 sm:px-10 sm:py-32 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#456653]">Heard around the table</p>
              <h2 className="mt-4 font-display text-[clamp(3.2rem,6vw,5.8rem)] leading-[.88] tracking-[-.06em]">Kind words<br /><em>from kind people.</em></h2>
            </div>
            <div className="flex gap-1 text-[#b96d49]" aria-label="Five stars"><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /></div>
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              { quote: 'The kind of place that makes you want to put your phone away. Their cortado is quietly perfect.', name: 'Mara L.', detail: 'Neighbor since 2019' },
              { quote: 'I came for a coffee and stayed for three chapters. The window seat is now part of my weekly rhythm.', name: 'Jonah R.', detail: 'Tuesday regular' },
              { quote: 'There is care in every detail, from the music to the last flaky edge of the morning bun.', name: 'Priya S.', detail: 'Found us on 12th' },
            ].map((review, index) => (
              <article key={review.name} className={`reveal delay-${index + 1} flex min-h-[280px] flex-col justify-between rounded-[1.25rem] border border-[#456653]/15 bg-[#edf1e9]/65 p-7`}>
                <p className="font-display text-[26px] leading-[1.08] tracking-[-.03em]">“{review.quote}”</p>
                <div className="border-t border-[#456653]/20 pt-4">
                  <p className="text-sm font-semibold">{review.name}</p>
                  <p className="mt-1 font-mono-custom text-[10px] uppercase tracking-[.14em] text-[#456653]/70">{review.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="visit" className="bg-[#f3eadc] px-5 py-24 sm:px-10 sm:py-32 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div className="reveal">
              <p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#b96d49]">A little north of ordinary</p>
              <h2 className="mt-5 max-w-[650px] font-display text-[clamp(4rem,8vw,8rem)] leading-[.82] tracking-[-.08em]">Come as<br /><em>you are.</em></h2>
              <p className="mt-9 max-w-[390px] text-[16px] leading-7 text-[#765f50]">Find us on the sunny corner of 12th and Union. Look for the striped awning, follow the smell of toast.</p>
              <button onClick={() => setVisitOpen(true)} className="group mt-8 flex items-center gap-3 rounded-full bg-[#30231d] px-5 py-3.5 text-sm font-semibold text-[#f7f0e5] transition-transform hover:-translate-y-1" data-testid="button-plan-visit">Plan a visit <CalendarDays size={16} className="transition-transform group-hover:rotate-6" /></button>
            </div>
            <div className="reveal delay-1 rounded-[1.5rem] bg-[#e7dccb] p-7 sm:p-10">
              <div className="flex items-start justify-between border-b border-[#2b211c]/15 pb-6">
                <div><p className="font-display text-3xl">Kindred Coffee House</p><p className="mt-1 font-mono-custom text-[10px] uppercase tracking-[.16em] text-[#765f50]">12th & Union · Seattle</p></div>
                <MapPin className="text-[#b96d49]" size={23} strokeWidth={1.5} />
              </div>
              <div className="grid gap-7 py-8 sm:grid-cols-2">
                <div><p className="mb-3 flex items-center gap-2 font-mono-custom text-[10px] uppercase tracking-[.16em] text-[#b96d49]"><Clock3 size={13} /> Hours</p><p className="text-sm leading-7">Mon – Fri <span className="float-right">7:00 – 4:00</span><br />Sat – Sun <span className="float-right">8:00 – 5:00</span></p></div>
                <div><p className="mb-3 flex items-center gap-2 font-mono-custom text-[10px] uppercase tracking-[.16em] text-[#b96d49]"><Utensils size={13} /> Good to know</p><p className="text-sm leading-7">Wi-Fi, outdoor tables,<br />dogs on the patio.</p></div>
              </div>
              <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#b6c7b4]">
                <div className="absolute h-56 w-56 rounded-full border border-[#456653]/25" /><div className="absolute h-28 w-28 rounded-full border border-[#456653]/30" />
                <div className="relative flex items-center gap-2 rounded-full bg-[#f3eadc] px-3 py-2 shadow-sm"><MapPin size={14} className="text-[#b96d49]" /><span className="font-mono-custom text-[9px] uppercase tracking-[.14em]">You are here</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#30231d] px-5 pb-8 pt-16 text-[#f7f0e5] sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-10 border-b border-[#f7f0e5]/15 pb-14 md:flex-row md:items-end">
            <div><p className="font-mono-custom text-[10px] uppercase tracking-[.2em] text-[#e7a96d]">Your next good morning</p><h2 className="mt-4 max-w-[660px] font-display text-[clamp(3.4rem,7vw,7rem)] leading-[.84] tracking-[-.07em]">See you<br /><em className="text-[#e7a96d]">soon.</em></h2></div>
            <div className="flex gap-7 text-sm text-[#f7f0e5]/70"><button onClick={() => scrollTo('menu')} className="line-link" data-testid="footer-link-menu">Menu</button><button onClick={() => scrollTo('visit')} className="line-link" data-testid="footer-link-visit">Visit</button><a href="https://instagram.com" target="_blank" rel="noreferrer" className="line-link flex items-center gap-2" data-testid="link-instagram"><Instagram size={15} /> Instagram</a></div>
          </div>
          <div className="flex flex-col justify-between gap-4 pt-7 font-mono-custom text-[9px] uppercase tracking-[.15em] text-[#f7f0e5]/45 sm:flex-row"><p>© 2024 Kindred Coffee House</p><p>Made slowly in Seattle</p></div>
        </div>
      </footer>

      {orderOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#2b211c]/65 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Order ahead">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-auto rounded-t-[1.5rem] bg-[#f3eadc] p-6 text-[#2b211c] shadow-2xl sm:rounded-[1.5rem] sm:p-8" data-testid="dialog-order">
            <div className="flex items-start justify-between"><div><p className="font-mono-custom text-[10px] uppercase tracking-[.18em] text-[#b96d49]">Pick-up, made easy</p><h2 className="mt-2 font-display text-4xl">Your order</h2></div><button onClick={() => { setOrderOpen(false); setOrderSent(false); }} className="rounded-full p-2 transition-colors hover:bg-[#e7dccb]" aria-label="Close order dialog" data-testid="button-close-order"><X size={19} /></button></div>
            {!orderSent ? <>
              <div className="mt-7 space-y-3">{cartItems.length === 0 ? <div className="rounded-xl border border-dashed border-[#2b211c]/20 p-8 text-center"><Coffee className="mx-auto text-[#b96d49]" size={26} /><p className="mt-3 font-display text-xl">Nothing in the bag yet.</p><p className="mt-1 text-sm text-[#765f50]">Add a favorite from the menu, then come back here.</p><button onClick={() => { setOrderOpen(false); scrollTo('menu'); }} className="mt-5 rounded-full bg-[#30231d] px-4 py-2.5 text-xs font-semibold uppercase tracking-[.12em] text-[#f7f0e5]" data-testid="button-browse-menu">Browse the menu</button></div> : cartItems.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#e7dccb] p-4" data-testid={`order-item-${item.id}`}><div><p className="font-display text-xl">{item.name}</p><p className="font-mono-custom text-xs text-[#b96d49]">{item.price}</p></div><div className="flex items-center gap-3"><button onClick={() => removeFromCart(item.id)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2b211c]/20" aria-label={`Remove one ${item.name}`} data-testid={`button-remove-${item.id}`}><Minus size={13} /></button><span className="font-mono-custom text-sm">{cart[item.id]}</span><button onClick={() => addToCart(item.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#30231d] text-[#f7f0e5]" aria-label={`Add one ${item.name}`} data-testid={`button-increase-${item.id}`}><Plus size={13} /></button></div></div>)}</div>
              {cartItems.length > 0 && <><div className="mt-6 flex justify-between border-t border-[#2b211c]/15 pt-5 font-display text-2xl"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div><button onClick={() => setOrderSent(true)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#b96d49] py-3.5 text-sm font-semibold text-[#f7f0e5] transition-transform hover:-translate-y-0.5" data-testid="button-submit-order">Send order to the bar <ArrowUpRight size={16} /></button><p className="mt-3 text-center text-[11px] text-[#765f50]">We will have it ready in about 10 minutes.</p></>}
            </> : <div className="py-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#b6c7b4] text-[#456653]"><Check size={24} /></div><h3 className="mt-5 font-display text-3xl">You are all set.</h3><p className="mx-auto mt-2 max-w-[270px] text-sm leading-6 text-[#765f50]">Your order is in. We will see you at the bar soon.</p><button onClick={() => { setOrderOpen(false); setOrderSent(false); setCart({}); }} className="mt-7 rounded-full bg-[#30231d] px-5 py-3 text-xs font-semibold uppercase tracking-[.12em] text-[#f7f0e5]" data-testid="button-finish-order">Done</button></div>}
          </div>
        </div>
      )}

      {visitOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#2b211c]/65 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Plan a visit">
          <div className="w-full max-w-lg rounded-t-[1.5rem] bg-[#f3eadc] p-6 text-[#2b211c] shadow-2xl sm:rounded-[1.5rem] sm:p-8" data-testid="dialog-visit">
            <div className="flex items-start justify-between"><div><p className="font-mono-custom text-[10px] uppercase tracking-[.18em] text-[#b96d49]">Save yourself a seat</p><h2 className="mt-2 font-display text-4xl">Plan a visit</h2></div><button onClick={() => { setVisitOpen(false); setVisitSent(false); }} className="rounded-full p-2 hover:bg-[#e7dccb]" aria-label="Close visit dialog" data-testid="button-close-visit"><X size={19} /></button></div>
            {!visitSent ? <form className="mt-7 grid gap-4" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setVisitSent(true); }}><label className="grid gap-2 text-xs font-semibold uppercase tracking-[.12em]">Your name<input required name="name" className="rounded-xl border border-[#2b211c]/20 bg-[#e7dccb] px-4 py-3 font-sans text-sm font-normal normal-case tracking-normal outline-none focus:border-[#b96d49]" placeholder="What should we call you?" data-testid="input-visit-name" /></label><label className="grid gap-2 text-xs font-semibold uppercase tracking-[.12em]">Best email<input required type="email" name="email" className="rounded-xl border border-[#2b211c]/20 bg-[#e7dccb] px-4 py-3 font-sans text-sm font-normal normal-case tracking-normal outline-none focus:border-[#b96d49]" placeholder="you@example.com" data-testid="input-visit-email" /></label><label className="grid gap-2 text-xs font-semibold uppercase tracking-[.12em]">When are you thinking?<select name="time" className="rounded-xl border border-[#2b211c]/20 bg-[#e7dccb] px-4 py-3 font-sans text-sm font-normal normal-case tracking-normal outline-none focus:border-[#b96d49]" data-testid="select-visit-time"><option>Tomorrow morning</option><option>This Saturday</option><option>Next week</option></select></label><button type="submit" className="mt-3 rounded-full bg-[#30231d] py-3.5 text-sm font-semibold text-[#f7f0e5]" data-testid="button-submit-visit">Put it on my calendar</button></form> : <div className="py-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#b6c7b4] text-[#456653]"><Check size={24} /></div><h3 className="mt-5 font-display text-3xl">Lovely. It is a date.</h3><p className="mx-auto mt-2 max-w-[290px] text-sm leading-6 text-[#765f50]">We will send a little reminder, plus directions for finding the sunny corner.</p><button onClick={() => setVisitOpen(false)} className="mt-7 rounded-full bg-[#30231d] px-5 py-3 text-xs font-semibold uppercase tracking-[.12em] text-[#f7f0e5]" data-testid="button-finish-visit">See you there</button></div>}
          </div>
        </div>
      )}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;