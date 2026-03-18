/* ==========================================
   Boutique Femenina — Main App
   Loads products from static data.js
   Cart, WhatsApp, Size Selection, Nav
   ========================================== */

const WHATSAPP = '59169113130';

// Typical sizes for each category
const SIZES = {
  mules: ['34', '35', '36', '37', '38', '39', '40'],
  rasteiras: ['33', '34', '35', '36', '37', '38', '39', '40'],
  sapatilhas: ['33', '34', '35', '36', '37', '38', '39', '40'],
  sandalias: ['33', '34', '35', '36', '37', '38', '39', '40'],
  scarpin: ['33', '34', '35', '36', '37', '38', '39', '40'],
  tamancos: ['33', '34', '35', '36', '37', '38', '39', '40'],
};

// Map sheet CATEGORIA → internal cat key
const CAT_MAP = {
  'mule': 'mules',
  'mules': 'mules',
  'sandalia plana': 'rasteiras',
  'rasteira': 'rasteiras',
  'rasteiras': 'rasteiras',
  'sandalia casual': 'rasteiras',
  'sapatilha': 'sapatilhas',
  'sapatilhas': 'sapatilhas',
  'bailarina': 'sapatilhas',
  'zuecos': 'tamancos',
  'zueco': 'tamancos',
  'tamanco': 'tamancos',
  'tamancos': 'tamancos',
  'sandalia con tacon': 'sandalias',
  'sandalia': 'sandalias',
  'sandalias': 'sandalias',
  'scarpin': 'scarpin',
  'scarpins': 'scarpin',
  'tacón': 'scarpin',
  'tacon': 'scarpin',
  'otros': 'sapatilhas'
};

// Subcategories to extract from product names
// Order matters: more specific keywords first, broader ones last
const SUBCAT_KEYWORDS = [
  { key: 'anabela', label: 'Anabela' },
  { key: 'flatform', label: 'Flatform' },
  { key: 'meia pata', label: 'Meia Pata' },
  { key: 'plataforma', label: 'Plataforma' },
  { key: 'papete', label: 'Papete' },
  { key: 'slingback', label: 'Slingback' },
  { key: 'boneca', label: 'Boneca' },
  { key: 'espadrille', label: 'Espadrille' },
  { key: 'salto fino', label: 'Salto Fino' },
  { key: 'salto bloco', label: 'Salto Bloco' },
  { key: 'salto grosso', label: 'Salto Grosso' },
  { key: 'salto geometrico', label: 'Salto Geométrico' },
  { key: 'salto geom', label: 'Salto Geométrico' },
  { key: 'salto flare', label: 'Salto Flare' },
  { key: 'salto taca', label: 'Salto Taça' },
  { key: 'salto taça', label: 'Salto Taça' },
  { key: 'salto medio', label: 'Salto Medio' },
  { key: 'salto alto', label: 'Salto Alto' },
  { key: 'salto', label: 'Salto' },
  { key: 'amarra', label: 'Amarração' },
  { key: 'rasteira', label: 'Rasteira' },
];

// Subcategories to skip per main category (redundant)
const SKIP_SUB_FOR_CAT = {
  mules: ['Mule'],
  rasteiras: ['Rasteira'],
};

// Minimum items to form a subcategory (otherwise merged into Clásicos)
const MIN_SUBCAT_SIZE = 4;

function parseSubcategory(name, mainCat) {
  if (!name) return 'Clásicos';
  const lower = name.toLowerCase();
  const skipList = SKIP_SUB_FOR_CAT[mainCat] || [];
  for (const sub of SUBCAT_KEYWORDS) {
    if (lower.includes(sub.key)) {
      if (skipList.includes(sub.label)) continue;
      return sub.label;
    }
  }
  return 'Clásicos';
}

// ── FORMAT ───────────────────────────────
function formatBs(n) {
  return 'Bs ' + Number(n).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── FIX ENCODING ────────────────────────
function fixEncoding(str) {
  if (!str) return '';
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
}

// ── WHATSAPP HELPERS ─────────────────────
function singleWA(p, size) {
  const sizeStr = size ? `Talla: *${size}*\n` : 'Talla: ___\n';
  const name = fixEncoding(p.name);
  const msg = `Hola! Me interesa este calzado de la Boutique:\n\n✨ *${name}*\nRef: ${p.sku}\n${sizeStr}Valor: *${formatBs(p.price)}*\n\n¿Tienen disponibilidad?`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function cartWA(items) {
  let msg = '¡Hola Boutique Femenina! Quiero completar este pedido:\n\n';
  items.forEach((item, i) => {
    const name = fixEncoding(item.name);
    msg += `0${i + 1}. ✨ *${name}*\n   Ref: ${item.sku} | Talla: *${item.size || '___'}* | ${formatBs(item.price)}\n\n`;
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
  const name = fixEncoding(p.name);
  const origPrice = formatBs(Math.ceil(p.price * 1.20));

  return `
    <div class="product-card" data-sku="${p.sku}">
      <div class="product-img-wrap">
        <img
          class="product-img" loading="lazy"
          src="${p.img}"
          alt="${name.replace(/"/g, '&quot;')}"
          onerror="this.onerror=null;this.src='https://placehold.co/400x400/F5EDE4/C9A092?text=Boutique+Femenina';"
        />
      </div>
      <div class="product-body">
        <h3 class="product-name">${name} <span style="font-size: 0.75rem; color: var(--muted); font-weight: 500; margin-left: 4px;">(${p.sku})</span></h3>
        <div class="size-selector">
          <span class="size-label">Seleccione Talla</span>
          <select class="size-select" id="size-${p.sku}" aria-label="Talla">
            <option value="">— Elija su talla —</option>
            ${sizeOptions}
          </select>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatBs(p.price)}</span>
          <span class="product-price-orig">${origPrice}</span>
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
  const grouped = { mules: {}, rasteiras: {}, sapatilhas: {}, sandalias: {}, scarpin: {}, tamancos: {} };
  productsArray.forEach(p => {
    let mainCat = CAT_MAP[(p.cat || '').trim().toLowerCase()];
    if (!mainCat) {
      const n = (p.name || '').toLowerCase();
      if (n.includes('scarpin')) mainCat = 'scarpin';
      else if (n.includes('mule')) mainCat = 'mules';
      else if (n.includes('rasteira')) mainCat = 'rasteiras';
      else if (n.includes('sapatilha')) mainCat = 'sapatilhas';
      else if (n.includes('tamanco')) mainCat = 'tamancos';
      else mainCat = 'sandalias';
    }

    const subCat = parseSubcategory(p.name, mainCat);

    if (grouped[mainCat]) {
      if (!grouped[mainCat][subCat]) {
        grouped[mainCat][subCat] = [];
      }
      p.subCat = subCat;
      grouped[mainCat][subCat].push(p);
    }
  });
  return grouped;
}

let navBuilt = false; // State to track dynamic nav building

function renderAll(filterText = '') {
  const data = typeof STORE_DATA !== 'undefined' ? STORE_DATA : (window.STORE_DATA || []);

  const lowerFilter = filterText.toLowerCase().trim();
  const filteredData = lowerFilter
    ? data.filter(p =>
      (p.name && p.name.toLowerCase().includes(lowerFilter)) ||
      (p.sku && p.sku.toLowerCase().includes(lowerFilter))
    )
    : data;

  allProcessedProducts = distributeProducts(filteredData);

  if (!navBuilt && filterText === '') {
    buildNavDropdowns();
    navBuilt = true;
  }

  const grids = {
    sandalias: 'grid-sandalias',
    rasteiras: 'grid-rasteiras',
    mules: 'grid-mules',
    sapatilhas: 'grid-sapatilhas',
    scarpin: 'grid-scarpin',
    tamancos: 'grid-tamancos',
  };

  let hasAnyMatches = false;

  Object.entries(grids).forEach(([cat, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const subCatsObj = allProcessedProducts[cat] || {};
    const itemsCount = Object.values(subCatsObj).reduce((sum, arr) => sum + arr.length, 0);

    const sectionEl = el.closest('.category-section');
    if (lowerFilter && itemsCount === 0) {
      if (sectionEl) sectionEl.style.display = 'none';
      return;
    } else if (!lowerFilter && itemsCount === 0) {
      if (sectionEl) sectionEl.style.display = 'block';
    } else {
      if (sectionEl) sectionEl.style.display = 'block';
      hasAnyMatches = true;
    }

    // Merge tiny subcategories into Clásicos
    const merged = {};
    Object.entries(subCatsObj).forEach(([sub, items]) => {
      if (sub !== 'Clásicos' && items.length < MIN_SUBCAT_SIZE) {
        if (!merged['Clásicos']) merged['Clásicos'] = [];
        merged['Clásicos'].push(...items);
      } else {
        if (!merged[sub]) merged[sub] = [];
        merged[sub].push(...items);
      }
    });

    let html = '';
    const sortedSubCats = Object.keys(merged).sort((a, b) => {
      if (a === 'Clásicos') return 1;
      if (b === 'Clásicos') return -1;
      return a.localeCompare(b);
    });

    sortedSubCats.forEach(sub => {
      const chunkHtml = merged[sub].map(renderCard).join('');
      const subId = `${cat}-${sub.replace(/\\s+/g, '-').toLowerCase()}`;
      html += `
         <div class="subcategory-group" id="${subId}">
           <h3 class="subcategory-title">${sub}</h3>
           <div class="products-grid">
             ${chunkHtml}
           </div>
         </div>
       `;
    });

    if (html !== '') {
      el.className = 'category-content';
      el.innerHTML = html;
    } else {
      el.className = 'products-grid';
      el.innerHTML = '<div class="loading-products" style="color:var(--muted)">Sin disponibilidad momentánea.</div>';
    }
  });

  if (lowerFilter && !hasAnyMatches) {
    const lastGrid = document.getElementById(grids['sandalias']);
    if (lastGrid) {
      lastGrid.parentElement.style.display = 'block';
      lastGrid.className = 'products-grid';
      lastGrid.innerHTML = `<div class="loading-products" style="color:var(--muted); padding: 2rem; grid-column: 1/-1">No se encontraron productos para "${filterText}".</div>`;
    }
  }
}

// ── GET PRODUCT BY SKU ───────────────────
function getProduct(sku) {
  for (const subCatsObj of Object.values(allProcessedProducts)) {
    for (const list of Object.values(subCatsObj)) {
      const p = list.find(x => x.sku === sku);
      if (p) return p;
    }
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

  itemsEl.innerHTML = cart.map(item => {
    const name = fixEncoding(item.name);
    return `
    <div class="cart-item">
      <img src="${item.img}" alt="${name.replace(/"/g, '&quot;')}" onerror="this.src='https://placehold.co/60x60/F5EDE4/C9A092?text=+';" />
      <div class="cart-item-info">
        <div class="cart-item-name">${name}</div>
        <div class="cart-item-size">Talla: ${item.size}</div>
        <div class="cart-item-price">${formatBs(item.price)}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `}).join('');

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

// ── NAV ACTIONS & SCROLL SPY ───────────────────────
function buildNavDropdowns() {
  const navCats = [
    { id: 'sandalias', label: 'Sandalias' },
    { id: 'rasteiras', label: 'Rasteiras' },
    { id: 'mules', label: 'Mules' },
    { id: 'sapatilhas', label: 'Sapatilhas' },
    { id: 'scarpin', label: 'Scarpin' },
    { id: 'tamancos', label: 'Tamancos' }
  ];

  const navEl = document.getElementById('navCategories');
  if (!navEl) return;

  let html = '';
  navCats.forEach(catInfo => {
    const subCatsObj = allProcessedProducts[catInfo.id] || {};
    // Apply same merging logic as grid rendering
    const merged = {};
    Object.entries(subCatsObj).forEach(([sub, items]) => {
      if (sub !== 'Clásicos' && items.length < MIN_SUBCAT_SIZE) {
        if (!merged['Clásicos']) merged['Clásicos'] = [];
        merged['Clásicos'].push(...items);
      } else {
        if (!merged[sub]) merged[sub] = [];
        merged[sub].push(...items);
      }
    });
    const subCats = Object.keys(merged).sort((a, b) => {
      if (a === 'Clásicos') return 1;
      if (b === 'Clásicos') return -1;
      return a.localeCompare(b);
    });

    if (subCats.length > 1) {
      let dropdownHtml = '<div class="nav-dropdown">';
      subCats.forEach(sub => {
        const subId = `${catInfo.id}-${sub.replace(/\\s+/g, '-').toLowerCase()}`;
        dropdownHtml += `<a href="#${catInfo.id}" class="nav-dropdown-link" onclick="scrollToSubcat(event, '${catInfo.id}', '${subId}')">${sub}</a>`;
      });
      dropdownHtml += '</div>';

      html += `
            <div class="nav-item has-dropdown">
                <a href="#${catInfo.id}" class="nav-link" data-cat="${catInfo.id}">${catInfo.label}</a>
                ${dropdownHtml}
            </div>
            `;
    } else {
      html += `
            <div class="nav-item">
                <a href="#${catInfo.id}" class="nav-link" data-cat="${catInfo.id}">${catInfo.label}</a>
            </div>
            `;
    }
  });

  navEl.innerHTML = html;
}

window.scrollToSubcat = function (e, catId, subId) {
  e.preventDefault();
  const section = document.getElementById(catId);
  let target = document.getElementById(subId);
  if (!target) target = section;
  if (target) {
    const y = target.getBoundingClientRect().top + window.scrollY - 180;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

function updateNav() {
  const cats = ['sandalias', 'rasteiras', 'mules', 'sapatilhas', 'scarpin', 'tamancos'];
  let active = cats[0];
  const y = window.scrollY + 200;
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

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderAll(e.target.value);
    });
  }

  // Use the local static data generated
  if (typeof STORE_DATA !== 'undefined' || window.STORE_DATA) {
    renderAll();
  } else {
    console.error("STORE_DATA not found. Please run the build script.");
  }
}

document.addEventListener('DOMContentLoaded', init);
