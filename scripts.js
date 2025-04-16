document.addEventListener("DOMContentLoaded", function () {
    let cartItems = [];

    fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const products = document.getElementById("products");

        data.forEach(product => {
            const div = document.createElement("div");
            div.classList.add("col-12", "col-sm-4", "mb-3", "product");

            div.innerHTML = `
            <picture>
              <source media="(max-width: 576px)" srcset="${product.image.mobile}">
              <source media="(max-width: 992px)" srcset="${product.image.tablet}">
              <img class="product-image" src="${product.image.desktop}" alt="${product.name}">
            </picture>
            <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">
                <img src="assets/images/icon-add-to-cart.svg">
                <p>Add to Cart</p>
            </button>
            <div class="product-info">
                <p class="product-tag">${product.category}</p>
                <p class="product-name">${product.name}</p>
                <p class="product-price">$${product.price}</p>
            </div>
          `;
          
            const addToCartButton = div.querySelector('.add-to-cart');
            addToCartButton.addEventListener('click', () => {
                addToCart(product, div, addToCartButton);
            });

            products.appendChild(div);
        });

    })
    .catch(error => console.error('Error loading the products:', error));

    function addToCart(product, productdiv, button) {
        let foundItem = cartItems.find(item => item.name === product.name);
    
        if (foundItem) {
            foundItem.quantity += 1;
        } else {
            cartItems.push({ ...product, quantity: 1 });
        }
    
        const productImg = productdiv.querySelector('.product-image');
        productImg.classList.add('selected');
    
        updateCart();
        changeButton(product, productdiv, button);
    }
    

    function changeButton(product, productdiv, button) {
        const plusminusButton = document.createElement('div');
        plusminusButton.classList.add('plusminus');
        plusminusButton.innerHTML = `
          <button id="minus">
            <img src="assets/images/icon-decrement-quantity.svg" alt="minus icon">
          </button>
          <p id="quantity">1</p>
          <button id="plus">
            <img src="assets/images/icon-increment-quantity.svg" alt="plus icon">
          </button>
        `;

        const minusButton = plusminusButton.querySelector("#minus");
        const plusButton = plusminusButton.querySelector("#plus");
        const quantityItem = plusminusButton.querySelector("#quantity");

        minusButton.addEventListener('click', () => {
            updateQuantity(product, -1, quantityItem, productdiv, plusminusButton);
        });

        plusButton.addEventListener('click', () => {
            updateQuantity(product, 1, quantityItem, productdiv, plusminusButton);
        });

        button.replaceWith(plusminusButton);
    }

    function updateQuantity(product, change, quantityItem, productdiv, plusminusButton) {
        let foundItem = cartItems.find(item => item.name === product.name);
        if (!foundItem) return;

        foundItem.quantity += change;

        if (foundItem.quantity <= 0) {
            cartItems = cartItems.filter(item => item.name !== product.name);
            restoreButton(productdiv, plusminusButton);
        } else {
            quantityItem.textContent = foundItem.quantity;
        }

        updateCart();
    }

    function restoreButton(productdiv, plusminusButton) {
        const addToCartButton = document.createElement("button");
        addToCartButton.classList.add("add-to-cart");
        addToCartButton.innerHTML = `
            <img src="assets/images/icon-add-to-cart.svg">
            <p>Add to Cart</p>
        `;

        addToCartButton.addEventListener('click', () => {
            addToCart({
                name: productdiv.querySelector('.product-name').textContent,
                price: parseFloat(productdiv.querySelector('.product-price').textContent.replace('$', '')),
                image: productdiv.querySelector('img').src
            }, productdiv, addToCartButton);
        });

        plusminusButton.replaceWith(addToCartButton);
    }

    function updateCart() {
        const emptyCart = document.getElementById("empty-cart");
        const addedCart = document.getElementById("added-cart");
        const totalPriceDiv = document.getElementById("total-div");
        const carbonDiv = document.querySelector(".carbon");
        const confirmButton = document.getElementById("confirm");
        const totalPrice = document.getElementById("total-price");
        const totalQuantity = document.getElementById("total");

        addedCart.innerHTML = '';

        if (cartItems.length === 0) {
            emptyCart.style.display = "flex";
            addedCart.style.display = "none";
            totalPriceDiv.style.display = "none";
            carbonDiv.style.display = "none";
            confirmButton.style.display = "none";
        } else {
            emptyCart.style.display = "none";
            addedCart.style.display = "flex";
            totalPriceDiv.style.display = "flex";
            carbonDiv.style.display = "flex";
            confirmButton.style.display = "block";
        }

        let total = 0;
        let totalQ = 0;

        cartItems.forEach(item => {
            const cartItemDiv = document.createElement("div");
            cartItemDiv.classList.add("items");
            cartItemDiv.innerHTML = `
                <div>
                    <p class="item-name">${item.name}</p>
                    <div class="quantity-price">
                        <p class="quantity">${item.quantity}x</p>
                        <p class="single-price">@ $${item.price}</p>
                        <p class="total-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
                <button class="remove-item" data-name="${item.name}">
                    <img src="assets/images/icon-remove-item.svg" alt="Remove item icon">
                </button>
            `;

            const line = document.createElement("hr");

            const removeButton = cartItemDiv.querySelector(".remove-item");
            removeButton.addEventListener('click', () => {
                removeItem(item.name);
            });

            addedCart.appendChild(cartItemDiv);
            addedCart.append(line);

            total += item.price * item.quantity;
            totalQ += item.quantity;
        });

        totalPrice.textContent = "$" + total.toFixed(2);
        totalQuantity.textContent = totalQ;
    }

    function removeItem(productName) {
        const removedItem = cartItems.find(item => item.name === productName);
        cartItems = cartItems.filter(item => item.name !== productName);
        
        const allProductDivs = document.querySelectorAll('.product');
        allProductDivs.forEach(productDiv => {
            const name = productDiv.querySelector('.product-name').textContent;
            if (name === productName) {
                const plusminus = productDiv.querySelector('.plusminus');
                const productImg = productDiv.querySelector('.product-image');
    
                if (plusminus) {
                    restoreButton(productDiv, plusminus);
                }
    
                if (productImg) {
                    productImg.classList.remove('selected');
                }
            }
        });
    
        updateCart();
    }
    
    

    const body = document.getElementById("body");
    const confirmSection = document.getElementById("order-confirmed");
    const bg = document.querySelector(".background");

    document.getElementById("confirm").addEventListener('click', confirmedOrder);

    confirmSection.style.display = "none";
    bg.style.display = "none";

    function confirmedOrder() {
        body.style.overflow = "hidden";
        confirmSection.style.display = "block";
        bg.style.display = "block";

        const confirmedList = document.getElementById("confirmed-item");
        const confirmedPrice = document.getElementById("confirmed-price");
        confirmedList.innerHTML = '';

        let totalConfirmed = 0;

        cartItems.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("item");
            itemDiv.innerHTML = `
                <div class="thumbnail-item">
                    <img src="${item.image.thumbnail}" alt="${item.name} thumbnail">
                    <div class="name-quantity-price">
                        <h6>${item.name}</h6>
                        <div class="quantity-price">
                            <p class="item-quantity">${item.quantity}x</p>
                            <p class="price">@ $${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            `;

            confirmedList.appendChild(itemDiv);
            confirmedList.appendChild(document.createElement("hr"));

            totalConfirmed += item.price * item.quantity;
        });

        confirmedPrice.textContent = "$" + totalConfirmed.toFixed(2);
    }

    const neworder = document.getElementById("neworder");
    neworder.addEventListener('click', newOrder);

    function newOrder() {
        cartItems = [];
        updateCart();
    
        const allProducts = document.querySelectorAll(".product");
        allProducts.forEach(productDiv => {
            const plusminus = productDiv.querySelector(".plusminus");
            const productImg = productDiv.querySelector(".product-image");
    
            if (plusminus) {
                restoreButton(productDiv, plusminus);
            }
    
            if (productImg) {
                productImg.classList.remove("selected");
            }
        });
    
        confirmSection.style.display = "none";
        bg.style.display = "none";
    
        document.getElementById("confirmed-item").innerHTML = "";
        document.getElementById("confirmed-price").textContent = "$0.00";
        body.style.overflow = "auto";
    }
    
});
