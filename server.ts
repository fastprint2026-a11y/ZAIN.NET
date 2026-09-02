import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store recent Midtrans payment transactions
interface MidtransTransaction {
  id: string;
  orderId: string;
  grossAmount: number;
  paymentType: string;
  transactionStatus: 'settlement' | 'capture' | 'pending' | 'deny' | 'cancel' | 'expire';
  customerEmail?: string;
  customerName?: string;
  itemId?: string;
  itemTitle?: string;
  vaNumber?: string;
  bank?: string;
  qrString?: string;
  updatedAt: string;
  payload?: any;
}

const recentTransactions: MidtransTransaction[] = [];

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ZAIN.NET Midtrans Gateway', time: new Date().toISOString() });
});

// API: Create Midtrans Payment (QRIS, VA BCA/Mandiri/BRI/BNI, GoPay, ShopeePay)
app.post('/api/midtrans/charge', (req, res) => {
  try {
    const { orderId, amount, itemTitle, itemId, customerName, customerEmail, paymentType, bank } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({ success: false, message: 'Order ID dan Amount wajib diisi' });
    }

    const cleanOrderId = String(orderId);
    const cleanAmount = Number(amount);
    const selectedPaymentType = paymentType || 'qris';
    const selectedBank = bank || 'bca';

    // Generate dynamic Virtual Account Number or QRIS string
    const vaRandom = Math.floor(10000000 + Math.random() * 90000000);
    const vaPrefix = selectedBank === 'bca' ? '70012' : selectedBank === 'mandiri' ? '88019' : selectedBank === 'bri' ? '00291' : '98801';
    const generatedVa = `${vaPrefix}${vaRandom}`;
    const dynamicQr = `00020101021226580016ID.CO.MIDTRANS.WWW011893600918000${Date.now()}5204581253033605405${cleanAmount}5802ID5912ZAIN NET ACAD6007JAKARTA62070703A016304E8A2`;

    const transaction: MidtransTransaction = {
      id: `trx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: cleanOrderId,
      grossAmount: cleanAmount,
      paymentType: selectedPaymentType,
      transactionStatus: 'pending',
      customerEmail: customerEmail ? String(customerEmail).toLowerCase() : undefined,
      customerName: customerName || 'Pelanggan ZAIN.NET',
      itemId: itemId || 'all_access',
      itemTitle: itemTitle || 'Akses Akademik ZAIN.NET',
      vaNumber: selectedPaymentType === 'bank_transfer' ? generatedVa : undefined,
      bank: selectedPaymentType === 'bank_transfer' ? selectedBank.toUpperCase() : undefined,
      qrString: selectedPaymentType === 'qris' ? dynamicQr : undefined,
      updatedAt: new Date().toISOString(),
      payload: { createdVia: 'app_charge' }
    };

    // Replace if existing orderId exists or unshift new
    const existingIndex = recentTransactions.findIndex(t => t.orderId === cleanOrderId);
    if (existingIndex >= 0) {
      recentTransactions[existingIndex] = transaction;
    } else {
      recentTransactions.unshift(transaction);
    }

    if (recentTransactions.length > 300) {
      recentTransactions.pop();
    }

    res.json({
      success: true,
      orderId: cleanOrderId,
      grossAmount: cleanAmount,
      paymentType: selectedPaymentType,
      vaNumber: transaction.vaNumber,
      bank: transaction.bank,
      qrString: transaction.qrString,
      status: 'pending',
      merchantName: 'ZAIN.NET Academic Store'
    });
  } catch (err: any) {
    console.error('Midtrans Charge error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Midtrans Webhook / HTTP Notification Handler
const handleMidtransNotification = (req: express.Request, res: express.Response) => {
  try {
    const body = req.body || {};
    console.log('🔔 [MIDTRANS NOTIFICATION RECEIVED]:', JSON.stringify(body));

    const orderId = body.order_id || body.orderId || req.query.order_id;
    const transactionStatus = body.transaction_status || body.status || 'settlement';
    const fraudStatus = body.fraud_status || 'accept';
    const grossAmount = Number(body.gross_amount || body.amount || 0);
    const paymentType = body.payment_type || 'qris';

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'order_id tidak ditemukan' });
    }

    let isSuccess = false;
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') isSuccess = true;
    } else if (transactionStatus === 'settlement') {
      isSuccess = true;
    }

    const cleanOrderId = String(orderId);
    const existingTrx = recentTransactions.find(t => t.orderId === cleanOrderId);

    if (existingTrx) {
      existingTrx.transactionStatus = isSuccess ? 'settlement' : (transactionStatus as any);
      existingTrx.updatedAt = new Date().toISOString();
      existingTrx.payload = body;
    } else {
      recentTransactions.unshift({
        id: `trx-${Date.now()}`,
        orderId: cleanOrderId,
        grossAmount,
        paymentType,
        transactionStatus: isSuccess ? 'settlement' : (transactionStatus as any),
        updatedAt: new Date().toISOString(),
        payload: body
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Notifikasi Midtrans berhasil diproses',
      orderId: cleanOrderId,
      settled: isSuccess
    });
  } catch (error: any) {
    console.error('❌ Midtrans Webhook error:', error);
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
};

app.post('/api/midtrans/notification', handleMidtransNotification);
app.post('/api/midtrans/webhook', handleMidtransNotification);
app.get('/api/midtrans/notification', (req, res) => res.json({ status: 'ok', message: 'Midtrans Webhook is active' }));

// API: Check Transaction Status (Polling / Verify)
app.post('/api/midtrans/check-status', (req, res) => {
  const { orderId, email } = req.body;
  if (!orderId && !email) {
    return res.status(400).json({ success: false, found: false, message: 'Order ID atau Email diperlukan' });
  }

  const cleanOrderId = orderId ? String(orderId).trim() : '';
  const cleanEmail = email ? String(email).trim().toLowerCase() : '';

  const matched = recentTransactions.find((t) => {
    const orderMatches = cleanOrderId && t.orderId.toUpperCase() === cleanOrderId.toUpperCase();
    const emailMatches = cleanEmail && t.customerEmail && t.customerEmail === cleanEmail;
    return orderMatches || (emailMatches && t.transactionStatus === 'settlement');
  });

  if (matched) {
    const isSettled = matched.transactionStatus === 'settlement' || matched.transactionStatus === 'capture';
    return res.json({
      success: true,
      found: true,
      isSettled,
      status: matched.transactionStatus,
      transaction: matched
    });
  }

  return res.json({
    success: true,
    found: false,
    isSettled: false,
    message: 'Transaksi belum terdaftar atau masih dalam proses'
  });
});

// API: Admin / Dev Simulation
app.post('/api/midtrans/simulate-payment', (req, res) => {
  const { orderId, amount, itemTitle, itemId, customerEmail } = req.body;
  const cleanOrderId = String(orderId || `ORDER-${Date.now()}`);

  const existingTrx = recentTransactions.find(t => t.orderId === cleanOrderId);
  if (existingTrx) {
    existingTrx.transactionStatus = 'settlement';
    existingTrx.updatedAt = new Date().toISOString();
  } else {
    recentTransactions.unshift({
      id: `sim-${Date.now()}`,
      orderId: cleanOrderId,
      grossAmount: Number(amount) || 10000,
      paymentType: 'qris',
      transactionStatus: 'settlement',
      customerEmail: customerEmail ? String(customerEmail).toLowerCase() : 'user@zain.net',
      itemId: itemId || 'all_access',
      itemTitle: itemTitle || 'Akses VIP ZAIN.NET',
      updatedAt: new Date().toISOString(),
      payload: { simulated: true }
    });
  }

  res.json({
    success: true,
    message: 'Simulasi pelunasan Midtrans berhasil!',
    orderId: cleanOrderId,
    status: 'settlement'
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZAIN.NET Server running on http://localhost:${PORT}`);
  });
}

startServer();
