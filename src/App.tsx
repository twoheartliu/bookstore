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
  Languages,
  ShoppingCart,
  ArrowRight
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
  isLocked?: boolean;
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
    subtitle: "Select books you're interested in and add them to your cart. All proceeds will be used for nofan site maintenance.",
    nodeInfo: 'Instance Node: nofan.xyz',
    fundraisingProgress: 'Fundraising Progress',
    proceedsNotice: 'All proceeds go directly to server hosting & bandwidth.',
    allBooks: 'All Books',
    all: 'All',
    computerScience: 'Computer Science',
    literature: 'Literature',
    humanities: 'Humanities',
    finance: 'Finance',
    tech: 'Tech',
    philosophy: 'Philosophy',
    bundles: 'Bundles',
    claimedBy: 'Claimed By',
    bundle: 'Bundle',
    claimBook: 'Claim Book',
    soldOut: 'Sold Out',
    locked: 'Claiming...',
    lockConflict: 'Sorry, the following books in your cart have been claimed by someone else: ',
    claimModalTitle: 'Claim this read',
    claimModalSubtitle: 'Support the instance and claim your item.',
    successTitle: 'Success!',
    successSubtitle: 'May your bookshelf never be empty.',
    thankYou: 'Thank you for your support!',
    reservedFor: 'Reserved for',
    contactNotice: "We'll contact you on the fediverse for shipping details.",
    seeYou: 'See you on the timeline!',
    selectedItem: 'SELECTED ITEM',
    handleLabel: 'Instance Domain',
    handlePlaceholder: 'e.g. nofan.xyz',
    nameLabel: 'Recipient Name',
    namePlaceholder: 'Your full name...',
    addressLabel: 'Shipping Address',
    addressPlaceholder: 'Street, City, State, ZIP...',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'Mobile or Phone number...',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove',
    manualConfirmationNotice: 'Claiming is subject to manual confirmation (first come, first served). Status updates may be delayed; please refer to the private message response.',
    shippingNotice: 'Note: Books are heavy. To simplify shipping costs, all items are shipped via SF Express Pay-on-Delivery (顺丰到付). This is the same price as pre-paid.',
    donateAndClaim: 'Donate & Claim',
    secureCheckout: 'SECURE FEDERATED CHECKOUT',
    serverStatus: 'Server Status',
    statusOnline: 'Online',
    builtForFed: 'Built for the nofan Federation'
  },
  zh: {
    siteTitle: '二心的旧书架',
    siteTitleZh: "Twoheart's Moving Sale",
    subtitle: '自由加购你感兴趣的书，所有收益将用于 nofan 站点运维。',
    nodeInfo: '实例节点: nofan.xyz',
    fundraisingProgress: '筹款进度',
    proceedsNotice: '所有收益将直接用于服务器托管和带宽支出。',
    allBooks: '全部书籍',
    all: '全部',
    computerScience: '计算机科学',
    literature: '文学',
    humanities: '人文社科',
    finance: '金融经济',
    tech: '技术/计算机',
    philosophy: '哲学/逻辑',
    bundles: '精选套装',
    claimedBy: '认领者',
    bundle: '套装',
    claimBook: '认领书籍',
    soldOut: '已售罄',
    locked: '认领中',
    lockConflict: '抱歉，你购物车中的以下书籍已被其他站友抢先认领了：',
    claimModalTitle: '认领此书',
    claimModalSubtitle: '支持实例运行，认领你的书籍。',
    successTitle: '成功！',
    successSubtitle: '愿你的书架永不空虚。',
    thankYou: '感谢你的支持！',
    reservedFor: '已为以下用户预留',
    contactNotice: '我们将通过联邦宇宙（Fediverse）联系你确认邮寄详情。',
    seeYou: '时间线上见！',
    selectedItem: '已选项目',
    handleLabel: '实例域名 (Instance Domain)',
    handlePlaceholder: '例如 nofan.xyz',
    nameLabel: '收件人姓名',
    namePlaceholder: '请填写收件人姓名...',
    addressLabel: '详细收货地址',
    addressPlaceholder: '请填写详细收货地址...',
    phoneLabel: '联系电话',
    phonePlaceholder: '请填写手机号码...',
    addToCart: '加入购物车',
    removeFromCart: '移出购物车',
    manualConfirmationNotice: '认领采用人工确认制（先发先得），页面状态可能存在延迟，请以私信回复为准。',
    shippingNotice: '注：书籍较重，为节省计算邮费和称重的精力，所有书籍统一发顺丰到付（顺丰到付与寄付价格一致，无额外溢价）。',
    donateAndClaim: '去结算 & 发送私信',
    secureCheckout: '安全联邦结账',
    serverStatus: '服务器状态',
    statusOnline: '在线',
    builtForFed: '爱来自 nofan'
  }
};

// --- Data ---
const BOOKS_API = 'https://bookstore.twoheart.workers.dev/api/books';
const LOCK_API = 'https://bookstore.twoheart.workers.dev/api/lock';

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
    default: "bg-white/95 text-[#6364ff] border border-[#6364ff]/20 shadow-sm",
    sold: "bg-gray-100 text-gray-500 border border-transparent",
    locked: "bg-blue-50 text-blue-600 border border-blue-100",
    accent: "bg-orange-100 text-orange-700 border border-transparent"
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

const BookCard = ({ book, onAddToCart, onRemoveFromCart, isInCart, t }: { book: Book; onAddToCart: (b: Book) => void; onRemoveFromCart: (id: string) => void; isInCart: boolean; t: any }) => {
  const categoryLabel = t[book.category] || book.category;
  const isUnavailable = book.isClaimed || book.isLocked;
  
  return (
    <Card className={`flex flex-col h-full ${isUnavailable ? 'opacity-70 grayscale-[0.3]' : ''}`}>
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
          <Badge variant={book.isClaimed ? "sold" : (book.isLocked ? "locked" : (isInCart ? "accent" : "default"))}>
            {book.isClaimed ? t.soldOut : (book.isLocked ? t.locked : categoryLabel)}
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
            variant={isUnavailable ? "secondary" : (isInCart ? "secondary" : "primary")}
            disabled={isUnavailable}
            onClick={() => isInCart ? onRemoveFromCart(book.id) : onAddToCart(book)}
            className="!px-3 !py-1.5 min-w-[100px]"
          >
            {book.isClaimed ? t.soldOut : (book.isLocked ? t.locked : (isInCart ? t.removeFromCart : t.addToCart))}
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

  const [isClaiming, setIsClaiming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [handle, setHandle] = useState('nofan.xyz');
  const [recipientName, setRecipientName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<Book[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [instanceList, setInstanceList] = useState<string[]>(['nofan.xyz']);
  const [showInstanceSuggestions, setShowInstanceSuggestions] = useState(false);
  const [isInstanceListLoading, setIsInstanceListLoading] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(books.map(b => b.category)));
    return ['all', ...uniqueCategories];
  }, [books]);

  const filteredBooks = useMemo(() => {
    if (selectedCategory === 'all') return books;
    return books.filter(b => b.category === selectedCategory);
  }, [books, selectedCategory]);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.charityPrice, 0);
  }, [cart]);

  const currentFunds = useMemo(() => {
    return books.filter(b => b.isClaimed).reduce((sum, b) => sum + b.charityPrice, 0);
  }, [books]);

  const totalGoal = useMemo(() => {
    return books.reduce((sum, b) => sum + b.charityPrice, 0);
  }, [books]);

  const getProxiedImage = (url: string) => {
    if (!url) return '';
    if (url.includes('doubanio.com')) {
      // Use Google's proxy first, it's very robust
      return `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const filteredInstances = useMemo(() => {
    const query = handle.trim().toLowerCase();
    if (!query) return instanceList.slice(0, 20);
    return instanceList
      .filter(domain => domain.toLowerCase().includes(query))
      .slice(0, 50);
  }, [handle, instanceList]);

  useEffect(() => {
    const fetchInstances = async () => {
      setIsInstanceListLoading(true);
      try {
        const response = await fetch('https://api.joinmastodon.org/servers');
        if (!response.ok) throw new Error();
        const data = await response.json();
        const domains = data.map((s: any) => s.domain);
        // Prepend nofan.xyz and remove duplicates
        const combined = Array.from(new Set(['nofan.xyz', ...domains]));
        setInstanceList(combined);
      } catch (err) {
        console.error('Failed to fetch instance list', err);
        setInstanceList(['nofan.xyz']);
      } finally {
        setIsInstanceListLoading(false);
      }
    };
    fetchInstances();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setFetchError(null);
        // Add cache-buster to ensure we get fresh data
        const response = await fetch(`${BOOKS_API}?t=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const json = await response.json();
        const bookData = json.data || json;
        
        if (!Array.isArray(bookData)) {
          throw new Error('Data format error: Expected an array of books');
        }
        
        const formattedBooks: Book[] = bookData.map((item: any) => ({
          id: String(item.id),
          title: item.title,
          originalPrice: item.originalPrice || 0,
          charityPrice: item.price || 0,
          category: item.category || 'single',
          coverImage: getProxiedImage(item.cover),
          isClaimed: item.status === 'sold_out',
          isLocked: item.status === 'locked',
          claimedBy: item.claimed_by || item.claimedBy,
          description: item.description,
          doubanUrl: item.doubanUrl
        }));
        
        setBooks(formattedBooks);
      } catch (error: any) {
        console.error('Failed to fetch books:', error);
        setFetchError(error.message || 'Failed to sync with the library');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
    // Poll for updates every 30 seconds to keep locked/sold status fresh
    const interval = setInterval(fetchBooks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getShareUrl = () => {
    const domain = handle.trim().replace(/^@/, '');
    
    const bookTitles = cart.map(b => `《${b.title}》`).join('、');
    const message = `@twoheart@nofan.xyz 二心你好！我想认领 ${cart.length} 本书：${bookTitles}。
总计赞助额：${totalPrice} 元。
我的顺丰到付收件信息是：
姓名：${recipientName}
电话：${phone}
地址：${address}`;

    // fallback to nofan.xyz
    const instanceUrl = domain && domain.includes('.') ? `https://${domain}` : 'https://nofan.xyz';
    return `${instanceUrl}/share?text=${encodeURIComponent(message)}&visibility=direct`;
  };

  const addToCart = (book: Book) => {
    if (cart.find(b => b.id === book.id)) return;
    setCart([...cart, book]);
  };

  const removeFromCart = (bookId: string) => {
    setCart(cart.filter(b => b.id !== bookId));
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsClaiming(true);

    try {
      // 1. Calling lock API
      const response = await fetch(LOCK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookIds: cart.map(b => b.id) }),
      });

      if (response.ok) {
        // Success: Locked. Proceed with share link.
        setIsClaiming(false);
        setIsSuccess(true);
        
        const shareUrl = getShareUrl();
        if (shareUrl) {
          window.open(shareUrl, '_blank');
        }
      } else if (response.status === 409) {
        // Conflict
        const data = await response.json();
        const titles = data.conflictedTitles?.map((t: string) => `《${t}》`).join('、');
        alert(`${t.lockConflict}${titles}`);
        // Refresh page to sync state
        window.location.reload();
      } else {
        throw new Error('Unexpected error during locking');
      }
    } catch (error) {
      console.error('Locking failed:', error);
      alert('Network error or server error. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleManualClose = () => {
    setIsCartOpen(false);
    if (isSuccess) {
      setIsSuccess(false);
      setHandle('nofan.xyz');
      setRecipientName('');
      setAddress('');
      setPhone('');
      setCart([]);
    }
  };

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
              <ProgressBar current={currentFunds} goal={totalGoal} t={t} />
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6364ff]" />
                <span>{t.proceedsNotice}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Categories / Filter */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 ${
                selectedCategory === cat 
                  ? 'bg-[#6364ff] text-white shadow-lg shadow-[#6364ff]/20 scale-105' 
                  : 'bg-white text-gray-400 hover:text-[#6364ff] border border-[#6364ff]/5'
              }`}
            >
              {cat === 'all' ? t.all : (t[cat] || cat)}
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
              <AnimatePresence mode="popLayout">
                {filteredBooks.map(book => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookCard 
                      book={book} 
                      onAddToCart={addToCart} 
                      onRemoveFromCart={removeFromCart}
                      isInCart={!!cart.find(b => b.id === book.id)}
                      t={t} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
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
            <a href="https://nofan.xyz/@twoheart" className="hover:text-[#6364ff] transition-colors text-xs font-mono font-bold">@twoheart</a>
          </div>
        </footer>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-[#6364ff] text-white rounded-full shadow-2xl flex items-center justify-center z-40 group"
          >
            <ShoppingCart className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              {cart.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Drawer / Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pt-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleManualClose}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-serif tracking-tight">{isSuccess ? t.successTitle : t.claimModalTitle}</h2>
                  {!isSuccess && <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">{cart.length} ITEMS IN CART</p>}
                </div>
                <button onClick={handleManualClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6">
                {isSuccess ? (
                  <div className="py-12 text-center">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-16 h-16 bg-green-50 text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-8 h-8" />
                    </motion.div>
                    <h3 className="text-xl font-serif mb-2 tracking-tight">{t.thankYou}</h3>
                    <p className="text-xs text-gray-500 mb-8 max-w-[280px] mx-auto leading-relaxed">
                      We've attempted to open a direct message window on your instance. If it didn't open, please use the button below.
                    </p>
                    
                    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
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
                        Done / 完成 / 清空购物车
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Cart Items */}
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4 p-3 bg-gray-50/50 rounded-2xl border border-gray-50 group">
                          <img 
                            src={item.coverImage} 
                            className="w-16 h-24 object-cover rounded-lg shadow-sm" 
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                            data-original-url={item.coverImage.includes('googleusercontent.com') ? decodeURIComponent(new URL(item.coverImage).searchParams.get('url') || '') : item.coverImage}
                          />
                          <div className="flex-grow flex flex-col justify-between py-1">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-serif font-bold leading-tight line-clamp-2 pr-4">{item.title}</h4>
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">{t[item.category] || item.category}</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-mono font-bold text-[#6364ff]">¥{item.charityPrice}</span>
                              <span className="text-[10px] text-gray-300 line-through">¥{item.originalPrice}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-50 pt-6 space-y-6">
                      <div className="flex justify-between items-baseline">
                        <span className="font-serif italic text-gray-500">Total Charity Donation</span>
                        <span className="text-3xl font-serif font-bold text-[#6364ff] tracking-tighter">¥{totalPrice}</span>
                      </div>

                      <form onSubmit={handleClaimSubmit} className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-1.5 relative group">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6364ff]/60 px-1 ml-1 flex items-center gap-1.5">
                              <Server className="w-3 h-3" /> {t.handleLabel}
                            </label>
                            <div className="relative">
                              <input 
                                required
                                type="text"
                                placeholder={t.handlePlaceholder}
                                value={handle}
                                onChange={(e) => {
                                  setHandle(e.target.value);
                                  setShowInstanceSuggestions(true);
                                }}
                                onFocus={() => setShowInstanceSuggestions(true)}
                                onBlur={() => {
                                  // Delay to allow clicking on suggestion
                                  setTimeout(() => setShowInstanceSuggestions(false), 200);
                                }}
                                className="w-full bg-[#faf9f6] border border-[#6364ff]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6364ff]/20 transition-all font-mono"
                              />
                              
                              <AnimatePresence>
                                {showInstanceSuggestions && filteredInstances.length > 0 && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                                  >
                                    {filteredInstances.map((domain) => (
                                      <button
                                        key={domain}
                                        type="button"
                                        onClick={() => {
                                          setHandle(domain);
                                          setShowInstanceSuggestions(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-xs font-mono hover:bg-[#6364ff]/5 hover:text-[#6364ff] transition-colors flex items-center justify-between group/item border-b border-gray-50 last:border-0"
                                      >
                                        <span>{domain}</span>
                                        {domain === 'nofan.xyz' && <span className="text-[8px] bg-[#6364ff]/10 px-1.5 py-0.5 rounded text-[#6364ff] font-bold">LOCAL</span>}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {isInstanceListLoading && !instanceList.length && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                  <div className="w-3.5 h-3.5 border-2 border-[#6364ff]/20 border-t-[#6364ff] rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6364ff]/60 px-1 ml-1 flex items-center gap-1.5">
                              <User className="w-3 h-3" /> {t.nameLabel}
                            </label>
                            <input 
                              required
                              type="text"
                              placeholder={t.namePlaceholder}
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              className="w-full bg-[#faf9f6] border border-[#6364ff]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6364ff]/20 transition-all font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6364ff]/60 px-1 ml-1 flex items-center gap-1.5">
                              <ArrowRight className="w-3 h-3" /> {t.phoneLabel}
                            </label>
                            <input 
                              required
                              type="tel"
                              placeholder={t.phonePlaceholder}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
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
                        <div className="space-y-3">
                          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3">
                            <Package className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-orange-700 leading-relaxed">
                              {t.shippingNotice}
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                            <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                              {t.manualConfirmationNotice}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            disabled={isClaiming || cart.length === 0} 
                            className="w-full py-4 text-base" 
                            loading={isClaiming}
                          >
                            <ArrowRight className="w-4 h-4" />
                            {t.donateAndClaim} ({cart.length})
                          </Button>
                          <p className="mt-4 text-[10px] text-center text-gray-400 leading-relaxed max-w-[280px] mx-auto italic">
                            By clicking claim, we'll help you compose a direct message to @twoheart on your instance to confirm.
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
              )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
