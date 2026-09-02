import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Copy, 
  Check, 
  Save, 
  ShieldCheck, 
  CreditCard,
  Building2,
  Globe,
  Sliders
} from 'lucide-react';
import { PaymentConfig } from '../types';

interface MidtransSettingsModalProps {
  config: PaymentConfig;
  onClose: () => void;
  onSaveConfig: (newConfig: PaymentConfig) => void;
}

export const MidtransSettingsModal: React.FC<MidtransSettingsModalProps> = ({
  config,
  onClose,
  onSaveConfig,
}) => {
  const [merchantName, setMerchantName] = useState(config.merchantName || 'ZAIN.NET Academic Store');
  const [clientKey, setClientKey] = useState(config.midtransClientKey || 'SB-Mid-client-zainnet-academic-prod');
  const [isProduction, setIsProduction] = useState(config.isProduction || false);
  const [allAccessPrice, setAllAccessPrice] = useState(config.allAccessPriceRp || 35000);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const webhookUrl = `${window.location.origin}/api/midtrans/notification`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      merchantName: merchantName.trim() || 'ZAIN.NET Academic Store',
      midtransClientKey: clientKey.trim() || 'SB-Mid-client-zainnet-academic-prod',
      isProduction: Boolean(isProduction),
      allAccessPriceRp: Number(allAccessPrice) || 35000,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Pengaturan Midtrans Gateway
            </h3>
            <p className="text-xs text-slate-400">
              Konfigurasi Merchant ID, Client Key, dan Webhook Notifikasi
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Merchant Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nama Merchant / Toko:
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="ZAIN.NET Academic Store"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* Midtrans Client Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Midtrans Client Key:
            </label>
            <input
              type="text"
              value={clientKey}
              onChange={(e) => setClientKey(e.target.value)}
              placeholder="SB-Mid-client-..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white font-mono focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Didapatkan dari Midtrans Dashboard &gt; Settings &gt; Access Keys.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Mode Produksi / Live</span>
              <span className="text-[11px] text-slate-400">Gunakan Sandbox untuk simulasi, Live untuk uang asli</span>
            </div>
            <button
              onClick={() => setIsProduction(!isProduction)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isProduction 
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isProduction ? 'Live (Produksi)' : 'Sandbox (Uji Coba)'}
            </button>
          </div>

          {/* Webhook Endpoint Display */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                URL Notifikasi HTTP / Webhook Midtrans:
              </span>
              <button
                onClick={handleCopyWebhook}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedWebhook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWebhook ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-slate-400 break-all bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
              {webhookUrl}
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Masukkan URL ini di <strong>Midtrans Dashboard &gt; Settings &gt; Configuration &gt; Payment Notification URL</strong> agar setiap pembayaran QRIS/VA otomatis terverifikasi secara realtime.
            </p>
          </div>

          {/* Pricing Config */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Harga Paket VIP All-Access:
            </label>
            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs">
              <span className="text-slate-500 mr-1">Rp</span>
              <input
                type="number"
                value={allAccessPrice}
                onChange={(e) => setAllAccessPrice(Number(e.target.value))}
                className="w-full bg-transparent text-white focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
