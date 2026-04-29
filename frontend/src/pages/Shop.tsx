import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flower2, Leaf, Check, Loader2, ShoppingCart,
  X, Minus, Plus,
} from 'lucide-react';
import { getProducts, getCategories, addToCart } from '../services/api';
import type { Product, Category } from '../types/shop';

import coralImg from './img/coral.png';
import greenImg from './img/green.png';
import lavenderImg from './img/lavender.png';
import yellowImg from './img/yellow.png';
import blueImg from './img/blue.png';
import barImg from './img/searchbar-img.png';
import main1Img from './img/main1.png';
import main2Img from './img/main2.png';

const CAT_PALETTES = [
  { bg: 'rgba(255,126,107,0.10)', border: 'rgba(255,126,107,0.28)', iconClr: '#ff7e6b' },
  { bg: 'rgba(212,240,192,0.55)', border: 'rgba(90,173,94,0.28)', iconClr: '#5aad5e' },
  { bg: 'rgba(185,146,212,0.13)', border: 'rgba(139,69,176,0.22)', iconClr: '#8b45b0' },
  { bg: 'rgba(245,200, 66,0.13)', border: 'rgba(200,160,  0,0.22)', iconClr: '#c8a020' },
  { bg: 'rgba( 91,155,212,0.13)', border: 'rgba( 60,120,200,0.22)', iconClr: '#3c78c8' },
  { bg: 'rgba(232,123,176,0.13)', border: 'rgba(200, 70,140,0.22)', iconClr: '#c8468c' },
];

const STRIP_COLORS = [
  'rgba(232,123,176,0.10)',
  'rgba(185,146,212,0.10)',
  'rgba(244,133,106,0.11)',
  'rgba(245,200, 66,0.09)',
  'rgba( 91,155,212,0.10)',
  'rgba(130,195,120,0.09)',
];

const MOSAIC_COLORS = {
  main: 'rgba(255,126,107,0.22)',   // coral based
  sm1: 'rgba(212,240,192,0.72)',   // green
  sm2: 'rgba(185,146,212,0.28)',   // lavender
  sm3: 'rgba(245,200, 66,0.28)',   // yellow
  sm4: 'rgba( 91,155,212,0.26)',   // blue
};

export default function Shop() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [heroScrolled, setHeroScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [qty, setQty] = useState(1);
  const [detailAdding, setDetailAdding] = useState(false);
  const [detailSuccess, setDetailSuccess] = useState(false);

  useEffect(() => {
    const onScroll = () => setHeroScrolled(window.scrollY > 88);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(selectedCategory ?? undefined)
      .then((r) => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      setSuccessId(product.id);
      setTimeout(() => setSuccessId(null), 1500);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setAddingId(null);
    }
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setQty(1);
    setDetailSuccess(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerVisible(true)));
  };
  const closeProduct = () => {
    setDrawerVisible(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleDetailAdd = async () => {
    if (!selectedProduct) return;
    setDetailAdding(true);
    try {
      await addToCart(selectedProduct.id, qty);
      setDetailSuccess(true);
      setTimeout(() => setDetailSuccess(false), 2200);
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setDetailAdding(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        /* ------------------------------------------------------------
           GLOBAL & VARIABLES
        ------------------------------------------------------------ */
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --coral:    #ff7e6b;
          --mint:     #d4f0c0;
          --cream:    #fffaf5;
          --charcoal: #1e1e1e;
          --muted:    #9a9490;
          --border:   #ede6de;
          --card-bg:  #ffffff;
        }

        .shop-page {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Outfit', sans-serif;
        }

        /* ------------------------------------------------------------
           HERO SECTION
        ------------------------------------------------------------ */
        .shop-hero {
          position: relative;
          height: auto;
          overflow: hidden;
          border-bottom: none;
        }

        /* --- Layer 0: Vertical strips (visible after scroll) --- */
        .hero-strips-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          display: flex;
          opacity: 0;
          transition: opacity 0.55s ease 0.22s;
        }
        .shop-hero.hero-scrolled .hero-strips-bg {
          opacity: 1;
        }
        .hero-strip-bg {
          flex: 1;
        }

        /* --- Ambient blobs --- */
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.55s ease 0.35s;
        }
        .shop-hero.hero-scrolled .hero-blob {
          opacity: 1;
        }
        .hero-blob-1 {
          width: 400px;
          height: 400px;
          background: rgba(255, 126, 107, 0.10);
          top: -110px;
          right: -70px;
          animation: blobFloat 7s ease-in-out infinite;
        }
        .hero-blob-2 {
          width: 290px;
          height: 290px;
          background: rgba(212, 240, 192, 0.18);
          bottom: -90px;
          left: 7%;
          animation: blobFloat 9s ease-in-out infinite 2s;
        }
        .hero-blob-3 {
          width: 210px;
          height: 210px;
          background: rgba(185, 146, 212, 0.13);
          top: 28%;
          left: 44%;
          animation: blobFloat 6s ease-in-out infinite 1s;
        }
        @keyframes blobFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-18px) scale(1.04); }
        }

        /* --- Layer 1: Mosaic grid (slides up & fades out on scroll) --- */
        .hero-mosaic-overlay {
          position: relative;
          background: rgba(255, 250, 245, 0.93);
          height: 468px;
          inset: 0;
          z-index: 10;
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.4s ease, transform 0.4s ease;
          will-change: transform, opacity;
        }
        
        .shop-hero.hero-scrolled .hero-mosaic-overlay {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-20px);
        }

        /* Mosaic grid layout */
        .hero-mosaic-grid {
          display: grid;
          grid-template-columns: 54% 1fr 1fr;
          grid-template-rows: 50% 50%;
          gap: 7px;
          height: 100%;
          padding: 7px;
          box-sizing: border-box;
        }
        .mosaic-main {
          grid-row: 1 / 3;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 32px;
          position: relative;
          transition: transform 0.22s;
        }
        .mosaic-main:hover {
          transform: scale(1.008);
        }
        .mosaic-sm {
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 14px 18px;
          position: relative;
          transition: transform 0.2s;
        }
        .mosaic-sm:hover {
          transform: scale(1.015);
        }

        /* Flower images inside mosaic boxes (screen blend removes black bg) */
        .mosaic-img {
          position: absolute;
          mix-blend-mode: normal !important;
          opacity: 1 !important;
          visibility: visible !important;
          object-fit: contain;
          user-select: none;
        }
        .mosaic-main-img {
          right: -100px;
          top: 15px;
          width: 65%;
          height: 95%;
          opacity: 0.95;
        }
        .mosaic-sm-img {
          right: -8px;
          top: -8px;
          width: 62%;
          height: 90%;
          opacity: 0.88;
        }
        /* Individual small box adjustments */
        .mosaic-sm:nth-child(1) .mosaic-sm-img {
          right: -250px;
        }
        .mosaic-sm:nth-child(3) .mosaic-sm-img {
          top: -20px;
        }
        .mosaic-sm:nth-child(4) .mosaic-sm-img {
          right: -8px;
          top: auto;
          bottom: 0px;
        }
        .mosaic-sm:nth-child(5) .mosaic-sm-img {
          right: auto;
          left: -8px;
          top: -20px;
        }

        /* Mosaic text styles */
        .mosaic-eyebrow {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(30, 30, 30, 0.45);
          margin-bottom: 5px;
          position: relative;
          z-index: 1;
        }
        .mosaic-title {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 5px;
          position: relative;
          z-index: 1;
        }
        .mosaic-main .mosaic-title {
          font-size: 2.1rem;
          margin-bottom: 6px;
        }
        .mosaic-sm .mosaic-title {
          font-size: 1.1rem;
        }
        .mosaic-sub {
          font-size: 0.70rem;
          color: rgba(30, 30, 30, 0.48);
          font-weight: 300;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }
        .mosaic-main .mosaic-sub {
          font-size: 0.78rem;
          max-width: 72%;
        }

        /* --- Layer 2: Hero text content (scroll-revealed, staggered) --- */
        .hero-content-layer {
          position: relative;
          opacity: 1 !important;
          transform: none !important;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 32px;
          pointer-events: none;
          margin-top: -180px;
        }

        /* --- Hero Corner Images --- */
        .hero-img-main1 {
          position: absolute;
          top: -20px;
          left: -15px;
          width: clamp(150px, 30vw, 360px);
          z-index: 0; /* Keeps it behind the text */
          pointer-events: none;
          rotate: 10deg;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s;
        }
        .hero-img-main2 {
          position: absolute;
          bottom: -40px;
          right: 10px;
          width: clamp(150px, 38vw, 360px);
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
        }
        
        .shop-hero.hero-scrolled .hero-img-main1,
        .shop-hero.hero-scrolled .hero-img-main2 {
          opacity: 1;
          transform: translateY(0);
        }

        .shop-hero.hero-scrolled .hero-content-layer {
          pointer-events: auto;
        }
        .hero-inner {
          width: 100%;
          max-width: 800px;   
          margin: 0 auto;
          display: flex;  
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .hero-left {
          display: flex;
          flex-direction: column;
          align-items: center; 
          text-align: center; 
          gap: 22px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--mint);
          color: #3a7d44;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 13px;
          border-radius: 100px;
          width: fit-content;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.52s ease 0.30s, transform 0.52s ease 0.30s;
        }
        .shop-hero.hero-scrolled .hero-eyebrow {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #3a7d44;
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.7); }
        }

        .hero-headline {
          display: flex;
          flex-direction: column;
          gap: 0;
          align-items: center; 
          text-align: center;
        }
        .hero-line-sm {
          font-family: 'Fraunces', serif;
          font-size: 1.35rem;
          font-weight: 300;
          font-style: italic;
          color: var(--muted);
          letter-spacing: -0.01em;
          line-height: 1.1;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.52s ease 0.38s, transform 0.52s ease 0.38s;
        }
        .shop-hero.hero-scrolled .hero-line-sm {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-line-lg {
          font-family: 'Fraunces', serif;
          font-size: clamp(3rem, 5.4vw, 4.75rem);
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.04em;
          line-height: 0.95;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.55s ease 0.44s, transform 0.55s ease 0.44s;
        }
        .shop-hero.hero-scrolled .hero-line-lg {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-line-lg .coral {
          color: var(--coral);
        }
        .hero-line-trail {
          font-family: 'Fraunces', serif;
          font-size: 1.55rem;
          font-weight: 300;
          font-style: italic;
          color: var(--muted);
          letter-spacing: -0.01em;
          margin-top: 5px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.52s ease 0.50s, transform 0.52s ease 0.50s;
        }
        .shop-hero.hero-scrolled .hero-line-trail {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-sub {
          font-size: 0.93rem;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.8;
          max-width: 400px;
          margin: 0 auto;  
          text-align: center; 
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease 0.56s, transform 0.5s ease 0.56s;
        }
        .shop-hero.hero-scrolled .hero-sub {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-ctas {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease 0.62s, transform 0.5s ease 0.62s;
        }
        .shop-hero.hero-scrolled .hero-ctas {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
        }
        .hero-cta-primary:hover {
          background: #2e2e2e;
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(30, 30, 30, 0.22);
        }

        .hero-stats {
          display: flex;
          align-items: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease 0.68s, transform 0.5s ease 0.68s;
        }
        .shop-hero.hero-scrolled .hero-stats {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 20px;
        }
        .hero-stat:first-child {
          padding-left: 0;
        }
        .hero-stat-val {
          font-family: 'Fraunces', serif;
          font-size: 1.3rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .hero-stat-lbl {
          font-size: 0.7rem;
          font-weight: 400;
          color: var(--muted);
        }
        .hero-stat-div {
          width: 1px;
          height: 32px;
          background: var(--border);
          flex-shrink: 0;
        }

        .hero-right-img-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 340px;
        }

        /* ------------------------------------------------------------
           CATEGORIES SECTION
        ------------------------------------------------------------ */
        .shop-cats-section {
          padding: 36px 32px 16px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .shop-cats-title {
          font-family: 'Fraunces', serif;
          font-size: 1.1rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.01em;
          margin-bottom: 14px;
        }
        .shop-cats-grid {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }
        .shop-cat-card {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 15px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: #fff;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          opacity: 0;
          animation: catIn 0.45s ease forwards;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s, background 0.18s;
        }
        .shop-cat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(30, 20, 10, 0.09);
          border-color: rgba(255, 126, 107, 0.38);
        }
        .shop-cat-card.selected {
          border-color: var(--coral);
          background: #fff8f5;
        }
        .shop-cat-card.selected .cat-label {
          color: var(--coral);
        }
        @keyframes catIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cat-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cat-label {
          font-size: 0.83rem;
          font-weight: 500;
          color: var(--charcoal);
          white-space: nowrap;
        }

        /* ------------------------------------------------------------
          CONTROLS (SEARCH + COUNT)
        ------------------------------------------------------------ */
        .shop-controls {
          position: relative;
          /* Adjust this width (e.g., 600px or 800px) to control how big the frame is on screen */
          width: 100%;
          max-width: 700px; 
          margin: 40px auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .shop-controls-img {
          width: 80%;
          height: 50vh; /* Maintains the 5000x5000 square proportion */
          display: block;
          pointer-events: none;
          z-index: 1;
          backgound: background: rgba(255, 250, 245, 0.93);
        }

        /* This pins the search bar inside the image gap */
        .search-wrapper {
          position: absolute;
          z-index: 2;
          /* 2650px (center of your gap) / 5000px total height = 53% */
          top: 53%; 
          left: 50%;
          transform: translate(-50%, -50%); 
          width: 82%; /* Adjust this to fit the width of the gap in your image */
          max-width: 720px;
          display: flex;
          align-items: center;
        }

        .shop-search {
          width: 100%;
          padding: 8px 90px 8px 48px;  
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;    
          color: var(--charcoal);
          background: rgba(255, 255, 255, 0.95); /* Slightly more opaque for readability */
          backdrop-filter: blur(8px);
          border: 1.5px solid var(--border);
          border-radius: 20px; 
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;

          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='%23c0b8b0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 20px center; 
        }

        .shop-search:focus {
          border-color: var(--coral);
          box-shadow: 0 0 0 3px rgba(255, 126, 107, 0.12);
        }

        .shop-count {
          position: absolute;
          right: 18px;
          font-size: 0.75rem;
          color: var(--muted);
          font-weight: 400;
          white-space: nowrap;
          pointer-events: none;
        }

        /* ------------------------------------------------------------
           PRODUCT GRID & CARDS
        ------------------------------------------------------------ */
        .shop-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px 72px;
        }
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
          gap: 20px;
        }
        .product-card {
          background: var(--card-bg);
          border-radius: 18px;
          overflow: hidden;
          border: 1.5px solid var(--border);
          opacity: 0;
          animation: cardIn 0.45s ease forwards;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.2s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(30, 20, 10, 0.10);
          border-color: #e0d8d0;
        }
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Card image area */
        .card-img-wrap {
          position: relative;
          height: 198px;
          background: linear-gradient(135deg, #fff8f4, #fde8f5);
          overflow: hidden;
          cursor: pointer;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .product-card:hover .card-img {
          transform: scale(1.04);
        }
        .card-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e0c8d8;
          transition: color 0.2s;
        }
        .product-card:hover .card-img-placeholder {
          color: rgba(255, 126, 107, 0.5);
        }
        .card-oos-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 250, 245, 0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.73rem;
          font-weight: 600;
          color: var(--muted);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          backdrop-filter: blur(2px);
        }
        .card-view-hint {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(20, 12, 6, 0.66);
          color: #fff;
          font-size: 0.67rem;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 100px;
          opacity: 0;
          transition: opacity 0.2s;
          white-space: nowrap;
          backdrop-filter: blur(4px);
          letter-spacing: 0.04em;
          pointer-events: none;
        }
        .card-img-wrap:hover .card-view-hint {
          opacity: 1;
        }
        .card-cat-tag {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 250, 245, 0.92);
          backdrop-filter: blur(4px);
          border: 1px solid var(--border);
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 3px 9px;
          border-radius: 100px;
        }

        /* Card body */
        .card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .card-name {
          font-family: 'Fraunces', serif;
          font-size: 1.05rem;
          font-weight: 400;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.01em;
          line-height: 1.25;
          cursor: pointer;
          transition: color 0.16s;
        }
        .card-name:hover {
          color: var(--coral);
        }
        .card-desc {
          font-size: 0.77rem;
          color: var(--muted);
          font-weight: 300;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-footer {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: 4px;
        }
        .card-price {
          font-family: 'Fraunces', serif;
          font-size: 1.18rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.01em;
        }
        .card-price-curr {
          font-family: 'Outfit', sans-serif;
          font-size: 0.7rem;
          font-weight: 300;
          color: var(--muted);
          margin-left: 3px;
        }
        .card-stock {
          font-size: 0.7rem;
          color: #c0b8b0;
          font-weight: 300;
        }
        .card-stock.low {
          color: var(--coral);
          font-weight: 500;
        }

        /* Add to cart button */
        .card-btn {
          width: 100%;
          padding: 11px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 11px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.2s, transform 0.12s, box-shadow 0.18s;
          position: relative;
          overflow: hidden;
        }
        .card-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
          transition: left 0.45s;
        }
        .card-btn:hover:not(:disabled)::after {
          left: 160%;
        }
        .card-btn:hover:not(:disabled) {
          background: #2e2e2e;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(30, 30, 30, 0.18);
        }
        .card-btn:disabled {
          background: #ede6de;
          color: #c0b8b0;
          cursor: not-allowed;
        }
        .card-btn.success {
          background: #5aad5e;
        }
        .card-btn.adding {
          opacity: 0.75;
        }

        /* Empty / loading states */
        .shop-state {
          text-align: center;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .shop-state-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #f5f0ea;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c0b8b0;
          margin-bottom: 4px;
        }
        .shop-spinner {
          width: 36px;
          height: 36px;
          border: 2.5px solid var(--border);
          border-top-color: var(--coral);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .shop-state-title {
          font-family: 'Fraunces', serif;
          font-size: 1.2rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
        }
        .shop-state-sub {
          font-size: 0.82rem;
          color: var(--muted);
          font-weight: 300;
        }

        /* ------------------------------------------------------------
           PRODUCT DETAIL DRAWER (SLIDE-IN)
        ------------------------------------------------------------ */
        .pd-backdrop {
          position: fixed;
          inset: 0;
          z-index: 400;
          background: rgba(30, 20, 10, 0.30);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          opacity: 0;
          transition: opacity 0.28s;
        }
        .pd-backdrop.in {
          opacity: 1;
        }
        .pd-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 401;
          width: min(520px, 100vw);
          background: #fff;
          border-left: 1.5px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Outfit', sans-serif;
          scrollbar-width: none;
          box-shadow: -8px 0 44px rgba(30, 20, 10, 0.11);
        }
        .pd-drawer::-webkit-scrollbar {
          display: none;
        }
        .pd-drawer.in {
          transform: translateX(0);
        }

        /* Drawer header */
        .pd-topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(8px);
          border-bottom: 1.5px solid var(--border);
        }
        .pd-crumb {
          font-size: 0.72rem;
          color: var(--muted);
          font-weight: 300;
        }
        .pd-crumb-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          color: var(--coral);
        }
        .pd-crumb-btn:hover {
          text-decoration: underline;
        }
        .pd-x-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.76rem;
          color: var(--muted);
          background: none;
          border: 1.5px solid var(--border);
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          transition: background 0.16s, color 0.16s, border-color 0.16s;
        }
        .pd-x-btn:hover {
          background: #f5f0ea;
          color: var(--charcoal);
          border-color: #d8d0c8;
        }

        /* Drawer image */
        .pd-img-wrap {
          width: 100%;
          height: 300px;
          background: linear-gradient(135deg, #fff0ea, #fde8f5);
          overflow: hidden;
          flex-shrink: 0;
        }
        .pd-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .pd-img-wrap:hover .pd-img {
          transform: scale(1.04);
        }
        .pd-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e0c8d8;
        }

        /* Drawer content */
        .pd-body {
          padding: 28px 28px 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .pd-cat-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--mint);
          color: #3a7d44;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 11px;
          border-radius: 100px;
          width: fit-content;
        }
        .pd-name {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 300;
          font-style: italic;
          color: var(--charcoal);
          letter-spacing: -0.02em;
          line-height: 1.15;
        }
        .pd-desc {
          font-size: 0.88rem;
          color: var(--muted);
          font-weight: 300;
          line-height: 1.72;
        }
        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .pd-price {
          font-family: 'Fraunces', serif;
          font-size: 1.7rem;
          font-weight: 500;
          color: var(--charcoal);
          letter-spacing: -0.02em;
        }
        .pd-price-curr {
          font-size: 0.78rem;
          font-weight: 300;
          color: var(--muted);
        }
        .pd-stock {
          font-size: 0.75rem;
          font-weight: 400;
          padding: 5px 12px;
          border-radius: 100px;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          width: fit-content;
        }
        .pd-stock.in {
          color: #3a7d44;
          background: #f0faf0;
          border-color: #b8e0b8;
        }
        .pd-stock.low {
          color: #b85c00;
          background: #fff3e0;
          border-color: #f0cc90;
        }
        .pd-stock.out {
          color: var(--muted);
          background: #f5f0ea;
          border-color: var(--border);
        }
        .pd-stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Quantity selector */
        .pd-qty-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pd-qty-label {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #c0b8b0;
        }
        .pd-qty-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pd-qty-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--charcoal);
          transition: border-color 0.16s, background 0.16s;
        }
        .pd-qty-btn:hover:not(:disabled) {
          border-color: var(--charcoal);
          background: #faf6f1;
        }
        .pd-qty-btn:disabled {
          opacity: 0.28;
          cursor: not-allowed;
        }
        .pd-qty-val {
          font-family: 'Fraunces', serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: var(--charcoal);
          min-width: 28px;
          text-align: center;
        }

        /* Drawer add to cart button */
        .pd-add-btn {
          width: 100%;
          padding: 15px;
          background: var(--charcoal);
          color: var(--cream);
          border: none;
          border-radius: 13px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .pd-add-btn:hover:not(:disabled) {
          background: #2e2e2e;
          box-shadow: 0 6px 20px rgba(30, 30, 30, 0.2);
          transform: translateY(-1px);
        }
        .pd-add-btn.success {
          background: #5aad5e;
        }
        .pd-add-btn:disabled {
          background: #d8d0c8;
          color: #b0a89e;
          cursor: not-allowed;
        }
        .pd-add-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
          transition: left 0.45s;
        }
        .pd-add-btn:hover:not(:disabled)::after {
          left: 160%;
        }

        /* ------------------------------------------------------------
           RESPONSIVE BREAKPOINTS
        ------------------------------------------------------------ */
        @media (max-width: 820px) {
          .hero-inner {
            grid-template-columns: 1fr;
          }
          .hero-right-img-slot {
            display: none;
          }
          .hero-content-layer {
            padding: 0 16px;
          }
        }

        @media (max-width: 640px) {
          .shop-hero {
            height: 360px;
          }
          .hero-mosaic-grid {
            grid-template-columns: 52% 1fr;
            grid-template-rows: repeat(3, 1fr);
          }
          .mosaic-main {
            grid-row: 1 / 4;
          }
          .shop-main,
          .shop-cats-section,
          .shop-controls {
            padding-left: 16px;
            padding-right: 16px;
          }
          .shop-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 14px;
          }
        }
      `}</style>

      <div className="shop-page">

        {/* ═══ HERO ═══ */}
        <section className={`shop-hero${heroScrolled ? ' hero-scrolled' : ''}`}>

          {/* Layer 0 — vertical color strips (visible after scroll) */}
          <div className="hero-strips-bg">
            {STRIP_COLORS.map((c, i) => (
              <div key={i} className="hero-strip-bg" style={{ background: c }} />
            ))}
          </div>

          {/* Ambient blobs for text state */}
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />

          {/* Layer 1 — mosaic grid (slides up and fades out on scroll) */}
          <div className="hero-mosaic-overlay">
            <div className="hero-mosaic-grid">

              {/* Big left panel (coral) */}
              <div className="mosaic-main" style={{ background: MOSAIC_COLORS.main }}>
                <img
                  id='coral-img'
                  src={coralImg}
                  alt=""
                  className="mosaic-img mosaic-main-img"
                />
                <div className="hero-eyebrow">
                  <span className="hero-eyebrow-dot" />
                  Spring Collection 2026
                </div>
                <h2 className="mosaic-title">Soft moments,</h2>
                <h2 className="mosaic-title">thoughtfully arranged</h2>
                <br />
                <p className="mosaic-sub">
                  There’s something about flowers,
                  <br />
                  how they arrive and fade so gently.
                  Not everything is meant to last, but it can still leave something behind.
                  Soft textures, subtle colors, and moments that feel almost still.
                  A collection shaped by presence, not permanence.
                </p>
                <br />
                <button
                  className="hero-cta-primary"
                  onClick={() =>
                    document.getElementById('shop-anchor')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                  style={{
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '10px',
                    width: 'fit-content',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  Discover More →
                </button>
              </div>

              {/* Top-center (green → Bouquets) */}
              <div className="mosaic-sm" style={{ background: MOSAIC_COLORS.sm1 }}>
                <img
                  id='green-img'
                  src={greenImg}
                  alt=""
                  className="mosaic-img mosaic-sm-img"
                />
                <p className="mosaic-eyebrow">Bouquets</p>
                <h3 className="mosaic-title">Thoughtfully<br />arranged blooms</h3>
                <p className="mosaic-sub">For gestures that feel personal and effortless.</p>
              </div>

              {/* Top-right (lavender → Plants) */}
              <div className="mosaic-sm" style={{ background: MOSAIC_COLORS.sm2 }}>
                <img
                  id='lavender-img'
                  src={lavenderImg}
                  alt=""
                  className="mosaic-img mosaic-sm-img"
                />
                <p className="mosaic-eyebrow">Potted plants</p>
                <h3 className="mosaic-title">A touch of green<br />that lasts</h3>
                <p className="mosaic-sub">Simple, calm, and made to stay with you.</p>
              </div>

              {/* Bottom-center (yellow → Seasonal) */}
              <div className="mosaic-sm" style={{ background: MOSAIC_COLORS.sm3 }}>
                <img
                  id='yellow-img'
                  src={yellowImg}
                  alt=""
                  className="mosaic-img mosaic-sm-img"
                />
                <p className="mosaic-eyebrow">Seasonal</p>
                <h3 className="mosaic-title">Inspired by<br />the moment</h3>
                <p className="mosaic-sub">Curated pieces that reflect the current season.</p>
              </div>

              {/* Bottom-right (blue → Gifts) */}
              <div className="mosaic-sm" style={{ background: MOSAIC_COLORS.sm4 }}>
                <img
                  id='blue-img'
                  src={blueImg}
                  alt=""
                  className="mosaic-img mosaic-sm-img"
                />
                <p className="mosaic-eyebrow">Gift sets</p>
                <h3 className="mosaic-title">More than<br />just flowers</h3>
                <p className="mosaic-sub">Small details that make a lasting impression.</p>
              </div>

            </div>
          </div>

          {/* Layer 2 — hero text content (scroll-revealed, staggered) */}
          <div className="hero-content-layer">
            <img src={main1Img} alt="" className="hero-img-main1" />
            <img src={main2Img} alt="" className="hero-img-main2" />
            <div className="hero-inner">
              <div className="hero-left">
                <div className="hero-eyebrow">
                  <span className="hero-eyebrow-dot" />
                  Spring Collection 2026
                </div>

                <div className="hero-headline">
                  <span className="hero-line-sm">handpicked with love</span>
                  <span className="hero-line-lg">
                    every <span className="coral">bloom</span>
                  </span>
                  <span className="hero-line-trail">tells a story</span>
                </div>

                <p className="hero-sub">
                  Fresh flowers, thoughtfully arranged and delivered to your door.
                  Find the perfect bloom for every occasion.
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* ═══ CATEGORIES ═══ */}
        {categories.length > 0 && (
          <section className="shop-cats-section">
            <p className="shop-cats-title">Browse by category</p>
            <div className="shop-cats-grid">
              <button
                className={`shop-cat-card${selectedCategory === null ? ' selected' : ''}`}
                style={{ animationDelay: '0ms' }}
                onClick={() => setSelectedCategory(null)}
              >
                <div className="cat-icon-box" style={{ background: '#f5f0ea' }}>
                  <Leaf size={15} strokeWidth={2} style={{ color: 'var(--muted)' }} />
                </div>
                <span className="cat-label">All flowers</span>
              </button>
              {categories.map((cat, i) => {
                const p = CAT_PALETTES[i % CAT_PALETTES.length];
                return (
                  <button
                    key={cat.id}
                    className={`shop-cat-card${selectedCategory === cat.id ? ' selected' : ''}`}
                    style={{ animationDelay: `${(i + 1) * 55}ms` }}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  >
                    <div className="cat-icon-box" style={{ background: p.bg }}>
                      <Flower2 size={15} strokeWidth={1.8} style={{ color: p.iconClr }} />
                    </div>
                    <span className="cat-label">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ SEARCH ═══ */}
        <div className="shop-controls" id="shop-anchor">
          <img
            src={barImg}
            alt=""
            className='shop-controls-img'
          />
          <div className="search-wrapper">
            <input
              className="shop-search"
              placeholder="Search flowers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {!loading && (
              <span className="shop-count">
                <strong>{filtered.length}</strong>{' '}
                {filtered.length === 1 ? 'flower' : 'flowers'}
              </span>
            )}
          </div>
        </div>

        {/* ═══ PRODUCT GRID ═══ */}
        <main className="shop-main">
          {loading ? (
            <div className="shop-state">
              <div className="shop-spinner" />
              <p className="shop-state-title">Gathering the blooms…</p>
              <p className="shop-state-sub">Just a moment</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="shop-state">
              <div className="shop-state-icon"><Leaf size={24} strokeWidth={1.5} /></div>
              <p className="shop-state-title">No flowers found</p>
              <p className="shop-state-sub">Try a different search or category</p>
            </div>
          ) : (
            <div className="shop-grid">
              {filtered.map((product, idx) => {
                const isAdding = addingId === product.id;
                const isSuccess = successId === product.id;
                const isOos = product.stock === 0;
                const isLow = product.stock > 0 && product.stock <= 5;
                return (
                  <div key={product.id} className="product-card" style={{ animationDelay: `${idx * 45}ms` }}>
                    <div className="card-img-wrap" onClick={() => !isOos && openProduct(product)}>
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="card-img" />
                        : <div className="card-img-placeholder"><Flower2 size={52} strokeWidth={1.2} /></div>
                      }
                      {isOos && <div className="card-oos-overlay">Out of stock</div>}
                      {!isOos && <div className="card-view-hint">View details</div>}
                      <span className="card-cat-tag">{product.category_name}</span>
                    </div>
                    <div className="card-body">
                      <h3 className="card-name" onClick={() => !isOos && openProduct(product)}>
                        {product.name}
                      </h3>
                      <p className="card-desc">{product.description}</p>
                      <div className="card-footer">
                        <span className="card-price">
                          {Number(product.price).toLocaleString()}
                          <span className="card-price-curr">DZD</span>
                        </span>
                        {!isOos && (
                          <span className={`card-stock${isLow ? ' low' : ''}`}>
                            {isLow ? `Only ${product.stock} left` : `${product.stock} in stock`}
                          </span>
                        )}
                      </div>
                      <button
                        className={`card-btn${isSuccess ? ' success' : ''}${isAdding ? ' adding' : ''}`}
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isOos || isAdding}
                      >
                        {isSuccess
                          ? <><Check size={15} strokeWidth={2.5} /> Added</>
                          : isAdding
                            ? <><Loader2 size={15} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> Adding…</>
                            : <><ShoppingCart size={15} strokeWidth={2} /> Add to cart</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ═══ INLINE PRODUCT DRAWER ═══ */}
      {selectedProduct && (
        <>
          <div className={`pd-backdrop${drawerVisible ? ' in' : ''}`} onClick={closeProduct} />
          <div className={`pd-drawer${drawerVisible ? ' in' : ''}`}>
            <div className="pd-topbar">
              <span className="pd-crumb">
                <button className="pd-crumb-btn" onClick={closeProduct}>Shop</button>
                {' / '}{selectedProduct.name}
              </span>
              <button className="pd-x-btn" onClick={closeProduct}>
                <X size={13} strokeWidth={2.5} /> Close
              </button>
            </div>
            <div className="pd-img-wrap">
              {selectedProduct.image_url
                ? <img src={selectedProduct.image_url} alt={selectedProduct.name} className="pd-img" />
                : <div className="pd-img-placeholder"><Flower2 size={88} strokeWidth={1.1} /></div>
              }
            </div>
            <div className="pd-body">
              <span className="pd-cat-tag">{selectedProduct.category_name}</span>
              <h1 className="pd-name">{selectedProduct.name}</h1>
              <p className="pd-desc">{selectedProduct.description || 'A beautiful handpicked flower, freshly arranged for you.'}</p>
              <div className="pd-price-row">
                <span className="pd-price">{Number(selectedProduct.price).toLocaleString()}</span>
                <span className="pd-price-curr">DZD</span>
              </div>
              {selectedProduct.stock === 0 ? (
                <span className="pd-stock out"><span className="pd-stock-dot" /> Out of stock</span>
              ) : selectedProduct.stock <= 5 ? (
                <span className="pd-stock low"><span className="pd-stock-dot" /> Only {selectedProduct.stock} left</span>
              ) : (
                <span className="pd-stock in"><span className="pd-stock-dot" /> {selectedProduct.stock} in stock</span>
              )}
              {selectedProduct.stock > 0 && (
                <div className="pd-qty-section">
                  <span className="pd-qty-label">Quantity</span>
                  <div className="pd-qty-row">
                    <button className="pd-qty-btn" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="pd-qty-val">{qty}</span>
                    <button className="pd-qty-btn" disabled={qty >= selectedProduct.stock} onClick={() => setQty((q) => Math.min(selectedProduct.stock, q + 1))} aria-label="Increase">
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}
              <button
                className={`pd-add-btn${detailSuccess ? ' success' : ''}`}
                onClick={handleDetailAdd}
                disabled={selectedProduct.stock === 0 || detailAdding}
              >
                {detailSuccess ? (
                  <><Check size={16} strokeWidth={2.5} /> Added to cart</>
                ) : detailAdding ? (
                  <><Loader2 size={16} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> Adding…</>
                ) : (
                  <><ShoppingCart size={16} strokeWidth={2} /> Add {qty > 1 ? `${qty} ` : ''}to cart</>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}