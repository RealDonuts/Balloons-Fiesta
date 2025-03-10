let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = [];

// Fetch products from JSON file
fetch("1.json")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        products = data;
        displayProducts(products);
        setupPagination(products);
    })
    .catch(error => console.error("Error fetching products:", error));

// Display products on the page
function displayProducts(productsToShow) {
    const productList = document.getElementById("product-list");
    if (!productList) return;
    productList.innerHTML = ""; // Clear existing products

    productsToShow.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product");
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="viewImage('${product.image}')">
            <h3>${product.name}</h3>
            <button onclick="addToCart(${product.id})" aria-label="Add ${product.name} to cart">Add to Cart</button>
        `;
        productList.appendChild(productCard);
    });
}
let currentPage = 1; // Track the current page

// Setup pagination with only Back and Next buttons
function setupPagination(filteredProducts) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    pagination.innerHTML = ""; // Clear existing pagination buttons

    const totalPages = Math.ceil(filteredProducts.length / 8); // 8 products per page

    // Display current page number
    const pageInfo = document.createElement("span");
    pageInfo.id = "page-info";
    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    pagination.appendChild(pageInfo);

    // Back button
    const backButton = document.createElement("button");
    backButton.innerText = "Back";
    backButton.disabled = currentPage === 1; // Disable if on the first page
    backButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayProducts(filteredProducts.slice((currentPage - 1) * 8, currentPage * 8));
            updatePaginationUI(totalPages);
        }
    });
    pagination.appendChild(backButton);

    // Next button
    const nextButton = document.createElement("button");
    nextButton.innerText = "Next";
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts(filteredProducts.slice((currentPage - 1) * 8, currentPage * 8));
            updatePaginationUI(totalPages);
        }
    });
    pagination.appendChild(nextButton);
}
// Update pagination UI (current page and button states)
function updatePaginationUI(totalPages) {
    const pageInfo = document.getElementById("page-info");
    const backButton = document.querySelector("#pagination button:first-of-type");
    const nextButton = document.querySelector("#pagination button:last-of-type");

    if (pageInfo) {
        pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    }

    if (backButton) {
        backButton.disabled = currentPage === 1; // Disable Back button on the first page
    }

    if (nextButton) {
        nextButton.disabled = currentPage === totalPages; // Disable Next button on the last page
    }
}

// Filter products by category
function filterCategory(category) {
    currentPage = 1; // Reset to the first page
    const filteredProducts = category === "all" ? products : products.filter(p => p.category === category);
    displayProducts(filteredProducts.slice(0, 8)); // Show first 8 products
    setupPagination(filteredProducts);
}
// Search products by name with debounce
let searchTimeout;

function searchProducts() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1; // Reset to the first page
        const query = document.getElementById("search").value.toLowerCase();
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query));
        displayProducts(filteredProducts.slice(0, 8)); // Show first 8 products
        setupPagination(filteredProducts);
    }, 300); // Adjust the delay as needed
}

// Add product to cart with minimum order quantity
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    let cartItem = cart.find(item => item.id === productId);
    const minOrder = product.minOrder || 5;

    if (cartItem) {
        // If the item already exists in the cart, increase the quantity by the minimum order
        cartItem.quantity += minOrder;
    } else {
        // If the item is not in the cart, add it with the minimum order quantity
        cart.push({ ...product, quantity: minOrder });
    }
    updateCart();
    updateCartButton();
}
// Adjust cart item quantity
function adjustCartQuantity(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        const minOrder = cartItem.minOrder || 5;
        cartItem.quantity += delta * minOrder; // Adjust by multiples of minOrder
        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            renderCart();
            updateCartButton();
        }
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    renderCart();
    updateCartButton();
}

// Render cart items and calculate total price
function renderCart() {
    const cartList = document.getElementById("cart-list");
    if (!cartList) return;

    cartList.innerHTML = ""; // Clear the cart list

    cart.forEach(item => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Quantity: 
                <button onclick="adjustCartQuantity(${item.id}, -1)">-</button>
                ${item.quantity}
                <button onclick="adjustCartQuantity(${item.id}, 1)">+</button>
            </p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartList.appendChild(cartItem);
    });
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

// Redirect to cart page
function goToCart() {
    window.location.href = "cart.html";
}

// Redirect to the main shop page
function goToShop() {
    window.location.href = "2.html";
}

// Redirect to checkout page
function goToCheckout() {
    window.location.href = "checkout.html";
}

// Hide checkout form and redirect to cart page
function hideCheckoutForm() {
    window.location.href = "cart.html";
}

// Show checkout form
function showCheckoutForm() {
    const checkoutForm = document.getElementById("checkout-form");
    checkoutForm.classList.remove("hidden");
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
// Load cart button count on page load
window.onload = function () {
    updateCartButton();
};

// Image viewing modal
function viewImage(imageUrl) {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.style.maxWidth = "90%";
    img.style.maxHeight = "90%";

    modal.appendChild(img);
    document.body.appendChild(modal);

    modal.addEventListener("click", () => {
        document.body.removeChild(modal);
    });
}
  // Toggle categories dropdown menu visibility
  function toggleCategoriesDropdown() {
    const dropdownContent = document.getElementById("categoriesDropdown");
    const dropbtn = document.querySelector(".categories-btn");
    dropdownContent.classList.toggle("show");
    dropbtn.classList.toggle("show"); // Toggle class for button icon
}
// Toggle contact dropdown menu visibility
function toggleDropdown() {
    const dropdownContent = document.getElementById("contactDropdown");
    const dropbtn = document.querySelector(".dropbtn");
    dropdownContent.classList.toggle("show");
    dropbtn.classList.toggle("show"); // Toggle class for button icon
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.categories-btn') && !event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        const buttons = document.querySelectorAll(".categories-btn, .dropbtn");
        
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
        
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            if (button.classList.contains('show')) {
                button.classList.remove('show');
            }
        }
    }
};
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
