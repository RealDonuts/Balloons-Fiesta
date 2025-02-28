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
    productList.innerHTML = "";
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

// Setup pagination with Back and Next buttons
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

    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.disabled = i === currentPage;
        pageButton.addEventListener("click", () => {
            currentPage = i;
            displayProducts(filteredProducts.slice((currentPage - 1) * 8, currentPage * 8));
            updatePaginationUI(totalPages);
        });
        pagination.appendChild(pageButton);
    }

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
        cartItem.quantity += minOrder;
    } else {
        cart.push({ ...product, quantity: minOrder });
    }
    updateCart();
    updateCartButton();
}

// Adjust cart item quantity
function adjustCartQuantity(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += delta;
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
    const totalPriceElement = document.getElementById("total-price");
    if (!cartList || !totalPriceElement) return;

    cartList.innerHTML = ""; // Clear the cart list
    let totalPrice = 0;

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
            <p>Price: $${(item.price || 10).toFixed(2)}</p> <!-- Default price if not provided -->
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartList.appendChild(cartItem);
        totalPrice += (item.price || 10) * item.quantity; // Default price if not provided
    });

    totalPriceElement.innerText = `Total: $${totalPrice.toFixed(2)}`;
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

async function sendOrder(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    // Validation
    if (!name || !address || !phone || !email) {
        alert("Please fill out all fields.");
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Phone number validation
    const phonePattern = /^\d+$/;
    if (!phonePattern.test(phone)) {
        alert("Please enter a valid phone number (numbers only).");
        return;
    }

    // Prepare data to send
    const orderData = {
        name,
        address,
        phone,
        email,
    };

    try {
        // Send data to backend
        const response = await fetch("/submit-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (response.ok) {
            alert("Order submitted successfully!");
            // Clear form fields
            document.getElementById("name").value = "";
            document.getElementById("address").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("email").value = "";
        } else {
            alert("Failed to submit order. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
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
};async function sendOrder(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    // Validation
    if (!name || !address || !phone || !email) {
        alert("Please fill out all fields.");
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Phone number validation
    const phonePattern = /^\d+$/;
    if (!phonePattern.test(phone)) {
        alert("Please enter a valid phone number (numbers only).");
        return;
    }

    // Prepare data to send
    const orderData = {
        name,
        address,
        phone,
        email,
    };

    try {
        // Send data to backend
        const response = await fetch("/submit-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (response.ok) {
            alert("Order submitted successfully!");
            // Clear form fields
            document.getElementById("name").value = "";
            document.getElementById("address").value = "";
            document.getElementById("phone").value = "";
            document.getElementById("email").value = "";
        } else {
            alert("Failed to submit order. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
}