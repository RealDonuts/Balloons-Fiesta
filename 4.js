let cart = [];
let products = [];

// Fetch products from JSON file
fetch("1.json")
    .then(response => response.json())
    .then(data => {
        products = data;
        displayProducts(products);
    });

// Display products on the page
function displayProducts(products) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product");
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="viewImage('${product.image}')">
            <h3>${product.name}</h3>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productList.appendChild(productCard);
    });
}

// Filter products by category
function filterCategory(category) {
    const filteredProducts = category === "all" ? products : products.filter(p => p.category === category);
    displayProducts(filteredProducts);
}

// Search products by name
function searchProducts() {
    const query = document.getElementById("search").value.toLowerCase();
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query));
    displayProducts(filteredProducts);
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    let cartItem = cart.find(item => item.id === productId);

    // Get the minimum order quantity for the category
    const minOrder = product.minOrder || 5; // Default to 5 if minOrder is not defined

    if (cartItem) {
        cartItem.quantity += minOrder; // Increase quantity by the minimum order
    } else {
        cart.push({ ...product, quantity: minOrder }); // Add new product with minimum quantity
    }
    updateCart();
}

// Update the cart UI
function updateCart() {
    const cartList = document.getElementById("cart-list");
    cartList.innerHTML = "";
    cart.forEach((item, index) => {
        const cartItem = document.createElement("li");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${item.image}" width="50">
            ${item.name} 
            <button onclick="decreaseQuantity(${index})">-</button>
            <span>${item.quantity}</span>
            <button onclick="increaseQuantity(${index})">+</button>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;
        cartList.appendChild(cartItem);
    });
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Increase item quantity
function increaseQuantity(index) {
    const minOrder = cart[index].minOrder || 5; // Default to 5 if minOrder is not defined
    cart[index].quantity += minOrder; // Increase quantity by the minimum order
    updateCart();
}

// Decrease item quantity
function decreaseQuantity(index) {
    const minOrder = cart[index].minOrder || 5; // Default to 5 if minOrder is not defined
    if (cart[index].quantity > minOrder) {
        cart[index].quantity -= minOrder; // Decrease quantity by the minimum order
    }
    updateCart();
}

// Function to toggle the cart visibility
function toggleCart() {
    const cartSection = document.getElementById("cart-section");
    const cartOverlay = document.getElementById("cart-overlay");
    cartSection.classList.toggle("hidden");
    cartOverlay.classList.toggle("hidden");
}

// Show checkout form
function showCheckoutForm() {
    const checkoutForm = document.getElementById("checkout-form");
    checkoutForm.classList.remove("hidden");
}

// Hide checkout form
function hideCheckoutForm() {
    const checkoutForm = document.getElementById("checkout-form");
    checkoutForm.classList.add("hidden");
}

// View enlarged image
function viewImage(src) {
    document.getElementById("modal-img").src = src;
    document.getElementById("image-modal").style.display = "flex";
}

// Close image modal
function closeModal() {
    document.getElementById("image-modal").style.display = "none";
}

// Send order via email
function sendOrder(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const cartItems = cart.map(item => `${item.name} (Quantity: ${item.quantity})`).join("%0A");

    const mailtoLink = `mailto:balloonsfiesta824@gmail.com?subject=Order Request&body=Name: ${name}%0AAddress: ${address}%0APhone: ${phone}%0AEmail: ${email}%0A%0AOrder Details:%0A${cartItems}`;
    window.location.href = mailtoLink;
}

// Toggle dropdown menu
function toggleDropdown() {
    const dropdown = document.getElementById("contactDropdown");
    dropdown.classList.toggle("show");
}

// Close dropdown if user clicks outside
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};

const productsPerPage = 8; // Number of products per page
let currentPage = 1;

function displayProducts(page) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = ""; // Clear existing products

    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);

    paginatedProducts.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.className = "product";
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
        `;
        productList.appendChild(productDiv);
    });
}

function setupPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = ""; // Clear existing buttons

    const totalPages = Math.ceil(products.length / productsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.innerText = i;
        button.addEventListener("click", () => {
            currentPage = i;
            displayProducts(currentPage);
            updatePaginationButtons();
        });
        pagination.appendChild(button);
    }

    updatePaginationButtons();
}

function updatePaginationButtons() {
    const buttons = document.querySelectorAll("#pagination button");
    buttons.forEach(button => {
        button.classList.remove("active");
        if (parseInt(button.innerText) === currentPage) {
            button.classList.add("active");
        }
    });
}

// Initialize
displayProducts(currentPage);
setupPagination();