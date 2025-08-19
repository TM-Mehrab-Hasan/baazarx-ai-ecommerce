// Enhanced AI Chatbot for BAAZARX with Intelligent Product Recommendations
class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.cachedProducts = null;
        this.responses = {
            greeting: [
                "Hello! Welcome to BAAZARX! 🛍️ I'm your AI shopping assistant. How can I help you find the perfect products today?",
                "Hi there! I'm here to help you discover amazing products at BAAZARX. What are you looking for?",
                "Welcome to BAAZARX! ✨ I can help you find products, compare prices, or answer any shopping questions you have!"
            ],
            help: [
                "I can help you with:\n• Product recommendations by price, brand, or category\n• Finding the best deals and offers\n• Comparing products and specifications\n• Shopping assistance and support\n\nWhat would you like to explore?",
                "I'm here to make your shopping easier! I can:\n• Suggest products based on your preferences\n• Help you find items within your budget\n• Answer questions about products and services\n• Guide you through our website\n\nHow can I assist you?",
                "Let me help you shop smarter! I can:\n• Recommend products based on price, storage, brand\n• Show you our latest deals and offers\n• Help compare different products\n• Answer any questions about BAAZARX\n\nWhat are you interested in?"
            ],
            thanks: [
                "You're very welcome! 😊 Happy shopping at BAAZARX!",
                "My pleasure! If you need any more help, just ask!",
                "Glad I could help! Enjoy browsing our amazing products! 🛒"
            ],
            goodbye: [
                "Goodbye! Thanks for visiting BAAZARX. Come back soon! 👋",
                "See you later! Happy shopping and have a great day! ✨",
                "Take care! Don't forget to check out our amazing deals! 🛍️"
            ],
            default: [
                "I'd be happy to help! I can suggest products based on your budget, preferred brands, or categories. What are you looking for?",
                "That's interesting! Let me know if you need product recommendations, price comparisons, or have any shopping questions.",
                "I'm here to help with all your shopping needs! Try asking me about products by price range, brand, or category."
            ]
        };
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createChatbotUI() {
        // Check if chatbot container already exists
        if (document.getElementById('chatbot-container')) {
            return;
        }

        const chatbotHTML = `
            <div id="chatbot-container" class="chatbot-container">
                <div id="chatbot-toggle" class="chatbot-toggle">
                    <i class="fas fa-robot"></i>
                    <span class="chatbot-badge">AI</span>
                </div>
                <div id="chatbot-window" class="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <i class="fas fa-brain"></i>
                            <span>Smart Assistant</span>
                            <span class="status-indicator"></span>
                        </div>
                        <button id="chatbot-close" class="chatbot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="chatbot-messages" class="chatbot-messages">
                        <!-- Messages will be added here -->
                    </div>
                    <div class="chatbot-input-container">
                        <div class="chatbot-quick-actions">
                            <button class="quick-action" data-message="Show me budget phones under 20000">Budget Phones</button>
                            <button class="quick-action" data-message="Recommend premium laptops">Premium Laptops</button>
                            <button class="quick-action" data-message="What's on sale today?">Today's Deals</button>
                            <button class="quick-action" data-message="Help me compare products">Compare</button>
                        </div>
                        <div class="chatbot-input">
                            <input type="text" id="chatbot-input-field" placeholder="Ask me about products, prices, brands..." maxlength="500">
                            <button id="chatbot-send" class="chatbot-send">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const send = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input-field');
        const quickActions = document.querySelectorAll('.quick-action');

        if (toggle) {
            toggle.addEventListener('click', () => this.toggleChat());
        }

        if (close) {
            close.addEventListener('click', () => this.closeChat());
        }

        if (send) {
            send.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            input.addEventListener('input', () => {
                const sendBtn = document.getElementById('chatbot-send');
                if (input.value.trim()) {
                    sendBtn.classList.add('active');
                } else {
                    sendBtn.classList.remove('active');
                }
            });
        }

        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const message = action.getAttribute('data-message');
                this.sendUserMessage(message);
            });
        });
    }

    addWelcomeMessage() {
        setTimeout(() => {
            this.addBotMessage(this.getRandomResponse('greeting'));
        }, 500);
    }

    toggleChat() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (window && toggle) {
            window.classList.add('active');
            toggle.classList.add('active');
            this.isOpen = true;
            
            // Focus on input
            setTimeout(() => {
                const input = document.getElementById('chatbot-input-field');
                if (input) input.focus();
            }, 300);
        }
    }

    closeChat() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (window && toggle) {
            window.classList.remove('active');
            toggle.classList.remove('active');
            this.isOpen = false;
        }
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input-field');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        this.sendUserMessage(message);
        input.value = '';
        
        // Remove active state from send button
        const sendBtn = document.getElementById('chatbot-send');
        if (sendBtn) sendBtn.classList.remove('active');
    }

    async sendUserMessage(message) {
        this.addUserMessage(message);
        
        // Show typing indicator
        this.showTyping();
        
        // Simulate AI processing delay
        setTimeout(async () => {
            this.hideTyping();
            const response = await this.generateIntelligentResponse(message);
            
            if (response.type === 'product_list' && response.products) {
                this.addBotMessage(response.text);
                this.addProductCarousel(response.products);
            } else {
                this.addBotMessage(response.text || response);
            }
        }, 1200 + Math.random() * 800);
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-brain"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    addProductCarousel(products) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer || !products.length) return;

        const carouselElement = document.createElement('div');
        carouselElement.className = 'message bot-message product-carousel-message';
        
        const productsHTML = products.map(product => `
            <div class="product-card" onclick="window.location.href='product-detail.html?id=${product.id}'">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/logo-square.svg'">
                    ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="product-brand">${product.brand || 'BAAZARX'}</div>
                    <div class="product-price">
                        <span class="current-price">৳${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="original-price">৳${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        ${'★'.repeat(Math.floor(product.rating || 4))}<span class="rating-text">(${product.rating || '4.0'})</span>
                    </div>
                </div>
            </div>
        `).join('');

        carouselElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-brain"></i>
            </div>
            <div class="message-content product-carousel">
                <div class="products-grid">
                    ${productsHTML}
                </div>
                <div class="carousel-actions">
                    <button class="view-all-btn" onclick="window.location.href='catalog.html'">
                        <i class="fas fa-th-large"></i> View All Products
                    </button>
                </div>
            </div>
        `;

        messagesContainer.appendChild(carouselElement);
        this.scrollToBottom();
    }

    // Enhanced intelligent response method with product recommendations
    async generateIntelligentResponse(message) {
        const lowercaseMessage = message.toLowerCase();
        
        // Product recommendation queries based on price
        if (lowercaseMessage.includes('recommend') || lowercaseMessage.includes('suggest') || lowercaseMessage.includes('show me')) {
            if (lowercaseMessage.includes('cheap') || lowercaseMessage.includes('budget') || 
                lowercaseMessage.includes('affordable') || lowercaseMessage.includes('low price') ||
                lowercaseMessage.includes('under')) {
                return await this.getProductRecommendations('price', 'low');
            }
            if (lowercaseMessage.includes('expensive') || lowercaseMessage.includes('premium') || 
                lowercaseMessage.includes('high end') || lowercaseMessage.includes('luxury')) {
                return await this.getProductRecommendations('price', 'high');
            }
            if (lowercaseMessage.includes('storage') || lowercaseMessage.includes('memory') || 
                lowercaseMessage.includes('space') || lowercaseMessage.includes('gb') || lowercaseMessage.includes('tb')) {
                return await this.getProductRecommendations('storage');
            }
            if (lowercaseMessage.includes('brand')) {
                return await this.getProductRecommendations('brand');
            }
        }
        
        // Category-specific recommendations
        if (lowercaseMessage.includes('phone') || lowercaseMessage.includes('smartphone') || 
            lowercaseMessage.includes('mobile')) {
            return await this.getProductRecommendations('category', 'smartphones');
        }
        if (lowercaseMessage.includes('laptop') || lowercaseMessage.includes('computer')) {
            return await this.getProductRecommendations('category', 'laptops');
        }
        if (lowercaseMessage.includes('fashion') || lowercaseMessage.includes('clothes') || 
            lowercaseMessage.includes('clothing')) {
            return await this.getProductRecommendations('category', 'fashion');
        }
        if (lowercaseMessage.includes('electronics')) {
            return await this.getProductRecommendations('category', 'electronics');
        }
        
        // Price-related queries
        if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || 
            lowercaseMessage.includes('how much')) {
            return {
                text: "💰 I can help you find products in any budget! Our products range from ৳500 to ৳150,000. You can:\n• Ask for 'budget products under 20000'\n• Request 'premium items over 50000'\n• Filter by price range on our catalog\n\nWhat's your budget range?",
                type: 'helpful'
            };
        }
        
        // Stock and availability
        if (lowercaseMessage.includes('stock') || lowercaseMessage.includes('available') || 
            lowercaseMessage.includes('in stock')) {
            return {
                text: "✅ All products displayed on our website are currently in stock! We update our inventory in real-time. If you're looking for a specific item, I can check its availability and suggest similar products if needed.",
                type: 'helpful'
            };
        }
        
        // Shipping and delivery
        if (lowercaseMessage.includes('shipping') || lowercaseMessage.includes('delivery') || 
            lowercaseMessage.includes('when will it arrive')) {
            return {
                text: "🚚 We offer multiple shipping options:\n• Standard Delivery: 3-5 business days (Free for orders over ৳5,000)\n• Express Delivery: 1-2 business days (৳200)\n• Same Day Delivery: Available in major cities (৳500)\n\nAll orders are tracked and you'll receive updates via SMS/email.",
                type: 'informative'
            };
        }
        
        // Payment methods
        if (lowercaseMessage.includes('payment') || lowercaseMessage.includes('pay') || 
            lowercaseMessage.includes('card') || lowercaseMessage.includes('bkash')) {
            return {
                text: "💳 We accept multiple payment methods:\n• Credit/Debit Cards (Visa, Mastercard)\n• Mobile Banking (bKash, Nagad, Rocket)\n• Bank Transfer\n• Cash on Delivery\n\nAll payments are secured with 256-bit SSL encryption.",
                type: 'informative'
            };
        }
        
        // Return and warranty
        if (lowercaseMessage.includes('return') || lowercaseMessage.includes('warranty') || 
            lowercaseMessage.includes('exchange')) {
            return {
                text: "🔄 Our return & warranty policy:\n• 7-day return policy for most items\n• Electronics come with manufacturer warranty\n• Free return pickup for defective items\n• Exchange available for size/color issues\n\nJust contact our support team to initiate a return.",
                type: 'helpful'
            };
        }
        
        // Comparison queries
        if (lowercaseMessage.includes('compare') || lowercaseMessage.includes('difference') || 
            lowercaseMessage.includes('vs') || lowercaseMessage.includes('versus')) {
            return {
                text: "⚖️ I'd be happy to help you compare products! You can:\n• Use our comparison tool on the catalog page\n• Tell me which specific products to compare\n• Ask about differences in features, price, and specifications\n\nWhich products would you like to compare?",
                type: 'helpful'
            };
        }
        
        // Size and specifications
        if (lowercaseMessage.includes('size') || lowercaseMessage.includes('dimension') || 
            lowercaseMessage.includes('spec') || lowercaseMessage.includes('specification')) {
            return {
                text: "📏 For detailed specifications and sizing:\n• Check the product detail page for complete specs\n• Use our size guide for clothing and accessories\n• Product dimensions are listed in descriptions\n• Ask me about any specific product features!\n\nWhat product specifications do you need?",
                type: 'helpful'
            };
        }

        // Sales and deals
        if (lowercaseMessage.includes('sale') || lowercaseMessage.includes('deal') || 
            lowercaseMessage.includes('offer') || lowercaseMessage.includes('discount')) {
            return await this.getProductRecommendations('deals');
        }
        
        // Default responses based on sentiment
        if (lowercaseMessage.includes('help') || lowercaseMessage.includes('assist') || 
            lowercaseMessage.includes('support')) {
            return this.getRandomResponse('help');
        }
        
        if (lowercaseMessage.includes('thank') || lowercaseMessage.includes('thanks')) {
            return this.getRandomResponse('thanks');
        }
        
        if (lowercaseMessage.includes('bye') || lowercaseMessage.includes('goodbye')) {
            return this.getRandomResponse('goodbye');
        }

        if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || 
            lowercaseMessage.includes('hey') || lowercaseMessage.includes('good morning') || 
            lowercaseMessage.includes('good afternoon') || lowercaseMessage.includes('good evening')) {
            return this.getRandomResponse('greeting');
        }
        
        // Fallback response
        return {
            text: "🤔 I understand you're looking for information! I can help you with:\n• Product recommendations by price, brand, or category\n• Shipping and delivery options\n• Payment methods and security\n• Return and warranty policies\n• Product comparisons and specifications\n\nTry asking me something like 'Show me budget phones' or 'Recommend premium laptops'!",
            type: 'helpful'
        };
    }
    
    // Enhanced product recommendation system
    async getProductRecommendations(filterType, filterValue) {
        try {
            const products = await this.loadProducts();
            let recommendations = [];
            
            switch (filterType) {
                case 'price':
                    if (filterValue === 'low') {
                        recommendations = products
                            .filter(p => p.price < 20000)
                            .sort((a, b) => a.price - b.price)
                            .slice(0, 6);
                        return {
                            text: `💰 Here are some great budget-friendly options under ৳20,000:`,
                            products: recommendations,
                            type: 'product_list'
                        };
                    } else if (filterValue === 'high') {
                        recommendations = products
                            .filter(p => p.price >= 50000)
                            .sort((a, b) => b.price - a.price)
                            .slice(0, 6);
                        return {
                            text: `✨ Here are our premium products over ৳50,000:`,
                            products: recommendations,
                            type: 'product_list'
                        };
                    }
                    break;
                    
                case 'storage':
                    recommendations = products
                        .filter(p => p.description && (
                            p.description.toLowerCase().includes('gb') || 
                            p.description.toLowerCase().includes('storage') ||
                            p.description.toLowerCase().includes('memory') ||
                            p.description.toLowerCase().includes('256gb') ||
                            p.description.toLowerCase().includes('512gb') ||
                            p.description.toLowerCase().includes('1tb')
                        ))
                        .slice(0, 6);
                    return {
                        text: `💾 Here are products with excellent storage options:`,
                        products: recommendations,
                        type: 'product_list'
                    };
                    
                case 'brand':
                    const topBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].slice(0, 3);
                    const brandText = topBrands.length > 0 
                        ? `🏷️ Popular brands: ${topBrands.join(', ')}. ` 
                        : '';
                    recommendations = products
                        .filter(p => p.brand)
                        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                        .slice(0, 6);
                    return {
                        text: `${brandText}Here are some top-rated branded products:`,
                        products: recommendations,
                        type: 'product_list'
                    };
                    
                case 'category':
                    recommendations = products
                        .filter(p => {
                            const category = (p.category || '').toLowerCase();
                            const subcategory = (p.subcategory || '').toLowerCase();
                            const name = (p.name || '').toLowerCase();
                            const target = filterValue.toLowerCase();
                            
                            return category.includes(target) || 
                                   subcategory.includes(target) || 
                                   name.includes(target);
                        })
                        .slice(0, 6);
                    return {
                        text: `📱 Here are the best ${filterValue} we have:`,
                        products: recommendations,
                        type: 'product_list'
                    };

                case 'deals':
                    recommendations = products
                        .filter(p => p.discount && p.discount > 0)
                        .sort((a, b) => (b.discount || 0) - (a.discount || 0))
                        .slice(0, 6);
                    return {
                        text: `🔥 Here are today's hottest deals and discounts:`,
                        products: recommendations,
                        type: 'product_list'
                    };
                    
                default:
                    recommendations = products
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 6);
                    return {
                        text: `⭐ Here are some popular recommendations for you:`,
                        products: recommendations,
                        type: 'product_list'
                    };
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return {
                text: "I'm having trouble loading product recommendations right now. Please try browsing our catalog page to see all available products, or ask me again in a moment!",
                type: 'error'
            };
        }
    }
    
    // Load products from JSON
    async loadProducts() {
        if (this.cachedProducts) {
            return this.cachedProducts;
        }
        
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            this.cachedProducts = data.products || [];
            return this.cachedProducts;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-message';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-brain"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTyping() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses.default;
        return {
            text: responses[Math.floor(Math.random() * responses.length)],
            type: 'response'
        };
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIAssistant();
});

// Enhanced CSS for chatbot with product carousel
const chatbotCSS = `
/* Enhanced AI Chatbot Styles */
.chatbot-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    font-family: 'Inter', system-ui, sans-serif;
}

.chatbot-toggle {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    transition: all 0.3s ease;
    position: relative;
    color: white;
    font-size: 1.6rem;
    border: 3px solid white;
}

.chatbot-toggle:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
}

.chatbot-toggle.active {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.chatbot-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
    color: #1f2937;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 12px;
    animation: pulse 2s infinite;
    box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.chatbot-window {
    position: absolute;
    bottom: 85px;
    right: 0;
    width: 420px;
    height: 550px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transform: translateY(20px) scale(0.9);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    border: 1px solid rgba(59, 130, 246, 0.1);
    overflow: hidden;
}

.chatbot-window.active {
    transform: translateY(0) scale(1);
    opacity: 1;
    visibility: visible;
}

.chatbot-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chatbot-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 1.1rem;
}

.status-indicator {
    width: 10px;
    height: 10px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.chatbot-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: background 0.2s ease;
    font-size: 1.1rem;
}

.chatbot-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

.chatbot-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #f8fafc;
}

.message {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    animation: messageSlide 0.3s ease;
}

.message.user-message {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
}

.user-message .message-avatar {
    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
    color: white;
}

.bot-message .message-avatar {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
}

.message-content {
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 16px;
    position: relative;
    line-height: 1.5;
}

.user-message .message-content {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border-bottom-right-radius: 6px;
}

.bot-message .message-content {
    background: white;
    color: #1f2937;
    border-bottom-left-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-content p {
    margin: 0;
    white-space: pre-line;
}

.message-time {
    font-size: 0.75rem;
    opacity: 0.6;
    display: block;
    margin-top: 6px;
}

.typing-indicator {
    display: flex;
    gap: 5px;
    padding: 12px 0;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

/* Product Carousel Styles */
.product-carousel-message .message-content {
    max-width: 100%;
    padding: 0;
    background: transparent;
    box-shadow: none;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin: 10px 0;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
    position: relative;
    height: 120px;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.discount-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ef4444;
    color: white;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
}

.product-info {
    padding: 12px;
}

.product-info h4 {
    margin: 0 0 4px 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-brand {
    font-size: 0.7rem;
    color: #6b7280;
    margin-bottom: 6px;
}

.product-price {
    margin-bottom: 6px;
}

.current-price {
    font-weight: 700;
    color: #3b82f6;
    font-size: 0.9rem;
}

.original-price {
    text-decoration: line-through;
    color: #9ca3af;
    font-size: 0.75rem;
    margin-left: 4px;
}

.product-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: #fbbf24;
}

.rating-text {
    color: #6b7280;
}

.carousel-actions {
    margin-top: 12px;
    text-align: center;
}

.view-all-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s ease;
}

.view-all-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.chatbot-input-container {
    border-top: 1px solid #e5e7eb;
    padding: 16px 20px;
    background: white;
}

.chatbot-quick-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.quick-action {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    color: #6b7280;
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.quick-action:hover {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    transform: translateY(-1px);
}

.chatbot-input {
    display: flex;
    gap: 10px;
    align-items: center;
}

.chatbot-input input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    outline: none;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
    background: #f8fafc;
}

.chatbot-input input:focus {
    border-color: #3b82f6;
    background: white;
}

.chatbot-send {
    width: 40px;
    height: 40px;
    background: #e5e7eb;
    color: #9ca3af;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.chatbot-send.active,
.chatbot-send:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    transform: translateY(-1px);
}

@keyframes messageSlide {
    from {
        opacity: 0;
        transform: translateY(15px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes typing {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-12px); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@media (max-width: 480px) {
    .chatbot-window {
        width: calc(100vw - 30px);
        height: 70vh;
        right: 15px;
        bottom: 90px;
    }
    
    .chatbot-toggle {
        right: 15px;
        bottom: 15px;
        width: 56px;
        height: 56px;
    }

    .products-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .quick-action {
        font-size: 0.75rem;
        padding: 4px 8px;
    }
}
`;

// Add CSS to document if not already present
if (!document.getElementById('chatbot-styles')) {
    const style = document.createElement('style');
    style.id = 'chatbot-styles';
    style.textContent = chatbotCSS;
    document.head.appendChild(style);
}
