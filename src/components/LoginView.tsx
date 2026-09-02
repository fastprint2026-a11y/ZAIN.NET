import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import { 
  Sparkles, 
  FileText, 
  Scissors, 
  Hash, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  Loader2,
  LogIn,
  MessageCircle
} from 'lucide-react';

interface LoginViewProps {
  onGuestLogin?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Proses login dibatalkan oleh pengguna.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Permintaan login ditimpa. Silakan coba lagi.');
      } else if (err.message?.includes('Membuka')) {
        setError('Sedang mengarahkan ke otorisasi akun Google...');
      } else {
        setError(err.message || 'Gagal masuk dengan akun Google. Pastikan koneksi internet aktif.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-slate-100">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md md:max-w-lg z-10">
        
        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 text-center">
          
          {/* Logo */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-blue-500/25 ring-4 ring-white/10 mb-5">
            Z
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            ZAIN.NET
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium mb-6">
            Pusat Tools Skripsi, Artikel & Makalah
          </p>

          {/* Security & Access Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Otentikasi Firebase Terverifikasi</span>
            </div>
          </div>

          {/* Promo Google: Beli 3x Gratis 1x All Item Banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-yellow-500/15 border border-amber-500/30 text-left shadow-lg shadow-amber-950/20">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold text-amber-300">
                    Promo Khusus Pengguna Umum
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 uppercase">
                    Beli 3 Gratis 1
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Masuk dengan <strong>Akun Google</strong>: Dapatkan <strong>1x Kuota Gratis Bebas Pilih All Item</strong> secara otomatis untuk setiap <strong>3x transaksi modul</strong>!
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm text-left flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full relative group flex items-center justify-center gap-3.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-white/5 transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer mb-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span className="text-sm sm:text-base">
              {loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}
            </span>
          </button>

          {/* Guest Mode fallback */}
          <div className="flex flex-col items-center gap-2">
            {onGuestLogin && (
              <button
                id="guest-signin-btn"
                onClick={onGuestLogin}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-800/50 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Lanjut tanpa login (Mode Tamu)</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            <a
              href="https://wa.me/6285231176597?text=Halo%20Admin%20ZAIN.NET%2C%20saya%20ingin%20bertanya%20seputar%20akses%20aplikasi%20skripsi."
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors py-1 px-3 rounded-lg hover:bg-emerald-950/40 inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Ada masalah atau kurang dimengerti? Hubungi CS WA (085231176597)</span>
            </a>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium tracking-wider">
                Layanan Termasuk
              </span>
            </div>
          </div>

          {/* Tools Grid Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Buat Artikel</p>
                <p className="text-[10px] text-slate-400 truncate">3 Modul Cerdas</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <Scissors className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Pisah PDF</p>
                <p className="text-[10px] text-slate-400 truncate">3 Pemisah Bab</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
                <Hash className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Penomoran</p>
                <p className="text-[10px] text-slate-400 truncate">Format Baku</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Penyusun Makalah</p>
                <p className="text-[10px] text-slate-400 truncate">Standar Kampus</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-2 col-span-2 sm:col-span-1">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Penurunan Plagiasi</p>
                <p className="text-[10px] text-slate-400 truncate">Parafrase Skripsi</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 ZAIN.NET — Sistem Manajemen & Otentikasi Akademik Terpadu
        </p>

      </div>
    </div>
  );
};
