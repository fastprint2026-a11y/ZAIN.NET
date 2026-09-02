import React, { useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  logoutUser, 
  auth, 
  db, 
  type User 
} from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  categoriesData, 
  defaultPaymentConfig, 
  defaultRolesConfig, 
  resolveUserRole, 
  defaultCustomPrices, 
  applyCustomPricesToCategories 
} from './data/toolsData';
import { initialSampleDocuments } from './data/sampleDocuments';
import { 
  ToolCategory, 
  ToolItem, 
  UserPurchase, 
  UserQuotas, 
  PaymentConfig, 
  UserRole, 
  RolesConfig, 
  UserLoyalty, 
  defaultLoyalty,
  CustomPricesConfig,
  UserDocumentItem,
  ResellerTrials,
  RESELLER_MAX_FREE_TRIALS
} from './types';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { CategorySection } from './components/CategorySection';
import { ToolViewerModal } from './components/ToolViewerModal';
import { UserProfileModal } from './components/UserProfileModal';
import { RoleManagementModal } from './components/RoleManagementModal';
import { MidtransPaymentModal, CheckoutTarget } from './components/MidtransPaymentModal';
import { MidtransSettingsModal } from './components/MidtransSettingsModal';
import { WhatsAppSupportWidget } from './components/WhatsAppSupportWidget';
import { LoyaltyBanner } from './components/LoyaltyBanner';
import { RewardCelebrationModal } from './components/RewardCelebrationModal';
import { AdminAnalyticsModal } from './components/AdminAnalyticsModal';
import { PriceManagementModal } from './components/PriceManagementModal';
import { DocumentArchiveModal } from './components/DocumentArchiveModal';
import { 
  Sparkles, 
  FileText, 
  Scissors, 
  Hash, 
  BookOpen, 
  Star,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Lock,
  Unlock,
  QrCode,
  Flame,
  Zap,
  CheckCircle2,
  Building2,
  MessageCircle,
  HelpCircle,
  Clock,
  Crown,
  Users,
  Gift,
  BarChart3,
  Tag,
  FolderArchive
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showRoleManagementModal, setShowRoleManagementModal] = useState<boolean>(false);
  const [showRewardCelebration, setShowRewardCelebration] = useState<boolean>(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [showPriceManagementModal, setShowPriceManagementModal] = useState<boolean>(false);
  const [showDocumentArchiveModal, setShowDocumentArchiveModal] = useState<boolean>(false);

  // Loyalty Program State: Buy 3 get 1 free
  const [loyalty, setLoyalty] = useState<UserLoyalty>(defaultLoyalty);

  // Dynamic Custom Prices state (Admin editable)
  const [customPrices, setCustomPrices] = useState<CustomPricesConfig>(() => {
    const saved = localStorage.getItem('zain_custom_prices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultCustomPrices, ...parsed };
      } catch (e) {}
    }
    return defaultCustomPrices;
  });

  // User Document Archive state
  const [documents, setDocuments] = useState<UserDocumentItem[]>(() => {
    const saved = localStorage.getItem('zain_user_documents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialSampleDocuments;
  });

  // Payment & Config state
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('zain_midtrans_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultPaymentConfig, ...parsed };
      } catch (e) {}
    }
    return defaultPaymentConfig;
  });

  // 3-Tier Roles Configuration (Admin, Reseller, Public)
  const [rolesConfig, setRolesConfig] = useState<RolesConfig>(() => {
    const saved = localStorage.getItem('zain_roles_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedAdmin = Array.from(new Set([...defaultRolesConfig.adminEmails, ...(parsed.adminEmails || [])]));
        const mergedReseller = Array.from(new Set([...defaultRolesConfig.resellerEmails, ...(parsed.resellerEmails || [])]));
        return { 
          ...defaultRolesConfig, 
          ...parsed,
          adminEmails: mergedAdmin,
          resellerEmails: mergedReseller
        };
      } catch (e) {}
    }
    return defaultRolesConfig;
  });

  // Derived user role (admin | reseller | public)
  const userRole: UserRole = useMemo(() => {
    return resolveUserRole(user?.email, rolesConfig);
  }, [user?.email, rolesConfig]);

  // Apply custom prices dynamically to categories
  const categories: ToolCategory[] = useMemo(() => {
    return applyCustomPricesToCategories(categoriesData, customPrices);
  }, [customPrices]);

  // Pay-per-use quotas state: { [toolId: string]: number of available creation sessions }
  const [userQuotas, setUserQuotas] = useState<UserQuotas>({});
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [allPurchasesForAdmin, setAllPurchasesForAdmin] = useState<UserPurchase[]>([]);

  // Reseller Free Trial state: { [toolId: string]: number of used trial sessions (0-3) }
  const [resellerTrials, setResellerTrials] = useState<ResellerTrials>({});

  // Checkout modal target
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(null);

  // Accordion open state (id of open section, or null)
  const [openSectionId, setOpenSectionId] = useState<number | null>(1);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<number | 'all' | 'favorites'>('all');
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Active tool opened in iframe modal
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);

  // Load global roles config, dynamic prices & listen to Auth state
  useEffect(() => {
    // Load remote roles and prices config from Firestore
    const loadRemoteConfigs = async () => {
      try {
        const rolesSnap = await getDoc(doc(db, 'settings', 'roles_config'));
        if (rolesSnap.exists()) {
          const remoteRoles = rolesSnap.data() as RolesConfig;
          const mergedConfig: RolesConfig = {
            ...defaultRolesConfig,
            ...remoteRoles,
            adminEmails: Array.from(new Set([...defaultRolesConfig.adminEmails, ...(remoteRoles.adminEmails || [])])),
            resellerEmails: Array.from(new Set([...defaultRolesConfig.resellerEmails, ...(remoteRoles.resellerEmails || [])])),
          };
          setRolesConfig(mergedConfig);
          localStorage.setItem('zain_roles_config', JSON.stringify(mergedConfig));
        }

        const pricesSnap = await getDoc(doc(db, 'settings', 'prices'));
        if (pricesSnap.exists()) {
          const remotePrices = pricesSnap.data() as CustomPricesConfig;
          const mergedPrices = { ...defaultCustomPrices, ...remotePrices };
          setCustomPrices(mergedPrices);
          localStorage.setItem('zain_custom_prices', JSON.stringify(mergedPrices));
        }
      } catch (err) {
        console.warn('Could not load remote settings config:', err);
      }
    };
    loadRemoteConfigs();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        setIsGuest(false);
        setShowLoginModal(false);
        
        // Sync user profile to Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastLoginAt: new Date().toISOString()
          }, { merge: true });

          // Load user favorites from Firestore
          const favsCol = collection(db, 'users', currentUser.uid, 'favorites');
          const favsSnap = await getDocs(favsCol);
          const favSet = new Set<string>();
          favsSnap.forEach((d) => favSet.add(d.id));
          setFavorites(favSet);

          // Load user documents from Firestore
          const docsCol = collection(db, 'users', currentUser.uid, 'documents');
          const docsSnap = await getDocs(docsCol);
          const userDocsList: UserDocumentItem[] = [];
          docsSnap.forEach((d) => {
            userDocsList.push(d.data() as UserDocumentItem);
          });
          if (userDocsList.length > 0) {
            setDocuments(userDocsList);
            localStorage.setItem(`zain_docs_${currentUser.uid}`, JSON.stringify(userDocsList));
          }

          // Load user quotas from Firestore
          const quotaDocRef = doc(db, 'users', currentUser.uid, 'data', 'quotas');
          const quotaSnap = await getDoc(quotaDocRef);
          let loadedQuotas: UserQuotas = {};

          if (quotaSnap.exists()) {
            loadedQuotas = (quotaSnap.data() as UserQuotas) || {};
          } else {
            // Fallback from localStorage
            const localQuotas = localStorage.getItem(`zain_quotas_${currentUser.uid}`);
            if (localQuotas) {
              try {
                loadedQuotas = JSON.parse(localQuotas);
              } catch (e) {}
            }
          }
          setUserQuotas(loadedQuotas);

          // Load user loyalty from Firestore
          const loyaltyDocRef = doc(db, 'users', currentUser.uid, 'data', 'loyalty');
          const loyaltySnap = await getDoc(loyaltyDocRef);
          let loadedLoyalty: UserLoyalty = defaultLoyalty;

          if (loyaltySnap.exists()) {
            loadedLoyalty = { ...defaultLoyalty, ...(loyaltySnap.data() as UserLoyalty) };
          } else {
            const localLoyalty = localStorage.getItem(`zain_loyalty_${currentUser.uid}`);
            if (localLoyalty) {
              try {
                loadedLoyalty = { ...defaultLoyalty, ...JSON.parse(localLoyalty) };
              } catch (e) {}
            }
          }
          setLoyalty(loadedLoyalty);

          // Load reseller trials from Firestore
          const trialsDocRef = doc(db, 'users', currentUser.uid, 'data', 'reseller_trials');
          const trialsSnap = await getDoc(trialsDocRef);
          let loadedTrials: ResellerTrials = {};

          if (trialsSnap.exists()) {
            loadedTrials = (trialsSnap.data() as ResellerTrials) || {};
          } else {
            const localTrials = localStorage.getItem(`zain_reseller_trials_${currentUser.uid}`);
            if (localTrials) {
              try {
                loadedTrials = JSON.parse(localTrials);
              } catch (e) {}
            }
          }
          setResellerTrials(loadedTrials);

          // Load user purchases
          const purchCol = collection(db, 'users', currentUser.uid, 'purchases');
          const purchSnap = await getDocs(purchCol);
          const purchList: UserPurchase[] = [];

          purchSnap.forEach((d) => {
            const data = d.data() as UserPurchase;
            purchList.push(data);
          });

          // Sort latest first
          purchList.sort((a, b) => b.purchasedAt - a.purchasedAt);
          setPurchases(purchList);

          // Load all global transactions if admin
          try {
            const allTrxCol = collection(db, 'transactions');
            const allTrxSnap = await getDocs(allTrxCol);
            const globalPurchList: UserPurchase[] = [];
            allTrxSnap.forEach((d) => {
              globalPurchList.push(d.data() as UserPurchase);
            });
            if (globalPurchList.length > 0) {
              globalPurchList.sort((a, b) => b.purchasedAt - a.purchasedAt);
              setAllPurchasesForAdmin(globalPurchList);
            }
          } catch (e) {
            console.warn('Could not load global transactions:', e);
          }
        } catch (err) {
          console.warn('Could not sync data from Firestore:', err);
          // Fallback to local storage
          const localPurch = localStorage.getItem(`zain_purch_${currentUser.uid}`);
          if (localPurch) {
            try {
              setPurchases(JSON.parse(localPurch));
            } catch (e) {}
          }
          const localQuotas = localStorage.getItem(`zain_quotas_${currentUser.uid}`);
          if (localQuotas) {
            try {
              setUserQuotas(JSON.parse(localQuotas));
            } catch (e) {}
          }
          const localLoyalty = localStorage.getItem(`zain_loyalty_${currentUser.uid}`);
          if (localLoyalty) {
            try {
              setLoyalty({ ...defaultLoyalty, ...JSON.parse(localLoyalty) });
            } catch (e) {}
          }
          const localTrials = localStorage.getItem(`zain_reseller_trials_${currentUser.uid}`);
          if (localTrials) {
            try {
              setResellerTrials(JSON.parse(localTrials));
            } catch (e) {}
          }
        }
      } else {
        // Guest mode fallback
        const guestPurch = localStorage.getItem('zain_guest_purch');
        if (guestPurch) {
          try {
            setPurchases(JSON.parse(guestPurch));
          } catch (e) {}
        }
        const guestQuotas = localStorage.getItem('zain_guest_quotas');
        if (guestQuotas) {
          try {
            setUserQuotas(JSON.parse(guestQuotas));
          } catch (e) {}
        }
        const guestLoyalty = localStorage.getItem('zain_guest_loyalty');
        if (guestLoyalty) {
          try {
            setLoyalty({ ...defaultLoyalty, ...JSON.parse(guestLoyalty) });
          } catch (e) {}
        }
        const guestTrials = localStorage.getItem('zain_guest_reseller_trials');
        if (guestTrials) {
          try {
            setResellerTrials(JSON.parse(guestTrials));
          } catch (e) {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to calculate remaining free trial for reseller (3x per item)
  const getResellerTrialRemaining = (toolId: string): number => {
    if (userRole !== 'reseller') return 0;
    const used = resellerTrials[toolId] || 0;
    return Math.max(0, RESELLER_MAX_FREE_TRIALS - used);
  };

  // Helper to get remaining quota for a tool (includes reseller trial)
  const getToolQuota = (tool: ToolItem): number => {
    if (userRole === 'admin') return 999;
    const paidQuota = userQuotas[tool.id] || 0;
    if (userRole === 'reseller') {
      const trialRemaining = getResellerTrialRemaining(tool.id);
      return paidQuota + trialRemaining;
    }
    return paidQuota;
  };

  // Total active quotas across all tools
  const totalQuotaCount = useMemo(() => {
    return Object.values(userQuotas).reduce<number>((acc, q) => acc + (typeof q === 'number' ? q : 0), 0);
  }, [userQuotas]);

  // Save updated payment config
  const handleSavePaymentConfig = async (newConfig: PaymentConfig) => {
    setPaymentConfig(newConfig);
    localStorage.setItem('zain_midtrans_config', JSON.stringify(newConfig));
    if (user) {
      try {
        await setDoc(doc(db, 'settings', 'midtrans_config'), newConfig, { merge: true });
      } catch (err) {
        console.warn('Error saving config to Firestore:', err);
      }
    }
  };

  // Save dynamic custom prices (Item & Category overrides)
  const handleSaveCustomPrices = async (newPrices: CustomPricesConfig) => {
    setCustomPrices(newPrices);
    localStorage.setItem('zain_custom_prices', JSON.stringify(newPrices));
    if (user) {
      try {
        await setDoc(doc(db, 'settings', 'prices'), newPrices, { merge: true });
      } catch (err) {
        console.warn('Error saving prices to Firestore:', err);
      }
    }
  };

  // Save / Update document in User Archive
  const handleSaveDocument = async (docItem: UserDocumentItem) => {
    const updatedDocs = [docItem, ...documents.filter((d) => d.id !== docItem.id)];
    setDocuments(updatedDocs);

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'documents', docItem.id);
        await setDoc(docRef, docItem, { merge: true });
        localStorage.setItem(`zain_docs_${user.uid}`, JSON.stringify(updatedDocs));
      } catch (err) {
        console.warn('Error saving document to Firestore:', err);
        localStorage.setItem(`zain_docs_${user.uid}`, JSON.stringify(updatedDocs));
      }
    } else {
      localStorage.setItem('zain_user_documents', JSON.stringify(updatedDocs));
    }
  };

  // Delete document from User Archive
  const handleDeleteDocument = async (docId: string) => {
    const updatedDocs = documents.filter((d) => d.id !== docId);
    setDocuments(updatedDocs);

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'documents', docId);
        await deleteDoc(docRef);
        localStorage.setItem(`zain_docs_${user.uid}`, JSON.stringify(updatedDocs));
      } catch (err) {
        console.warn('Error deleting document from Firestore:', err);
        localStorage.setItem(`zain_docs_${user.uid}`, JSON.stringify(updatedDocs));
      }
    } else {
      localStorage.setItem('zain_user_documents', JSON.stringify(updatedDocs));
    }
  };

  // Save updated roles config (Admin, Resellers, Discount %)
  const handleSaveRolesConfig = async (newConfig: RolesConfig) => {
    setRolesConfig(newConfig);
    localStorage.setItem('zain_roles_config', JSON.stringify(newConfig));
    try {
      await setDoc(doc(db, 'settings', 'roles_config'), newConfig, { merge: true });
    } catch (err) {
      console.warn('Error saving roles config to Firestore:', err);
    }
  };

  // Handle successful purchase: Grant +1 quota for tool or all tools in category
  const handlePaymentSuccess = async (purchase: UserPurchase) => {
    const updatedQuotas = { ...userQuotas };

    if (purchase.itemType === 'tool') {
      const toolId = purchase.itemId.replace('tool:', '');
      updatedQuotas[toolId] = (updatedQuotas[toolId] || 0) + (purchase.quotaGranted || 1);
    } else if (purchase.itemType === 'category') {
      const categoryId = Number(purchase.itemId.replace('category:', ''));
      const foundCategory = categories.find((c) => c.id === categoryId);
      if (foundCategory && Array.isArray(foundCategory.tools)) {
        foundCategory.tools.forEach((t) => {
          if (t && t.id) {
            updatedQuotas[t.id] = (updatedQuotas[t.id] || 0) + 1;
          }
        });
      }
    }

    setUserQuotas(updatedQuotas);

    const updatedPurchases = [purchase, ...purchases];
    setPurchases(updatedPurchases);

    // Calculate Loyalty: Every 3 purchases get 1 free all item
    let updatedLoyalty = { ...loyalty };
    const nextCount = loyalty.purchaseCount + 1;
    const earnedFree = nextCount % 3 === 0;

    updatedLoyalty = {
      purchaseCount: nextCount,
      freeRewardsAvailable: earnedFree ? loyalty.freeRewardsAvailable + 1 : loyalty.freeRewardsAvailable,
      totalFreeEarned: earnedFree ? loyalty.totalFreeEarned + 1 : loyalty.totalFreeEarned,
      totalFreeClaimed: loyalty.totalFreeClaimed
    };
    setLoyalty(updatedLoyalty);

    if (earnedFree) {
      setShowRewardCelebration(true);
    }

    // Save to Firestore if user logged in
    if (user) {
      try {
        const purchRef = doc(db, 'users', user.uid, 'purchases', purchase.id);
        await setDoc(purchRef, purchase);
        const quotaDocRef = doc(db, 'users', user.uid, 'data', 'quotas');
        await setDoc(quotaDocRef, updatedQuotas);
        const loyaltyDocRef = doc(db, 'users', user.uid, 'data', 'loyalty');
        await setDoc(loyaltyDocRef, updatedLoyalty);

        // Also save to global transactions collection for admin analytics
        try {
          await setDoc(doc(db, 'transactions', purchase.id), purchase);
        } catch (trxErr) {
          console.warn('Error recording global transaction in Firestore:', trxErr);
        }

        localStorage.setItem(`zain_purch_${user.uid}`, JSON.stringify(updatedPurchases));
        localStorage.setItem(`zain_quotas_${user.uid}`, JSON.stringify(updatedQuotas));
        localStorage.setItem(`zain_loyalty_${user.uid}`, JSON.stringify(updatedLoyalty));
      } catch (err) {
        console.warn('Error recording purchase/quotas in Firestore:', err);
        localStorage.setItem(`zain_purch_${user.uid}`, JSON.stringify(updatedPurchases));
        localStorage.setItem(`zain_quotas_${user.uid}`, JSON.stringify(updatedQuotas));
        localStorage.setItem(`zain_loyalty_${user.uid}`, JSON.stringify(updatedLoyalty));
      }
    } else {
      // Guest purchase also record to global transactions if possible
      try {
        await setDoc(doc(db, 'transactions', purchase.id), purchase);
      } catch (e) {}
      localStorage.setItem('zain_guest_purch', JSON.stringify(updatedPurchases));
      localStorage.setItem('zain_guest_quotas', JSON.stringify(updatedQuotas));
      localStorage.setItem('zain_guest_loyalty', JSON.stringify(updatedLoyalty));
    }

    setAllPurchasesForAdmin((prev) => [purchase, ...prev.filter((p) => p.id !== purchase.id)]);

    setCheckoutTarget(null);

    // If purchase was for a single tool, auto-open it immediately
    if (purchase.itemType === 'tool') {
      const toolId = purchase.itemId.replace('tool:', '');
      for (const cat of categoriesData) {
        const found = cat.tools.find((t) => t.id === toolId);
        if (found) {
          setActiveTool(found);
          break;
        }
      }
    }
  };

  // Claim 1 Free Creation Quota using Loyalty Reward (Beli 3x Gratis 1x)
  const handleClaimLoyaltyReward = async (tool: ToolItem) => {
    if (loyalty.freeRewardsAvailable <= 0) return;

    const newFreeAvailable = Math.max(0, loyalty.freeRewardsAvailable - 1);
    const newTotalClaimed = loyalty.totalFreeClaimed + 1;
    const updatedLoyalty: UserLoyalty = {
      ...loyalty,
      freeRewardsAvailable: newFreeAvailable,
      totalFreeClaimed: newTotalClaimed
    };
    setLoyalty(updatedLoyalty);

    const updatedQuotas = {
      ...userQuotas,
      [tool.id]: (userQuotas[tool.id] || 0) + 1
    };
    setUserQuotas(updatedQuotas);

    const rewardPurchase: UserPurchase = {
      id: `reward-${Date.now()}`,
      userId: user?.uid || 'guest',
      userEmail: user?.email || 'guest@zain.net',
      itemId: `tool:${tool.id}`,
      itemType: 'tool',
      itemTitle: `Klaim Promo Beli 3x Gratis 1x: ${tool.title}`,
      amountPaid: 0,
      purchasedAt: Date.now(),
      method: 'loyalty_reward_3x',
      quotaGranted: 1,
      status: 'settlement'
    };

    const updatedPurchases = [rewardPurchase, ...purchases];
    setPurchases(updatedPurchases);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'data', 'loyalty'), updatedLoyalty);
        await setDoc(doc(db, 'users', user.uid, 'data', 'quotas'), updatedQuotas);
        await setDoc(doc(db, 'users', user.uid, 'purchases', rewardPurchase.id), rewardPurchase);
        try {
          await setDoc(doc(db, 'transactions', rewardPurchase.id), rewardPurchase);
        } catch (e) {}
        localStorage.setItem(`zain_loyalty_${user.uid}`, JSON.stringify(updatedLoyalty));
        localStorage.setItem(`zain_quotas_${user.uid}`, JSON.stringify(updatedQuotas));
        localStorage.setItem(`zain_purch_${user.uid}`, JSON.stringify(updatedPurchases));
      } catch (err) {
        console.warn('Error saving claimed reward to Firestore:', err);
      }
    } else {
      try {
        await setDoc(doc(db, 'transactions', rewardPurchase.id), rewardPurchase);
      } catch (e) {}
      localStorage.setItem('zain_guest_loyalty', JSON.stringify(updatedLoyalty));
      localStorage.setItem('zain_guest_quotas', JSON.stringify(updatedQuotas));
      localStorage.setItem('zain_guest_purch', JSON.stringify(updatedPurchases));
    }

    setAllPurchasesForAdmin((prev) => [rewardPurchase, ...prev.filter((p) => p.id !== rewardPurchase.id)]);

    // Open the claimed tool immediately
    setActiveTool(tool);
  };

  // Redeem free reward directly from the checkout modal
  const handleUseFreeRewardFromCheckout = async (target: CheckoutTarget) => {
    if (loyalty.freeRewardsAvailable <= 0) return;

    if (target.type === 'tool') {
      for (const cat of categoriesData) {
        const found = cat.tools.find((t) => t.id === target.id);
        if (found) {
          setCheckoutTarget(null);
          await handleClaimLoyaltyReward(found);
          return;
        }
      }
    } else if (target.type === 'category') {
      const categoryId = Number(target.id);
      const foundCategory = categoriesData.find((c) => c.id === categoryId);
      if (foundCategory && foundCategory.tools.length > 0) {
        setCheckoutTarget(null);
        // Claim the first tool in this category
        await handleClaimLoyaltyReward(foundCategory.tools[0]);
        return;
      }
    }
  };

  // Launch tool directly using Reseller Free Trial from checkout modal
  const handleUseResellerTrialFromCheckout = (target: CheckoutTarget) => {
    if (userRole !== 'reseller') return;
    if (target.type === 'tool') {
      for (const cat of categoriesData) {
        const found = cat.tools.find((t) => t.id === target.id);
        if (found) {
          setCheckoutTarget(null);
          setActiveTool(found);
          return;
        }
      }
    }
  };

  // Consume 1 creation quota when session finishes (Admin has unlimited free sessions)
  const handleConsumeQuota = async (tool: ToolItem) => {
    if (userRole === 'admin') {
      return; // Admins have unlimited free access
    }

    // Check reseller free trial first
    if (userRole === 'reseller') {
      const trialRemaining = getResellerTrialRemaining(tool.id);
      if (trialRemaining > 0) {
        const usedCount = (resellerTrials[tool.id] || 0) + 1;
        const updatedTrials: ResellerTrials = {
          ...resellerTrials,
          [tool.id]: usedCount
        };
        setResellerTrials(updatedTrials);

        if (user) {
          try {
            const trialDocRef = doc(db, 'users', user.uid, 'data', 'reseller_trials');
            await setDoc(trialDocRef, updatedTrials);
            localStorage.setItem(`zain_reseller_trials_${user.uid}`, JSON.stringify(updatedTrials));
          } catch (err) {
            console.warn('Error updating reseller trials in Firestore:', err);
            localStorage.setItem(`zain_reseller_trials_${user.uid}`, JSON.stringify(updatedTrials));
          }
        } else {
          localStorage.setItem('zain_guest_reseller_trials', JSON.stringify(updatedTrials));
        }
        return;
      }
    }

    const currentQuota = userQuotas[tool.id] || 0;
    if (currentQuota <= 0) return;

    const newQuotas = {
      ...userQuotas,
      [tool.id]: Math.max(0, currentQuota - 1)
    };

    setUserQuotas(newQuotas);

    if (user) {
      try {
        const quotaDocRef = doc(db, 'users', user.uid, 'data', 'quotas');
        await setDoc(quotaDocRef, newQuotas);
        localStorage.setItem(`zain_quotas_${user.uid}`, JSON.stringify(newQuotas));
      } catch (err) {
        console.warn('Error updating quota in Firestore:', err);
        localStorage.setItem(`zain_quotas_${user.uid}`, JSON.stringify(newQuotas));
      }
    } else {
      localStorage.setItem('zain_guest_quotas', JSON.stringify(newQuotas));
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (toolId: string) => {
    const newFavorites = new Set(favorites);
    const isAdding = !newFavorites.has(toolId);

    if (isAdding) {
      newFavorites.add(toolId);
    } else {
      newFavorites.delete(toolId);
    }
    setFavorites(newFavorites);

    if (user) {
      try {
        const favDocRef = doc(db, 'users', user.uid, 'favorites', toolId);
        if (isAdding) {
          await setDoc(favDocRef, { toolId, addedAt: Date.now() });
        } else {
          await deleteDoc(favDocRef);
        }
        localStorage.setItem(`zain_favs_${user.uid}`, JSON.stringify(Array.from(newFavorites)));
      } catch (err) {
        console.warn('Error updating favorite in Firestore:', err);
        localStorage.setItem(`zain_favs_${user.uid}`, JSON.stringify(Array.from(newFavorites)));
      }
    } else {
      localStorage.setItem('zain_guest_favs', JSON.stringify(Array.from(newFavorites)));
    }
  };

  const handleToggleSection = (id: number) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsGuest(false);
      setShowProfileModal(false);
      setShowRoleManagementModal(false);
      setShowSettingsModal(false);
      setActiveTool(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Re-fetch all global transactions for admin analytics
  const handleRefreshAdminAnalytics = async () => {
    try {
      const allTrxCol = collection(db, 'transactions');
      const allTrxSnap = await getDocs(allTrxCol);
      const globalPurchList: UserPurchase[] = [];
      allTrxSnap.forEach((d) => {
        globalPurchList.push(d.data() as UserPurchase);
      });
      if (globalPurchList.length > 0) {
        globalPurchList.sort((a, b) => b.purchasedAt - a.purchasedAt);
        setAllPurchasesForAdmin(globalPurchList);
      }
    } catch (e) {
      console.warn('Could not refresh global transactions:', e);
    }
  };

  const totalToolsCount = useMemo(() => {
    return categories.reduce((acc, cat) => acc + cat.tools.length, 0);
  }, [categories]);

  // Filtered categories and tools
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .map((category) => {
        let tools = category.tools;

        if (filterFavoritesOnly || selectedCategoryTab === 'favorites') {
          tools = tools.filter((t) => favorites.has(t.id));
        }

        if (query) {
          tools = tools.filter(
            (t) =>
              t.title.toLowerCase().includes(query) ||
              t.domain.toLowerCase().includes(query) ||
              category.title.toLowerCase().includes(query) ||
              (t.description && t.description.toLowerCase().includes(query)) ||
              (t.badge && t.badge.toLowerCase().includes(query))
          );
        }

        return {
          ...category,
          tools
        };
      })
      .filter((category) => {
        if (selectedCategoryTab !== 'all' && selectedCategoryTab !== 'favorites') {
          if (category.id !== selectedCategoryTab) return false;
        }
        if (query || filterFavoritesOnly || selectedCategoryTab === 'favorites') {
          return category.tools.length > 0;
        }
        return true;
      });
  }, [categories, searchQuery, filterFavoritesOnly, selectedCategoryTab, favorites]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-blue-500/25 animate-pulse mb-4">
          Z
        </div>
        <p className="text-sm font-semibold text-slate-300">Menghubungkan ke ZAIN.NET...</p>
        <p className="text-xs text-slate-500 mt-1">Memverifikasi otentikasi Firebase & gateway Midtrans</p>
      </div>
    );
  }

  // Not logged in and not in guest preview -> show Login screen
  if (!user && !isGuest) {
    return (
      <LoginView 
        onGuestLogin={() => setIsGuest(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        isGuest={isGuest}
        userRole={userRole}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterFavorites={filterFavoritesOnly}
        onToggleFilterFavorites={() => setFilterFavoritesOnly((prev) => !prev)}
        favoritesCount={favorites.size}
        documentsCount={documents.length}
        totalQuota={totalQuotaCount}
        totalToolsCount={totalToolsCount}
        onSignOut={handleSignOut}
        onOpenLogin={() => setIsGuest(false)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenRoleManagement={() => setShowRoleManagementModal(true)}
        onOpenAnalytics={() => setShowAnalyticsModal(true)}
        onOpenPriceManagement={() => setShowPriceManagementModal(true)}
        onOpenDocumentArchive={() => setShowDocumentArchiveModal(true)}
      />

      {/* Guest Mode Banner */}
      {isGuest && !user && (
        <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border-b border-blue-500/30 px-4 py-2 text-center text-xs text-blue-200 flex items-center justify-center gap-2">
          <span>Anda sedang dalam <strong>Mode Tamu</strong>. Masuk dengan akun Google agar riwayat kuota pembuatan naskah Anda tersimpan permanen.</span>
          <button
            onClick={() => setIsGuest(false)}
            className="px-2.5 py-1 bg-white text-slate-900 rounded-lg font-bold hover:bg-slate-100 transition-colors cursor-pointer text-[11px]"
          >
            Login Google
          </button>
        </div>
      )}

      {/* Role Tier Status Banner (For Admin & Reseller) */}
      {user && userRole === 'admin' && (
        <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-yellow-950/90 border-b border-amber-500/40 px-4 py-2 text-center text-xs text-amber-200 flex flex-wrap items-center justify-center gap-2">
          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Selamat Datang, <strong>Administrator ({user.email})</strong>. Akses <strong>100% Bebas</strong> untuk seluruh modul.
          </span>
          <button
            onClick={() => setShowRoleManagementModal(true)}
            className="px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 font-bold border border-amber-500/50 cursor-pointer text-[11px]"
          >
            Kelola Role Email
          </button>
          <button
            onClick={handleSignOut}
            title="Keluar dari Akun Google"
            className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/35 text-red-300 font-semibold border border-red-500/40 cursor-pointer text-[11px]"
          >
            Logout Google
          </button>
        </div>
      )}

      {user && userRole === 'reseller' && (
        <div className="bg-gradient-to-r from-blue-950/90 via-indigo-900/80 to-purple-950/90 border-b border-blue-500/40 px-4 py-2 text-center text-xs text-blue-200 flex flex-wrap items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            Selamat Datang, Partner <strong>Reseller ({user.email})</strong>. Anda memiliki <strong>Free Trial 3x Per Item</strong> & Tarif Khusus <strong>Diskon {rolesConfig.resellerDiscountPercentage}% All Item</strong>.
          </span>
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-2 py-0.5 rounded bg-blue-500/30 hover:bg-blue-500/45 text-cyan-200 font-bold border border-blue-500/50 cursor-pointer text-[11px]"
          >
            Info Akun Reseller
          </button>
          <button
            onClick={handleSignOut}
            title="Keluar dari Akun Google"
            className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/35 text-red-300 font-semibold border border-red-500/40 cursor-pointer text-[11px]"
          >
            Logout Google
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header Hero */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-xl shadow-blue-500/25 ring-4 ring-white/10 mb-4 transition-transform hover:scale-105 duration-200">
            Z
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            ZAIN.NET
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1.5 font-medium">
            Pusat Modul Akademik Skripsi, Artikel & Makalah
          </p>

          {/* Pay-Per-Use Notice Pill */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-200 shadow-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sistem Sekali Pembuatan (Pay-Per-Use) • Pembayaran Otomatis QRIS & Bank Midtrans</span>
          </div>
        </div>

        {/* Informative Business Model Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <h4 className="font-bold text-white text-sm">
              Ketentuan Pembuatan Dokumen (Sekali Pakai)
            </h4>
            <p className="leading-relaxed text-slate-400">
              Setiap pembelian modul berlaku untuk <strong>1x proses pembuatan naskah / pengolahan dokumen</strong>. Selesaikan proses penulisan dan unduh dokumen hasil (.docx / .pdf). Jika Anda ingin membuat naskah baru lagi di kemudian hari, Anda cukup melakukan pembayaran kembali.
            </p>
          </div>
        </div>

        {/* Loyalty Program Stamp Banner (Beli 3x Gratis 1x) */}
        {userRole === 'public' && (
          <LoyaltyBanner
            loyalty={loyalty}
            isLoggedIn={!!user}
            onOpenLogin={() => setIsGuest(false)}
            onOpenProfile={() => setShowProfileModal(true)}
          />
        )}

        {/* Quick Category Filter Chips */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategoryTab('all');
              setFilterFavoritesOnly(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryTab === 'all' && !filterFavoritesOnly
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua Modul ({totalToolsCount})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategoryTab(cat.id);
                setFilterFavoritesOnly(false);
                setOpenSectionId(cat.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategoryTab === cat.id && !filterFavoritesOnly
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                {cat.tools.length}
              </span>
            </button>
          ))}

          <button
            onClick={() => {
              setSelectedCategoryTab('favorites');
              setFilterFavoritesOnly(true);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              filterFavoritesOnly || selectedCategoryTab === 'favorites'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favorites.size > 0 ? 'fill-current' : ''}`} />
            <span>Favorit ({favorites.size})</span>
          </button>
        </div>

        {/* Section Accordions List */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                isOpen={
                  searchQuery.trim().length > 0 ||
                  selectedCategoryTab === category.id ||
                  selectedCategoryTab === 'favorites' ||
                  openSectionId === category.id
                }
                onToggle={handleToggleSection}
                favorites={favorites}
                getToolQuota={getToolQuota}
                getResellerTrialRemaining={getResellerTrialRemaining}
                userRole={userRole}
                discountPercentage={rolesConfig.resellerDiscountPercentage}
                freeRewardsAvailable={userRole === 'public' ? loyalty.freeRewardsAvailable : 0}
                onOpenTool={(tool) => setActiveTool(tool)}
                onToggleFavorite={handleToggleFavorite}
                onClaimReward={handleClaimLoyaltyReward}
                onCheckoutRequest={(target) => setCheckoutTarget(target)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Tidak Ada Modul yang Cocok
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-4">
              Tidak ditemukan modul akademik untuk kata kunci "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryTab('all');
                setFilterFavoritesOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Reset Pencarian
            </button>
          </div>
        )}

        {/* Workflow Guidance & Customer Service Card */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900/60 border border-blue-500/20 backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">
                  Sistem Pembayaran Terpadu Midtrans Gateway
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap transaksi via Midtrans (QRIS, Virtual Account & Dompet Digital) langsung diverifikasi otomatis secara realtime.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Otomatis 100%</span>
              </div>
            </div>
          </div>

          {/* WhatsApp CS Banner */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-200">
                  Ada Kendala Teknis atau Kurang Dimengerti?
                </p>
                <p className="text-[11px] text-slate-400">
                  Customer Service WhatsApp kami siap membantu: <strong className="text-emerald-300 font-mono">0852-3117-6597</strong>
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/6285231176597?text=Halo%20Admin%20ZAIN.NET%2C%20saya%20butuh%20bantuan%20seputar%20modul%20akademik%20skripsi."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Hubungi Kami Lewat WA</span>
            </a>
          </div>
        </div>

        {/* Clean Footer */}
        <footer className="text-center text-xs text-slate-500 mt-10 py-6 border-t border-slate-800/80">
          <p className="font-medium text-slate-400">© 2026 ZAIN.NET — Sistem Manajemen & Penulisan Akademik Terpadu</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Platform Penulisan Skripsi, Pembuatan Artikel Ilmiah, Penomoran Halaman & Penyusunan Makalah • CS WA: 0852-3117-6597
          </p>
        </footer>

      </main>

      {/* Floating WhatsApp Support Widget */}
      <WhatsAppSupportWidget user={user} />

      {/* Fullscreen In-App Viewer Modal */}
      <ToolViewerModal
        tool={activeTool}
        quota={activeTool ? getToolQuota(activeTool) : 0}
        userRole={userRole}
        resellerTrialRemaining={activeTool ? getResellerTrialRemaining(activeTool.id) : 0}
        onClose={() => setActiveTool(null)}
        onFinishCreation={handleConsumeQuota}
      />

      {/* Midtrans Checkout Modal */}
      <MidtransPaymentModal
        target={checkoutTarget}
        user={user}
        userRole={userRole}
        discountPercentage={rolesConfig.resellerDiscountPercentage}
        paymentConfig={paymentConfig}
        loyalty={loyalty}
        resellerTrialRemaining={checkoutTarget && checkoutTarget.type === 'tool' ? getResellerTrialRemaining(checkoutTarget.id) : 0}
        onClose={() => setCheckoutTarget(null)}
        onPaymentSuccess={handlePaymentSuccess}
        onUseFreeReward={handleUseFreeRewardFromCheckout}
        onUseResellerTrial={handleUseResellerTrialFromCheckout}
      />

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          user={user}
          userRole={userRole}
          discountPercentage={rolesConfig.resellerDiscountPercentage}
          favoritesCount={favorites.size}
          documentsCount={documents.length}
          quotas={userQuotas}
          purchases={purchases}
          loyalty={loyalty}
          resellerTrials={resellerTrials}
          onClose={() => setShowProfileModal(false)}
          onSignOut={handleSignOut}
          onOpenDocumentArchive={() => {
            setShowProfileModal(false);
            setShowDocumentArchiveModal(true);
          }}
        />
      )}

      {/* Admin Analytics Dashboard Modal */}
      <AdminAnalyticsModal
        purchases={allPurchasesForAdmin.length > 0 ? allPurchasesForAdmin : purchases}
        categories={categories}
        rolesConfig={rolesConfig}
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        onRefresh={handleRefreshAdminAnalytics}
      />

      {/* Dynamic Price Management Modal (Admin) */}
      <PriceManagementModal
        categories={categories}
        currentPrices={customPrices}
        isOpen={showPriceManagementModal}
        onClose={() => setShowPriceManagementModal(false)}
        onSavePrices={handleSaveCustomPrices}
      />

      {/* User Document & Work History Archive Modal */}
      <DocumentArchiveModal
        documents={documents}
        isOpen={showDocumentArchiveModal}
        onClose={() => setShowDocumentArchiveModal(false)}
        onSaveDocument={handleSaveDocument}
        onDeleteDocument={handleDeleteDocument}
      />

      {/* Reward Celebration Modal (When 3rd purchase completed) */}
      <RewardCelebrationModal
        isOpen={showRewardCelebration}
        totalFreeEarned={loyalty.totalFreeEarned}
        onClose={() => setShowRewardCelebration(false)}
      />

      {/* Midtrans Settings Modal */}
      {showSettingsModal && (
        <MidtransSettingsModal
          config={paymentConfig}
          onClose={() => setShowSettingsModal(false)}
          onSaveConfig={handleSavePaymentConfig}
        />
      )}

      {/* Admin Role Management Modal */}
      {showRoleManagementModal && (
        <RoleManagementModal
          currentConfig={rolesConfig}
          currentUserEmail={user?.email}
          onClose={() => setShowRoleManagementModal(false)}
          onSaveConfig={handleSaveRolesConfig}
        />
      )}

    </div>
  );
}
