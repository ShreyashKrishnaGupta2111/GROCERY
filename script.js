const products = [
  { name: "A2 Fresh Milk", emoji: "🥛", detail: "1L • chilled", price: 72, tag: "HOT" },
  { name: "Crunchy Bananas", emoji: "🍌", detail: "6 pcs • sweet", price: 54, tag: "NEW" },
  { name: "Green Basket Mix", emoji: "🥬", detail: "Spinach + coriander", price: 39, tag: "15% OFF" },
  { name: "Masala Chips", emoji: "🍟", detail: "Party pack", price: 49, tag: "TRENDING" },
  { name: "Chocolate Blast", emoji: "🍫", detail: "Midnight craving", price: 99, tag: "BOGO" },
  { name: "Mango Madness", emoji: "🥭", detail: "Alphonso box", price: 249, tag: "FRESH" },
  { name: "Ice Cream Tub", emoji: "🍦", detail: "Vanilla bean", price: 189, tag: "FAST" },
  { name: "Home Clean Kit", emoji: "🧽", detail: "Floor + dish care", price: 229, tag: "VALUE" },
];

const cart = new Map();
const productGrid = document.querySelector("#product-grid");
const cartCount = document.querySelector("#cart-count");
const cartDrawer = document.querySelector("#cart-drawer");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");
const checkoutButton = document.querySelector("#checkout-button");

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function renderProducts() {
  productGrid.innerHTML = products.map((product, index) => `
    <article class="product-card">
      <span class="sale-tag">${product.tag}</span>
      <div class="product-emoji">${product.emoji}</div>
      <h3>${product.name}</h3>
      <p>${product.detail}</p>
      <div class="price-row">
        <span>${formatPrice(product.price)}</span>
        <button class="add-button" type="button" data-add-product="${index}">ADD +</button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const entries = [...cart.values()];
  const totalItems = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.quantity * item.price, 0);

  cartCount.textContent = totalItems;
  cartTotal.textContent = formatPrice(total);
  cartItems.innerHTML = entries.length ? entries.map((item) => `
    <div class="cart-line">
      <div>${item.emoji} ${item.name}<small>${item.quantity} × ${formatPrice(item.price)}</small></div>
      <strong>${formatPrice(item.quantity * item.price)}</strong>
    </div>
  `).join("") : "<p>Your cart is waiting for a lightning deal ⚡</p>";
}

function addToCart(index) {
  const product = products[index];
  const existing = cart.get(product.name) || { ...product, quantity: 0 };
  existing.quantity += 1;
  cart.set(product.name, existing);
  renderCart();
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1300);
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

document.querySelectorAll("[data-open-cart]").forEach((button) => {
  button.addEventListener("click", () => setCartOpen(true));
});

document.querySelectorAll("[data-close-cart]").forEach((button) => {
  button.addEventListener("click", () => setCartOpen(false));
});

checkoutButton.addEventListener("click", () => {
  if (!cart.size) {
    toast.textContent = "Add a deal before launching your order!";
  } else {
    toast.textContent = "Order launched! Rider is racing your way 🚀";
    cart.clear();
    renderCart();
    setCartOpen(false);
  }
  toast.classList.add("show");
  window.setTimeout(() => {
    toast.classList.remove("show");
    toast.textContent = "Added to your flash cart!";
  }, 1800);
});

renderProducts();
renderCart();
