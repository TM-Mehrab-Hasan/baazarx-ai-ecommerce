// Main JavaScript file for BAAZARX
// Handles authentication, navigation, and general functionality

class AISmartShop {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.products = [];
        this.init();
    }

    // Initialize the application
    init() {
        this.loadUserSession();
        this.loadCart();
        this.loadProducts();
        this.updateNavigation();
        this.bindEvents();
        this.loadPopularProducts();
    }

    // Load user session from localStorage
    loadUserSession() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
        }
    }

    // Load cart from localStorage
    loadCart() {
        const cart = localStorage.getItem('cart');
        if (cart) {
            this.cart = JSON.parse(cart);
        }
        this.updateCartCount();
    }

    // Load products from localStorage or use default
    async loadProducts() {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            this.products = JSON.parse(storedProducts);
        } else {
            // Load default products from products.json
            try {
                const response = await fetch('data/products.json');
                const data = await response.json();
                this.products = data.products;
                this.saveProducts();
            } catch (error) {
                console.error('Error loading products:', error);
                this.products = this.getDefaultProducts();
                this.saveProducts();
            }
        }
    }

    // Save products to localStorage
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    // Update navigation based on user authentication
    updateNavigation() {
        const loggedOutMenu = document.getElementById('user-menu-logged-out');
        const loggedInMenu = document.getElementById('user-menu-logged-in');
        const userName = document.getElementById('user-name');

        if (this.currentUser) {
            if (loggedOutMenu) loggedOutMenu.style.display = 'none';
            if (loggedInMenu) loggedInMenu.style.display = 'block';
            if (userName) userName.textContent = `Hello, ${this.currentUser.name}`;
        } else {
            if (loggedOutMenu) loggedOutMenu.style.display = 'block';
            if (loggedInMenu) loggedInMenu.style.display = 'none';
        }
    }

    // Update cart count in navigation
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Bind event listeners
    bindEvents() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // Load popular products for homepage
    loadPopularProducts() {
        const popularProductsGrid = document.getElementById('popular-products-grid');
        if (!popularProductsGrid) return;

        // Get first 4 products as popular
        const popularProducts = this.products.slice(0, 4);
        
        popularProductsGrid.innerHTML = popularProducts.map(product => `
            <div class="product-card" onclick="window.location.href='catalog.html?product=${product.id}'">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-price">৳${product.price.toLocaleString()}</p>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); aiShop.addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Add product to cart
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product.name} added to cart!`, 'success');
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    // Update cart item quantity
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartCount();
            }
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // User authentication methods
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateNavigation();
            return true;
        }
        return false;
    }

    register(userData) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            return false;
        }

        // Add new user
        const newUser = {
            id: Date.now(),
            ...userData,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login after registration
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.updateNavigation();
        
        return true;
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateNavigation();
        this.showNotification('Logged out successfully!', 'success');
        
        // Redirect to home page if on restricted page
        if (window.location.pathname.includes('admin')) {
            window.location.href = 'index.html';
        }
    }

    // Initialize default admin user if none exists
    initializeDefaultUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (!users.find(u => u.isAdmin)) {
            const defaultAdmin = {
                id: 1,
                name: 'Admin',
                email: 'admin@aismartshop.com',
                password: 'admin123',
                isAdmin: true,
                createdAt: new Date().toISOString()
            };
            
            users.push(defaultAdmin);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Get default products if none exist
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Smart Wireless Headphones",
                category: "electronics",
                price: 199.99,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                description: "Premium wireless headphones with noise cancellation",
                stock: 50,
                featured: true
            },
            {
                id: 2,
                name: "Designer Running Shoes",
                category: "fashion",
                price: 129.99,
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                description: "Comfortable and stylish running shoes",
                stock: 30,
                featured: true
            },
            {
                id: 3,
                name: "Smart Home Speaker",
                category: "electronics",
                price: 99.99,
                image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500",
                description: "Voice-controlled smart speaker with AI assistant",
                stock: 25,
                featured: false
            },
            {
                id: 4,
                name: "Yoga Mat Premium",
                category: "sports",
                price: 49.99,
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
                description: "High-quality yoga mat for all fitness levels",
                stock: 40,
                featured: true
            }
        ];
    }

    // Filter products based on search and category
    filterProducts(searchTerm = '', category = '', sortBy = 'name') {
        let filtered = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !category || product.category === category;
            return matchesSearch && matchesCategory;
        });

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return filtered;
    }

    // Get unique categories
    getCategories() {
        return [...new Set(this.products.map(product => product.category))];
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Process checkout (mock)
    processCheckout(orderData) {
        const order = {
            id: Date.now(),
            userId: this.currentUser ? this.currentUser.id : null,
            items: [...this.cart],
            total: this.getCartTotal(),
            customerInfo: orderData,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        // Save order
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart
        this.clearCart();

        return order;
    }
}

// Global logout function
function logout() {
    if (window.aiShop) {
        aiShop.logout();
    }
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateRequired(value) {
        return value.trim() !== '';
    }

    static showError(element, message) {
        const errorElement = element.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        element.classList.add('error');
    }

    static hideError(element) {
        const errorElement = element.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.style.display = 'none';
        }
        element.classList.remove('error');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.aiShop = new AISmartShop();
    
    // Initialize default users
    aiShop.initializeDefaultUsers();
    
    // Initialize Three.js background if on homepage
    if (document.getElementById('threejs-bg')) {
        initThreeJSBackground();
    }
    
    // Initialize chatbot
    if (typeof initChatbot === 'function') {
        initChatbot();
    }
    
    // Initialize recommendations
    if (typeof initRecommendations === 'function') {
        initRecommendations();
    }
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
