import React from 'react';
import { 
  FileText, 
  Scissors, 
  Hash, 
  BookOpen, 
  ShieldCheck, 
  ChevronDown, 
  Layers, 
  Lock, 
  Unlock, 
  Sparkles, 
  QrCode, 
  Flame,
  Crown
} from 'lucide-react';
import { ToolCategory, ToolItem, UserRole } from '../types';
import { ToolCard } from './ToolCard';
import { CheckoutTarget } from './MidtransPaymentModal';
import { calculateEffectivePrice } from '../data/toolsData';

interface CategorySectionProps {
  category: ToolCategory;
  isOpen: boolean;
  onToggle: (id: number) => void;
  favorites: Set<string>;
  getToolQuota: (tool: ToolItem) => number;
  getResellerTrialRemaining?: (toolId: string) => number;
  userRole?: UserRole;
  discountPercentage?: number;
  freeRewardsAvailable?: number;
  onOpenTool: (tool: ToolItem) => void;
  onToggleFavorite: (toolId: string) => void;
  onCheckoutRequest: (target: CheckoutTarget) => void;
  onClaimReward?: (tool: ToolItem) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'FileText':
      return <FileText className="w-5 h-5" />;
    case 'Scissors':
      return <Scissors className="w-5 h-5" />;
    case 'Hash':
      return <Hash className="w-5 h-5" />;
    case 'BookOpen':
      return <BookOpen className="w-5 h-5" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-5 h-5" />;
    default:
      return <Layers className="w-5 h-5" />;
  }
};

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  isOpen,
  onToggle,
  favorites,
  getToolQuota,
  getResellerTrialRemaining,
  userRole = 'public',
  discountPercentage = 50,
  freeRewardsAvailable = 0,
  onOpenTool,
  onToggleFavorite,
  onCheckoutRequest,
  onClaimReward,
}) => {
  const isAdmin = userRole === 'admin';
  const isReseller = userRole === 'reseller';
  const effectivePackagePrice = calculateEffectivePrice(category.packagePriceRp, userRole, discountPercentage);
  const totalCategoryTrials = isReseller && getResellerTrialRemaining
    ? category.tools.reduce((sum, t) => sum + getResellerTrialRemaining(t.id), 0)
    : 0;
  const allToolsHaveQuota = isAdmin || category.tools.every((t) => getToolQuota(t) > 0);

  return (
    <div 
      id={`section-${category.id}`}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md ${
        isOpen
          ? 'bg-slate-900/80 border-blue-500/40 shadow-xl shadow-blue-950/20'
          : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* Accordion Header Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => onToggle(category.id)}
          aria-expanded={isOpen}
          className="flex-1 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {/* Category Number Badge */}
            <div className={`w-10 h-10 sm:w-11 sm:h-11 min-w-10 sm:min-w-11 rounded-xl flex items-center justify-center font-extrabold text-base sm:text-lg transition-colors ${
              isAdmin
                ? 'bg-gradient-to-tr from-amber-500 to-amber-700 text-white shadow-md shadow-amber-500/20'
                : totalCategoryTrials > 0
                ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                : allToolsHaveQuota
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : isOpen 
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30' 
                : 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
            }`}>
              {category.number}
            </div>

            {/* Category Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-base sm:text-lg text-white tracking-tight">
                  {category.title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/80 hidden sm:inline-block">
                  {category.tools.length} Modul
                </span>
                {isAdmin ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>Akses Gratis (Admin)</span>
                  </span>
                ) : isReseller && totalCategoryTrials > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Trial Reseller: {totalCategoryTrials}x Sesi Siap Pakai</span>
                  </span>
                ) : allToolsHaveQuota ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Kuota Siap Pakai</span>
                  </span>
                ) : isReseller ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30">
                    <span className="text-[10px] line-through text-slate-500">
                      Paket Rp {category.packagePriceRp.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-bold text-blue-300">
                      Paket Rp {effectivePackagePrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] font-extrabold bg-blue-500/30 text-blue-200 px-1 rounded">
                      -50%
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
                    Paket Kategori Rp {category.packagePriceRp.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate">
                {category.subtitle}
              </p>
            </div>
          </div>

          {/* Arrow Toggle Indicator */}
          <div className={`w-9 h-9 min-w-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-blue-600 text-white rotate-180 shadow-md shadow-blue-600/30'
              : 'bg-white/10 text-slate-300'
          }`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {/* Quick Package Unlock Action for entire category */}
        {!isAdmin && !allToolsHaveQuota && (
          <div className="pl-14 sm:pl-0 flex items-center gap-2">
            <button
              onClick={() => onCheckoutRequest({
                type: 'category',
                id: String(category.id),
                title: `Paket Kategori: ${category.title} (1x Buat untuk ${category.tools.length} Modul)`,
                subtitle: `Dapatkan 1x kuota pembuatan untuk semua ${category.tools.length} modul dalam kategori ini`,
                priceRp: effectivePackagePrice,
                badge: isReseller ? 'Diskon Reseller 50%' : 'Hemat Paket',
                mayarPaymentUrl: category.mayarPaymentUrl
              })}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>
                Beli Paket Kategori ({isReseller ? `Rp ${effectivePackagePrice.toLocaleString('id-ID')} (-50%)` : `Rp ${effectivePackagePrice.toLocaleString('id-ID')}`})
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Accordion Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1200px] opacity-100 px-4 sm:px-5 pb-5 pt-1' : 'max-h-0 opacity-0 px-4 sm:px-5 py-0 pointer-events-none'
        }`}
      >
        {/* Category Description Banner */}
        {category.description && (
          <div className="mb-3.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                {getCategoryIcon(category.iconName)}
              </div>
              <span className="leading-relaxed">{category.description}</span>
            </div>
          </div>
        )}

        {/* List of tools in this category */}
        <div className="flex flex-col gap-2.5">
          {category.tools.map((tool) => {
            const quota = getToolQuota(tool);
            const resellerTrialRemaining = getResellerTrialRemaining ? getResellerTrialRemaining(tool.id) : 0;
            const isUnlocked = isAdmin || quota > 0;

            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favorites.has(tool.id)}
                isUnlocked={isUnlocked}
                quota={quota}
                resellerTrialRemaining={resellerTrialRemaining}
                userRole={userRole}
                discountPercentage={discountPercentage}
                freeRewardsAvailable={freeRewardsAvailable}
                onOpen={onOpenTool}
                onToggleFavorite={onToggleFavorite}
                onClaimReward={onClaimReward}
                onUnlockRequest={(targetTool, effectivePrice) => onCheckoutRequest({
                  type: 'tool',
                  id: targetTool.id,
                  title: `1x Pembuatan: ${targetTool.title}`,
                  subtitle: `Berlaku untuk 1x proses pembuatan naskah / pengolahan dokumen`,
                  priceRp: effectivePrice,
                  badge: isReseller ? 'Diskon Reseller 50%' : targetTool.badge,
                  mayarPaymentUrl: targetTool.mayarPaymentUrl || category.mayarPaymentUrl
                })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
