// CineShelf CSS Designer - ULTIMATE Multi-View Designer
// Supports: Tab (Movies/Wishlist/Both) × View Mode (Grid/List/Detail/Small) × Grid Columns (2-8)
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

    // Current selection
    let currentTab = 'both'; // 'collection', 'wishlist', or 'both'
    let currentViewMode = 'grid'; // 'grid', 'list', 'detail', 'small'
    let currentGridCols = 4; // 2-8, only relevant when viewMode is 'grid'

    // Nested storage structure: tab → viewMode → (gridCols if grid) → styles
    let allStyles = {
        collection: {
            grid: { 2: {...DEFAULT_STYLES}, 3: {...DEFAULT_STYLES}, 4: {...DEFAULT_STYLES}, 5: {...DEFAULT_STYLES}, 6: {...DEFAULT_STYLES}, 7: {...DEFAULT_STYLES}, 8: {...DEFAULT_STYLES} },
            list: {...DEFAULT_STYLES},
            detail: {...DEFAULT_STYLES},
            small: {...DEFAULT_STYLES}
        },
        wishlist: {
            grid: { 2: {...DEFAULT_STYLES}, 3: {...DEFAULT_STYLES}, 4: {...DEFAULT_STYLES}, 5: {...DEFAULT_STYLES}, 6: {...DEFAULT_STYLES}, 7: {...DEFAULT_STYLES}, 8: {...DEFAULT_STYLES} },
            list: {...DEFAULT_STYLES},
            detail: {...DEFAULT_STYLES},
            small: {...DEFAULT_STYLES}
        },
        both: {
            grid: { 2: {...DEFAULT_STYLES}, 3: {...DEFAULT_STYLES}, 4: {...DEFAULT_STYLES}, 5: {...DEFAULT_STYLES}, 6: {...DEFAULT_STYLES}, 7: {...DEFAULT_STYLES}, 8: {...DEFAULT_STYLES} },
            list: {...DEFAULT_STYLES},
            detail: {...DEFAULT_STYLES},
            small: {...DEFAULT_STYLES}
        }
    };

    const STORAGE_KEY = 'cineshelf_ultimate_styles';

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
        setupEventListeners();
        updateUIState();
        createPreviewCards();
        updateAllInputs();
        applyStylesToPage();
        
        console.log('🎨 CineShelf ULTIMATE CSS Designer initialized!');
    }

    function setupEventListeners() {
        const tabSelector = document.getElementById('cssTabSelector');
        const viewModeSelector = document.getElementById('cssViewModeSelector');
        const gridColsSelector = document.getElementById('cssGridColsSelector');
        
        if (tabSelector) {
            tabSelector.addEventListener('change', (e) => {
                currentTab = e.target.value;
                console.log('Tab changed to:', currentTab);
                updateUIState();
            });
        }
        
        if (viewModeSelector) {
            viewModeSelector.addEventListener('change', (e) => {
                currentViewMode = e.target.value;
                console.log('View mode changed to:', currentViewMode);
                updateUIState();
            });
        }
        
        if (gridColsSelector) {
            gridColsSelector.addEventListener('change', (e) => {
                currentGridCols = parseInt(e.target.value);
                console.log('Grid columns changed to:', currentGridCols);
                updateUIState();
            });
        }
    }

    function updateUIState() {
        // Show/hide grid columns selector based on view mode
        const gridColsContainer = document.getElementById('cssGridColsContainer');
        if (gridColsContainer) {
            if (currentViewMode === 'grid') {
                gridColsContainer.style.display = 'block';
            } else {
                gridColsContainer.style.display = 'none';
            }
        }
        
        // Update preview and inputs
        createPreviewCards();
        updateAllInputs();
        applyStylesToPage();
    }

    function getCurrentStyles() {
        const tab = allStyles[currentTab];
        const view = tab[currentViewMode];
        
        if (currentViewMode === 'grid') {
            return view[currentGridCols];
        } else {
            return view;
        }
    }

    function loadAllStyles() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all properties exist
                ['collection', 'wishlist', 'both'].forEach(tab => {
                    if (parsed[tab]) {
                        // Grid views
                        if (parsed[tab].grid) {
                            for (let cols = 2; cols <= 8; cols++) {
                                if (parsed[tab].grid[cols]) {
                                    allStyles[tab].grid[cols] = {...DEFAULT_STYLES, ...parsed[tab].grid[cols]};
                                }
                            }
                        }
                        // Other views
                        ['list', 'detail', 'small'].forEach(view => {
                            if (parsed[tab][view]) {
                                allStyles[tab][view] = {...DEFAULT_STYLES, ...parsed[tab][view]};
                            }
                        });
                    }
                });
                console.log('✅ Loaded all custom styles from storage');
            } catch (error) {
                console.error('❌ Error loading styles:', error);
            }
        }
    }

    function saveStyles() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allStyles));
        console.log('💾 Saved all styles');
    }

    function updateStyle(property, value) {
        // Convert string values to numbers where needed
        if (typeof DEFAULT_STYLES[property] === 'number') {
            value = parseFloat(value);
        }
        
        const currentStyles = getCurrentStyles();
        currentStyles[property] = value;
        
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
        const currentStyles = getCurrentStyles();
        Object.keys(currentStyles).forEach(property => {
            const input = document.getElementById(property);
            if (input) {
                input.value = currentStyles[property];
            }
            updateValueDisplay(property, currentStyles[property]);
        });
    }

    function applyStylesToPage() {
        let styleElement = document.getElementById('cineshelf-custom-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'cineshelf-custom-styles';
            document.head.appendChild(styleElement);
        }

        const css = generateCSS();
        styleElement.textContent = css;
        
        // Update preview immediately
        updatePreviewCards();
    }

    function generateCSS() {
        let css = '/* CineShelf ULTIMATE Custom Styles */\n/* Tab × View Mode × Grid Columns */\n\n';
        
        // Generate CSS for all tabs
        ['both', 'collection', 'wishlist'].forEach(tab => {
            const tabData = allStyles[tab];
            
            // Grid views (all column counts)
            for (let cols = 2; cols <= 8; cols++) {
                css += generateCSSForConfig(tab, 'grid', cols, tabData.grid[cols]);
            }
            
            // Other views
            ['list', 'detail', 'small'].forEach(view => {
                css += generateCSSForConfig(tab, view, null, tabData[view]);
            });
        });
        
        return css;
    }

    function generateCSSForConfig(tab, viewMode, gridCols, styles) {
        const s = styles;
        const borderColor = hexToRgba(s.cardBorderColor, s.cardBorderOpacity);
        
        // Build selector based on tab, view mode, and grid columns
        let selector = '';
        let comment = '';
        
        if (tab === 'both') {
            // Global styles
            if (viewMode === 'grid') {
                selector = `.movie-grid.grid-view.grid-cols-${gridCols} .movie-card`;
                comment = `Global Grid ${gridCols} Columns`;
            } else if (viewMode === 'list') {
                selector = `.movie-grid.list-view .movie-card.list-item`;
                comment = `Global List View`;
            } else if (viewMode === 'detail') {
                selector = `.movie-grid.detail-view .movie-card.detail-item`;
                comment = `Global Detail View`;
            } else if (viewMode === 'small') {
                selector = `.movie-grid.small-view .movie-card.small-item`;
                comment = `Global Small View`;
            }
        } else {
            // Tab-specific styles
            const tabId = tab === 'collection' ? '#collection' : '#wishlist';
            
            if (viewMode === 'grid') {
                selector = `${tabId} .movie-grid.grid-view.grid-cols-${gridCols} .movie-card`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} → Grid ${gridCols} Columns`;
            } else if (viewMode === 'list') {
                selector = `${tabId} .movie-grid.list-view .movie-card.list-item`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} → List View`;
            } else if (viewMode === 'detail') {
                selector = `${tabId} .movie-grid.detail-view .movie-card.detail-item`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} → Detail View`;
            } else if (viewMode === 'small') {
                selector = `${tabId} .movie-grid.small-view .movie-card.small-item`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} → Small View`;
            }
        }
        
        return `
/* ${comment} */
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

        // Clear existing
        container.innerHTML = '';
        
        // Apply view mode class to container
        container.className = 'movie-grid';
        if (currentViewMode === 'grid') {
            container.classList.add('grid-view', `grid-cols-${currentGridCols}`);
        } else if (currentViewMode === 'list') {
            container.classList.add('list-view');
        } else if (currentViewMode === 'detail') {
            container.classList.add('detail-view');
        } else if (currentViewMode === 'small') {
            container.classList.add('small-view');
        }
        
        // Create cards
        previewMovies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            
            // Add view-specific class
            if (currentViewMode === 'list') {
                card.classList.add('list-item');
            } else if (currentViewMode === 'detail') {
                card.classList.add('detail-item');
            } else if (currentViewMode === 'small') {
                card.classList.add('small-item');
            }
            
            // Different HTML structure for list/detail views
            if (currentViewMode === 'list' || currentViewMode === 'detail') {
                card.innerHTML = `
                    <img src="${movie.posterIMG}" alt="${movie.title}" class="movie-poster" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'300\'%3E%3Crect fill=\'%23333\' width=\'200\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' fill=\'white\' font-size=\'20\'%3ENo Image%3C/text%3E%3C/svg%3E'">
                    <div class="movie-content">
                        <div class="movie-title">${movie.title}</div>
                        <div class="movie-info">
                            <span class="movie-card-year">${movie.year}</span>
                            <span class="movie-card-format"> • ${movie.format}</span>
                            <br><span class="movie-card-rating">⭐ ${movie.rating}</span>
                        </div>
                    </div>
                `;
            } else {
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
            }
            
            container.appendChild(card);
        });
    }

    function updatePreviewCards() {
        createPreviewCards();
    }

    function resetStyles() {
        let message = '';
        if (currentViewMode === 'grid') {
            message = `Reset ${currentTab === 'both' ? 'global' : currentTab} → Grid ${currentGridCols} columns to defaults?`;
        } else {
            message = `Reset ${currentTab === 'both' ? 'global' : currentTab} → ${currentViewMode} view to defaults?`;
        }
        
        if (confirm(message + ' This cannot be undone.')) {
            const currentStyles = getCurrentStyles();
            Object.keys(DEFAULT_STYLES).forEach(key => {
                currentStyles[key] = DEFAULT_STYLES[key];
            });
            
            saveStyles();
            updateAllInputs();
            applyStylesToPage();
            
            if (window.App && window.App.showStatus) {
                window.App.showStatus('🎨 Styles reset to defaults!', 'success');
            }
        }
    }

    function exportCSS() {
        const css = generateCSS();
        
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cineshelf-ultimate-custom-styles.css';
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