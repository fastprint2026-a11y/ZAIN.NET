import React from 'react';
import { Sparkles, Gift, Check, Flame, ArrowRight, Award } from 'lucide-react';
import { UserLoyalty } from '../types';

interface LoyaltyBannerProps {
  loyalty: UserLoyalty;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
}

export const LoyaltyBanner: React.FC<LoyaltyBannerProps> = ({
  loyalty,
  isLoggedIn,
  onOpenLogin,
  onOpenProfile
}) => {
  const currentStamps = loyalty.purchaseCount % 3;
  const hasReward = loyalty.freeRewardsAvailable > 0;

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-indigo-950/60 border border-amber-500/30 backdrop-blur-md shadow-xl shadow-amber-950/20 relative overflow-hidden">
      
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Info & Stamps */}
        <div className="space-y-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-black text-amber-300 uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Promo Akun Google: Beli 3× Gratis 1×</span>
            </span>

            {hasReward && (
              <span className="animate-pulse inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-extrabold text-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{loyalty.freeRewardsAvailable} Kuota Gratis Tersedia!</span>
              </span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-sm sm:text-base text-white">
              {hasReward
                ? `Selamat! Anda memiliki ${loyalty.freeRewardsAvailable}x Kuota Gratis All Item`
                : isLoggedIn
                ? `Kumpulkan 3 Pembelian untuk Dapatkan 1x Modul Gratis All Item`
                : `Masuk dengan Akun Google: Setiap Pembelian 3× Gratis 1× All Item`}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {hasReward
                ? 'Klik modul apa saja yang terkunci di bawah dan pilih "Klaim Gratis (Reward 3x)" untuk membuka 1x pembuatan tanpa biaya.'
                : isLoggedIn
                ? `Progress stamp Anda saat ini: ${currentStamps} dari 3 transaksi selesai. Beli ${3 - currentStamps}x modul lagi untuk klaim reward gratis!`
                : 'Login menggunakan akun Google Anda sekarang agar riwayat pembelian dihitung dan otomatis mendapatkan kuota gratis.'}
            </p>
          </div>

          {/* 3-Stamp Visual Card */}
          {isLoggedIn && (
            <div className="pt-1 flex items-center gap-2.5 sm:gap-3 flex-wrap">
              {[1, 2, 3].map((step) => {
                const isCompleted = step <= currentStamps;
                const isGift = step === 3;

                return (
                  <div 
                    key={step}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : isGift
                        ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400/80 border-dashed'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCompleted
                        ? 'bg-amber-400 text-slate-950'
                        : isGift
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : isGift ? <Gift className="w-3 h-3" /> : step}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {isGift ? 'Gratis 1x All Item' : `Beli ke-${step}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
          {!isLoggedIn ? (
            <button
              onClick={onOpenLogin}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Login Google & Dapatkan Promo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : hasReward ? (
            <button
              onClick={onOpenProfile}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gunakan Kuota Gratis</span>
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>Lihat Status Stamp</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
