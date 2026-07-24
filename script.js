const products = [
  { name: "A2 Fresh Milk", emoji: "🥛", detail: "1L • chilled", price: 72, tag: "HOT", category: "fresh", eta: "8 min", rating: "4.9" },
  { name: "Crunchy Bananas", emoji: "🍌", detail: "6 pcs • sweet", price: 54, tag: "NEW", category: "fresh", eta: "9 min", rating: "4.8" },
  { name: "Green Basket Mix", emoji: "🥬", detail: "Spinach + coriander", price: 39, tag: "15% OFF", category: "fresh", eta: "7 min", rating: "4.7" },
  { name: "Masala Chips", emoji: "🍟", detail: "Party pack", price: 49, tag: "TRENDING", category: "snacks", eta: "6 min", rating: "4.9" },
  { name: "Chocolate Blast", emoji: "🍫", detail: "Midnight craving", price: 99, tag: "BOGO", category: "snacks", eta: "8 min", rating: "4.8" },
  { name: "Mango Madness", emoji: "🥭", detail: "Alphonso box", price: 249, tag: "FRESH", category: "fresh", eta: "10 min", rating: "5.0" },
  { name: "Ice Cream Tub", emoji: "🍦", detail: "Vanilla bean", price: 189, tag: "FAST", category: "snacks", eta: "7 min", rating: "4.9" },
  { name: "Home Clean Kit", emoji: "🧽", detail: "Floor + dish care", price: 229, tag: "VALUE", category: "home", eta: "12 min", rating: "4.6" },
];

const cart = new Map();
let activeFilter = "all";
let searchTerm = "";

const productGrid = document.querySelector("#product-grid");
const cartCount = document.querySelector("#cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");
const checkoutButton = document.querySelector("#checkout-button");
const addressInput = document.querySelector(".location-card input");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function getVisibleProducts() {
  return products.filter((product) => {
    const matchesFilter = activeFilter === "all" || product.category === activeFilter;
    const searchable = `${product.name} ${product.detail} ${product.category}`.toLowerCase();
    return matchesFilter && searchable.includes(searchTerm);
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  emptyState.hidden = visibleProducts.length > 0;
  productGrid.innerHTML = visibleProducts.map((product) => {
    const index = products.indexOf(product);
    return `
      <article class="product-card">
        <span class="sale-tag">${product.tag}</span>
        <div class="product-emoji">${product.emoji}</div>
        <h3>${product.name}</h3>
        <p>${product.detail}</p>
        <div class="product-meta"><span>⏱ ${product.eta}</span><span>⭐ ${product.rating}</span></div>
        <div class="price-row">
          <span>${formatPrice(product.price)}</span>
          <button class="add-button" type="button" data-add-product="${index}">ADD +</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCart() {
  const entries = [...cart.values()];
  const totalItems = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatPrice(total);
  checkoutButton.disabled = totalItems === 0;
  cartItems.innerHTML = entries.length ? entries.map((item) => `
    <div class="cart-line">
      <div>${item.emoji} ${item.name}<small>${item.quantity} × ${formatPrice(item.price)}</small></div>
      <div class="qty-controls" aria-label="Update ${item.name} quantity">
        <button type="button" data-dec="${item.name}" aria-label="Remove one ${item.name}">−</button>
        <strong>${formatPrice(item.quantity * item.price)}</strong>
        <button type="button" data-inc="${item.name}" aria-label="Add one ${item.name}">+</button>
        <button class="remove-button" type="button" data-remove="${item.name}">Remove</button>
      </div>
    </div>
  `).join("") : "<p>Your cart is waiting for a lightning deal ⚡</p>";
}

function showToast(message = "Added to your flash cart!") {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1500);
}

function addToCart(index) {
  const product = products[index];
  const existing = cart.get(product.name) || { ...product, quantity: 0 };
  existing.quantity += 1;
  cart.set(product.name, existing);
  renderCart();
  showToast(`${product.name} added in a flash!`);
}

function updateQuantity(name, delta) {
  const item = cart.get(name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart.delete(name);
  renderCart();
}

function getCartPayload() {
  const items = [...cart.values()].map(({ name, price, quantity }) => ({ name, price, quantity }));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, total, address: addressInput.value };
}

async function submitOrder() {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getCartPayload()),
  });

  if (!response.ok) {
    throw new Error("Unable to place order");
  }

  return response.json();
}

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("open", isOpen);
  overlay.classList.toggle("open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-product]");
  if (button) addToCart(Number(button.dataset.addProduct));
});

cartItems.addEventListener("click", (event) => {
  const inc = event.target.closest("[data-inc]");
  const dec = event.target.closest("[data-dec]");
  const remove = event.target.closest("[data-remove]");
  if (inc) updateQuantity(inc.dataset.inc, 1);
  if (dec) updateQuantity(dec.dataset.dec, -1);
  if (remove) {
    cart.delete(remove.dataset.remove);
    renderCart();
  }
});

document.querySelectorAll("[data-open-cart]").forEach((button) => button.addEventListener("click", () => setCartOpen(true)));
document.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", () => setCartOpen(false)));

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderProducts();
  });
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

checkoutButton.addEventListener("click", async () => {
  if (!cart.size) {
    showToast("Add a deal before launching your order!");
    return;
  }

  checkoutButton.disabled = true;
  checkoutButton.textContent = "Placing order...";

  try {
    const order = await submitOrder();
    cart.clear();
    renderCart();
    setCartOpen(false);
    showToast(`Order ${order.id.slice(0, 8)} accepted! Rider ETA ${order.etaMinutes} min 🚀`);
  } catch (error) {
    showToast("Could not reach backend. Start the server and try again.");
  } finally {
    checkoutButton.textContent = "Place exciting order 🚀";
    checkoutButton.disabled = cart.size === 0;
  }
});

async function loadGoogleMap() {
  const mapElement = document.querySelector("#map");
  if (!mapElement) return;

  try {
    const response = await fetch("/api/config");
    const config = await response.json();

    if (!config.googleMapsApiKey) return;

    window.initFlashBasketMap = () => {
      const map = new google.maps.Map(mapElement, {
        center: config.defaultCenter,
        zoom: 13,
        mapId: "FLASHBASKET_DELIVERY_MAP",
      });

      new google.maps.Marker({
        position: config.defaultCenter,
        map,
        title: "FlashBasket delivery hub",
      });

      new google.maps.Circle({
        strokeColor: "#2fb344",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#e9ff58",
        fillOpacity: 0.25,
        map,
        center: config.defaultCenter,
        radius: config.deliveryRadiusKm * 1000,
      });
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.googleMapsApiKey)}&callback=initFlashBasketMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  } catch (error) {
    console.warn("Google Maps configuration could not be loaded", error);
  }
}

renderProducts();
renderCart();
loadGoogleMap();
