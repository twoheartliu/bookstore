/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  User, 
  Send, 
  X, 
  CheckCircle2, 
  Lock,
  Package,
  Server,
  MoveHorizontal,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Book {
  id: string;
  title: string;
  originalPrice: number;
  charityPrice: number;
  category: string;
  coverImage: string;
  isClaimed: boolean;
  claimedBy?: string;
  description: string;
  doubanUrl?: string; // New field from Gist
}

// --- I18n ---
type Locale = 'en' | 'zh';

const TRANSLATIONS = {
  en: {
    siteTitle: "Twoheart's Moving Sale",
    siteTitleZh: '二心的旧书架',
    subtitle: "Welcome to nofan! Created for Fanfou refugees. Pick a 'Bundle' or a single book; all proceeds go to site maintenance.",
    nodeInfo: 'Instance Node: nofan.xyz',
    fundraisingProgress: 'Fundraising Progress',
    proceedsNotice: 'All proceeds go directly to server hosting & bandwidth.',
    allBooks: 'All Books',
    computerScience: 'Computer Science',
    literature: 'Literature',
    philosophy: 'Philosophy',
    bundles: 'Bundles',
    claimedBy: 'Claimed By',
    bundle: 'Bundle',
    claimBook: 'Claim Book',
    reserved: 'Reserved',
    claimModalTitle: 'Claim this read',
    claimModalSubtitle: 'Support the instance and claim your item.',
    successTitle: 'Success!',
    successSubtitle: 'May your bookshelf never be empty.',
    thankYou: 'Thank you for your support!',
    reservedFor: 'Reserved for',
    contactNotice: "We'll contact you on the fediverse for shipping details.",
    seeYou: 'See you on the timeline!',
    selectedItem: 'SELECTED ITEM',
    handleLabel: 'Mastodon Handle',
    addressLabel: 'Shipping Address',
    addressPlaceholder: 'Recipient Name, Phone, and Full Address...',
    shippingNotice: 'Note: Books are heavy. To simplify shipping costs, all items are shipped via SF Express Pay-on-Delivery (顺丰到付). This is the same price as pre-paid.',
    donateAndClaim: 'Donate & Claim',
    secureCheckout: 'SECURE FEDERATED CHECKOUT',
    serverStatus: 'Server Status',
    statusOnline: 'Online',
    builtForFed: 'Built for the Federation'
  },
  zh: {
    siteTitle: '二心的旧书架',
    siteTitleZh: "Twoheart's Moving Sale",
    subtitle: '挑选你感兴趣的“主题包”或者单本，所有收益将用于 nofan 站点运维。',
    nodeInfo: '实例节点: nofan.xyz',
    fundraisingProgress: '筹款进度',
    proceedsNotice: '所有收益将直接用于服务器托管和带宽支出。',
    allBooks: '全部书籍',
    computerScience: '计算机科学',
    literature: '文学',
    philosophy: '哲学/逻辑',
    bundles: '精选套装',
    claimedBy: '认领者',
    bundle: '套装',
    claimBook: '认领书籍',
    reserved: '已预订',
    claimModalTitle: '认领此书',
    claimModalSubtitle: '支持实例运行，认领你的书籍。',
    successTitle: '成功！',
    successSubtitle: '愿你的书架永不空虚。',
    thankYou: '感谢你的支持！',
    reservedFor: '已为以下用户预留',
    contactNotice: '我们将通过联邦宇宙（Fediverse）联系你确认邮寄详情。',
    seeYou: '时间线上见！',
    selectedItem: '已选项目',
    handleLabel: '长毛象 ID (Handle)',
    addressLabel: '收货地址',
    addressPlaceholder: '收件人姓名、电话及详细地址...',
    shippingNotice: '注：书籍较重，为节省计算邮费和称重的精力，所有书籍统一发顺丰到付（顺丰到付与寄付价格一致，无额外溢价）。',
    donateAndClaim: '捐赠并认领',
    secureCheckout: '安全联邦结账',
    serverStatus: '服务器状态',
    statusOnline: '在线',
    builtForFed: '为联邦宇宙而建'
  }
};

// --- Data ---
const GIST_URL = 'https://gist.githubusercontent.com/twoheartliu/de948c91619fd8cb1c26e9b14b7dc100/raw';

const FUNDRAISING_GOAL = 5000;
const CURRENT_FUNDS = 3740;

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  loading = false,
  type = 'button'
}: any) => {
  const base = "px-5 py-2 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 text-xs";
  const variants: any = {
    primary: "bg-[#6364ff] text-white hover:bg-[#563acc] shadow-sm hover:shadow-md disabled:bg-gray-300",
    secondary: "bg-white border border-[#6364ff]/20 text-[#6364ff] hover:bg-[#6364ff]/5",
    ghost: "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100",
    outline: "bg-transparent border-2 border-[#6364ff] text-[#6364ff] hover:bg-[#6364ff] hover:text-white"
  };

  return (
    <button 
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className} ${loading ? 'opacity-80 cursor-wait' : ''}`}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white border border-[#6364ff]/10 rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(99,100,255,0.04)] transition-transform duration-500 hover:translate-y-[-2px] ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }: any) => {
  const variants: any = {
    default: "bg-[#6364ff]/10 text-[#6364ff]",
    sold: "bg-gray-100 text-gray-500",
    accent: "bg-orange-100 text-orange-700"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ current, goal, t }: { current: number; goal: number; t: any }) => {
  const percentage = Math.min((current / goal) * 100, 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{t.fundraisingProgress}</span>
          <span className="text-xl font-serif font-semibold text-[#6364ff]">
            ¥{current.toLocaleString()} <span className="text-xs font-normal text-gray-300">/ ¥{goal.toLocaleString()}</span>
          </span>
        </div>
        <span className="text-xs font-mono text-[#6364ff] font-bold">{Math.round(percentage)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[#6364ff] to-[#7b7cff]" 
        />
      </div>
    </div>
  );
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const img = e.currentTarget;
  const attempt = parseInt(img.getAttribute('data-attempt') || '0');
  const originalUrl = img.getAttribute('data-original-url');
  
  if (!originalUrl) {
    img.src = 'https://placehold.co/400x600/f8fafc/0f172a?text=Cover+Not+Found';
    return;
  }

  if (attempt >= 3) {
    img.src = 'https://placehold.co/400x600/f8fafc/0f172a?text=Cover+Not+Found';
    return;
  }

  const nextAttempt = attempt + 1;
  img.setAttribute('data-attempt', nextAttempt.toString());

  if (nextAttempt === 1) {
    // Attempt 1: Try a different proxy (wsrv.nl)
    img.src = `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=400&fit=cover`;
  } else if (nextAttempt === 2) {
    // Attempt 2: Try direct URL (meta referrer should handle this)
    img.src = originalUrl;
  } else if (nextAttempt === 3) {
    // Attempt 3: Try direct URL with a cache buster
    img.src = `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}retry=${Date.now()}`;
  }
};

const BookCard = ({ book, onClaim, t }: { book: Book; onClaim: (b: Book) => void; t: any }) => {
  return (
    <Card className={`flex flex-col h-full ${book.isClaimed ? 'opacity-70 grayscale-[0.3]' : ''}`}>
      <div className="relative aspect-[3/4] overflow-hidden group">
        <img 
          src={book.coverImage} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          data-original-url={book.coverImage.includes('googleusercontent.com') ? decodeURIComponent(new URL(book.coverImage).searchParams.get('url') || '') : book.coverImage}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant={book.isClaimed ? "sold" : "default"}>
            {book.isClaimed ? t.reserved : book.category}
          </Badge>
        </div>
        {book.doubanUrl && (
          <a 
            href={book.doubanUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute top-2 right-2 p-1.5 bg-green-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
            title="View on Douban"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </a>
        )}
        {book.isClaimed && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center p-4 text-center">
            <div className="bg-white/95 px-3 py-1.5 rounded shadow-sm border border-gray-100">
              <p className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">{t.claimedBy}</p>
              <p className="text-[10px] font-mono text-[#6364ff] truncate max-w-[120px]">{book.claimedBy}</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="font-serif text-base font-semibold leading-tight mb-2 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-3 mb-3 leading-relaxed italic opacity-80 font-serif">
            {book.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-serif font-bold text-[#6364ff]">¥{book.charityPrice}</span>
            <span className="text-[10px] text-gray-300 line-through">¥{book.originalPrice}</span>
          </div>
          <Button 
            variant={book.isClaimed ? "secondary" : "primary"}
            disabled={book.isClaimed}
            onClick={() => onClaim(book)}
            className="!px-3 !py-1.5"
          >
            {book.isClaimed ? t.reserved : t.claimBook}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// --- Main App ---

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh');
  const t = TRANSLATIONS[locale];

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [handle, setHandle] = useState('');
  const [address, setAddress] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const getProxiedImage = (url: string) => {
    if (!url) return '';
    if (url.includes('doubanio.com')) {
      // Use Google's proxy first, it's very robust
      return `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setFetchError(null);
        // Add cache-buster to ensure we get fresh data
        const response = await fetch(`${GIST_URL}?t=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Data format error: Expected an array of books');
        }
        
        const formattedBooks: Book[] = data.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          originalPrice: item.originalPrice || 0,
          charityPrice: item.price || 0,
          category: item.category || 'single',
          coverImage: getProxiedImage(item.cover),
          isClaimed: item.status === 'sold_out',
          claimedBy: item.claimedBy,
          description: item.description,
          doubanUrl: item.doubanUrl
        }));
        
        setBooks(formattedBooks);
      } catch (error: any) {
        console.error('Failed to fetch books:', error);
        setFetchError(error.message || 'Failed to sync with the library Gist');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const getShareUrl = () => {
    const parts = handle.replace(/^@/, '').split('@').filter(Boolean);
    const domain = parts[parts.length - 1];
    if (domain && domain.includes('.')) {
      const message = `@twoheart@nofan.xyz 我想认领《${selectedBook?.title}》，地址是：${address}`;
      return `https://${domain}/share?text=${encodeURIComponent(message)}&visibility=direct`;
    }
    return null;
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsClaiming(true);

    // Mock processing
    setTimeout(() => {
      setIsClaiming(false);
      setIsSuccess(true);
      
      const shareUrl = getShareUrl();
      if (shareUrl) {
        window.open(shareUrl, '_blank');
      }

      // Update books state
      setBooks(prev => prev.map(b => 
        b.id === selectedBook?.id 
          ? { ...b, isClaimed: true, claimedBy: handle } 
          : b
      ));

      // Removed auto-close setTimeout
    }, 2000);
  };

  const handleManualClose = () => {
    setSelectedBook(null);
    setIsSuccess(false);
    setHandle('');
    setAddress('');
  };

  const navCategories = [
    { key: 'allBooks', label: t.allBooks },
    { key: 'computerScience', label: t.computerScience },
    { key: 'literature', label: t.literature },
    { key: 'philosophy', label: t.philosophy },
    { key: 'bundles', label: t.bundles },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 selection:bg-[#6364ff]/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-20">
          <div className="flex justify-end mb-8">
            <button 
              onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#6364ff]/60 hover:text-[#6364ff] transition-colors bg-white px-3 py-1.5 rounded-full border border-[#6364ff]/10"
            >
              <Languages className="w-3 h-3" />
              {locale === 'en' ? '中文' : 'English'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Server className="w-4 h-4" />
                <span className="text-xs font-mono tracking-widest uppercase">{t.nodeInfo}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#6364ff] tracking-tight">
                {t.siteTitle} <br />
                <span className="italic font-normal text-gray-400">{t.siteTitleZh}</span>
              </h1>
              <p className="max-w-md text-gray-600 leading-relaxed font-serif">
                {t.subtitle}
              </p>
            </div>
            
            <div className="md:w-1/3 bg-white p-6 rounded-2xl border border-[#6364ff]/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <ProgressBar current={CURRENT_FUNDS} goal={FUNDRAISING_GOAL} t={t} />
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6364ff]" />
                <span>{t.proceedsNotice}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Categories / Filter Mock */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {navCategories.map((cat, i) => (
            <button 
              key={cat.key}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${i === 0 ? 'bg-[#6364ff] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Book Grid */}
        <section className="min-h-[400px]">
          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#6364ff]/20 border-t-[#6364ff] rounded-full animate-spin" />
              <p className="text-sm font-mono text-gray-400 animate-pulse uppercase tracking-widest">Syncing Library...</p>
            </div>
          ) : fetchError ? (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-12 h-12 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-2">
                <X className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-900">Sync Failed</p>
              <p className="text-xs text-gray-500 max-w-xs">{fetchError}</p>
              <Button variant="secondary" onClick={() => window.location.reload()} className="mt-4">
                Retry Connection
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map(book => (
                <BookCard key={book.id} book={book} onClaim={(b) => setSelectedBook(b)} t={t} />
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-[#6364ff]/10 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-mono">{t.serverStatus}: {t.statusOnline}</span>
            </div>
            <span className="text-xs">|</span>
            <span className="text-xs italic">{t.builtForFed}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#6364ff] transition-colors"><BookOpen className="w-5 h-5" /></a>
            <a href="#" className="hover:text-[#6364ff] transition-colors"><User className="w-5 h-5" /></a>
            <a href="#" className="hover:text-[#6364ff] transition-colors text-xs font-mono font-bold">@ADMIN</a>
          </div>
        </footer>
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isClaiming && !isSuccess && setSelectedBook(null)}
              className="absolute inset-0 bg-[#6364ff]/30 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-semibold text-[#6364ff]">
                    {isSuccess ? t.successTitle : t.claimModalTitle}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isSuccess ? t.successSubtitle : t.claimModalSubtitle}
                  </p>
                </div>
                {!isClaiming && !isSuccess && (
                  <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isSuccess ? (
                <div className="px-8 pb-12 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="w-16 h-16 bg-green-50 text-[#10b981] rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-serif mb-2 tracking-tight">{t.thankYou}</h3>
                  <p className="text-xs text-gray-500 mb-8 max-w-[280px] mx-auto leading-relaxed">
                    We've attempted to open a direct message window on your instance. If it didn't open, please use the button below.
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        const url = getShareUrl();
                        if (url) window.open(url, '_blank');
                      }} 
                      className="w-full"
                    >
                      Retry Redirect / 再次尝试跳转
                    </Button>
                    <Button variant="secondary" onClick={handleManualClose} className="w-full border-gray-100">
                      Done / 完成
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="px-8 pb-8 space-y-6">
                  {/* Selected Item Summary */}
                  <div className="flex gap-4 p-4 bg-[#6364ff]/5 rounded-2xl border border-[#6364ff]/10">
                    <img 
                      src={selectedBook.coverImage} 
                      className="w-12 h-18 object-cover rounded shadow-sm" 
                      alt="Book preview"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                      data-original-url={selectedBook.coverImage.includes('googleusercontent.com') ? decodeURIComponent(new URL(selectedBook.coverImage).searchParams.get('url') || '') : selectedBook.coverImage}
                    />
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6364ff] opacity-60">{t.selectedItem}</p>
                      <p className="font-serif text-sm font-semibold truncate max-w-[200px]">{selectedBook.title}</p>
                      <p className="text-lg font-serif font-bold text-[#6364ff]">¥{selectedBook.charityPrice}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6364ff]/60 px-1 ml-1 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {t.handleLabel}
                      </label>
                      <input 
                        required
                        type="text"
                        placeholder="@user@instance.social"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="w-full bg-[#faf9f6] border border-[#6364ff]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6364ff]/20 transition-all font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6364ff]/60 px-1 ml-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> {t.addressLabel}
                      </label>
                      <textarea 
                        required
                        placeholder={t.addressPlaceholder}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full bg-[#faf9f6] border border-[#6364ff]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6364ff]/20 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                    <Package className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-orange-700 leading-relaxed">
                      {t.shippingNotice}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-4 text-base" 
                    loading={isClaiming}
                  >
                    <Send className="w-4 h-4" />
                    {t.donateAndClaim}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest pt-2">
                    <Lock className="w-3 h-3" />
                    {t.secureCheckout}
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
