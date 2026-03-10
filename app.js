/* ==========================================
   Boutique Femenina — Main App
   Loads products from static data.js
   Cart, WhatsApp, Size Selection, Nav
   ========================================== */

const WHATSAPP = '59169113130';

// Typical sizes for each category
const SIZES = {
  mules: ['34', '35', '36', '37', '38', '39', '40'],
  peeptoe: ['34', '35', '36', '37', '38', '39', '40'],
  rasteiras: ['33', '34', '35', '36', '37', '38', '39', '40'],
  sapatilhas: ['33', '34', '35', '36', '37', '38', '39', '40'],
  sandalias: ['33', '34', '35', '36', '37', '38', '39', '40'],
  scarpin: ['33', '34', '35', '36', '37', '38', '39', '40'],
  tamancos: ['33', '34', '35', '36', '37', '38', '39', '40'],
};

// Map sheet CATEGORIA → internal cat key
const CAT_MAP = {
  'mule': 'mules',
  'sandalia plana': 'rasteiras',
  'sapatilha': 'sapatilhas',
  'zuecos': 'tamancos',
  'sandalia con tacon': 'sandalias',
  'peep toe': 'peeptoe',
  'scarpin': 'scarpin',
};

// ── FORMAT ───────────────────────────────
function formatBs(n) {
  return 'Bs ' + Number(n).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── WHATSAPP HELPERS ─────────────────────
function singleWA(p, size) {
  const sizeStr = size ? `Talla: *${size}*\n` : 'Talla: ___\n';
  const msg = `Hola! Me interesa este calzado de la Boutique:\n\n✨ *${p.name}*\nRef: ${p.sku}\n${sizeStr}Valor: *${formatBs(p.price)}*\n\n¿Tienen disponibilidad?`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function cartWA(items) {
  let msg = '¡Hola Boutique Femenina! Quiero completar este pedido:\n\n';
  items.forEach((item, i) => {
    msg += `0${i + 1}. ✨ *${item.name}*\n   Ref: ${item.sku} | Talla: *${item.size || '___'}* | ${formatBs(item.price)}\n\n`;
  });
  const total = items.reduce((s, x) => s + x.price, 0);
  msg += `*Total estimado: ${formatBs(total)}*\n\nQuedo atenta, gracias.`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

// ── RENDER CARD ──────────────────────────
function renderCard(p) {
  const catKey = CAT_MAP[(p.cat || '').toLowerCase()] || 'scarpin';
  const sizes = SIZES[catKey] || SIZES.scarpin;
  const sizeOptions = sizes.map(s => `<option value="${s}">Talla ${s}</option>`).join('');

  return `
    <div class="product-card" data-sku="${p.sku}">
      <div class="product-img-wrap">
        <img
          class="product-img" loading="lazy"
          src="${p.img}"
          alt="${p.name.replace(/"/g, '&quot;')}"
          onerror="this.onerror=null;this.src='https://placehold.co/400x400/F5EDE4/C9A092?text=Boutique+Femenina';"
        />
      </div>
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <div class="size-selector">
          <span class="size-label">Seleccione Talla</span>
          <select class="size-select" id="size-${p.sku}" aria-label="Talla">
            <option value="">— Elija su talla —</option>
            ${sizeOptions}
          </select>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatBs(p.price)}</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn-cart" id="bcart-${p.sku}" onclick="addToCart('${p.sku}')">
           Agregar
        </button>
        <button class="btn-buy" onclick="buyNow('${p.sku}')">
          Solicitar
        </button>
      </div>
    </div>
  `;
}

// ── PROCESS & RENDER GRIDS ───────────────
let allProcessedProducts = {};

function distributeProducts(productsArray) {
  const grouped = { mules: [], peeptoe: [], rasteiras: [], sapatilhas: [], sandalias: [], scarpin: [], tamancos: [] };
  productsArray.forEach(p => {
    const catRaw = (p.cat || '').trim().toLowerCase();
    const key = CAT_MAP[catRaw];
    if (key && grouped[key]) {
      grouped[key].push(p);
    }
  });
  return grouped;
}

function renderAll() {
  allProcessedProducts = distributeProducts(window.STORE_DATA || []);

  const grids = {
    sandalias: 'grid-sandalias',
    rasteiras: 'grid-rasteiras',
    mules: 'grid-mules',
    sapatilhas: 'grid-sapatilhas',
    peeptoe: 'grid-peeptoe',
    scarpin: 'grid-scarpin',
    tamancos: 'grid-tamancos',
  };

  Object.entries(grids).forEach(([cat, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const items = allProcessedProducts[cat] || [];
    if (!items.length) {
      el.innerHTML = '<div class="loading-products" style="color:var(--muted)">Sin disponibilidad momentánea.</div>';
      return;
    }
    el.innerHTML = items.map(renderCard).join('');
  });
}

// ── GET PRODUCT BY SKU ───────────────────
function getProduct(sku) {
  for (const list of Object.values(allProcessedProducts)) {
    const p = list.find(x => x.sku === sku);
    if (p) return p;
  }
  return null;
}

// ── CART STATE ────────────────────────────
let cart = [];

function addToCart(sku) {
  const p = getProduct(sku);
  if (!p) return;

  const sizeEl = document.getElementById('size-' + sku);
  const size = sizeEl ? sizeEl.value : '';

  if (!size) {
    sizeEl && (sizeEl.style.borderColor = 'var(--rose-dark)');
    sizeEl && sizeEl.focus();
    alert('Por favor, seleccione una talla para continuar.');
    return;
  }

  const exists = cart.find(c => c.sku === sku && c.size === size);
  if (!exists) {
    cart.push({ ...p, size, id: sku + '-' + size });
  }

  const btn = document.getElementById('bcart-' + sku);
  if (btn) { btn.textContent = 'Agregado ✓'; btn.classList.add('added'); }

  updateCartUI();
  openCart();
}

function buyNow(sku) {
  const p = getProduct(sku);
  if (!p) return;
  const sizeEl = document.getElementById('size-' + sku);
  const size = sizeEl ? sizeEl.value : '';
  if (!size) {
    sizeEl && sizeEl.focus();
    alert('Por favor, seleccione una talla para continuar.');
    return;
  }
  window.open(singleWA(p, size), '_blank');
}

function removeFromCart(id) {
  const item = cart.find(c => c.id === id);
  cart = cart.filter(c => c.id !== id);

  if (item) {
    const btn = document.getElementById('bcart-' + item.sku);
    const anyLeft = cart.some(c => c.sku === item.sku);
    if (btn && !anyLeft) { btn.textContent = 'Agregar'; btn.classList.remove('added'); }
  }
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = cart.length;
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (!cart.length) {
    itemsEl.innerHTML = '<div class="cart-empty">No hay artículos seleccionados.</div>';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (footerEl) footerEl.style.display = 'flex';
  const total = cart.reduce((s, x) => s + x.price, 0);

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name.replace(/"/g, '&quot;')}" onerror="this.src='https://placehold.co/60x60/F5EDE4/C9A092?text=+';" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">Talla: ${item.size}</div>
        <div class="cart-item-price">${formatBs(item.price)}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `).join('');

  document.getElementById('cartTotal').textContent = formatBs(total);
}

// ── CART OPEN/CLOSE ──────────────────────
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── NAV SCROLL SPY ───────────────────────
function updateNav() {
  const cats = ['sandalias', 'rasteiras', 'mules', 'sapatilhas', 'peeptoe', 'scarpin', 'tamancos'];
  let active = cats[0];
  const y = window.scrollY + 100;
  cats.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= y) active = id;
  });
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.cat === active);
  });
}

// ── INIT ─────────────────────────────────
function init() {
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('btnWhatsappCart').addEventListener('click', () => {
    if (cart.length) window.open(cartWA(cart), '_blank');
  });
  window.addEventListener('scroll', updateNav, { passive: true });

  // Use the local static data generated
  if (window.STORE_DATA) {
    renderAll();
  } else {
    console.error("STORE_DATA not found. Please run the build script.");
  }
}

document.addEventListener('DOMContentLoaded', init);
