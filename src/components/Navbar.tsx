import React from 'react';
import { 
  Search, 
  Star, 
  LogOut, 
  LogIn, 
  User as UserIcon, 
  Sparkles, 
  SlidersHorizontal, 
  X, 
  Flame, 
  Crown, 
  Settings, 
  ShieldCheck, 
  MessageCircle,
  Users,
  BarChart3,
  Tag,
  FolderArchive
} from 'lucide-react';
import { User } from 'firebase/auth';
import { UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  isGuest: boolean;
  userRole?: UserRole;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterFavorites: boolean;
  onToggleFilterFavorites: () => void;
  favoritesCount: number;
  documentsCount?: number;
  totalQuota: number;
  totalToolsCount: number;
  onSignOut: () => void;
  onOpenLogin: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenRoleManagement?: () => void;
  onOpenAnalytics?: () => void;
  onOpenPriceManagement?: () => void;
  onOpenDocumentArchive?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isGuest,
  userRole = 'public',
  searchQuery,
  onSearchChange,
  filterFavorites,
  onToggleFilterFavorites,
  favoritesCount,
  documentsCount = 0,
  totalQuota,
  totalToolsCount,
  onSignOut,
  onOpenLogin,
  onOpenProfile,
  onOpenSettings,
  onOpenRoleManagement,
  onOpenAnalytics,
  onOpenPriceManagement,
  onOpenDocumentArchive
}) => {
  const isAdmin = userRole === 'admin';
  const isReseller = userRole === 'reseller';

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-500/25 ring-2 ring-white/10">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  ZAIN.NET
                </span>
                {isAdmin ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    <span>ADMIN (All Gratis)</span>
                  </span>
                ) : isReseller ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                    <span>RESELLER (-50%)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Sekali Buat</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Skripsi, Artikel & Makalah
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center gap-1.5">
            {/* Document Archive Button */}
            {onOpenDocumentArchive && (
              <button
                onClick={onOpenDocumentArchive}
                title="Arsip Dokumen Saya"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 hover:text-blue-300"
              >
                <FolderArchive className="w-4 h-4" />
              </button>
            )}

            {/* Admin Analytics & Price Management */}
            {isAdmin && onOpenAnalytics && (
              <button
                onClick={onOpenAnalytics}
                title="Analitik Penjualan & Transaksi"
                className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            )}

            {isAdmin && onOpenPriceManagement && (
              <button
                onClick={onOpenPriceManagement}
                title="Manajemen Harga Dinamis"
                className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
              >
                <Tag className="w-4 h-4" />
              </button>
            )}

            {/* WhatsApp Direct Help Button */}
            <a
              href="https://wa.me/6285231176597?text=Halo%20Admin%20ZAIN.NET%2C%20saya%20butuh%20bantuan%20seputar%20modul%20akademik%20skripsi."
              target="_blank"
              rel="noopener noreferrer"
              title="Bantuan WhatsApp (085231176597)"
              className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {isAdmin && onOpenRoleManagement && (
              <button
                onClick={onOpenRoleManagement}
                title="Kelola Role & Email"
                className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300"
              >
                <Users className="w-4 h-4" />
              </button>
            )}

            {totalQuota > 0 && !isAdmin && (
              <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                {totalQuota} Kuota
              </span>
            )}

            <button
              onClick={onOpenSettings}
              title="Pengaturan Midtrans Gateway"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenProfile}
                  title={`Profil: ${user.email}`}
                  className="p-1 rounded-full border border-blue-500/40 hover:border-blue-400 transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>

                {/* Direct Mobile Google Logout Button */}
                <button
                  onClick={onSignOut}
                  title="Keluar dari Akun Google"
                  className="p-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:max-w-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari tool skripsi, pdf, artikel..."
              className="w-full pl-9 pr-8 py-2 bg-slate-900/90 border border-slate-800 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Favorite filter toggle */}
          <button
            onClick={onToggleFilterFavorites}
            title="Filter tool favorit"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border ${
              filterFavorites
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">Favorit</span>
            {favoritesCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                filterFavorites ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          
          {/* Document Archive button */}
          {onOpenDocumentArchive && (
            <button
              onClick={onOpenDocumentArchive}
              title="Arsip Naskah & Dokumen Tersimpan"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5 text-blue-400" />
              <span>Arsip Dokumen</span>
              {documentsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                  {documentsCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Analytics button */}
          {isAdmin && onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              title="Dashboard Analitik Transaksi & Penjualan"
              className="px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Analitik</span>
            </button>
          )}

          {/* Admin Price Manager button */}
          {isAdmin && onOpenPriceManagement && (
            <button
              onClick={onOpenPriceManagement}
              title="Manajemen Tarif & Harga Dinamis"
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kelola Harga</span>
            </button>
          )}

          {/* Admin Role Manager button */}
          {isAdmin && onOpenRoleManagement && (
            <button
              onClick={onOpenRoleManagement}
              title="Kelola Daftar Email Admin & Reseller"
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Role</span>
            </button>
          )}

          {/* Quota active indicator for non-admins */}
          {!isAdmin && totalQuota > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{totalQuota}x Kuota Buat</span>
            </div>
          )}

          {/* WhatsApp CS Button */}
          <a
            href="https://wa.me/6285231176597?text=Halo%20Admin%20ZAIN.NET%2C%20saya%20butuh%20bantuan%20seputar%20modul%20akademik%20skripsi."
            target="_blank"
            rel="noopener noreferrer"
            title="Hubungi CS WhatsApp: 085231176597"
            className="px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm shadow-emerald-950"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bantuan WA</span>
          </a>

          {/* Midtrans Settings button */}
          <button
            onClick={onOpenSettings}
            title="Pengaturan Midtrans Gateway & Webhook"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 pr-2 rounded-2xl">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity cursor-pointer pr-1"
                title={`Profil Akun: ${user.email}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-xl object-cover ring-2 ring-blue-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="max-w-[110px] truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate leading-none">
                    {user.displayName || 'Pengguna'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5 font-mono">
                    {user.email}
                  </p>
                </div>
              </button>

              <button
                id="desktop-logout-btn"
                onClick={onSignOut}
                title="Keluar dari Akun Google"
                className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Google</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
