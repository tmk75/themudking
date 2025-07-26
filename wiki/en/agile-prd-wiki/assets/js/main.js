// Main JavaScript functionality for Agile PRD Wiki

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeThemeToggle();
    initializeMobileMenu();
    initializeScrollToTop();
    initializeSmoothScrolling();
    initializeActiveNavigation();
    initializeTableOfContents();
    initializeExpandableSections();
    initializeChecklists();
    initializeAnimations();
    initializePrintFunctionality();
    initializeDownloadFunctionality();
});

// Theme Toggle Functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    
    if (!themeToggle) return;
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
        
        // Add transition class for smooth theme change
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    });
}

function updateThemeIcon(theme, iconElement) {
    if (!iconElement) return;
    iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!mobileMenuToggle || !navMenu) return;
    
    mobileMenuToggle.addEventListener('click', function() {
        const isActive = navMenu.classList.contains('active');
        
        if (isActive) {
            navMenu.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        } else {
            navMenu.classList.add('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
        }
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
            navMenu.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Scroll to Top Functionality
function initializeScrollToTop() {
    // Create scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top when clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth Scrolling for Anchor Links
function initializeSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, href);
            }
        });
    });
}

// Active Navigation Highlighting
function initializeActiveNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tocLinks = document.querySelectorAll('.toc-link');
    
    function updateActiveNavigation() {
        const currentPath = window.location.pathname;
        
        // Update main navigation
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Update table of contents for current page sections
        if (tocLinks.length > 0) {
            updateActiveSection();
        }
    }
    
    function updateActiveSection() {
        const sections = document.querySelectorAll('.content-section[id]');
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                currentSection = section.id;
            }
        });
        
        tocLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Update on page load and scroll
    updateActiveNavigation();
    window.addEventListener('scroll', throttle(updateActiveSection, 100));
    window.addEventListener('popstate', updateActiveNavigation);
}

// Table of Contents Functionality
function initializeTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-link');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active state
                tocLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Update URL
                history.pushState(null, null, href);
            }
        });
    });
}

// Expandable Sections Functionality
function initializeExpandableSections() {
    const expandToggles = document.querySelectorAll('.expand-toggle');
    
    expandToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.expand-icon');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                content.classList.remove('expanded');
                this.setAttribute('aria-expanded', 'false');
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('expanded');
                this.setAttribute('aria-expanded', 'true');
                if (icon) icon.style.transform = 'rotate(90deg)';
            }
        });
        
        // Initialize ARIA attributes
        toggle.setAttribute('aria-expanded', 'false');
    });
}

// Interactive Checklists
function initializeChecklists() {
    const checklistItems = document.querySelectorAll('.checklist-item');
    
    checklistItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        
        item.addEventListener('click', function(e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                updateChecklistProgress();
            }
        });
        
        checkbox.addEventListener('change', updateChecklistProgress);
    });
    
    function updateChecklistProgress() {
        const checklists = document.querySelectorAll('.checklist');
        
        checklists.forEach(checklist => {
            const items = checklist.querySelectorAll('input[type="checkbox"]');
            const checkedItems = checklist.querySelectorAll('input[type="checkbox"]:checked');
            const progress = items.length > 0 ? (checkedItems.length / items.length) * 100 : 0;
            
            // Store progress in localStorage
            const checklistId = checklist.closest('.checklist-container')?.id || 'default';
            localStorage.setItem(`checklist-${checklistId}`, progress.toString());
            
            // Add visual feedback
            if (progress === 100) {
                checklist.style.opacity = '0.7';
                checklist.style.background = 'linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(16, 185, 129, 0.1))';
            } else {
                checklist.style.opacity = '1';
                checklist.style.background = 'none';
            }
        });
    }
    
    // Load saved progress
    const checklists = document.querySelectorAll('.checklist');
    checklists.forEach(checklist => {
        const checklistId = checklist.closest('.checklist-container')?.id || 'default';
        const savedProgress = localStorage.getItem(`checklist-${checklistId}`);
        
        if (savedProgress) {
            const items = checklist.querySelectorAll('input[type="checkbox"]');
            const targetChecked = Math.round((parseFloat(savedProgress) / 100) * items.length);
            
            for (let i = 0; i < targetChecked && i < items.length; i++) {
                items[i].checked = true;
            }
            
            updateChecklistProgress();
        }
    });
}

// Animation on Scroll
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .resource-card, .step-item, .metric-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Print Functionality
function initializePrintFunctionality() {
    window.printPage = function() {
        // Expand all collapsible sections before printing
        const expandToggles = document.querySelectorAll('.expand-toggle');
        const originalStates = [];
        
        expandToggles.forEach((toggle, index) => {
            const content = toggle.nextElementSibling;
            originalStates[index] = content.classList.contains('expanded');
            
            if (!originalStates[index]) {
                content.classList.add('expanded');
            }
        });
        
        // Print the page
        window.print();
        
        // Restore original states after printing
        setTimeout(() => {
            expandToggles.forEach((toggle, index) => {
                const content = toggle.nextElementSibling;
                if (!originalStates[index]) {
                    content.classList.remove('expanded');
                }
            });
        }, 1000);
    };
}

// Download Template Functionality
function initializeDownloadFunctionality() {
    window.downloadTemplate = function() {
        // Create a simple markdown template download
        const templateContent = `# Product Requirement Document (PRD)
## Agile Methodology Integration Template

**Document Version:** 1.0
**Created by:** [Your Name]
**Date:** ${new Date().toLocaleDateString()}
**Template Type:** Feature-Focused Agile PRD

---

## 1. Executive Summary

**Feature Name:** [Clear, descriptive name]
**Problem Being Solved:** [One-sentence problem statement]
**Target Users:** [Primary user personas affected]
**Business Impact:** [Expected business value/metrics]
**Development Effort:** [High-level effort estimate]
**Timeline:** [Target delivery timeframe]
**Success Criteria:** [Key metrics for success]

## 2. Problem Statement & Opportunity

[Describe the current situation, pain points, and limitations]

## 3. Target Users & Personas

**Primary Persona:**
- Demographics: [Age, role, experience level]
- Goals: [What they're trying to achieve]
- Pain Points: [Current frustrations and challenges]

## 4. User Stories & Acceptance Criteria

**Story 1:**
As a [persona],
I want to [action],
So that [benefit].

Acceptance Criteria:
- [ ] [Specific, testable criteria]
- [ ] [Specific, testable criteria]

## 5. Success Metrics & KPIs

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| [User adoption] | [Current %] | [Target %] | [Analytics tool] |

---

*This template is part of the Agile PRD Wiki. Visit the wiki for complete guidance and best practices.*`;

        const blob = new Blob([templateContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agile-prd-template.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        showNotification('Template downloaded successfully!', 'success');
    };
}

// Utility Functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
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

function showNotification(message, type = 'info') {
    const notification = docum
(Content truncated due to size limit. Use line ranges to read in chunks)


live

Jump to live
