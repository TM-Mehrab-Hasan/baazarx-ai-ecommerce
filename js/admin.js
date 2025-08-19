// Admin Dashboard JavaScript
// Handles CRUD operations for products and admin functionality

class AdminManager {
    constructor() {
        this.products = [];
        this.orders = [];
        this.init();
    }

    // Initialize admin dashboard
    init() {
        this.loadProducts();
        this.loadOrders();
        this.updateStats();
        this.bindEvents();
        this.showSection('dashboard');
    }

    // Load products from localStorage or JSON file
    async loadProducts() {
        try {
            const response = await fetch('../../data/products.json');
            const data = await response.json();
            this.products = data.products || [];
            this.updateProductsTable();
        } catch (error) {
            console.error('Error loading products:', error);
            // Load from localStorage as fallback
            const stored = localStorage.getItem('products');
            this.products = stored ? JSON.parse(stored) : [];
            this.updateProductsTable();
        }
    }

    // Save products to localStorage and JSON file
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
        // In a real application, this would save to the server
        console.log('Products saved to localStorage');
    }

    // Load orders (mock data for demo)
    loadOrders() {
        const mockOrders = [
            {
                id: 'ORD001',
                customer: 'John Doe',
                date: '2025-08-19',
                total: 299.99,
                status: 'completed'
            },
            {
                id: 'ORD002',
                customer: 'Jane Smith',
                date: '2025-08-18',
                total: 159.99,
                status: 'pending'
            }
        ];
        this.orders = mockOrders;
        this.updateOrdersTable();
    }

    // Bind event listeners
    bindEvents() {
        // Product form submission
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        // Search and filter functionality
        const adminSearch = document.getElementById('admin-search');
        if (adminSearch) {
            adminSearch.addEventListener('input', () => this.filterProducts());
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterProducts());
        }

        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterProducts());
        }
    }

    // Show specific admin section
    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => section.classList.remove('active'));

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));

        // Find and activate corresponding nav link
        const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Update dashboard statistics
    updateStats() {
        const totalProducts = this.products.length;
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        const totalCustomers = new Set(this.orders.map(order => order.customer)).size;

        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('total-customers').textContent = totalCustomers;
    }

    // Update products table
    updateProductsTable() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-image" 
                         onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                </td>
                <td>
                    <strong>${product.name}</strong>
                    <br>
                    <small>${product.description.substring(0, 50)}...</small>
                </td>
                <td>${product.category}</td>
                <td>৳${product.price.toLocaleString()}</td>
                <td>${product.stock || 0}</td>
                <td>
                    <span class="status-badge status-${product.status || 'active'}">
                        ${product.status || 'active'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="adminManager.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="adminManager.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-view" onclick="adminManager.viewProduct('${product.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Update orders table
    updateOrdersTable() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-view" onclick="adminManager.viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit" onclick="adminManager.editOrder('${order.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Filter products based on search and filters
    filterProducts() {
        const searchTerm = document.getElementById('admin-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        const filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            const matchesStatus = !statusFilter || product.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.displayFilteredProducts(filteredProducts);
    }

    // Display filtered products
    displayFilteredProducts(products) {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${product.image}" alt="${product.name}" class="product-image"
                         onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                </td>
                <td>
                    <strong>${product.name}</strong>
                    <br>
                    <small>${product.description.substring(0, 50)}...</small>
                </td>
                <td>${product.category}</td>
                <td>৳${product.price.toLocaleString()}</td>
                <td>${product.stock || 0}</td>
                <td>
                    <span class="status-badge status-${product.status || 'active'}">
                        ${product.status || 'active'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="adminManager.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="adminManager.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-view" onclick="adminManager.viewProduct('${product.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Show add product modal
    showAddProductModal() {
        document.getElementById('modal-title').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('productModal').style.display = 'block';
    }

    // Edit product
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock || 0;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-status').value = product.status || 'active';

        document.getElementById('productModal').style.display = 'block';
    }

    // Save product (add or update)
    saveProduct() {
        const formData = {
            id: document.getElementById('product-id').value || this.generateId(),
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            image: document.getElementById('product-image').value,
            brand: document.getElementById('product-brand').value,
            status: document.getElementById('product-status').value
        };

        if (document.getElementById('product-id').value) {
            // Update existing product
            const index = this.products.findIndex(p => p.id === formData.id);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...formData };
            }
        } else {
            // Add new product
            this.products.push(formData);
        }

        this.saveProducts();
        this.updateProductsTable();
        this.updateStats();
        this.closeProductModal();

        // Show success message
        this.showNotification('Product saved successfully!', 'success');
    }

    // Delete product
    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.updateProductsTable();
            this.updateStats();
            this.showNotification('Product deleted successfully!', 'success');
        }
    }

    // View product details
    viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            alert(`Product: ${product.name}\nPrice: ৳${product.price.toLocaleString()}\nStock: ${product.stock}`);
        }
    }

    // View order details
    viewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`Order: ${order.id}\nCustomer: ${order.customer}\nTotal: $${order.total}`);
        }
    }

    // Edit order
    editOrder(orderId) {
        alert('Order editing functionality would be implemented here');
    }

    // Close product modal
    closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
    }

    // Show import modal
    showImportModal() {
        document.getElementById('importModal').style.display = 'block';
    }

    // Close import modal
    closeImportModal() {
        document.getElementById('importModal').style.display = 'none';
    }

    // Import products
    importProducts() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file to import');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    this.products = [...this.products, ...data];
                } else if (data.products && Array.isArray(data.products)) {
                    this.products = [...this.products, ...data.products];
                }
                
                this.saveProducts();
                this.updateProductsTable();
                this.updateStats();
                this.closeImportModal();
                this.showNotification('Products imported successfully!', 'success');
            } catch (error) {
                alert('Error parsing file. Please ensure it\'s a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }

    // Export products
    exportProducts() {
        const dataStr = JSON.stringify({ products: this.products }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `products_export_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        this.showNotification('Products exported successfully!', 'success');
    }

    // Generate unique ID
    generateId() {
        return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'success' ? '#10b981' : '#00bfff'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for onclick handlers
function showSection(sectionName) {
    if (window.adminManager) {
        window.adminManager.showSection(sectionName);
    }
}

function showAddProductModal() {
    if (window.adminManager) {
        window.adminManager.showAddProductModal();
    }
}

function closeProductModal() {
    if (window.adminManager) {
        window.adminManager.closeProductModal();
    }
}

function showImportModal() {
    if (window.adminManager) {
        window.adminManager.showImportModal();
    }
}

function closeImportModal() {
    if (window.adminManager) {
        window.adminManager.closeImportModal();
    }
}

function importProducts() {
    if (window.adminManager) {
        window.adminManager.importProducts();
    }
}

function exportProducts() {
    if (window.adminManager) {
        window.adminManager.exportProducts();
    }
}

// Initialize admin manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const productModal = document.getElementById('productModal');
    const importModal = document.getElementById('importModal');
    
    if (e.target === productModal) {
        closeProductModal();
    }
    if (e.target === importModal) {
        closeImportModal();
    }
});
