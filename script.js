document.addEventListener('DOMContentLoaded', () => {
    // Instead of auto-showing, wait for first user interaction
    const firstInteraction = () => {
        document.removeEventListener('click', firstInteraction);
        setTimeout(showCall, 1000);
    };
    document.addEventListener('click', firstInteraction);
});

function showCall() {
    const callPopup = document.getElementById('callPopup');
    const ringtone = document.getElementById('ringtone');
    
    callPopup.classList.add('active');
    
    // Safely handle vibration
    try {
        if ('vibrate' in navigator && document.hasFocus()) {
            navigator.vibrate([1000, 2000, 1000, 2000]);
        }
    } catch (e) {
        console.log('Vibration not supported or not permitted');
    }

    // Safely handle audio
    try {
        ringtone.volume = 0;
        const playPromise = ringtone.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Fade in the volume
                let volume = 0;
                const fadeIn = setInterval(() => {
                    if (volume < 0.7) {
                        volume = Math.min(volume + 0.1, 0.7);
                        ringtone.volume = volume;
                    } else {
                        clearInterval(fadeIn);
                    }
                }, 100);
            }).catch(error => {
                console.log('Audio playback prevented:', error);
            });
        }
    } catch (e) {
        console.log('Audio playback error:', e);
    }
}

function stopRinging() {
    const ringtone = document.getElementById('ringtone');
    const callPopup = document.getElementById('callPopup');
    
    // Safely stop vibration
    try {
        if ('vibrate' in navigator) {
            navigator.vibrate(0);
        }
    } catch (e) {
        console.log('Vibration stop error:', e);
    }

    // Safely fade out audio
    try {
        let volume = ringtone.volume;
        const fadeOut = setInterval(() => {
            if (volume > 0) {
                volume = Math.max(volume - 0.1, 0);
                ringtone.volume = volume;
            } else {
                clearInterval(fadeOut);
                ringtone.pause();
                ringtone.currentTime = 0;
            }
        }, 50);
    } catch (e) {
        console.log('Audio stop error:', e);
        // Fallback: just try to stop the audio
        try {
            ringtone.pause();
            ringtone.currentTime = 0;
        } catch (e) {}
    }

    callPopup.classList.remove('active');
}

function declineCall() {
    stopRinging();
}

function acceptCall() {
    stopRinging();
}

// Remove the click event listener since we're handling it in DOMContentLoaded

class ProductManager {
    constructor() {
        this.productsContainer = document.getElementById('productsContainer');
    }

    async fetchProducts() {
        try {
            const apiUrl = 'https://joyabuy.com/search-info/get-wd-shop-full';
            const headers = {
                'accept': '*/*',
                'accept-language': 'en-GB,en;q=0.9',
                'referer': 'https://joyabuy.com/shops/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            };

            const response = await fetch(`${apiUrl}?${new URLSearchParams({
                ShopId: '1722231041',
                Page: '1',
                Language: 'en'
            })}`, { headers });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Format products with correct Weidian URLs
            const products = data.data.shopProducts.productList.map(product => ({
                title: product.name,
                image: product.imgUrl,
                price: `¥${product.price}`,
                link: `https://weidian.com/item.html?itemID=${product.id}&userid=1722231041`,
                sold: product.sold
            }));
            
            return [{
                title: "All Products",
                products: products
            }];

        } catch (error) {
            console.error('Error fetching products:', error);
            // Return fallback with shop link on error
            return [{
                title: "Error Loading Products",
                products: [{
                    title: "Visit Our Weidian Shop",
                    image: "https://via.placeholder.com/300",
                    price: "N/A", 
                    link: "https://weidian.com/?userid=1722231041"
                }]
            }];
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="price">${product.price}</div>
            </div>
        `;
        
        // Add click event to open Weidian product page
        card.addEventListener('click', () => {
            window.open(product.link, '_blank');
        });
        
        return card;
    }

    createCategorySection(category) {
        return category.products.map(product => this.createProductCard(product));
    }

    async displayProducts() {
        this.productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
        
        try {
            const categories = await this.fetchProducts();
            this.productsContainer.innerHTML = '';
            
            categories.forEach(category => {
                const products = this.createCategorySection(category);
                products.forEach(product => {
                    this.productsContainer.appendChild(product);
                });
            });

        } catch (error) {
            this.productsContainer.innerHTML = `
                <div class="error">
                    <p>Unable to load products. Please try again later.</p>
                    <a href="https://shop236556112.taobao.com" target="_blank" class="error-link">
                        Visit Taobao Store
                    </a>
                </div>
            `;
        }
    }
}

// Function to load products (called by button click)
function loadProducts() {
    scrollToSection('productsSection');
}

// Initialize products when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize products
    const productManager = new ProductManager();
    productManager.displayProducts();

    // Check for URL hash and scroll if needed
    const hash = window.location.hash;
    if (hash) {
        const sectionId = hash.slice(1); // Remove the # from the hash
        setTimeout(() => {
            scrollToSection(sectionId);
        }, 500); // Small delay to ensure content is loaded
    }
});

// Update the scroll function for better behavior
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 0;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = section.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Add click event listeners for the buttons
document.addEventListener('DOMContentLoaded', () => {
    const productManager = new ProductManager();
    productManager.displayProducts();

    // Add button event listeners
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const sectionId = e.target.getAttribute('data-section');
            scrollToSection(sectionId);
        });
    });
}); 