document.addEventListener("DOMContentLoaded", function () {
    let cartItems = [];

    // Fetch product data from JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const productsContainer = document.getElementById("products");

            data.forEach(product => {
                const div = document.createElement("div");
                div.classList.add("col-12", "col-sm-4", "mb-3", "product");

                div.innerHTML = `
                    <img src="${product.image.desktop}">
                    <div class="product-info">
                        <p class="product-tag">${product.category}</p>
                        <p class="product-name">${product.name}</p>
                        <p class="product-price">$${product.price}</p>
                    </div>
                    <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">
                        <img src="assets/images/icon-add-to-cart.svg">
                        <p>Add to Cart</p>
                    </button>
                `;

                const addToCartButton = div.querySelector('.add-to-cart');
                addToCartButton.addEventListener('click', () => {
                    addToCart(product, div, addToCartButton);
                });

                productsContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error loading the products:', error));

    function addToCart(product, productDiv, button) {
        const existingItem = cartItems.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({ name: product.name, price: product.price, quantity: 1 });
        }

        updateCart();
        changeToPlusMinusButtons(product, productDiv, button);
    }

    function changeToPlusMinusButtons(product, productDiv, button) {
        const plusMinusDiv = document.createElement('div');
        plusMinusDiv.classList.add('plusminus');
        plusMinusDiv.innerHTML = `
            <button class="decrement">
                <img src="assets/images/icon-decrement-quantity.svg" alt="minus icon">
            </button>
            <p>1</p>
            <button class="increment">
                <img src="assets/images/icon-increment-quantity.svg" alt="plus icon">
            </button>
        `;

        const minusButton = plusMinusDiv.querySelector('.decrement');
        const plusButton = plusMinusDiv.querySelector('.increment');
        const quantityText = plusMinusDiv.querySelector('p');

        minusButton.addEventListener('click', () => {
            updateQuantity(product, -1, quantityText, productDiv, plusMinusDiv);
        });

        plusButton.addEventListener('click', () => {
            updateQuantity(product, 1, quantityText, productDiv, plusMinusDiv);
        });

        button.replaceWith(plusMinusDiv);
    }

    function updateQuantity(product, change, quantityText, productDiv, plusMinusDiv) {
        const cartItem = cartItems.find(item => item.name === product.name);

        if (!cartItem) return;

        cartItem.quantity += change;

        if (cartItem.quantity <= 0) {
            cartItems = cartItems.filter(item => item.name !== product.name);
            restoreAddToCartButton(productDiv, plusMinusDiv);
        } else {
            quantityText.textContent = cartItem.quantity;
        }

        updateCart();
    }

    function restoreAddToCartButton(productDiv, plusMinusDiv) {
        const addToCartButton = document.createElement("button");
        addToCartButton.classList.add("add-to-cart");
        addToCartButton.innerHTML = `
            <img src="assets/images/icon-add-to-cart.svg">
            <p>Add to Cart</p>
        `;

        addToCartButton.addEventListener('click', () => {
            addToCart({
                name: productDiv.querySelector('.product-name').textContent,
                price: parseFloat(productDiv.querySelector('.product-price').textContent.replace('$', ''))
            }, productDiv, addToCartButton);
        });

        plusMinusDiv.replaceWith(addToCartButton);
    }

    function updateCart() {
        const cartContainer = document.getElementById("added-cart");
        const emptyCartMessage = document.getElementById("empty-cart");

        cartContainer.innerHTML = '';

        if (cartItems.length === 0) {
            emptyCartMessage.style.display = "block";
            cartContainer.style.display = "none";
            return;
        }

        emptyCartMessage.style.display = "none";
        cartContainer.style.display = "block";

        cartItems.forEach(item => {
            const cartItemDiv = document.createElement("div");
            cartItemDiv.classList.add("items");
            cartItemDiv.innerHTML = `
                <div>
                    <p class="item-name">${item.name}</p>
                    <div class="quantity-price">
                        <p class="quantity">${item.quantity}x</p>
                        <p class="single-price">@ $${item.price.toFixed(2)}</p>
                        <p class="total-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
                <button class="remove-item" data-name="${item.name}">
                    <img src="assets/images/icon-remove-item.svg" alt="Remove item icon">
                </button>
            `;

            const removeButton = cartItemDiv.querySelector('.remove-item');
            removeButton.addEventListener("click", () => {
                removeFromCart(item.name);
            });

            cartContainer.appendChild(cartItemDiv);
        });
    }

    function removeFromCart(productName) {
        cartItems = cartItems.filter(item => item.name !== productName);
        updateCart();
    }
});
