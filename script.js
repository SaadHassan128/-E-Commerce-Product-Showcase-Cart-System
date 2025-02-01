document.addEventListener("DOMContentLoaded", function () {
  let products = [];
  let cart = [];

  const productListElem = document.querySelector(".products-list");
  const cartContainer = document.querySelector(".cart-items");
  const cartTotalElem = document.querySelector(".cart-total");
  const cartQuantityElem = document.querySelector(".cart-quantity");
  const clearCartButton = document.querySelector(".clear-cart");
  const cartIcon = document.querySelector(".cart-icon button");
  const cartModal = document.querySelector(".cart-modal");
  const cartOverlay = document.querySelector(".cart-modal-overlay");
  const closeCartBtn = document.querySelector(".close-cart");
  const cartTotalPriceElem = document.querySelector(".cart-total-price");
  const searchInput = document.querySelector(".search");
  const categoriesInput = document.querySelector(".categories");
  const minPriceInput = document.querySelector(".min-price");
  const maxPriceInput = document.querySelector(".max-price");
  const sortInput = document.querySelector(".sort");
  const filterBtn = document.querySelector(".filter-btn");

  const viewModal = document.querySelector(".view-modal");
  const viewModalOverlay = document.querySelector(".view-modal-overlay");
  const viewModalContent = document.querySelector(".view-modal-content");

  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => {
      products = data;
      renderProducts(products);
    });

  function renderProducts(list) {
    productListElem.innerHTML = "";
    list.forEach((product) => {
      productListElem.innerHTML += `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-3 d-flex">
                    <div class="card text-dark w-100">
                        <img src="${product.image}" class="card-img-top" alt="${
        product.title
      }">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.title}</h5>
                            <p class="card-text">$${product.price.toFixed(
                              2
                            )}</p>
                            <div class="mt-auto d-flex justify-content-between">
                                <button class="btn btn-primary view-details" data-id="${
                                  product.id
                                }">View Details</button>
                                <button class="btn btn-danger add-to-cart" data-id="${
                                  product.id
                                }">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>`;
    });
    attachEventListeners();
  }

  function attachEventListeners() {
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        const product = products.find((p) => p.id == productId);
        addToCart(product);
      });
    });

    document.querySelectorAll(".view-details").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        const product = products.find((p) => p.id == productId);
        openViewDetails(product);
      });
    });
  }

  function openViewDetails(product) {
    viewModalContent.innerHTML = `
            <div class="p-3">
                <button class="close-view btn btn-danger">&times;</button>
                <img src="${product.image}" alt="${
      product.title
    }" class="w-100 mb-3">
                <h3>${product.title}</h3>
                <p class="text-muted">$${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
            </div>
        `;

    viewModal.style.display = "block";
    viewModalOverlay.style.display = "block";
    document.body.style.overflow = "hidden";

    document
      .querySelector(".close-view")
      .addEventListener("click", closeViewModal);
    viewModalOverlay.addEventListener("click", closeViewModal);
  }

  function closeViewModal() {
    viewModal.style.display = "none";
    viewModalOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  function addToCart(product) {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
  }

  function updateCartUI() {
    let totalPrice = 0;
    if (cart.length === 0) {
      cartContainer.innerHTML = `<p class="text-muted text-center">Your Cart is Empty</p>`;
    } else {
      cartContainer.innerHTML = cart
        .map((item) => {
          totalPrice += item.price * item.quantity;
          return `
                    <div class="cart-item d-flex justify-content-between align-items-center p-2 border-bottom">
                        <img src="${item.image}" alt="${
            item.title
          }" class="cart-img">
                        <div class="cart-details">
                            <h6>${item.title}</h6>
                            <p class="text-muted">$${item.price.toFixed(2)} x ${
            item.quantity
          }</p>
                        </div>
                        <button class="btn btn-sm btn-danger remove-item" data-id="${
                          item.id
                        }">&times;</button>
                    </div>`;
        })
        .join("");
    }
    cartTotalElem.textContent = cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
    cartQuantityElem.textContent = cart.length;
    document.querySelector(".cart-count").textContent = cart.length;
    cartTotalPriceElem.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
    attachRemoveFromCartListeners();
  }

  function attachRemoveFromCartListeners() {
    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-id");
        cart = cart.filter((item) => item.id != productId);
        updateCartUI();
      });
    });
  }

  function toggleCartModal() {
    if (cartModal.style.display === "block") {
      cartModal.style.display = "none";
      cartOverlay.style.display = "none";
      document.body.style.overflow = "auto";
    } else {
      cartModal.style.display = "block";
      cartOverlay.style.display = "block";
      document.body.style.overflow = "hidden";
      updateCartUI();
    }
  }

  function clearCart() {
    cart = [];
    updateCartUI();
    cartModal.style.display = "none";
    cartOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  function filterProducts() {
    let filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchInput.value.toLowerCase()) &&
        (categoriesInput.value === "" ||
          p.category === categoriesInput.value) &&
        (minPriceInput.value === "" ||
          p.price >= parseFloat(minPriceInput.value)) &&
        (maxPriceInput.value === "" ||
          p.price <= parseFloat(maxPriceInput.value))
    );

    if (sortInput.value === "low-to-high") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortInput.value === "high-to-low") {
      filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
  }

  cartIcon.addEventListener("click", toggleCartModal);
  closeCartBtn.addEventListener("click", toggleCartModal);
  cartOverlay.addEventListener("click", toggleCartModal);
  clearCartButton.addEventListener("click", clearCart);
  filterBtn.addEventListener("click", filterProducts);
});
