// Navigation-specific functionality for Agile PRD Wiki

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigationEnhancements();
    initializeBreadcrumbNavigation();
    initializePageNavigation();
    initializeSearchFunctionality();
});

// Enhanced Navigation Features
function initializeNavigationEnhancements() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add hover effects and active states
    navLinks.forEach(link => {
        // Add ripple effect on click
        link.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
        
        // Preload pages on hover for faster navigation
        link.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            if (href && href.endsWith('.html')) {
                preloadPage(href);
            }
        });
    });
}

// Breadcrumb Navigation
function initializeBreadcrumbNavigation() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    // Generate breadcrumb based on current page
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment);
    
    // Update breadcrumb if needed
    updateBreadcrumb(pathSegments);
}

function updateBreadcrumb(pathSegments) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    const pageMap = {
        'index.html': 'Home',
        'getting-started.html': 'Getting Started',
        'prd-template.html': 'PRD Template',
        'best-practices.html': 'Best Practices',
        'research.html': 'Research',
        'resources.html': 'Resources'
    };
    
    const currentPage = pathSegments[pathSegments.length - 1] || 'index.html';
    const currentPageName = pageMap[currentPage] || 'Page';
    
    // Update current page name in breadcrumb
    const currentElement = breadcrumb.querySelector('.breadcrumb-current');
    if (currentElement) {
        currentElement.textContent = currentPageName;
    }
}

// Page Navigation (Previous/Next)
function initializePageNavigation() {
    const pages = [
        { url: 'index.html', title: 'Home' },
        { url: 'getting-started.html', title: 'Getting Started' },
        { url: 'prd-template.html', title: 'PRD Template' },
        { url: 'best-practices.html', title: 'Best Practices' },
        { url: 'research.html', title: 'Research' },
        { url: 'resources.html', title: 'Resources' }
    ];
    
    const currentPath = window.location.pathname;
    const currentPageIndex = pages.findIndex(page => currentPath.endsWith(page.url));
    
    if (currentPageIndex === -1) return;
    
    // Create navigation controls
    createPageNavigation(pages, currentPageIndex);
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            if (e.key === 'ArrowLeft' && currentPageIndex > 0) {
                e.preventDefault();
                window.location.href = pages[currentPageIndex - 1].url;
            } else if (e.key === 'ArrowRight' && currentPageIndex < pages.length - 1) {
                e.preventDefault();
                window.location.href = pages[currentPageIndex + 1].url;
            }
        }
    });
}

function createPageNavigation(pages, currentIndex) {
    const content = document.querySelector('.content');
    if (!content) return;
    
    const navContainer = document.createElement('div');
    navContainer.className = 'page-navigation';
    navContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 3rem 0;
        padding: 2rem;
        background: var(--gray-50);
        border-radius: 1rem;
        border: 1px solid var(--gray-200);
    `;
    
    // Previous page link
    if (currentIndex > 0) {
        const prevLink = createNavLink(pages[currentIndex - 1], 'previous');
        navContainer.appendChild(prevLink);
    } else {
        navContainer.appendChild(document.createElement('div'));
    }
    
    // Page indicator
    const indicator = document.createElement('div');
    indicator.className = 'page-indicator';
    indicator.style.cssText = `
        display: flex;
        gap: 0.5rem;
        align-items: center;
    `;
    
    pages.forEach((page, index) => {
        const dot = document.createElement('div');
        dot.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${index === currentIndex ? 'var(--primary-color)' : 'var(--gray-300)'};
            transition: background-color 0.2s ease;
        `;
        indicator.appendChild(dot);
    });
    
    navContainer.appendChild(indicator);
    
    // Next page link
    if (currentIndex < pages.length - 1) {
        const nextLink = createNavLink(pages[currentIndex + 1], 'next');
        navContainer.appendChild(nextLink);
    } else {
        navContainer.appendChild(document.createElement('div'));
    }
    
    content.appendChild(navContainer);
}

function createNavLink(page, direction) {
    const link = document.createElement('a');
    link.href = page.url;
    link.className = `nav-link-${direction}`;
    link.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: 0.5rem;
        text-decoration: none;
        color: var(--gray-700);
        transition: all 0.2s ease;
        max-width: 200px;
    `;
    
    const arrow = document.createElement('span');
    arrow.textContent = direction === 'previous' ? '←' : '→';
    arrow.style.color = 'var(--primary-color)';
    
    const text = document.createElement('div');
    text.style.cssText = `
        display: flex;
        flex-direction: column;
        ${direction === 'next' ? 'text-align: right;' : ''}
    `;
    
    const label = document.createElement('span');
    label.textContent = direction === 'previous' ? 'Previous' : 'Next';
    label.style.cssText = `
        font-size: 0.75rem;
        color: var(--gray-500);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    `;
    
    const title = document.createElement('span');
    title.textContent = page.title;
    title.style.cssText = `
        font-weight: 500;
        color: var(--gray-900);
    `;
    
    text.appendChild(label);
    text.appendChild(title);
    
    if (direction === 'previous') {
        link.appendChild(arrow);
        link.appendChild(text);
    } else {
        link.appendChild(text);
        link.appendChild(arrow);
    }
    
    // Hover effects
    link.addEventListener('mouseenter', function() {
        this.style.borderColor = 'var(--primary-color)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = 'var(--shadow-md)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.borderColor = 'var(--gray-200)';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
    
    return link;
}

// Search Functionality (Basic)
function initializeSearchFunctionality() {
    // Create search overlay (hidden by default)
    createSearchOverlay();
    
    // Add search keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchOverlay();
        }
        
        if (e.key === 'Escape') {
            closeSearchOverlay();
        }
    });
}

function createSearchOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1000;
        display: none;
        align-items: flex-start;
        justify-content: center;
        padding-top: 10vh;
    `;
    
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        box-shadow: var(--shadow-xl);
        animation: slideIn 0.3s ease-out;
    `;
    
    const searchTitle = document.createElement('h3');
    searchTitle.textContent = 'Search Wiki';
    searchTitle.style.cssText = `
        margin-bottom: 1rem;
        color: var(--gray-900);
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for content, templates, or best practices...';
    searchInput.style.cssText = `
        width: 100%;
        padding: 1rem;
        border: 2px solid var(--gray-200);
        border-radius: 0.5rem;
        font-size: 1rem;
        margin-bottom: 1rem;
        outline: none;
        transition: border-color 0.2s ease;
    `;
    
    const searchResults = document.createElement('div');
    searchResults.id = 'searchResults';
    searchResults.style.cssText = `
        max-height: 300px;
        overflow-y: auto;
    `;
    
    const searchHint = document.createElement('p');
    searchHint.textContent = 'Press Ctrl+K (Cmd+K on Mac) to search, Esc to close';
    searchHint.style.cssText = `
        font-size: 0.875rem;
        color: var(--gray-500);
        margin: 0;
        text-align: center;
    `;
    
    searchContainer.appendChild(searchTitle);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchResults);
    searchContainer.appendChild(searchHint);
    overlay.appendChild(searchContainer);
    document.body.appendChild(overlay);
    
    // Search input events
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = 'var(--primary-color)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = 'var(--gray-200)';
    });
    
    searchInput.addEventListener('input', function() {
        performSearch(this.value, searchResults);
    });
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeSearchOverlay();
        }
    });
}

function openSearchOverlay() {
    const overlay = document.getElementById('searchOverlay');
    const searchInput = overlay.querySelector('input');
    
    overlay.style.display = 'flex';
    setTimeout(() => {
        searchInput.focus();
    }, 100);
}

function closeSearchOverlay() {
    const overlay = document.getElementById('searchOverlay');
    const searchInput = overlay.querySelector('input');
    const searchResults = document.getElementById('searchResults');
    
    overlay.style.display = 'none';
    searchInput.value = '';
    searchResults.innerHTML = '';
}

function performSearch(query, resultsContainer) {
    if (!query.trim()) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Simple search implementation
    const searchableContent = [
        { title: 'Getting Started', url: 'getting-started.html', content: 'implementation guide agile prd team preparation pilot' },
        { title: 'PRD Template', url: 'prd-template.html', content: 'template user stories acceptance criteria technical requirements' },
        { title: 'Best Practices', url: 'best-practices.html', content: 'best practices implementation guide collaboration stakeholder alignment' },
        { title: 'Research', url: 'research.html', content: 'research findings atlassian delibr user stories agile methodology' },
        { title: 'Resources', url: 'resources.html', content: 'tools templates downloads resources collaboration software' }
    ];
    
    const results = searchableContent.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 1rem;">No results found</p>';
        return;
    }
    
    resultsContainer.innerHTML = results.map(result => `
        <a href="${result.url}" style="
            display: block;
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
            text-decoration: none;
            color: var(--gray-700);
            transition: background-color 0.2s ease;
        " onmouseover="this.style.backgroundColor='var(--gray-50)'" onmouseout="this.style.backgroundColor='transparent'">
            <div style="font-weight: 500; color: var(--gray-900); margin-bottom: 0.25rem;">${result.title}</div>
            <div style="font-size: 0.875rem; color: var(--gray-600);">${result.url}</div>
        </a>
    `).join('');
    
    // Add click handlers to close overlay
    resultsContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeSearchOverlay);
    });
}

// Ripple Effect for Interactive Elements
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    // Ensure element has relative positioning
    const originalPosition = element.style.position;
    if (!originalPosition || originalPosition === 'static') {
        element.style.position = 'relative';
    }
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Page Preloading for Faster Navigation
function preloadPage(url) {
    if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
        return; // Already preloaded
    }
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .theme-transitioning * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
`;
document.head.appendChild(style);



live

Jump to live
