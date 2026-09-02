import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  Copy, 
  Check, 
  Loader2, 
  Building2, 
  Wallet, 
  AlertCircle, 
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Crown,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserPurchase, PaymentConfig, UserRole, UserLoyalty } from '../types';

export interface CheckoutTarget {
  type: 'tool' | 'category' | 'all_access';
  id: string; // 'art-1', '1', 'all_access'
  title: string;
  subtitle?: string;
  priceRp: number;
  badge?: string;
  mayarPaymentUrl?: string;
}

interface MidtransPaymentModalProps {
  target: CheckoutTarget | null;
  user: User | null;
  userRole?: UserRole;
  discountPercentage?: number;
  paymentConfig: PaymentConfig;
  loyalty?: UserLoyalty;
  resellerTrialRemaining?: number;
  onClose: () => void;
  onPaymentSuccess: (purchase: UserPurchase) => void;
  onUseFreeReward?: (target: CheckoutTarget) => void;
  onUseResellerTrial?: (target: CheckoutTarget) => void;
}

type TabType = 'mayar' | 'qris' | 'va' | 'ewallet';
type BankType = 'bca' | 'mandiri' | 'bri' | 'bni';

export const MidtransPaymentModal: React.FC<MidtransPaymentModalProps> = ({
  target,
  user,
  userRole = 'public',
  discountPercentage = 50,
  paymentConfig,
  loyalty,
  resellerTrialRemaining = 0,
  onClose,
  onPaymentSuccess,
  onUseFreeReward,
  onUseResellerTrial
}) => {
  const isArtikelSkripsi = Boolean(
    target?.mayarPaymentUrl || 
    target?.id === '1' || 
    target?.id === 'art-1' || 
    target?.id === 'art-2' || 
    target?.id === 'art-3' || 
    target?.title.toLowerCase().includes('artikel') || 
    target?.title.toLowerCase().includes('skripsi')
  );

  const mayarUrl = target?.mayarPaymentUrl || 'https://zainnet.myr.id/pl/pembuatan-artikel-skripsi?iframe=true';

  const [activeTab, setActiveTab] = useState<TabType>(isArtikelSkripsi ? 'mayar' : 'qris');
  const [selectedBank, setSelectedBank] = useState<BankType>('bca');
  
  // Transaction State
  const [orderId, setOrderId] = useState<string>('');
  const [vaNumber, setVaNumber] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [copiedVa, setCopiedVa] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes timer
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize or reset on target open
  useEffect(() => {
    if (target) {
      const isTargetArtikel = Boolean(
        target.mayarPaymentUrl || 
        target.id === '1' || 
        target.id === 'art-1' || 
        target.id === 'art-2' || 
        target.id === 'art-3' || 
        target.title.toLowerCase().includes('artikel') || 
        target.title.toLowerCase().includes('skripsi')
      );
      setActiveTab(isTargetArtikel ? 'mayar' : 'qris');

      const generatedOrderId = `ZAIN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setOrderId(generatedOrderId);
      setIsInitializing(true);
      setTimeLeft(900);
      setStatusMessage(null);

      // Create charge in background
      fetch('/api/midtrans/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: generatedOrderId,
          amount: target.priceRp,
          itemTitle: target.title,
          itemId: target.type === 'tool' ? `tool:${target.id}` : target.type === 'category' ? `category:${target.id}` : 'all_access',
          customerEmail: user?.email || 'guest@zain.net',
          customerName: user?.displayName || 'Pengguna ZAIN.NET',
          paymentType: 'qris',
          bank: selectedBank
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.vaNumber) {
          setVaNumber(data.vaNumber);
        }
      })
      .catch(err => console.error('Midtrans init error:', err))
      .finally(() => setIsInitializing(false));
    }
  }, [target]);

  // Update VA when bank changes
  useEffect(() => {
    if (orderId && target) {
      const vaRandom = Math.floor(10000000 + Math.random() * 90000000);
      const vaPrefix = selectedBank === 'bca' ? '70012' : selectedBank === 'mandiri' ? '88019' : selectedBank === 'bri' ? '00291' : '98801';
      setVaNumber(`${vaPrefix}${vaRandom}`);
    }
  }, [selectedBank, orderId]);

  // Countdown timer
  useEffect(() => {
    if (!target) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  // Auto Polling for payment status every 4 seconds
  useEffect(() => {
    if (!target || !orderId) return;

    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/midtrans/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            email: user?.email || ''
          })
        });
        const data = await res.json();
        if (data.isSettled) {
          clearInterval(checkInterval);
          handleCompletePurchase('qris');
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(checkInterval);
  }, [target, orderId, user]);

  if (!target) return null;

  const formatMinutes = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyVa = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleCompletePurchase = (methodType: 'qris' | 'bank_transfer' | 'gopay' | 'demo' | 'mayar') => {
    const purchase: UserPurchase = {
      id: `purch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: user?.uid || 'guest',
      userEmail: user?.email || (userRole === 'reseller' ? 'reseller@zain.net' : 'user@zain.net'),
      itemId: target.type === 'tool' ? `tool:${target.id}` : target.type === 'category' ? `category:${target.id}` : 'all_access',
      itemType: target.type,
      itemTitle: target.title,
      amountPaid: target.priceRp,
      orderId: orderId || `${methodType === 'mayar' ? 'MYR' : 'MID'}-${Date.now()}`,
      purchasedAt: Date.now(),
      paymentType: methodType,
      method: methodType === 'mayar' ? 'mayar' : methodType === 'demo' ? 'demo' : 'midtrans_qris',
      bank: methodType === 'mayar' ? 'MAYAR' : selectedBank.toUpperCase(),
      vaNumber: vaNumber,
      status: 'settlement'
    };
    onPaymentSuccess(purchase);
  };

  const handleManualCheck = async () => {
    setIsCheckingStatus(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/midtrans/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email: user?.email || '' })
      });
      const data = await res.json();
      if (data.isSettled) {
        handleCompletePurchase('qris');
      } else {
        setStatusMessage('Pembayaran belum terdeteksi. Silakan selesaikan scan QRIS atau transfer VA terlebih dahulu.');
      }
    } catch (err) {
      setStatusMessage('Gagal menghubungi gateway Midtrans. Periksa koneksi internet Anda.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/midtrans/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: target.priceRp,
          itemTitle: target.title,
          itemId: target.type === 'tool' ? `tool:${target.id}` : target.type === 'category' ? `category:${target.id}` : 'all_access',
          customerEmail: user?.email || 'user@zain.net'
        })
      });
      setTimeout(() => {
        setIsSimulating(false);
        handleCompletePurchase('demo');
      }, 700);
    } catch (err) {
      setIsSimulating(false);
      handleCompletePurchase('demo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0 font-black text-lg">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Midtrans Payment Gateway
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Resmi & Otomatis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {paymentConfig.merchantName || 'ZAIN.NET Academic Gateway'}
            </p>
          </div>
        </div>

        {/* Google Loyalty Promo Banner & Free Claim Option */}
        {user && userRole === 'public' && loyalty && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-yellow-500/15 border border-amber-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-extrabold text-amber-300">
                  Promo Akun Google: Beli 3× Gratis 1×
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 font-bold">
                Stamp: {loyalty.purchaseCount % 3}/3
              </span>
            </div>

            {loyalty.freeRewardsAvailable > 0 ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
                <div>
                  <p className="text-[11px] text-amber-200 font-bold">
                    Anda memiliki {loyalty.freeRewardsAvailable}x Kuota Gratis Tersedia!
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Gunakan voucher reward Anda sekarang untuk modul ini tanpa bayar.
                  </p>
                </div>
                {onUseFreeReward && (
                  <button
                    type="button"
                    onClick={() => onUseFreeReward(target)}
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Gunakan Kuota Gratis (Rp 0)</span>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Selesaikan pembayaran ini untuk menambah stamp Anda ({loyalty.purchaseCount % 3 + 1}/3). Setiap 3x pembelian otomatis mendapat 1 kuota gratis all item!
              </p>
            )}
          </div>
        )}

        {/* Reseller Free Trial Available Banner */}
        {userRole === 'reseller' && target.type === 'tool' && resellerTrialRemaining > 0 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 text-xs text-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-extrabold text-cyan-300">
                  Hak Istimewa Reseller: Free Trial 3x Per Item
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold">
                Trial: {resellerTrialRemaining}/3x Tersisa
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-cyan-500/20">
              <div>
                <p className="text-[11px] text-cyan-200 font-bold">
                  Modul ini memiliki {resellerTrialRemaining}x Free Trial Gratis!
                </p>
                <p className="text-[10px] text-slate-400">
                  Sebagai akun Reseller, Anda dapat langsung memakai modul ini tanpa membayar.
                </p>
              </div>
              {onUseResellerTrial && (
                <button
                  type="button"
                  onClick={() => onUseResellerTrial(target)}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Gunakan Free Trial Sekarang (Rp 0)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Target Item Summary Box */}
        <div className="mb-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                {target.type === 'category' ? 'Paket Menu Kategori' : '1x Kuota Pembuatan'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Sekali Pakai
              </span>
              {userRole === 'reseller' && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                  <span>Diskon Reseller {discountPercentage}%</span>
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm sm:text-base text-white truncate">
              {target.title}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Berlaku untuk 1x pembuatan / proses naskah. Pembuatan selanjutnya membutuhkan kuota baru.
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span>Order ID:</span>
              <span className="font-mono text-slate-300 font-bold">{orderId}</span>
              <button 
                onClick={handleCopyOrderId}
                title="Salin Order ID"
                className="text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                {copiedOrderId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-slate-400 block">Total Tagihan</span>
            <span className="text-lg sm:text-xl font-black text-amber-300">
              Rp {target.priceRp.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Payment Methods Tab */}
        <div className={`grid ${isArtikelSkripsi ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-4`}>
          {isArtikelSkripsi && (
            <button
              onClick={() => setActiveTab('mayar')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'mayar'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'text-amber-400 hover:text-amber-200 border border-amber-500/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mayar Pay</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('qris')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'qris'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QRIS E-Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('va')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'va'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Virtual Account</span>
          </button>

          <button
            onClick={() => setActiveTab('ewallet')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ewallet'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>E-Wallet Lain</span>
          </button>
        </div>

        {/* Tab Content 0: MAYAR (Khusus Pembuatan Artikel Skripsi) */}
        {activeTab === 'mayar' && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="font-extrabold text-xs text-amber-300">
                  Pembayaran Resmi Mayar — Khusus Pembuatan Artikel Skripsi
                </h5>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Selesaikan pembelian via gateway Mayar resmi. Mendukung QRIS instan, Virtual Account bank, dan dompet digital terverifikasi.
                </p>
              </div>
            </div>

            {/* The Official Mayar HTML Link & Button */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-300">
                1. Klik tombol di bawah untuk membuka form checkout Mayar:
              </label>
              
              <a 
                className="mayar-button iframe-lightbox-link w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer no-underline active:scale-95 text-center" 
                href={mayarUrl} 
                data-padding-bottom="30%" 
                data-scrolling="true"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span></span>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Beli Sekarang via Mayar (https://zainnet.myr.id/pl/pembuatan-artikel-skripsi)</span>
                <ExternalLink className="w-4 h-4 text-slate-950" />
              </a>
            </div>

            {/* Interactive Embedded Checkout View */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Form Checkout Mayar Langsung di Sini:</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">zainnet.myr.id</span>
              </div>
              
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 bg-white shadow-inner relative">
                <iframe
                  src={mayarUrl}
                  title="Mayar Payment Gateway - Pembuatan Artikel Skripsi"
                  className="w-full h-full border-0"
                  allow="payment"
                />
              </div>
            </div>

            {/* Step 2 Confirmation */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-amber-300">2. Konfirmasi Penyelesaian Transaksi:</p>
              <p className="text-slate-400">
                Setelah Anda menyelesaikan proses pembayaran pada halaman Mayar di atas, klik tombol hijau di bawah untuk mengaktifkan kuota pembuatan artikel naskah secara instan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCompletePurchase('mayar')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Saya Sudah Bayar di Mayar (Buka Akses Artikel Skripsi)</span>
            </button>
          </div>
        )}

        {/* Tab Content 1: QRIS */}
        {activeTab === 'qris' && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Batas Waktu Bayar:</span>
              </span>
              <span className="font-mono text-amber-300 font-bold text-sm">
                {formatMinutes(timeLeft)}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center relative">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://zain.net/pay/${orderId}?amt=${target.priceRp}&margin=0`}
                alt="QRIS Midtrans"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-2.5 px-2.5 py-0.5 bg-slate-900 text-[10px] font-bold text-white rounded-full border border-slate-700 shadow-md">
                QRIS Terverifikasi
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">
                Mendukung Semua Pembayaran:
              </p>
              <p className="text-[11px] text-slate-400">
                GoPay • OVO • DANA • ShopeePay • LinkAja • BCA Mobile • Livin' Mandiri • BRImo • Mobile Banking
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Virtual Account */}
        {activeTab === 'va' && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Pilih Bank Virtual Account:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['bca', 'mandiri', 'bri', 'bni'] as BankType[]).map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold uppercase transition-all border cursor-pointer ${
                      selectedBank === bank
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-1 text-xs text-slate-400">
                <span>Nomor Virtual Account ({selectedBank.toUpperCase()}):</span>
                <span className="text-[10px] text-emerald-400 font-bold">Otomatis Dicek</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider">
                  {vaNumber || '70012894102931'}
                </span>
                <button
                  onClick={handleCopyVa}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedVa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVa ? 'Tersalin' : 'Salin VA'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
              <p className="font-bold text-slate-300">Cara Pembayaran Mobile Banking:</p>
              <p>1. Buka aplikasi m-Banking {selectedBank.toUpperCase()} Anda.</p>
              <p>2. Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</p>
              <p>3. Masukkan nomor VA di atas dan konfirmasi nominal.</p>
              <p>4. Akses menu ZAIN.NET akan langsung terbuka seketika!</p>
            </div>
          </div>
        )}

        {/* Tab Content 3: E-Wallet Direct */}
        {activeTab === 'ewallet' && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <p className="text-xs text-slate-300 font-semibold">
              Pilih E-Wallet favorit Anda:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {['GoPay Instant', 'ShopeePay Direct', 'DANA / OVO', 'Alfamart / Indomaret'].map((name, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab('qris')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left hover:border-blue-500/40 transition-all cursor-pointer group"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300">{name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Scan otomatis via QRIS</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Semua dompet digital di atas terhubung langsung dengan kode QRIS ZAIN.NET.
            </p>
          </div>
        )}

        {/* Error / Status Message */}
        {statusMessage && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Button: Check status & WhatsApp Help */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleManualCheck}
            disabled={isCheckingStatus}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 disabled:opacity-75"
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa Sistem Midtrans...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Saya Sudah Menyelesaikan Pembayaran</span>
              </>
            )}
          </button>

          {/* WhatsApp CS Quick Help Button */}
          <button
            type="button"
            onClick={() => {
              const text = encodeURIComponent(`Halo Admin ZAIN.NET, saya butuh bantuan perihal pembayaran ${target.title} (Order ID: ${orderId}, Nominal: Rp ${target.priceRp.toLocaleString('id-ID')}).`);
              window.open(`https://wa.me/6285231176597?text=${text}`, '_blank', 'noopener,noreferrer');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Ada Kendala Pembayaran? Hubungi Kami Lewat WA (085231176597)</span>
          </button>
        </div>

        {/* Bottom Footer: Auto Webhook Status & Dev Simulation */}
        <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Auto-detect Midtrans Aktif</span>
          </div>

          <button
            onClick={handleSimulatePayment}
            disabled={isSimulating}
            className="text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
            title="Simulasi pelunasan instan untuk pengujian admin"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Memverifikasi...' : 'Simulasi Pembayaran (Uji Coba)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
