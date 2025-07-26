// Interactive components for the PRD template and other pages

document.addEventListener('DOMContentLoaded', function() {
    initializeTemplateForm();
    initializeInteractiveElements();
    initializeFormPersistence();
    initializeTemplateActions();
});

// Template Form Functionality
function initializeTemplateForm() {
    const formInputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    
    formInputs.forEach(input => {
        // Auto-save functionality
        input.addEventListener('input', function() {
            saveFormData();
            updateFormProgress();
        });
        
        // Enhanced styling on focus
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary-color)';
            this.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = 'var(--gray-300)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Load saved form data
    loadFormData();
}

// Interactive Elements
function initializeInteractiveElements() {
    initializeAddButtons();
    initializeRemoveButtons();
    initializeStoryBuilder();
    initializeMetricsTable();
}

// Add Button Functionality
function initializeAddButtons() {
    // Add criteria button
    const addCriteriaButtons = document.querySelectorAll('.btn-add-criteria');
    addCriteriaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const criteriaList = this.parentElement;
            const newCriteria = document.createElement('div');
            newCriteria.className = 'criteria-item';
            newCriteria.innerHTML = `
                <input type="text" placeholder="Specific, testable criteria" class="form-input">
                <button class="btn-remove" onclick="removeCriteria(this)">×</button>
            `;
            criteriaList.insertBefore(newCriteria, this);
            
            // Initialize the new input
            const newInput = newCriteria.querySelector('input');
            newInput.addEventListener('input', saveFormData);
            newInput.focus();
        });
    });
    
    // Add story button
    const addStoryButtons = document.querySelectorAll('.btn:contains("Add Another Story")');
    addStoryButtons.forEach(button => {
        if (button.textContent.includes('Add Another Story')) {
            button.addEventListener('click', function() {
                addNewStory();
            });
        }
    });
    
    // Add metric button
    const addMetricButtons = document.querySelectorAll('button:contains("Add Metric")');
    addMetricButtons.forEach(button => {
        if (button.textContent.includes('Add Metric')) {
            button.addEventListener('click', function() {
                addNewMetric();
            });
        }
    });
}

// Remove Button Functionality
function initializeRemoveButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-remove')) {
            e.target.parentElement.remove();
            saveFormData();
        }
    });
}

// Story Builder
function initializeStoryBuilder() {
    const storyForms = document.querySelectorAll('.story-form');
    
    storyForms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                updateStoryPreview(form);
                saveFormData();
            });
        });
    });
}

function addNewStory() {
    const epicBreakdown = document.querySelector('.epic-breakdown');
    const storyCount = epicBreakdown.querySelectorAll('.story-builder').length + 1;
    
    const newStoryBuilder = document.createElement('div');
    newStoryBuilder.className = 'story-builder';
    newStoryBuilder.innerHTML = `
        <div class="story-header">
            <h5>Story ${storyCount}:</h5>
            <button class="btn-remove" onclick="removeStory(this)">Remove Story</button>
        </div>
        <div class="story-form">
            <div class="story-text">
                As a <input type="text" placeholder="persona" class="form-input inline">,<br>
                I want to <input type="text" placeholder="action" class="form-input inline">,<br>
                So that <input type="text" placeholder="benefit" class="form-input inline">.
            </div>
            
            <div class="story-meta">
                <div class="meta-row">
                    <label>Priority:</label>
                    <select class="form-select">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>
                <div class="meta-row">
                    <label>Story Points:</label>
                    <input type="number" placeholder="Estimate" class="form-input small">
                </div>
                <div class="meta-row">
                    <label>Sprint:</label>
                    <input type="text" placeholder="Target sprint" class="form-input">
                </div>
            </div>
            
            <div class="acceptance-criteria-builder">
                <h6>Acceptance Criteria:</h6>
                <div class="criteria-list">
                    <div class="criteria-item">
                        <input type="text" placeholder="Specific, testable criteria" class="form-input">
                    </div>
                    <button class="btn-add-criteria">+ Add Criteria</button>
                </div>
            </div>
        </div>
    `;
    
    const addButton = epicBreakdown.querySelector('.btn:last-child');
    epicBreakdown.insertBefore(newStoryBuilder, addButton);
    
    // Initialize the new story builder
    initializeStoryBuilder();
    initializeAddButtons();
    
    // Focus on the first input
    const firstInput = newStoryBuilder.querySelector('input');
    firstInput.focus();
}

function removeStory(button) {
    const storyBuilder = button.closest('.story-builder');
    storyBuilder.remove();
    
    // Renumber remaining stories
    const remainingStories = document.querySelectorAll('.story-builder h5');
    remainingStories.forEach((heading, index) => {
        heading.textContent = `Story ${index + 1}:`;
    });
    
    saveFormData();
}

function removeCriteria(button) {
    button.parentElement.remove();
    saveFormData();
}

// Metrics Table
function initializeMetricsTable() {
    const metricsTable = document.querySelector('.metrics-table table tbody');
    if (!metricsTable) return;
    
    const inputs = metricsTable.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', saveFormData);
    });
}

function addNewMetric() {
    const tbody = document.querySelector('.metrics-table table tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" placeholder="Metric name" class="form-input"></td>
        <td><input type="text" placeholder="Baseline" class="form-input"></td>
        <td><input type="text" placeholder="Target" class="form-input"></td>
        <td><input type="text" placeholder="Measurement method" class="form-input"></td>
        <td><input type="text" placeholder="Timeline" class="form-input"></td>
        <td><button class="btn-remove" onclick="removeMetric(this)">×</button></td>
    `;
    
    tbody.appendChild(newRow);
    
    // Initialize the new inputs
    const newInputs = newRow.querySelectorAll('input');
    newInputs.forEach(input => {
        input.addEventListener('input', saveFormData);
    });
    
    // Focus on the first input
    newInputs[0].focus();
}

function removeMetric(button) {
    button.closest('tr').remove();
    saveFormData();
}

// Form Persistence
function initializeFormPersistence() {
    // Load form data on page load
    loadFormData();
    
    // Save form data periodically
    setInterval(saveFormData, 30000); // Save every 30 seconds
    
    // Save on page unload
    window.addEventListener('beforeunload', saveFormData);
}

function saveFormData() {
    const formData = {};
    
    // Save all form inputs
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    inputs.forEach((input, index) => {
        formData[`input_${index}`] = {
            value: input.value,
            type: input.type || input.tagName.toLowerCase(),
            placeholder: input.placeholder || '',
            name: input.name || ''
        };
    });
    
    // Save checklist states
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox, index) => {
        formData[`checkbox_${index}`] = checkbox.checked;
    });
    
    // Save to localStorage
    localStorage.setItem('prd_template_data', JSON.stringify(formData));
    
    // Show save indicator
    showSaveIndicator();
}

function loadFormData() {
    const savedData = localStorage.getItem('prd_template_data');
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        // Load form inputs
        const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
        inputs.forEach((input, index) => {
            const savedInput = formData[`input_${index}`];
            if (savedInput && savedInput.value) {
                input.value = savedInput.value;
            }
        });
        
        // Load checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            const savedCheckbox = formData[`checkbox_${index}`];
            if (savedCheckbox !== undefined) {
                checkbox.checked = savedCheckbox;
            }
        });
        
        updateFormProgress();
        
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

function showSaveIndicator() {
    let indicator = document.getElementById('saveIndicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'saveIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: var(--success-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        indicator.textContent = 'Saved';
        document.body.appendChild(indicator);
    }
    
    indicator.style.opacity = '1';
    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Form Progress
function updateFormProgress() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
    const progress = inputs.length > 0 ? (filledInputs.length / inputs.length) * 100 : 0;
    
    // Update progress indicator if it exists
    let progressBar = document.getElementById('formProgress');
    if (!progressBar && progress > 0) {
        createProgressBar();
        progressBar = document.getElementById('formProgress');
    }
    
    if (progressBar) {
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressText = progressBar.querySelector('.progress-text');
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% Complete`;
        
        if (progress === 100) {
            progressBar.classList.add('complete');
        } else {
            progressBar.classList.remove('complete');
        }
    }
}

function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'formProgress';
    progressBar.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        right: 2rem;
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-width: 300px;
        margin-left: auto;
    `;
    
    progressBar.innerHTML = `
        <div class="progress-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span class="progress-text" style="font-size: 0.875rem; font-weight: 500;">0% Complete</span>
            <button onclick="closeProgressBar()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">×</button>
        </div>
        <div class="progress-track" style="background: var(--gray-200); height: 8px; border-radius: 4px; overflow: hidden;">
            <div class="progress-fill" style="background: var(--primary-color); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
        </div>
    `;
    
    document.body.appendChild(progressBar);
}

function closeProgressBar() {
    const progressBar = document.getElementById('formProgress');
    if (progressBar) {
        progressBar.remove();
    }
}

// Template Actions
function initializeTemplateActions() {
    // These functions are called from the HTML buttons
    window.saveProgress = function() {
        saveFormData();
        showNotification('Progress saved successfully!', 'success');
    };
    
    window.resetTemplate = function() {
        if (confirm('Are you sure you want to reset all form data? This action cannot be undone.')) {
            localStorage.removeItem('prd_template_data');
            location.reload();
        }
    };
    
    window.exportToMarkdown = function() {
        const markdown = generateMarkdownFromForm();
        downloadMarkdown(markdown, 'agile-prd-filled.md');
    };
}

// Story Preview Update
function updateStoryPreview(storyForm) {
    const persona = storyForm.querySelector('input[placeholder="persona"]')?.value || '[persona]';
    const action = storyForm.querySelector('input[placeholder="action"]')?.value || '[action]';
    const benefit = storyForm.querySelector('input[placeholder="benefit"]')?.value || '[benefit]';
    
    // Create or update preview
    let preview = storyForm.querySelector('.story-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'story-preview';
        preview.style.cssText = `
            background: var(--gray-50);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            font-style: italic;
            color: var(--gray-700);
        `;
        storyForm.appendChild(preview);
    }
    
    preview.innerHTML = `
        <strong>Preview:</strong><br>
        As a <em>${persona}</em>,<br>
        I want to <em>${action}</em>,<br>
        So that <em>${benefit}</em>.
    `;
}

// Markdown Generation
function generateMarkdownFromForm() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    const data = {};
    
    inputs.forEach(input => {
        if (input.placeholder && input.value) {
            data[input.placeholder] = input.value;
        }
    });
    
    // Generate markdown content
    let markdown = `# Product Requirement Document (PRD)\n`;
    markdown += `## Agile Methodology Integration\n\n`;
    markdown += `**Document Version:** 1.0\n`;
    markdown += `**Created by:** ${data['Your Name'] || '[Your Name]'}\n`;
    markdown += `**Date:** ${new Date().toLocaleDateString()}\n`;
    markdown += `**Template Type:** Feature-Focused Agile PRD\n\n`;
    
    markdown += `---\n\n`;
    
    markdown += `## Executive Summary\n\n`;
    markdown += `**Feature Name:** ${data['Clear, descriptive name'] || '[Feature Name]'}\n`;
    markdown += `**Problem Being Solved:** ${data['One-sentence problem statement'] || '[Problem Statement]'}\n`;
    markdown += `**Target Users:** ${data['Primary user personas affected'] || '[Target Users]'}\n`;
    markdown += `**Business Impact:** ${data['Expected
(Content truncated due to size limit. Use line ranges to read in chunks)


