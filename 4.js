let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = [];

// Fetch products from JSON file
function fetchProducts() {
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "flex";

    fetch("1.json")
        .then(response => response.json())
        .then(data => {
            products = data;
            displayProducts(products);
            setupPagination(products);
            loadingSpinner.style.display = "none";
        })
        .catch(error => {
            console.error("Error fetching products:", error);
            loadingSpinner.style.display = "none";
            alert("Failed to load products. Please try again later.");
        });
}

// Display products on the page
function displayProducts(productsToShow) {
    const productList = document.getElementById("product-list");
    if (!productList) return;
    productList.innerHTML = "";
    productsToShow.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product");
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="viewImage('${product.image}')">
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productList.appendChild(productCard);
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    let cartItem = cart.find(item => item.id === productId);
    const minOrder = product.minOrder || 5;

    if (cartItem) {
        cartItem.quantity += minOrder;
    } else {
        cart.push({ ...product, quantity: minOrder });
    }
    updateCart();
    updateCartButton();
}

// Update the cart UI and save to localStorage
function updateCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart button with item count
function updateCartButton() {
    const cartButton = document.getElementById("cart-toggle");
    if (cartButton) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartButton.innerText = `🛒 (${totalItems})`;
    }
}

// Load cart button count on page load
window.onload = function () {
    fetchProducts();
    updateCartButton();
};
// Render cart items
function renderCart() {
    const cartList = document.getElementById("cart-list");
    const totalPriceElement = document.getElementById("total-price");
    if (!cartList || !totalPriceElement) return;

    cartList.innerHTML = "";
    let totalPrice = 0;

    cart.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartList.appendChild(cartItem);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.innerText = `Total: $${totalPrice.toFixed(2)}`;
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    renderCart();
    updateCartButton();
}

// Send order
function sendOrder(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    // Simulate order submission
    setTimeout(() => {
        document.getElementById("order-form").classList.add("hidden");
        document.getElementById("order-confirmation").classList.remove("hidden");
        cart = [];
        updateCart();
        updateCartButton();
    }, 1000);
}