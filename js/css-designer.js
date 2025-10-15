// CineShelf COMPREHENSIVE CSS Designer
// Controls EVERYTHING: Layout, Typography, Colors, Spacing, Visibility
// Save as: js/css-designer.js

window.CSSDesigner = (function() {
    
    // Complete default configuration
    const DEFAULT_STYLES = {
        // CARD APPEARANCE
        cardBgOpacity: 0.12,
        cardBorderRadius: 16,
        cardBorderColor: '#ffffff',
        cardBorderOpacity: 0.25,
        cardBlur: 20,
        cardShadowBlur: 25,
        cardShadowOpacity: 0.1,
        cardHoverScale: 1.02,
        cardHoverLift: -8,
        
        // CARD LAYOUT
        cardPadding: 12, // px
        cardGap: 4, // px between elements inside card
        
        // POSTER
        posterBorderRadius: 16,
        posterAspectRatio: '2/3',
        posterFit: 'cover',
        posterHeight: 220, // px for grid view
        
        // TYPOGRAPHY - TITLE
        titleFontSize: 15, // px
        titleLineHeight: 1.3,
        titleLineClamp: 2,
        titleMarginBottom: 6, // px
        titleFontWeight: 700,
        
        // TYPOGRAPHY - INFO ELEMENTS
        infoFontSize: 13, // px
        infoLineHeight: 1.5,
        
        // INDIVIDUAL INFO ELEMENTS (font size in px)
        yearFontSize: 13,
        formatFontSize: 13,
        ratingFontSize: 13,
        runtimeFontSize: 12,
        directorFontSize: 12,
        genreFontSize: 12,
        
        // VISIBILITY CONTROLS
        showYear: true,
        showFormat: true,
        showRating: true,
        showRuntime: true,
        showDirector: true,
        showGenre: true,
        
        // LIST VIEW SPECIFIC
        listPosterWidth: 60, // px
        listPosterHeight: 90, // px
        listGap: 16, // px gap between poster and content
        
        // DETAIL VIEW SPECIFIC
        detailPosterWidth: 120, // px
        detailPosterHeight: 180, // px
        detailGap: 24, // px
        
        // SMALL VIEW SPECIFIC
        smallPosterHeight: 130, // px
        smallMaxWidth: 140 // px
    };
    
    // Current selection state
    let currentTab = 'both'; // 'collection', 'wishlist', or 'both'
    let currentViewMode = 'grid'; // 'grid', 'list', 'detail', 'small'
    let currentGridCols = 4; // 2-8
    
    // Storage structure: tab → viewMode → (gridCols if grid) → styles
    let allStyles = initializeAllStyles();
    
    const STORAGE_KEY = 'cineshelf_ultimate_styles';
    
    function initializeAllStyles() {
        const structure = {};
        ['collection', 'wishlist', 'both'].forEach(tab => {
            structure[tab] = {
                grid: {},
                list: {...DEFAULT_STYLES},
                detail: {...DEFAULT_STYLES},
                small: {...DEFAULT_STYLES}
            };
            // Initialize each grid column count
            for (let cols = 2; cols <= 8; cols++) {
                structure[tab].grid[cols] = {...DEFAULT_STYLES};
            }
        });
        return structure;
    }
    
    // Preview movies
    const previewMovies = [
        { title: 'Ghostbusters', year: 1984, rating: 8.0, format: 'Blu-ray', runtime: '105 min', director: 'Ivan Reitman', genre: 'Comedy', posterIMG: 'https://image.tmdb.org/t/p/w500/3FS5OiozObQ4xKj7WI.jpg' },
        { title: 'The Matrix', year: 1999, rating: 8.7, format: '4K', runtime: '136 min', director: 'Wachowski', genre: 'Sci-Fi', posterIMG: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
        { title: 'Jurassic Park', year: 1993, rating: 8.2, format: 'DVD', runtime: '127 min', director: 'Spielberg', genre: 'Adventure', posterIMG: 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg' }
    ];
    
    function init() {
        console.log('🎨 Comprehensive CSS Designer initializing...');
        
        loadAllStyles();
        setupDropdownListeners();
        setupAllControls();
        updateAllInputs();
        updateDropdownDisplay();
        createPreviewCards();
        applyStylesToPage();
        
        console.log('✅ CSS Designer ready with full control!');
    }
    
    function setupDropdownListeners() {
        // Tab selector
        const tabSelector = document.getElementById('cssTabSelector');
        if (tabSelector) {
            tabSelector.value = currentTab;
            tabSelector.addEventListener('change', (e) => {
                currentTab = e.target.value;
                updateAllInputs();
                updateDropdownDisplay();
                createPreviewCards();
                console.log(`📂 Tab: ${currentTab}`);
            });
        }
        
        // View mode selector
        const viewSelector = document.getElementById('cssViewModeSelector');
        if (viewSelector) {
            viewSelector.value = currentViewMode;
            viewSelector.addEventListener('change', (e) => {
                currentViewMode = e.target.value;
                updateAllInputs();
                updateDropdownDisplay();
                createPreviewCards();
                console.log(`👁️ View: ${currentViewMode}`);
            });
        }
        
        // Grid columns selector
        const colsSelector = document.getElementById('cssGridColsSelector');
        if (colsSelector) {
            colsSelector.value = currentGridCols;
            colsSelector.addEventListener('change', (e) => {
                currentGridCols = parseInt(e.target.value);
                updateAllInputs();
                updateDropdownDisplay();
                createPreviewCards();
                console.log(`📐 Columns: ${currentGridCols}`);
            });
        }
    }
    
    function setupAllControls() {
        // All slider controls
        const sliders = [
            'cardBgOpacity', 'cardBorderRadius', 'cardBorderOpacity', 'cardBlur',
            'cardShadowBlur', 'cardShadowOpacity', 'cardHoverScale', 'cardHoverLift',
            'posterBorderRadius', 'posterHeight', 'cardPadding', 'cardGap',
            'titleFontSize', 'titleLineHeight', 'titleLineClamp', 'titleMarginBottom', 'titleFontWeight',
            'infoFontSize', 'infoLineHeight',
            'yearFontSize', 'formatFontSize', 'ratingFontSize',
            'runtimeFontSize', 'directorFontSize', 'genreFontSize',
            'listPosterWidth', 'listPosterHeight', 'listGap',
            'detailPosterWidth', 'detailPosterHeight', 'detailGap',
            'smallPosterHeight', 'smallMaxWidth'
        ];
        
        sliders.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    updateStyle(id, parseFloat(e.target.value));
                });
            }
        });
        
        // Color picker
        const colorInput = document.getElementById('cardBorderColor');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                updateStyle('cardBorderColor', e.target.value);
            });
        }
        
        // Select dropdowns
        const selects = ['posterFit', 'posterAspectRatio'];
        selects.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => {
                    updateStyle(id, e.target.value);
                });
            }
        });
        
        // Visibility checkboxes
        const checkboxes = ['showYear', 'showFormat', 'showRating', 'showRuntime', 'showDirector', 'showGenre'];
        checkboxes.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', (e) => {
                    updateStyle(id, e.target.checked);
                });
            }
        });
    }
    
    function updateDropdownDisplay() {
        // Show/hide grid columns selector
        const gridColsRow = document.getElementById('cssGridColsSelector')?.closest('.form-group');
        if (gridColsRow) {
            gridColsRow.style.display = currentViewMode === 'grid' ? 'block' : 'none';
        }
        
        // Update status display
        let statusText = '';
        const tabName = currentTab === 'both' ? 'Global (Both)' : (currentTab === 'collection' ? 'Movies' : 'Wishlist');
        const viewName = currentViewMode.charAt(0).toUpperCase() + currentViewMode.slice(1);
        
        if (currentViewMode === 'grid') {
            statusText = `${tabName} → ${viewName} → ${currentGridCols} Columns`;
        } else {
            statusText = `${tabName} → ${viewName} View`;
        }
        
        const statusDisplay = document.querySelector('.css-current-config-display');
        if (statusDisplay) {
            statusDisplay.textContent = `Editing: ${statusText}`;
        }
    }
    
    function getCurrentStyles() {
        if (currentViewMode === 'grid') {
            return allStyles[currentTab][currentViewMode][currentGridCols];
        } else {
            return allStyles[currentTab][currentViewMode];
        }
    }
    
    function updateStyle(property, value) {
        const currentStyles = getCurrentStyles();
        currentStyles[property] = value;
        saveAllStyles();
        applyStylesToPage();
        updateValueDisplay(property, value);
    }
    
    function updateValueDisplay(property, value) {
        const displayElement = document.getElementById(property + 'Value');
        if (!displayElement) return;
        
        if (typeof value === 'boolean') {
            displayElement.textContent = value ? 'Yes' : 'No';
        } else if (property.includes('Opacity') || property.includes('Scale') || property.includes('LineHeight')) {
            displayElement.textContent = value;
        } else if (property.includes('Weight') || property.includes('Clamp')) {
            displayElement.textContent = value;
        } else if (typeof value === 'number') {
            displayElement.textContent = value + 'px';
        } else {
            displayElement.textContent = value;
        }
    }
    
    function updateAllInputs() {
        const currentStyles = getCurrentStyles();
        
        Object.keys(currentStyles).forEach(property => {
            const input = document.getElementById(property);
            if (!input) return;
            
            if (input.type === 'checkbox') {
                input.checked = currentStyles[property];
            } else {
                input.value = currentStyles[property];
            }
            
            updateValueDisplay(property, currentStyles[property]);
        });
    }
    
    function loadAllStyles() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const loaded = JSON.parse(saved);
                // Merge loaded with defaults to ensure all properties exist
                ['collection', 'wishlist', 'both'].forEach(tab => {
                    ['list', 'detail', 'small'].forEach(view => {
                        allStyles[tab][view] = {...DEFAULT_STYLES, ...(loaded[tab]?.[view] || {})};
                    });
                    for (let cols = 2; cols <= 8; cols++) {
                        allStyles[tab].grid[cols] = {...DEFAULT_STYLES, ...(loaded[tab]?.grid?.[cols] || {})};
                    }
                });
                console.log('✅ Loaded saved styles');
            } catch (error) {
                console.error('Error loading styles:', error);
                allStyles = initializeAllStyles();
            }
        }
    }
    
    function saveAllStyles() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allStyles));
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
        updatePreviewCards();
    }
    
    function generateCSS() {
        let css = '/* CineShelf Comprehensive Custom Styles - Generated by Designer */\n\n';
        
        // Generate in order: tab-specific first, then global (for proper cascade)
        ['collection', 'wishlist', 'both'].forEach(tab => {
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
        
        // Build selector
        let cardSelector = '';
        let posterSelector = '';
        let contentSelector = '';
        let comment = '';
        
        if (tab === 'both') {
            // Global rules with high specificity
            if (viewMode === 'grid') {
                cardSelector = `body #collection .movie-grid.grid-view.grid-cols-${gridCols} .movie-card, body #wishlist .movie-grid.grid-view.grid-cols-${gridCols} .movie-card`;
                posterSelector = `body #collection .movie-grid.grid-view.grid-cols-${gridCols} .movie-poster, body #wishlist .movie-grid.grid-view.grid-cols-${gridCols} .movie-poster`;
                contentSelector = `body #collection .movie-grid.grid-view.grid-cols-${gridCols} .movie-card-content, body #wishlist .movie-grid.grid-view.grid-cols-${gridCols} .movie-card-content`;
                comment = `Global - Grid ${gridCols} Columns`;
            } else if (viewMode === 'list') {
                cardSelector = `body #collection .movie-grid.list-view .movie-card.list-item, body #wishlist .movie-grid.list-view .movie-card.list-item`;
                posterSelector = `body #collection .movie-grid.list-view .movie-poster, body #wishlist .movie-grid.list-view .movie-poster`;
                contentSelector = `body #collection .movie-grid.list-view .movie-content, body #wishlist .movie-grid.list-view .movie-content`;
                comment = `Global - List View`;
            } else if (viewMode === 'detail') {
                cardSelector = `body #collection .movie-grid.detail-view .movie-card.detail-item, body #wishlist .movie-grid.detail-view .movie-card.detail-item`;
                posterSelector = `body #collection .movie-grid.detail-view .movie-poster, body #wishlist .movie-grid.detail-view .movie-poster`;
                contentSelector = `body #collection .movie-grid.detail-view .movie-content, body #wishlist .movie-grid.detail-view .movie-content`;
                comment = `Global - Detail View`;
            } else if (viewMode === 'small') {
                cardSelector = `body #collection .movie-grid.small-view .movie-card.small-item, body #wishlist .movie-grid.small-view .movie-card.small-item`;
                posterSelector = `body #collection .movie-grid.small-view .movie-poster, body #wishlist .movie-grid.small-view .movie-poster`;
                contentSelector = `body #collection .movie-grid.small-view .movie-card-content, body #wishlist .movie-grid.small-view .movie-card-content`;
                comment = `Global - Small View`;
            }
        } else {
            // Tab-specific rules
            const tabId = tab === 'collection' ? '#collection' : '#wishlist';
            
            if (viewMode === 'grid') {
                cardSelector = `${tabId} .movie-grid.grid-view.grid-cols-${gridCols} .movie-card`;
                posterSelector = `${tabId} .movie-grid.grid-view.grid-cols-${gridCols} .movie-poster`;
                contentSelector = `${tabId} .movie-grid.grid-view.grid-cols-${gridCols} .movie-card-content`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} - Grid ${gridCols} Columns`;
            } else if (viewMode === 'list') {
                cardSelector = `${tabId} .movie-grid.list-view .movie-card.list-item`;
                posterSelector = `${tabId} .movie-grid.list-view .movie-poster`;
                contentSelector = `${tabId} .movie-grid.list-view .movie-content`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} - List View`;
            } else if (viewMode === 'detail') {
                cardSelector = `${tabId} .movie-grid.detail-view .movie-card.detail-item`;
                posterSelector = `${tabId} .movie-grid.detail-view .movie-poster`;
                contentSelector = `${tabId} .movie-grid.detail-view .movie-content`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} - Detail View`;
            } else if (viewMode === 'small') {
                cardSelector = `${tabId} .movie-grid.small-view .movie-card.small-item`;
                posterSelector = `${tabId} .movie-grid.small-view .movie-poster`;
                contentSelector = `${tabId} .movie-grid.small-view .movie-card-content`;
                comment = `${tab === 'collection' ? 'Movies' : 'Wishlist'} - Small View`;
            }
        }
        
        let css = `\n/* ${comment} */\n`;
        
        // CARD STYLING
        css += `${cardSelector} {
    background: rgba(255, 255, 255, ${s.cardBgOpacity}) !important;
    border-radius: ${s.cardBorderRadius}px !important;
    border-color: ${borderColor} !important;
    backdrop-filter: blur(${s.cardBlur}px) !important;
    -webkit-backdrop-filter: blur(${s.cardBlur}px) !important;
    box-shadow: 0 8px ${s.cardShadowBlur}px rgba(0, 0, 0, ${s.cardShadowOpacity}) !important;
}\n\n`;
        
        css += `${cardSelector}:hover {
    transform: translateY(${s.cardHoverLift}px) scale(${s.cardHoverScale}) !important;
}\n\n`;
        
        // POSTER STYLING
        if (viewMode === 'grid') {
            css += `${posterSelector} {
    border-radius: ${s.posterBorderRadius}px ${s.posterBorderRadius}px 0 0 !important;
    aspect-ratio: ${s.posterAspectRatio} !important;
    object-fit: ${s.posterFit} !important;
    height: ${s.posterHeight}px !important;
}\n\n`;
        } else if (viewMode === 'list') {
            css += `${posterSelector} {
    width: ${s.listPosterWidth}px !important;
    height: ${s.listPosterHeight}px !important;
    border-radius: ${s.posterBorderRadius}px !important;
    object-fit: ${s.posterFit} !important;
}\n\n`;
            css += `${cardSelector} {
    gap: ${s.listGap}px !important;
    padding: ${s.cardPadding}px !important;
}\n\n`;
        } else if (viewMode === 'detail') {
            css += `${posterSelector} {
    width: ${s.detailPosterWidth}px !important;
    height: ${s.detailPosterHeight}px !important;
    border-radius: ${s.posterBorderRadius}px !important;
    object-fit: ${s.posterFit} !important;
}\n\n`;
            css += `${cardSelector} {
    gap: ${s.detailGap}px !important;
    padding: ${s.cardPadding}px !important;
}\n\n`;
        } else if (viewMode === 'small') {
            css += `${posterSelector} {
    height: ${s.smallPosterHeight}px !important;
    border-radius: ${s.posterBorderRadius}px !important;
    object-fit: ${s.posterFit} !important;
}\n\n`;
            css += `${cardSelector} {
    max-width: ${s.smallMaxWidth}px !important;
    padding: ${s.cardPadding}px !important;
}\n\n`;
        }
        
        // CONTENT STYLING
        css += `${contentSelector} {
    padding: ${s.cardPadding}px !important;
    gap: ${s.cardGap}px !important;
}\n\n`;
        
        // TITLE STYLING
        css += `${cardSelector} .movie-title {
    font-size: ${s.titleFontSize}px !important;
    line-height: ${s.titleLineHeight} !important;
    -webkit-line-clamp: ${s.titleLineClamp} !important;
    margin-bottom: ${s.titleMarginBottom}px !important;
    font-weight: ${s.titleFontWeight} !important;
}\n\n`;
        
        // INFO STYLING
        css += `${cardSelector} .movie-info {
    font-size: ${s.infoFontSize}px !important;
    line-height: ${s.infoLineHeight} !important;
}\n\n`;
        
        // INDIVIDUAL INFO ELEMENTS
        css += `${cardSelector} .movie-card-year {
    font-size: ${s.yearFontSize}px !important;
    display: ${s.showYear ? 'inline' : 'none'} !important;
}\n\n`;
        
        css += `${cardSelector} .movie-card-format {
    font-size: ${s.formatFontSize}px !important;
    display: ${s.showFormat ? 'inline' : 'none'} !important;
}\n\n`;
        
        css += `${cardSelector} .movie-card-rating {
    font-size: ${s.ratingFontSize}px !important;
    display: ${s.showRating ? 'inline' : 'none'} !important;
}\n\n`;
        
        css += `${cardSelector} .movie-card-runtime {
    font-size: ${s.runtimeFontSize}px !important;
    display: ${s.showRuntime ? 'block' : 'none'} !important;
}\n\n`;
        
        css += `${cardSelector} .movie-card-director {
    font-size: ${s.directorFontSize}px !important;
    display: ${s.showDirector ? 'block' : 'none'} !important;
}\n\n`;
        
        css += `${cardSelector} .movie-card-genre {
    font-size: ${s.genreFontSize}px !important;
    display: ${s.showGenre ? 'block' : 'none'} !important;
}\n\n`;
        
        return css;
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
        container.className = 'movie-grid';
        
        if (currentViewMode === 'grid') {
            container.classList.add('grid-view', `grid-cols-${currentGridCols}`);
        } else {
            container.classList.add(`${currentViewMode}-view`);
        }
        
        previewMovies.forEach(movie => {
            const card = createPreviewCard(movie);
            container.appendChild(card);
        });
    }
    
    function createPreviewCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        if (currentViewMode === 'list') {
            card.classList.add('list-item');
        } else if (currentViewMode === 'detail') {
            card.classList.add('detail-item');
        } else if (currentViewMode === 'small') {
            card.classList.add('small-item');
        }
        
        const poster = `<img src="${movie.posterIMG}" alt="${movie.title}" class="movie-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Crect width=%22200%22 height=%22300%22 fill=%22%23333%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22white%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">`;
        
        let content = '';
        if (currentViewMode === 'list' || currentViewMode === 'detail') {
            content = `
                <div class="movie-content">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-info">
                        <span class="movie-card-year">${movie.year}</span> · 
                        <span class="movie-card-format">${movie.format}</span> · 
                        <span class="movie-card-rating">⭐ ${movie.rating}</span>
                        <br>
                        <span class="movie-card-runtime">${movie.runtime}</span>
                        <span class="movie-card-director">${movie.director}</span>
                        <span class="movie-card-genre">${movie.genre}</span>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="movie-card-content">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-info">
                        <span class="movie-card-year">${movie.year}</span> · 
                        <span class="movie-card-format">${movie.format}</span><br>
                        <span class="movie-card-rating">⭐ ${movie.rating}</span>
                        <span class="movie-card-runtime">${movie.runtime}</span>
                        <span class="movie-card-director">${movie.director}</span>
                        <span class="movie-card-genre">${movie.genre}</span>
                    </div>
                </div>
            `;
        }
        
        if (currentViewMode === 'list' || currentViewMode === 'detail') {
            card.innerHTML = poster + content;
        } else {
            card.innerHTML = poster + content;
        }
        
        return card;
    }
    
    function updatePreviewCards() {
        // Just recreate to apply new styles
        createPreviewCards();
    }
    
    function resetStyles() {
        if (!confirm('Reset current configuration to defaults?')) return;
        
        const currentStyles = getCurrentStyles();
        Object.keys(DEFAULT_STYLES).forEach(key => {
            currentStyles[key] = DEFAULT_STYLES[key];
        });
        
        saveAllStyles();
        updateAllInputs();
        applyStylesToPage();
        console.log('✅ Reset to defaults');
    }
    
    function exportCSS() {
        const css = generateCSS();
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cineshelf-custom-styles.css';
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ CSS exported');
    }
    
    return {
        init,
        updateStyle,
        resetStyles,
        exportCSS
    };
    
})();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', CSSDesigner.init);
} else {
    CSSDesigner.init();
}