// Shopping Cart functionality for BAAZARX
// Handles cart operations, checkout process, and order management

class ShoppingCart {
    constructor() {
        this.cart = [];
        this.deliveryLocation = 'dhaka'; // default to Dhaka
        this.isCheckoutMode = false;
        this.init();
    }

    init() {
        this.loadCart();
        this.loadDeliveryLocation();
        this.bindEvents();
        this.updateDisplay();
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    loadDeliveryLocation() {
        const savedLocation = localStorage.getItem('deliveryLocation');
        if (savedLocation) {
            this.deliveryLocation = savedLocation;
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    saveDeliveryLocation() {
        localStorage.setItem('deliveryLocation', this.deliveryLocation);
    }

    setDeliveryLocation(location) {
        this.deliveryLocation = location;
        this.saveDeliveryLocation();
        this.renderCartSummary();
    }

    getDeliveryLocation() {
        return this.deliveryLocation;
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    bindEvents() {
        // Event delegation for dynamic cart content
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn-minus')) {
                const productId = parseInt(e.target.dataset.productId);
                this.updateQuantity(productId, -1);
            } else if (e.target.classList.contains('quantity-btn-plus')) {
                const productId = parseInt(e.target.dataset.productId);
                this.updateQuantity(productId, 1);
            } else if (e.target.closest('.remove-btn')) {
                const productId = parseInt(e.target.closest('.remove-btn').dataset.productId);
                this.removeFromCart(productId);
            }
        });

        // Quantity input changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const productId = parseInt(e.target.dataset.productId);
                const newQuantity = parseInt(e.target.value);
                this.setQuantity(productId, newQuantity);
            }
        });
    }

    async addToCart(productId) {
        try {
            const products = await this.loadProducts();
            const product = products.find(p => p.id === productId);
            
            if (!product) {
                throw new Error('Product not found');
            }

            const existingItem = this.cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    quantity: 1
                });
            }
            
            this.saveCart();
            this.updateDisplay();
            this.showNotification(`${product.name} added to cart!`, 'success');
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add item to cart', 'error');
        }
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateDisplay();
            this.showNotification(`${item.name} removed from cart!`, 'info');
        }
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateDisplay();
            }
        }
    }

    setQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = Math.min(quantity, 99); // Max 99 items
                this.saveCart();
                this.updateDisplay();
            }
        }
    }

    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getTotal() {
        return this.getSubtotal();
    }

    updateDisplay() {
        this.renderCartItems();
        this.renderCartSummary();
        this.updateCartCount();
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart empty-cart-icon"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started!</p>
                    <a href="catalog.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        cartContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-category">${item.category}</p>
                    <p class="cart-item-price">৳${item.price.toLocaleString()}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn quantity-btn-minus" data-product-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                               min="1" max="99" data-product-id="${item.id}">
                        <button class="quantity-btn quantity-btn-plus" data-product-id="${item.id}">+</button>
                    </div>
                    <button class="remove-btn" data-product-id="${item.id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCartSummary() {
        const summaryContainer = document.getElementById('cart-summary');
        if (!summaryContainer) return;

        const subtotal = this.getSubtotal();
        const deliveryLocation = this.getDeliveryLocation();
        const shipping = deliveryLocation === 'dhaka' ? 70 : 120;
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + shipping + tax;

        summaryContainer.innerHTML = `
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="delivery-options">
                    <h4>Delivery Location</h4>
                    <div class="delivery-radio-group">
                        <label class="delivery-option">
                            <input type="radio" name="delivery" value="dhaka" ${deliveryLocation === 'dhaka' ? 'checked' : ''} 
                                   onchange="cartManager.setDeliveryLocation('dhaka')">
                            <span>Inside Dhaka - ৳70</span>
                        </label>
                        <label class="delivery-option">
                            <input type="radio" name="delivery" value="outside" ${deliveryLocation === 'outside' ? 'checked' : ''} 
                                   onchange="cartManager.setDeliveryLocation('outside')">
                            <span>Outside Dhaka - ৳120</span>
                        </label>
                    </div>
                </div>
                <div class="summary-line">
                    <span>Subtotal (${this.getItemCount()} items):</span>
                    <span>৳${subtotal.toLocaleString()}</span>
                </div>
                <div class="summary-line">
                    <span>Delivery (${deliveryLocation === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                    <span>৳${shipping.toLocaleString()}</span>
                </div>
                <div class="summary-line">
                    <span>Tax (5%):</span>
                    <span>৳${Math.round(tax).toLocaleString()}</span>
                </div>
                <div class="summary-line total-line">
                    <span><strong>Total:</strong></span>
                    <span><strong>৳${Math.round(total).toLocaleString()}</strong></span>
                </div>
                <div class="cart-actions">
                    ${this.cart.length > 0 ? `
                        <button class="btn btn-secondary" onclick="cartManager.clearCart()">Clear Cart</button>
                        <button class="btn btn-primary" onclick="cartManager.proceedToCheckout()">
                            Proceed to Checkout
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.updateDisplay();
            this.showNotification('Cart cleared!', 'info');
        }
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }

        // Save order data
        const orderData = {
            items: this.cart,
            subtotal: this.getSubtotal(),
            shipping: this.deliveryLocation === 'dhaka' ? 70 : 120,
            tax: this.getSubtotal() * 0.05,
            total: this.getSubtotal() + (this.deliveryLocation === 'dhaka' ? 70 : 120) + (this.getSubtotal() * 0.05),
            deliveryLocation: this.deliveryLocation,
            estimatedDelivery: this.calculateDeliveryDate(),
            orderDate: new Date().toISOString()
        };

        localStorage.setItem('checkoutData', JSON.stringify(orderData));
        window.location.href = 'checkout.html';
    }

    calculateDeliveryDate() {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 3); // 3-7 days
        return deliveryDate.toISOString().split('T')[0];
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    // Coupon system
    applyCoupon(code) {
        const coupons = {
            'SAVE10': { type: 'percentage', value: 10 },
            'SAVE50': { type: 'fixed', value: 50 },
            'FREESHIP': { type: 'shipping', value: 0 },
            'WELCOME': { type: 'percentage', value: 15 }
        };

        const coupon = coupons[code.toUpperCase()];
        if (coupon) {
            this.appliedCoupon = coupon;
            this.couponCode = code.toUpperCase();
            this.renderCartSummary();
            this.showNotification(`Coupon ${code} applied successfully!`, 'success');
            return true;
        } else {
            this.showNotification('Invalid coupon code!', 'error');
            return false;
        }
    }

    removeCoupon() {
        this.appliedCoupon = null;
        this.couponCode = null;
        this.renderCartSummary();
        this.showNotification('Coupon removed!', 'info');
    }
}

// Initialize cart manager
const cartManager = new ShoppingCart();

// Global functions for compatibility
window.addToCart = (productId) => cartManager.addToCart(productId);
window.removeFromCart = (productId) => cartManager.removeFromCart(productId);
window.clearCart = () => cartManager.clearCart();
