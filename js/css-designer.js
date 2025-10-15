// CineShelf CSS Designer - Tab-Aware Card Customization
// Save this as js/css-designer.js

window.CSSDesigner = (function() {
    
    const DEFAULT_STYLES = {
        cardBgOpacity: 0.12,
        cardBorderRadius: 16,
        cardBorderColor: '#ffffff',
        cardBorderOpacity: 0.25,
        cardHoverScale: 1.02,
        cardHoverLift: -8,
        posterBorderRadius: 16,
        posterAspectRatio: '2/3',
        posterFit: 'contain',
        cardShadowBlur: 25,
        cardShadowOpacity: 0.1,
        cardBlur: 20
    };

    let currentTab = 'both'; // 'collection', 'wishlist', or 'both'
    let stylesPerTab = {
        collection: {...DEFAULT_STYLES},
        wishlist: {...DEFAULT_STYLES},
        both: {...DEFAULT_STYLES}
    };

    const STORAGE_PREFIX = 'cineshelf_custom_styles_';

    // Sample movie data for preview
    const previewMovies = [
        {
            title: "The Matrix",
            year: 1999,
            format: "4K UHD",
            rating: 8.7,
            posterIMG: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
        },
        {
            title: "Inception",
            year: 2010,
            format: "Blu-ray",
            rating: 8.8,
            posterIMG: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
        },
        {
            title: "Interstellar",
            year: 2014,
            format: "Blu-ray",
            rating: 8.6,
            posterIMG: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
        }
    ];

    function init() {
        loadAllStyles();
        createPreviewCards();
        updateAllInputs();
        applyStylesToPage();
        
        // Set up tab selector event listener
        const tabSelector = document.getElementById('cssTabSelector');
        if (tabSelector) {
            tabSelector.addEventListener('change', handleTabChange);
        }
        
        console.log('CineShelf CSS Designer initialized (Tab-Aware)');
    }

    function handleTabChange(event) {
        currentTab = event.target.value;
        console.log('Designer tab changed to:', currentTab);
        updateAllInputs();
        applyStylesToPage();
    }

    function loadAllStyles() {
        // Load styles for each tab
        ['collection', 'wishlist', 'both'].forEach(tab => {
            const saved = localStorage.getItem(STORAGE_PREFIX + tab);
            if (saved) {
                try {
                    stylesPerTab[tab] = {...DEFAULT_STYLES, ...JSON.parse(saved)};
                    console.log(`Loaded custom styles for ${tab}:`, stylesPerTab[tab]);
                } catch (error) {
                    console.error(`Error loading ${tab} styles:`, error);
                    stylesPerTab[tab] = {...DEFAULT_STYLES};
                }
            }
        });
    }

    function saveStyles() {
        const currentStyles = stylesPerTab[currentTab];
        localStorage.setItem(STORAGE_PREFIX + currentTab, JSON.stringify(currentStyles));
        console.log(`Saved custom styles for ${currentTab}`);
    }

    function updateStyle(property, value) {
        // Convert string values to numbers where needed
        if (typeof DEFAULT_STYLES[property] === 'number') {
            value = parseFloat(value);
        }
        
        stylesPerTab[currentTab][property] = value;
        saveStyles();
        applyStylesToPage();
        updateValueDisplay(property, value);
    }

    function updateValueDisplay(property, value) {
        const displayElement = document.getElementById(property + 'Value');
        if (!displayElement) return;

        // Format display based on property type
        if (property.includes('Opacity') || property.includes('Scale')) {
            displayElement.textContent = value;
        } else if (property.includes('Lift')) {
            displayElement.textContent = value + 'px';
        } else if (property.includes('Radius') || property.includes('Blur') || property.includes('Shadow')) {
            displayElement.textContent = value + 'px';
        } else if (property === 'posterAspectRatio') {
            displayElement.textContent = value;
        } else {
            displayElement.textContent = value;
        }
    }

    function updateAllInputs() {
        // Update all input values and displays based on current tab
        const currentStyles = stylesPerTab[currentTab];
        Object.keys(currentStyles).forEach(property => {
            const input = document.getElementById(property);
            if (input) {
                input.value = currentStyles[property];
            }
            updateValueDisplay(property, currentStyles[property]);
        });
    }

    function applyStylesToPage() {
        // Create or update the custom style element
        let styleElement = document.getElementById('cineshelf-custom-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'cineshelf-custom-styles';
            document.head.appendChild(styleElement);
        }

        const css = generateCSS();
        styleElement.textContent = css;
        
        // Update preview cards immediately
        updatePreviewCards();
    }

    function generateCSS() {
        let css = '/* CineShelf Custom Card Styles - Tab-Aware */\n\n';
        
        // Generate CSS for 'both' (applies to all tabs)
        if (stylesPerTab.both) {
            css += generateCSSForTab('both', stylesPerTab.both);
        }
        
        // Generate CSS for 'collection' (Movies tab only)
        if (stylesPerTab.collection) {
            css += generateCSSForTab('collection', stylesPerTab.collection);
        }
        
        // Generate CSS for 'wishlist' (Wishlist tab only)
        if (stylesPerTab.wishlist) {
            css += generateCSSForTab('wishlist', stylesPerTab.wishlist);
        }
        
        return css;
    }

    function generateCSSForTab(tab, styles) {
        const s = styles;
        const borderColor = hexToRgba(s.cardBorderColor, s.cardBorderOpacity);
        
        // Selector based on tab
        let selector = '';
        if (tab === 'both') {
            selector = '.movie-card';
        } else if (tab === 'collection') {
            selector = '#collection .movie-card';
        } else if (tab === 'wishlist') {
            selector = '#wishlist .movie-card';
        }
        
        return `
        /* Designer styles for: ${tab} */
        ${selector} {
            background: rgba(255, 255, 255, ${s.cardBgOpacity}) !important;
            border-radius: ${s.cardBorderRadius}px !important;
            border-color: ${borderColor} !important;
            backdrop-filter: blur(${s.cardBlur}px) !important;
            -webkit-backdrop-filter: blur(${s.cardBlur}px) !important;
            box-shadow: 0 8px ${s.cardShadowBlur}px rgba(0, 0, 0, ${s.cardShadowOpacity}) !important;
        }
        
        ${selector}:hover {
            transform: translateY(${s.cardHoverLift}px) scale(${s.cardHoverScale}) !important;
        }
        
        ${selector} .movie-poster {
            border-radius: ${s.posterBorderRadius}px ${s.posterBorderRadius}px 0 0 !important;
            aspect-ratio: ${s.posterAspectRatio} !important;
            object-fit: ${s.posterFit} !important;
        }
        `;
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function createPreviewCards() {
        const container = document.getElementById('cssPreviewGrid');
        if (!container) return;

        container.innerHTML = '';
        
        previewMovies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${movie.posterIMG}" alt="${movie.title}" class="movie-poster" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'300\'%3E%3Crect fill=\'%23333\' width=\'200\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' fill=\'white\' font-size=\'20\'%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="movie-card-content">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-info">
                        <span class="movie-card-year">${movie.year}</span>
                        <span class="movie-card-format"> • ${movie.format}</span>
                        <br><span class="movie-card-rating">⭐ ${movie.rating}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function updatePreviewCards() {
        // Re-create preview cards to apply new styles
        createPreviewCards();
    }

    function resetStyles() {
        if (confirm(`Reset ${currentTab === 'both' ? 'global' : currentTab} card styles to defaults? This cannot be undone.`)) {
            stylesPerTab[currentTab] = {...DEFAULT_STYLES};
            saveStyles();
            updateAllInputs();
            applyStylesToPage();
            
            if (window.App && window.App.showStatus) {
                window.App.showStatus(`🎨 ${currentTab === 'both' ? 'Global' : currentTab} card styles reset!`, 'success');
            }
        }
    }

    function exportCSS() {
        const css = generateCSS();
        
        // Create downloadable file
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cineshelf-custom-cards.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (window.App && window.App.showStatus) {
            window.App.showStatus('📥 CSS exported! Check your downloads.', 'success');
        }
    }

    // Expose public methods
    return {
        init,
        updateStyle,
        resetStyles,
        exportCSS
    };

})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CSSDesigner.init);
} else {
    CSSDesigner.init();
}