import React from 'react';
import { Star, ArrowUpRight, Lock, Unlock, Sparkles, QrCode, Crown } from 'lucide-react';
import { ToolItem, UserRole } from '../types';
import { calculateEffectivePrice } from '../data/toolsData';

interface ToolCardProps {
  tool: ToolItem;
  isFavorite: boolean;
  isUnlocked: boolean;
  quota?: number;
  resellerTrialRemaining?: number;
  userRole?: UserRole;
  discountPercentage?: number;
  freeRewardsAvailable?: number;
  onOpen: (tool: ToolItem) => void;
  onToggleFavorite: (toolId: string) => void;
  onUnlockRequest: (tool: ToolItem, effectivePrice: number) => void;
  onClaimReward?: (tool: ToolItem) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  isUnlocked,
  quota = 0,
  resellerTrialRemaining = 0,
  userRole = 'public',
  discountPercentage = 50,
  freeRewardsAvailable = 0,
  onOpen,
  onToggleFavorite,
  onUnlockRequest,
  onClaimReward
}) => {
  const effectivePrice = calculateEffectivePrice(tool.priceRp, userRole, discountPercentage);
  const isAdmin = userRole === 'admin';
  const isReseller = userRole === 'reseller';
  const hasResellerTrial = isReseller && resellerTrialRemaining > 0;
  const hasAccess = isUnlocked || isAdmin || hasResellerTrial;

  return (
    <div 
      id={`tool-card-${tool.id}`}
      onClick={() => {
        if (hasAccess) {
          onOpen(tool);
        }
      }}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
        hasAccess
          ? hasResellerTrial
            ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-900 hover:shadow-xl hover:shadow-cyan-950/30 hover:-translate-y-0.5 cursor-pointer'
            : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 hover:shadow-xl hover:shadow-emerald-950/30 hover:-translate-y-0.5 cursor-pointer'
          : 'bg-slate-950/60 border-slate-800/60 hover:border-blue-500/40 hover:bg-slate-900/60'
      }`}
    >
      {/* Left section: Number & Info */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        
        {/* Number Badge */}
        <div className={`w-10 h-10 min-w-10 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md transition-colors ${
          isAdmin
            ? 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-950/50'
            : hasResellerTrial
            ? 'bg-gradient-to-br from-cyan-600 to-blue-700 group-hover:from-cyan-500 group-hover:to-blue-600 shadow-cyan-950/50'
            : hasAccess
            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 group-hover:from-emerald-500 group-hover:to-teal-600 shadow-emerald-950/50'
            : 'bg-slate-800 text-slate-400'
        }`}>
          {isAdmin ? <Crown className="w-5 h-5 text-amber-200" /> : tool.number}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold text-sm sm:text-base transition-colors truncate ${
              hasAccess ? 'text-white group-hover:text-emerald-200' : 'text-slate-300'
            }`}>
              {tool.title}
            </h3>
            {tool.badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                {tool.badge}
              </span>
            )}
            
            {/* Quota / Price Badge based on Role */}
            {isAdmin ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Gratis (Admin)</span>
              </span>
            ) : hasResellerTrial ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Free Trial Reseller: {resellerTrialRemaining}/3x</span>
              </span>
            ) : isUnlocked ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>Tersedia: {quota}x Buat</span>
              </span>
            ) : isReseller ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30">
                <span className="text-[9px] text-slate-400 font-medium">Trial 3x Habis</span>
                <span className="text-[10px] line-through text-slate-500">
                  Rp {tool.priceRp.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] font-bold text-blue-300">
                  Rp {effectivePrice.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] font-extrabold bg-blue-500/30 text-blue-200 px-1 rounded">
                  -50%
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
                Rp {tool.priceRp.toLocaleString('id-ID')} / 1x Buat
              </span>
            )}
          </div>
          {tool.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {tool.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
        
        {/* Favorite toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(tool.id);
          }}
          title={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            isFavorite
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>

        {hasAccess ? (
          /* Open In-App Viewer Modal */
          <button
            id={`open-btn-${tool.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(tool);
            }}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer ${
              isAdmin
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-600/25'
                : hasResellerTrial
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
            }`}
          >
            <span>
              {isAdmin 
                ? 'Buka Modul (Admin)' 
                : hasResellerTrial 
                ? `Buka Modul (Trial ${resellerTrialRemaining}/3)` 
                : 'Buka Modul'}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            {/* If user has free loyalty reward voucher available */}
            {freeRewardsAvailable > 0 && onClaimReward && (
              <button
                id={`claim-reward-btn-${tool.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimReward(tool);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap animate-pulse"
                title="Gunakan 1 kuota gratis dari reward promo Beli 3x Gratis 1x"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Klaim Gratis (Reward 3x)</span>
              </button>
            )}

            {/* Locked State -> Unlock with Midtrans */}
            <button
              id={`unlock-btn-${tool.id}`}
              onClick={() => onUnlockRequest(tool, effectivePrice)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                Beli 1x Buat ({isReseller ? `Rp ${effectivePrice.toLocaleString('id-ID')} (-50%)` : `Rp ${effectivePrice.toLocaleString('id-ID')}`})
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
