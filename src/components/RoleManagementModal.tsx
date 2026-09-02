import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Crown, 
  Sparkles, 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Search, 
  AlertCircle, 
  Mail, 
  Percent,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { RolesConfig, UserRole } from '../types';
import { resolveUserRole } from '../data/toolsData';

interface RoleManagementModalProps {
  currentConfig: RolesConfig;
  currentUserEmail?: string | null;
  onClose: () => void;
  onSaveConfig: (newConfig: RolesConfig) => void;
}

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  currentConfig,
  currentUserEmail,
  onClose,
  onSaveConfig
}) => {
  const [adminEmails, setAdminEmails] = useState<string[]>([...currentConfig.adminEmails]);
  const [resellerEmails, setResellerEmails] = useState<string[]>([...currentConfig.resellerEmails]);
  const [discountPercent, setDiscountPercent] = useState<number>(currentConfig.resellerDiscountPercentage || 50);

  // New email inputs
  const [newAdminInput, setNewAdminInput] = useState<string>('');
  const [newResellerInput, setNewResellerInput] = useState<string>('');
  
  // Status feedback
  const [adminError, setAdminError] = useState<string | null>(null);
  const [resellerError, setResellerError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Email Role Tester
  const [testEmail, setTestEmail] = useState<string>('');

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAddAdmin = () => {
    setAdminError(null);
    const clean = newAdminInput.trim().toLowerCase();
    if (!clean) return;
    if (!isValidEmail(clean)) {
      setAdminError('Format email tidak valid (contoh: nama@domain.com)');
      return;
    }
    if (adminEmails.includes(clean)) {
      setAdminError('Email ini sudah terdaftar sebagai Admin.');
      return;
    }
    setAdminEmails(prev => [...prev, clean]);
    setNewAdminInput('');
  };

  const handleRemoveAdmin = (emailToRemove: string) => {
    // Prevent removing the last admin or removing yourself if it's the only one
    if (adminEmails.length <= 1) {
      setAdminError('Minimal harus ada 1 email Admin.');
      return;
    }
    setAdminEmails(prev => prev.filter(e => e !== emailToRemove));
    setAdminError(null);
  };

  const handleAddReseller = () => {
    setResellerError(null);
    const clean = newResellerInput.trim().toLowerCase();
    if (!clean) return;
    if (!isValidEmail(clean)) {
      setResellerError('Format email tidak valid (contoh: nama@domain.com)');
      return;
    }
    if (resellerEmails.includes(clean)) {
      setResellerError('Email ini sudah terdaftar sebagai Reseller.');
      return;
    }
    setResellerEmails(prev => [...prev, clean]);
    setNewResellerInput('');
  };

  const handleRemoveReseller = (emailToRemove: string) => {
    setResellerEmails(prev => prev.filter(e => e !== emailToRemove));
    setResellerError(null);
  };

  const handleSave = () => {
    const updated: RolesConfig = {
      adminEmails: Array.from(new Set(adminEmails.map(e => e.trim().toLowerCase()))),
      resellerEmails: Array.from(new Set(resellerEmails.map(e => e.trim().toLowerCase()))),
      resellerDiscountPercentage: Math.max(1, Math.min(99, Number(discountPercent) || 50)),
      updatedAt: Date.now()
    };
    onSaveConfig(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const simulatedConfig: RolesConfig = {
    adminEmails,
    resellerEmails,
    resellerDiscountPercentage: discountPercent
  };
  const testRole: UserRole = testEmail ? resolveUserRole(testEmail, simulatedConfig) : 'public';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
              Manajemen Role & Hak Akses Pengguna
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur daftar email untuk Admin (Semua Gratis), Reseller/Partner (Diskon 50%), dan User Umum (Normal).
            </p>
          </div>
        </div>

        {/* 3 Categories Overview Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">1. Role Admin</span>
            </div>
            <p className="text-[11px] text-slate-300 font-semibold">Harga: Rp 0 (Semua Gratis)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Akses langsung seluruh modul tanpa batasan kuota.</p>
          </div>

          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">2. Role Reseller / Partner</span>
            </div>
            <p className="text-[11px] text-slate-300 font-semibold">Harga: Diskon {discountPercent}% All Item</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Potongan setengah harga untuk setiap modul & paket.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-300">3. Role User Umum</span>
            </div>
            <p className="text-[11px] text-slate-300 font-semibold">Harga: Tarif Normal</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Email yang tidak terdaftar otomatis menjadi User Umum.</p>
          </div>
        </div>

        {/* Section 1: Admin Emails Management */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Daftar Email Admin ({adminEmails.length})
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              All Gratis
            </span>
          </div>

          {/* Add Admin Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={newAdminInput}
                onChange={(e) => setNewAdminInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                placeholder="Masukkan email Google admin baru..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddAdmin}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-amber-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          {adminError && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{adminError}</span>
            </p>
          )}

          {/* Admin Email List */}
          <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
            {adminEmails.map((email) => (
              <div 
                key={email}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-mono"
              >
                <span>{email}</span>
                {email === currentUserEmail && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-sans font-bold">Anda</span>
                )}
                <button
                  onClick={() => handleRemoveAdmin(email)}
                  title="Hapus dari Admin"
                  className="text-amber-400/60 hover:text-red-400 p-0.5 rounded cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Reseller Emails Management */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Daftar Email Reseller / Partnership ({resellerEmails.length})
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                🎁 Free Trial 3x Per Item
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Diskon Lanjutan:</span>
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-xs font-bold text-blue-300">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-10 bg-transparent text-center focus:outline-none"
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Setiap email reseller mendapatkan <strong>3x Free Trial Gratis untuk setiap item modul</strong> akademik di sistem ZAIN.NET, serta diskon {discountPercent}% untuk pembelian berikutnya.
          </p>

          {/* Add Reseller Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={newResellerInput}
                onChange={(e) => setNewResellerInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddReseller()}
                placeholder="Masukkan email Google reseller baru..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddReseller}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-blue-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          {resellerError && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{resellerError}</span>
            </p>
          )}

          {/* Reseller Email List */}
          <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
            {resellerEmails.length > 0 ? (
              resellerEmails.map((email) => (
                <div 
                  key={email}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs font-mono"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => handleRemoveReseller(email)}
                    title="Hapus dari Reseller"
                    className="text-blue-400/60 hover:text-red-400 p-0.5 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">
                Belum ada email reseller. Masukkan email di atas untuk mendaftarkan partner.
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Live Role Tester */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">
              Cek Status Role untuk Email Tertentu:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Ketik email untuk tes role (misal: user@gmail.com)..."
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
            {testEmail && (
              <div className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5">
                {testRole === 'admin' && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Admin (All Gratis)
                  </span>
                )}
                {testRole === 'reseller' && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Reseller (Trial 3x & Diskon {discountPercent}%)
                  </span>
                )}
                {testRole === 'public' && (
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    User Umum (Harga Normal)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-500">
            Perubahan akan otomatis tersinkronisasi ke Firebase Firestore.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Role</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
