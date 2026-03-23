// src/pages/ProductsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

// ── Razorpay loader ───────────────────────────────────────────────────────────
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere';
const loadRazorpay = () => new Promise(resolve => {
  if (window.Razorpay) { resolve(true); return; }
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

// ── Placeholder products from different brands ────────────────────────────────
const PLACEHOLDER_PRODUCTS = [
  {
    id: 'pp1', brandName: 'Asian Paints', brandPincode: '400001',
    title: 'Apex Ultima - Weather Proof Exterior',
    description: 'Ultra-premium exterior emulsion with 10-year warranty...',
    price: 4299, discount: 15, category: 'Exterior', surface: 'Wall',
    color: '#6B7C45', colorName: 'Sage Green', rating: 4.8, reviews: 1287,
    badge: 'Best Seller',
    placeholder: 'linear-gradient(135deg, #6B7C45, #3D5016)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/61YT5HJdA2L._AC_UF1000_1000_QL80__w6bun0',
  },
  {
    id: 'pp2', brandName: 'Berger Paints', brandPincode: '700001',
    title: 'WeatherCoat Anti-Dustt',
    description: 'Advanced anti-dust technology...',
    price: 3650, discount: 10, category: 'Exterior', surface: 'Wall',
    color: '#1E3A5F', colorName: 'Navy Blue', rating: 4.6, reviews: 943,
    badge: 'Premium',
    placeholder: 'linear-gradient(135deg, #1E3A5F, #0A1628)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/product_weathercoat_long_life_15_yweoo6',
  },
  {
    id: 'pp3', brandName: 'Nerolac', brandPincode: '400025',
    title: 'Excel Total – Interior Luxury',
    description: 'Smooth, washable interior emulsion...',
    price: 2899, discount: 20, category: 'Interior', surface: 'Wall',
    color: '#F5E6C8', colorName: 'Warm Ivory', rating: 4.7, reviews: 2104,
    badge: 'Top Rated',
    placeholder: 'linear-gradient(135deg, #C27A57, #8B4513)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/Nerolac-Impressions-Kashmir-High-Sheen_Cheatshot_R1_nlitap',
  },
  {
    id: 'pp4', brandName: 'Dulux', brandPincode: '110001',
    title: 'Weathershield Flex – Crack Bridge',
    description: 'Bridges hairline cracks up to 1mm...',
    price: 5199, discount: 5, category: 'Exterior', surface: 'Wall',
    color: '#9CA3AF', colorName: 'Cement Grey', rating: 4.9, reviews: 678,
    badge: 'Premium',
    placeholder: 'linear-gradient(135deg, #6B7280, #374151)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/shopping_zmumcd',
  },
  {
    id: 'pp5', brandName: 'Indigo Paints', brandPincode: '560001',
    title: 'Premium Bright Ceiling White',
    description: 'Brilliant white ceiling solution...',
    price: 1850, discount: 25, category: 'Interior', surface: 'Ceiling',
    color: '#FFFFFF', colorName: 'Brilliant White', rating: 4.5, reviews: 534,
    badge: 'Value Pick',
    placeholder: 'linear-gradient(135deg, #e0e7ff, #a5b4fc)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/41hd8a3dr8L._SY300_SX300_QL70_FMwebp__r1fc9u',
  },
  {
    id: 'pp6', brandName: 'Jotun', brandPincode: '500001',
    title: 'Jotashield Colour Extreme',
    description: 'Scandinavian anti-fade technology...',
    price: 6450, discount: 8, category: 'Exterior', surface: 'Wall',
    color: '#EF4444', colorName: 'Bold Red', rating: 4.7, reviews: 389,
    badge: 'Imported',
    placeholder: 'linear-gradient(135deg, #EF4444, #991B1B)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/Screenshot_2026-03-23_124743_afzp8f',
  },
  {
    id: 'pp7', brandName: 'Kansai Nerolac', brandPincode: '400002',
    title: 'Beauty Smooth Enamel – Doors & Wood',
    description: 'High-gloss enamel for furniture...',
    price: 1299, discount: 12, category: 'Wood Finish', surface: 'Wood',
    color: '#B45309', colorName: 'Teak Brown', rating: 4.4, reviews: 1567,
    badge: 'Top Seller',
    placeholder: 'linear-gradient(135deg, #B45309, #6B3A0A)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/205-x-258_0001_Gloria-Epoxy-Primer-Tin_3D-Pack_R2_Hi-Res_zuzfjj',
  },
  {
    id: 'pp8', brandName: 'Shalimar', brandPincode: '600001',
    title: 'Lafarge Roof Shield – Terrace Coat',
    description: 'Specialized waterproofing solution...',
    price: 3200, discount: 0, category: 'Waterproof', surface: 'Concrete',
    color: '#374151', colorName: 'Slate Grey', rating: 4.6, reviews: 721,
    badge: 'New Launch',
    placeholder: 'linear-gradient(135deg, #374151, #111827)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/ZERO_DAMP_Bucket_C_fum3xo',
  },
  {
    id: 'pp9', brandName: 'Nippon Paint', brandPincode: '600002',
    title: 'Vinilex Acrylic Primer – All Surface',
    description: 'Universal primer for walls, wood, and metal...',
    price: 980, discount: 18, category: 'Primer', surface: 'All',
    color: '#E5E7EB', colorName: 'Off White', rating: 4.3, reviews: 2341,
    badge: 'Essential',
    placeholder: 'linear-gradient(135deg, #D1FAE5, #6EE7B7)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/shopping_1_kojpll',
  },
  {
    id: 'pp10', brandName: 'British Paints', brandPincode: '700002',
    title: 'Ultra-Shine Metallic Coat',
    description: 'Premium metallic finish paint...',
    price: 7800, discount: 5, category: 'Specialty', surface: 'Wall',
    color: '#FCD34D', colorName: 'Metallic Gold', rating: 4.9, reviews: 267,
    badge: 'Luxury',
    placeholder: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
    imageUrl: 'https://res.cloudinary.com/dyktwrahh/image/upload/f_auto,q_auto/100d3489-cbb4-4c0f-a212-3b86095d377d_god7xj',
  },
];

// ── Pincode distance estimation helper ───────────────────────────────────────
const estimateDelivery = (userPincode, brandPincode) => {
  if (!userPincode || userPincode.length !== 6) return null;
  const diff = Math.abs(parseInt(userPincode) - parseInt(brandPincode));
  if (diff < 10000) return { days: 2, label: '1–2 Days', zone: 'Local', color: '#10B981' };
  if (diff < 50000) return { days: 4, label: '3–4 Days', zone: 'Regional', color: '#3B82F6' };
  if (diff < 200000) return { days: 6, label: '5–6 Days', zone: 'National', color: '#F59E0B' };
  return { days: 8, label: '7–8 Days', zone: 'Pan India', color: '#8B5CF6' };
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { showToast } = useToast();

  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [userPincode, setUserPincode] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyModal, setBuyModal] = useState(null);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [ordering, setOrdering] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [geoLoading, setGeoLoading] = useState(false);

  // Load Firebase approved brand products + merge with placeholders
  useEffect(() => {
    const q = query(collection(db, 'brand_products'), where('status', '==', 'approved'));
    return onSnapshot(q, snap => {
      const liveProducts = snap.docs.map(d => ({ id: d.id, ...d.data(), isLive: true }));
      setAllProducts([...PLACEHOLDER_PRODUCTS, ...liveProducts]);
    }, () => setAllProducts(PLACEHOLDER_PRODUCTS));
  }, []);

  useEffect(() => {
    if (userProfile?.pincode) setUserPincode(userProfile.pincode);
  }, [userProfile]);

  const categories = ['All', ...new Set(allProducts.map(p => p.category))];

  const filtered = allProducts
    .filter(p => filter === 'All' || p.category === filter)
    .filter(p =>
      !searchTerm ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price * (1 - a.discount / 100)) - (b.price * (1 - b.discount / 100));
      if (sortBy === 'price-desc') return (b.price * (1 - b.discount / 100)) - (a.price * (1 - a.discount / 100));
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discount - a.discount;
      return 0;
    });

  const discountedPrice = (p) => Math.round(p.price * (1 - p.discount / 100));
  const cartTotal = cart.reduce((s, item) => s + discountedPrice(item) * item.qty, 0);
  const cartCount = cart.reduce((s, item) => s + item.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.title} added to cart!`, 'success');
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );

  // ── Geo-location helper (shared by Buy Now & Cart Checkout) ──────────────────
  const getGeoLocation = (onSuccess) => {
    if (!navigator.geolocation) { showToast('Geolocation not supported on this browser', 'error'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocode with a free API to get a nearby pincode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const pincode = data.address?.postcode?.replace(/\s/g, '').slice(0, 6);
          if (pincode && /^\d{6}$/.test(pincode)) {
            onSuccess(pincode);
            showToast(`📍 Pincode ${pincode} detected from your location!`, 'success');
          } else {
            showToast('Could not find pincode from location. Please enter manually.', 'warning');
          }
        } catch {
          showToast('Location detected but pincode lookup failed. Enter manually.', 'warning');
        }
        setGeoLoading(false);
      },
      () => { showToast('Location access denied. Please enter pincode manually.', 'warning'); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleBuyNow = (product) => {
    if (!user) { navigate('/login'); return; }
    setBuyModal(product);
    setOrderForm({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      pincode: userPincode || '',
    });
  };

  const handleOpenCheckout = () => {
    if (!user) { navigate('/login'); return; }
    setCheckoutForm({
      name: userProfile?.name || '',
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      pincode: userPincode || '',
    });
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  // ── Place order for cart (multiple items) via Razorpay ───────────────────────
  const handleCartCheckout = async () => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.pincode) {
      showToast('Please fill all delivery details', 'error');
      return;
    }
    if (checkoutForm.pincode.length !== 6) {
      showToast('Please enter a valid 6-digit pincode', 'error');
      return;
    }
    setCheckingOut(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) {
        showToast('Razorpay failed to load. Please check your internet connection.', 'error');
        setCheckingOut(false);
        return;
      }

      const totalPaise = cartTotal * 100; // convert ₹ to paise

      const options = {
        key: RAZORPAY_KEY,
        amount: totalPaise,
        currency: 'INR',
        name: 'ChromaAI Paints',
        description: `Order for ${cart.length} item(s)`,
        image: 'https://i.imgur.com/n5tjHFD.png',
        prefill: {
          name: checkoutForm.name,
          contact: checkoutForm.phone,
          email: user.email || '',
        },
        theme: { color: '#F59E0B' },
        handler: async (response) => {
          try {
            for (const item of cart) {
              const delivery = estimateDelivery(checkoutForm.pincode, item.brandPincode);
              const expectedDate = new Date();
              expectedDate.setDate(expectedDate.getDate() + (delivery?.days || 5));
              await addDoc(collection(db, 'orders'), {
                userId: user.uid,
                userName: checkoutForm.name,
                userPhone: checkoutForm.phone,
                userAddress: checkoutForm.address,
                userPincode: checkoutForm.pincode,
                productId: item.id,
                productTitle: item.title,
                brandName: item.brandName,
                brandPincode: item.brandPincode,
                brandUid: item.brandUid || null,
                price: discountedPrice(item),
                originalPrice: item.price,
                discount: item.discount,
                qty: item.qty,
                deliveryZone: delivery?.zone || 'Pan India',
                estimatedDays: delivery?.days || 5,
                expectedDelivery: expectedDate.toISOString(),
                status: 'confirmed',
                paymentId: response.razorpay_payment_id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }
            showToast(`🎉 Payment successful! ${cart.length} order(s) placed.`, 'success');
            setCart([]);
            setCheckoutOpen(false);
            navigate('/orders');
          } catch (err) {
            showToast('Payment done but order save failed. Contact support with payment ID: ' + response.razorpay_payment_id, 'error');
          } finally {
            setCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled. Your order was not placed.', 'warning');
            setCheckingOut(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        showToast('Payment failed. Please try again.', 'error');
        setCheckingOut(false);
      });
      rzp.open();
    } catch (err) {
      showToast('Checkout failed. Please try again.', 'error');
      setCheckingOut(false);
    }
  };

  // ── Buy Now single product via Razorpay ───────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!orderForm.name || !orderForm.phone || !orderForm.address || !orderForm.pincode) {
      showToast('Please fill all fields', 'error');
      return;
    }
    if (orderForm.pincode.length !== 6) {
      showToast('Please enter a valid 6-digit pincode', 'error');
      return;
    }
    setOrdering(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) {
        showToast('Razorpay failed to load. Please check your internet connection.', 'error');
        setOrdering(false);
        return;
      }

      const amountPaise = discountedPrice(buyModal) * 100; // convert ₹ to paise

      const options = {
        key: RAZORPAY_KEY,
        amount: amountPaise,
        currency: 'INR',
        name: 'ChromaAI Paints',
        description: buyModal.title,
        image: 'https://i.imgur.com/n5tjHFD.png',
        prefill: {
          name: orderForm.name,
          contact: orderForm.phone,
          email: user.email || '',
        },
        theme: { color: '#F59E0B' },
        handler: async (response) => {
          try {
            const delivery = estimateDelivery(orderForm.pincode, buyModal.brandPincode);
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() + (delivery?.days || 5));

            await addDoc(collection(db, 'orders'), {
              userId: user.uid,
              userName: orderForm.name,
              userPhone: orderForm.phone,
              userAddress: orderForm.address,
              userPincode: orderForm.pincode,
              productId: buyModal.id,
              productTitle: buyModal.title,
              brandName: buyModal.brandName,
              brandPincode: buyModal.brandPincode,
              price: discountedPrice(buyModal),
              originalPrice: buyModal.price,
              discount: buyModal.discount,
              deliveryZone: delivery?.zone || 'Pan India',
              estimatedDays: delivery?.days || 5,
              expectedDelivery: expectedDate.toISOString(),
              status: 'confirmed',
              paymentId: response.razorpay_payment_id,
              trackingSteps: [
                { step: 'Order Placed', date: new Date().toISOString(), done: true, icon: '📦' },
                { step: 'Processing', date: null, done: false, icon: '⚙️' },
                { step: 'Shipped', date: null, done: false, icon: '🚚' },
                { step: 'Out for Delivery', date: null, done: false, icon: '🛵' },
                { step: 'Delivered', date: null, done: false, icon: '✅' },
              ],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });

            showToast('🎉 Payment successful! Order placed.', 'success');
            setBuyModal(null);
            navigate('/orders');
          } catch (err) {
            showToast('Payment done but order save failed. Contact support with payment ID: ' + response.razorpay_payment_id, 'error');
          } finally {
            setOrdering(false);
          }
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled. Your order was not placed.', 'warning');
            setOrdering(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        showToast('Payment failed. Please try again.', 'error');
        setOrdering(false);
      });
      rzp.open();
    } catch (err) {
      showToast('Order failed. Please try again.', 'error');
      setOrdering(false);
    }
  };

  const delivery = buyModal ? estimateDelivery(orderForm.pincode || userPincode, buyModal.brandPincode) : null;

  const isLoggedIn = !!user;
  const sidebarVisible = isLoggedIn && userProfile?.role !== 'brand' && userProfile?.role !== 'admin';

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {isLoggedIn && <Sidebar />}

      <div style={{ marginLeft: isLoggedIn ? 240 : 0 }}>
        {isLoggedIn ? (
          <Navbar title="Paint Products" />
        ) : (
          <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(8,14,26,0.97)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            padding: '0 32px', height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div className="brand-icon">🎨</div>
              <div className="brand-name">ChromaAI</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign In</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Started</button>
            </div>
          </nav>
        )}

        <div style={{ padding: '32px 32px' }}>
          {/* Page Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(59,130,246,0.05))',
            border: '1px solid var(--border)',
            borderRadius: 16, padding: '28px 32px', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
                🎨 Paint Products
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Premium paints from India's top brands • Free delivery tracking
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Pincode input */}
              <div style={{ position: 'relative' }}>
                <input
                  placeholder="📍 Your Pincode"
                  value={userPincode}
                  onChange={e => setUserPincode(e.target.value.slice(0, 6))}
                  maxLength={6}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '9px 14px', color: 'var(--text-primary)',
                    fontSize: '0.875rem', width: 160, outline: 'none',
                  }}
                />
              </div>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                style={{
                  position: 'relative',
                  background: 'var(--accent)', border: 'none', borderRadius: 10,
                  padding: '9px 18px', color: '#000', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem',
                }}
              >
                🛒 Cart
                {cartCount > 0 && (
                  <span style={{
                    background: '#EF4444', color: '#fff', borderRadius: '50%',
                    width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700,
                  }}>{cartCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              placeholder="🔍 Search products or brands..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                flex: 1, minWidth: 200,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 16px', color: 'var(--text-primary)',
                fontSize: '0.875rem', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: '1px solid var(--border)',
                    background: filter === cat ? 'var(--accent)' : 'var(--bg-card)',
                    color: filter === cat ? '#000' : 'var(--text-secondary)',
                    fontWeight: filter === cat ? 700 : 400,
                    cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s',
                  }}
                >{cat}</button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '9px 14px', color: 'var(--text-secondary)',
                fontSize: '0.875rem', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>

          {/* Products Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {filtered.map(product => {
              const finalPrice = discountedPrice(product);
              const del = estimateDelivery(userPincode, product.brandPincode);
              const inCart = cart.find(i => i.id === product.id);

              return (
                <div
                  key={product.id}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 16, overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {/* Product Image */}
                  <div style={{
                    height: 180, position: 'relative', overflow: 'hidden',
                    background: product.placeholder || product.imageUrl ? undefined : 'var(--bg-elevated)',
                  }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: product.placeholder || 'var(--bg-elevated)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 10,
                      }}>
                        <div style={{
                          width: 64, height: 64, borderRadius: '50%',
                          background: product.color || '#6B7280',
                          boxShadow: `0 8px 20px ${product.color || '#6B7280'}66`,
                          border: '3px solid rgba(255,255,255,0.2)',
                        }} />
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                          {product.colorName}
                        </span>
                      </div>
                    )}

                    {/* Badge */}
                    {product.badge && (
                      <div style={{
                        position: 'absolute', top: 12, left: 12,
                        background: product.badge === 'Best Seller' ? '#F59E0B' :
                          product.badge === 'New Launch' ? '#3B82F6' :
                            product.badge === 'Luxury' ? '#8B5CF6' :
                              product.badge === 'Imported' ? '#10B981' : '#374151',
                        color: '#fff', fontWeight: 700, fontSize: '0.65rem',
                        letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 6,
                        textTransform: 'uppercase',
                      }}>{product.badge}</div>
                    )}

                    {/* Discount badge */}
                    {product.discount > 0 && (
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: '#EF4444', color: '#fff',
                        fontWeight: 800, fontSize: '0.75rem',
                        padding: '4px 8px', borderRadius: 6,
                      }}>{product.discount}% OFF</div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {product.brandName} · {product.category}
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.3, color: 'var(--text-primary)' }}>
                      {product.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, flex: 1 }}>
                      {product.description.slice(0, 100)}...
                    </p>

                    {/* Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} style={{
                            fontSize: '0.75rem',
                            color: s <= Math.round(product.rating) ? '#FCD34D' : 'var(--bg-elevated)',
                          }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {product.rating} ({product.reviews?.toLocaleString() || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                      {product.discount > 0 && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Delivery estimate */}
                    {del && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        marginBottom: 12, fontSize: '0.72rem', color: del.color,
                        background: `${del.color}15`, borderRadius: 6, padding: '5px 10px',
                      }}>
                        🚚 {del.label} delivery · {del.zone}
                      </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => addToCart(product)}
                        style={{
                          flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--accent)',
                          background: inCart ? 'var(--accent-glow)' : 'transparent',
                          color: 'var(--accent)', fontWeight: 700, cursor: 'pointer',
                          fontSize: '0.8rem', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; }}
                        onMouseLeave={e => { if (!inCart) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {inCart ? `🛒 In Cart (${inCart.qty})` : '+ Cart'}
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        style={{
                          flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
                          background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                          color: '#000', fontWeight: 700, cursor: 'pointer',
                          fontSize: '0.8rem', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>No products found</div>
            </div>
          )}
        </div>
      </div>

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000 }} />
          <div style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(440px, 100vw)',
            background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
            zIndex: 9001, display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.3s ease',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>🛒 Shopping Cart ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                  <div>Your cart is empty</div>
                </div>
              ) : cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: 12, marginBottom: 16, padding: 12,
                  background: 'var(--bg-elevated)', borderRadius: 10,
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 8, flexShrink: 0,
                    background: item.placeholder || 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '🎨'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{item.brandName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{discountedPrice(item).toLocaleString('en-IN')}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-primary)' }}>-</button>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-primary)' }}>+</button>
                        <button onClick={() => removeFromCart(item.id)} style={{ width: 24, height: 24, borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#EF4444', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>Subtotal ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>Delivery charges calculated at checkout</div>
                <button
                  onClick={handleOpenCheckout}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                    color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                  }}
                >
                  🛒 Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── BUY NOW MODAL ── */}
      {buyModal && (
        <>
          <div onClick={() => setBuyModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9100, backdropFilter: 'blur(6px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 9101, width: 'min(560px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
            animation: 'slideUpModal 0.35s ease',
          }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, #F59E0B, #10B981, #3B82F6)' }} />
            <div style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem' }}>📦 Place Order</h2>
                <button onClick={() => setBuyModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 22 }}>×</button>
              </div>

              {/* Product Summary */}
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px',
                marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <div style={{ width: 50, height: 50, borderRadius: 8, background: buyModal.placeholder || 'var(--bg-card)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{buyModal.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{buyModal.brandName}</div>
                  <div style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{discountedPrice(buyModal).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Delivery Estimate */}
              {delivery && (
                <div style={{
                  background: `${delivery.color}15`, border: `1px solid ${delivery.color}40`,
                  borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 24 }}>🚚</span>
                  <div>
                    <div style={{ fontWeight: 700, color: delivery.color, fontSize: '0.9rem' }}>
                      Estimated Delivery: {delivery.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {delivery.zone} shipping from pincode {buyModal.brandPincode}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Your full name', type: 'text' },
                  { label: 'Phone Number', key: 'phone', placeholder: '+91 XXXXXXXX', type: 'tel' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={orderForm[field.key]}
                      onChange={e => setOrderForm(f => ({ ...f, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
                        fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Delivery Address</label>
                  <textarea
                    value={orderForm.address}
                    onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="House no., Street, Area, City"
                    rows={2}
                    style={{
                      width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
                      fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Pincode *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={orderForm.pincode}
                      onChange={e => setOrderForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      style={{
                        flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)',
                        fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => getGeoLocation(pin => setOrderForm(f => ({ ...f, pincode: pin })))}
                      disabled={geoLoading}
                      title="Auto-detect pincode from GPS"
                      style={{
                        padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
                        background: geoLoading ? 'var(--bg-elevated)' : 'rgba(16,185,129,0.1)',
                        color: '#10B981', cursor: geoLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0,
                      }}
                    >
                      {geoLoading ? '⏳' : '📡 GPS'}
                    </button>
                  </div>
                  {orderForm.pincode.length === 6 && buyModal && (() => {
                    const d = estimateDelivery(orderForm.pincode, buyModal.brandPincode);
                    return d ? (
                      <div style={{ marginTop: 6, fontSize: '0.75rem', color: d.color, background: `${d.color}12`, borderRadius: 6, padding: '5px 10px' }}>
                        🚚 {d.label} · {d.zone} delivery from pincode {buyModal.brandPincode}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setBuyModal(null)} style={{
                  flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600,
                }}>Cancel</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={ordering}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                    background: ordering ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                    color: ordering ? 'var(--text-muted)' : '#000', fontWeight: 700,
                    cursor: ordering ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                  }}
                >
                  {ordering ? '⏳ Opening Razorpay...' : `🔒 Pay ₹${discountedPrice(buyModal).toLocaleString('en-IN')} via Razorpay`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CART CHECKOUT MODAL ── */}
      {checkoutOpen && (
        <>
          <div onClick={() => setCheckoutOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9200, backdropFilter: 'blur(6px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 9201, width: 'min(600px, 96vw)', maxHeight: '92vh', overflowY: 'auto',
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
            animation: 'slideUpModal 0.35s ease',
          }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, #F59E0B, #10B981, #3B82F6)' }} />
            <div style={{ padding: '24px 28px' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🛒 Checkout</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{cart.length} item(s) · Total ₹{cartTotal.toLocaleString('en-IN')}</div>
                </div>
                <button onClick={() => setCheckoutOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 22 }}>×</button>
              </div>

              {/* Cart summary */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Summary</div>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0, background: item.placeholder || 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎨</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.brandName} · Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.88rem' }}>₹{(discountedPrice(item) * item.qty).toLocaleString('en-IN')}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, fontWeight: 800 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📦 Delivery Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Full Name *</label>
                      <input
                        value={checkoutForm.name}
                        onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name"
                        style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Phone Number *</label>
                      <input
                        type="tel"
                        value={checkoutForm.phone}
                        onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 XXXXXXXXXX"
                        style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Delivery Address *</label>
                    <textarea
                      value={checkoutForm.address}
                      onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="House no., Street, Area, City, State"
                      rows={2}
                      style={{ width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Pincode + GPS */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>Delivery Pincode *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={checkoutForm.pincode}
                        onChange={e => setCheckoutForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => getGeoLocation(pin => {
                          setCheckoutForm(f => ({ ...f, pincode: pin }));
                          setUserPincode(pin);
                        })}
                        disabled={geoLoading}
                        style={{
                          padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)',
                          background: geoLoading ? 'var(--bg-elevated)' : 'rgba(16,185,129,0.1)',
                          color: '#10B981', cursor: geoLoading ? 'wait' : 'pointer',
                          fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0,
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        {geoLoading ? '⏳ Detecting...' : '📡 Use GPS'}
                      </button>
                    </div>

                    {/* Delivery estimates per item */}
                    {checkoutForm.pincode.length === 6 && cart.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {cart.map(item => {
                          const d = estimateDelivery(checkoutForm.pincode, item.brandPincode);
                          return d ? (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: d.color, background: `${d.color}10`, borderRadius: 6, padding: '5px 10px' }}>
                              <span>🚚</span>
                              <span style={{ flex: 1, fontWeight: 600 }}>{item.title.slice(0, 30)}...</span>
                              <span style={{ fontWeight: 700 }}>{d.label} · {d.zone}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout button */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setCheckoutOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  ← Back to Cart
                </button>
                <button
                  onClick={handleCartCheckout}
                  disabled={checkingOut}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                    background: checkingOut ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                    color: checkingOut ? 'var(--text-muted)' : '#000',
                    fontWeight: 700, cursor: checkingOut ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                  }}
                >
                  {checkingOut ? '⏳ Opening Razorpay...' : `🔒 Pay ₹${cartTotal.toLocaleString('en-IN')} via Razorpay`}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
