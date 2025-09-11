// Advanced SAP Arabic Text Processor with Free Translation Services
let uploadedFile = null;
let processedWorkbook = null;
let currentProcessingMode = 'free';
let customDictionary = new Map();
let processingReport = {
    totalProcessed: 0,
    successfulTranslations: 0,
    averageConfidence: 0,
    servicesUsed: [],
    processingTime: 0
};

// Comprehensive Arabic processing data from application data
const arabicProcessingData = {
    businessTerms: {
        "شركة": "Company",
        "مؤسسة": "Foundation",
        "تجارة": "Trade",
        "أسواق": "Markets", 
        "مخابز": "Bakeries",
        "تمويل": "Financing",
        "خدمات": "Services",
        "استثمار": "Investment",
        "تطوير": "Development",
        "إدارة": "Management",
        "تقنية": "Technology",
        "هندسة": "Engineering",
        "استشارات": "Consulting",
        "مقاولات": "Contracting",
        "صناعات": "Industries",
        "النقل": "Transportation",
        "اللوجستية": "Logistics"
    },
    commonNames: {
        "محمد": "Mohammed",
        "أحمد": "Ahmed", 
        "علي": "Ali",
        "عبدالله": "Abdullah",
        "ابراهيم": "Ibrahim",
        "خالد": "Khalid",
        "سعد": "Saad",
        "فهد": "Fahad"
    },
    locations: {
        "الرياض": "Riyadh",
        "جدة": "Jeddah",
        "مكة": "Mecca",
        "المدينة": "Medina",
        "الدمام": "Dammam"
    },
    morphologicalRules: {
        prefixes: ["ال", "و", "ف", "ب", "ل", "ك", "من", "إلى", "في"],
        suffixes: ["ة", "ين", "ون", "ان", "ات", "ها", "هم", "كم"],
        companyIndicators: ["شركة", "مؤسسة", "معهد", "مكتب"],
        patterns: {
            "شركةأسواقومخابز": "شركة أسواق ومخابز",
            "مؤسسةدارسلتيللتجا": "مؤسسة دار سلتي للتجارة",
            "تمويناتوتينمدىللم": "تمويلات وتين مدى للمواد",
            "طارقعبداللهابراهيم": "طارق عبدالله ابراهيم"
        }
    }
};

// Free translation services configuration
const translationServices = {
    libretranslate: {
        name: "LibreTranslate",
        endpoint: "https://libretranslate.com/translate",
        active: true,
        priority: 1
    },
    mymemory: {
        name: "MyMemory",
        endpoint: "https://api.mymemory.translated.net/get",
        active: true,
        priority: 2
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeFileUpload();
    initializeProcessingModes();
    initializeDictionary();
    checkServiceStatus();
    loadCustomTerms();
    updateDictionaryStats();
    
    // Fix: Ensure process button starts disabled
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
}

function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadArea.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
}

function initializeProcessingModes() {
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            selectProcessingMode(this.dataset.mode);
        });
    });
}

function selectProcessingMode(mode) {
    currentProcessingMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Show/hide services section based on mode
    const servicesSection = document.getElementById('servicesSection');
    servicesSection.style.display = mode === 'offline' ? 'none' : 'block';
}

function initializeDictionary() {
    // Load default dictionary
    Object.entries(arabicProcessingData.businessTerms).forEach(([arabic, english]) => {
        customDictionary.set(arabic, english);
    });
    Object.entries(arabicProcessingData.commonNames).forEach(([arabic, english]) => {
        customDictionary.set(arabic, english);
    });
    Object.entries(arabicProcessingData.locations).forEach(([arabic, english]) => {
        customDictionary.set(arabic, english);
    });
}

async function checkServiceStatus() {
    // Check LibreTranslate
    try {
        const response = await fetch('https://libretranslate.com/languages', { 
            method: 'GET',
            timeout: 5000 
        });
        if (response.ok) {
            document.getElementById('libretranslate-status').className = 'service-status online';
        } else {
            document.getElementById('libretranslate-status').className = 'service-status offline';
            translationServices.libretranslate.active = false;
        }
    } catch (error) {
        document.getElementById('libretranslate-status').className = 'service-status offline';
        translationServices.libretranslate.active = false;
    }

    // Check MyMemory
    try {
        const response = await fetch('https://api.mymemory.translated.net/get?q=test&langpair=ar|en', {
            timeout: 5000
        });
        if (response.ok) {
            document.getElementById('mymemory-status').className = 'service-status online';
        } else {
            document.getElementById('mymemory-status').className = 'service-status offline';
            translationServices.mymemory.active = false;
        }
    } catch (error) {
        document.getElementById('mymemory-status').className = 'service-status offline';
        translationServices.mymemory.active = false;
    }
}

function toggleDictionary() {
    const content = document.getElementById('dictionaryContent');
    const toggleText = document.getElementById('dictionaryToggleText');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        toggleText.textContent = 'Hide Dictionary';
        loadCustomTerms();
    } else {
        content.style.display = 'none';
        toggleText.textContent = 'Show Dictionary';
    }
}

function loadCustomTerms() {
    const customTermsList = document.getElementById('customTermsList');
    customTermsList.innerHTML = '';
    
    let customCount = 0;
    const displayTerms = Array.from(customDictionary.entries()).slice(0, 5);
    
    displayTerms.forEach(([arabic, english]) => {
        const termItem = document.createElement('div');
        termItem.className = 'term-item';
        termItem.innerHTML = `
            <span class="term-arabic">${arabic}</span>
            <span class="term-english">${english}</span>
        `;
        customTermsList.appendChild(termItem);
        customCount++;
    });
    
    if (customCount === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = 'var(--color-text-secondary)';
        emptyMessage.style.padding = 'var(--space-16)';
        emptyMessage.textContent = 'No custom terms added yet';
        customTermsList.appendChild(emptyMessage);
    }
}

function updateDictionaryStats() {
    const businessCount = Object.keys(arabicProcessingData.businessTerms).length;
    const namesCount = Object.keys(arabicProcessingData.commonNames).length;
    const locationsCount = Object.keys(arabicProcessingData.locations).length;
    
    document.getElementById('businessTermsCount').textContent = businessCount;
    document.getElementById('namesCount').textContent = namesCount;
    document.getElementById('locationsCount').textContent = locationsCount;
}

function addCustomTerm() {
    const arabicTerm = document.getElementById('arabicTerm').value.trim();
    const englishTerm = document.getElementById('englishTerm').value.trim();
    
    if (!arabicTerm || !englishTerm) {
        showError('Please enter both Arabic and English terms');
        return;
    }
    
    customDictionary.set(arabicTerm, englishTerm);
    document.getElementById('arabicTerm').value = '';
    document.getElementById('englishTerm').value = '';
    
    loadCustomTerms();
    showSuccess('Custom term added successfully');
    
    // Update statistics
    updateDictionaryStats();
}

// File handling functions
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!validateFile(file)) {
        return;
    }
    
    uploadedFile = file;
    displayFileInfo(file);
    
    // Fix: Enable process button only after successful file upload
    document.getElementById('processBtn').disabled = false;
    
    document.getElementById('uploadArea').classList.add('upload-success');
    setTimeout(() => {
        document.getElementById('uploadArea').classList.remove('upload-success');
    }, 600);
}

function validateFile(file) {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
        showError('Please upload a valid Excel file (.xlsx or .xls)');
        return false;
    }
    
    if (file.size > maxSize) {
        showError('File size must be less than 10MB');
        return false;
    }
    
    return true;
}

function displayFileInfo(file) {
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clearFile() {
    uploadedFile = null;
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileInput').value = '';
    
    // Fix: Disable process button when file is cleared
    document.getElementById('processBtn').disabled = true;
    
    document.getElementById('downloadSection').style.display = 'none';
    document.getElementById('reviewSection').style.display = 'none';
    document.getElementById('processStatus').style.display = 'none';
}

// Main processing function
async function processFile() {
    if (!uploadedFile) {
        showError('Please upload a file first');
        return;
    }
    
    const startTime = Date.now();
    processingReport = {
        totalProcessed: 0,
        successfulTranslations: 0,
        averageConfidence: 0,
        servicesUsed: [],
        processingTime: 0
    };
    
    showProcessingStatus('Reading Excel file...', 10);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            showProcessingStatus('Initializing Arabic processing engine...', 20);
            setTimeout(async () => {
                await processWorkbook(workbook, startTime);
            }, 100);
            
        } catch (error) {
            showError('Error reading Excel file: ' + error.message);
            hideProcessingStatus();
        }
    };
    
    reader.onerror = function() {
        showError('Error reading file');
        hideProcessingStatus();
    };
    
    reader.readAsArrayBuffer(uploadedFile);
}

async function processWorkbook(workbook, startTime) {
    try {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        showProcessingStatus('Analyzing Arabic text patterns...', 30);
        
        const totalRows = 399; // rows 2-400
        const sampleResults = [];
        let confidenceSum = 0;
        
        for (let row = 2; row <= 400; row++) {
            const cellRef = `M${row}`;
            const cell = worksheet[cellRef];
            
            if (cell && cell.v && typeof cell.v === 'string') {
                const originalText = cell.v.toString();
                
                // Advanced Arabic text processing
                const { correctedArabic, confidence } = await processArabicText(originalText);
                
                // Get translation based on selected mode
                const { translation, serviceUsed } = await getTranslation(correctedArabic);
                
                // Add to worksheet
                worksheet[`AC${row}`] = { v: correctedArabic, t: 's' };
                worksheet[`AD${row}`] = { v: translation, t: 's' };
                
                // Update statistics
                processingReport.totalProcessed++;
                if (translation && translation !== 'Arabic text') {
                    processingReport.successfulTranslations++;
                }
                confidenceSum += confidence;
                
                if (serviceUsed && !processingReport.servicesUsed.includes(serviceUsed)) {
                    processingReport.servicesUsed.push(serviceUsed);
                }
                
                // Collect sample for preview (first 5 results)
                if (sampleResults.length < 5 && originalText.trim().length > 0) {
                    sampleResults.push({
                        original: originalText,
                        corrected: correctedArabic,
                        translation: translation,
                        confidence: confidence
                    });
                }
            }
            
            // Update progress
            if (row % 20 === 0) {
                const progress = 30 + ((row - 2) / totalRows) * 50;
                showProcessingStatus(`Processing row ${row}... (${currentProcessingMode} mode)`, progress);
                updateConfidence(Math.round(confidenceSum / processingReport.totalProcessed));
            }
        }
        
        // Finalize processing
        processingReport.averageConfidence = Math.round(confidenceSum / processingReport.totalProcessed);
        processingReport.processingTime = Date.now() - startTime;
        
        // Update worksheet range
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        if (range.e.c < 29) {
            range.e.c = 29;
            worksheet['!ref'] = XLSX.utils.encode_range(range);
        }
        
        processedWorkbook = workbook;
        
        showProcessingStatus('Generating results...', 90);
        
        setTimeout(() => {
            showProcessingStatus('Complete!', 100);
            displayResults(sampleResults);
            document.getElementById('downloadSection').style.display = 'block';
            document.getElementById('reviewSection').style.display = 'block';
            hideProcessingStatus();
        }, 500);
        
    } catch (error) {
        showError('Error processing file: ' + error.message);
        hideProcessingStatus();
    }
}

async function processArabicText(text) {
    if (!text || typeof text !== 'string') {
        return { correctedArabic: text, confidence: 0 };
    }
    
    let result = text;
    let confidence = 70; // Base confidence for local processing
    
    // Apply morphological patterns first (highest confidence)
    for (const [pattern, replacement] of Object.entries(arabicProcessingData.morphologicalRules.patterns)) {
        if (result.includes(pattern)) {
            result = result.replace(new RegExp(pattern, 'g'), replacement);
            confidence += 15;
        }
    }
    
    // Apply prefix/suffix spacing rules
    arabicProcessingData.morphologicalRules.prefixes.forEach(prefix => {
        const regex = new RegExp(`(?<!^|\\s)${prefix}(?=\\S)`, 'g');
        result = result.replace(regex, ` ${prefix}`);
    });
    
    arabicProcessingData.morphologicalRules.suffixes.forEach(suffix => {
        const regex = new RegExp(`(?<=\\S)${suffix}(?!$|\\s)`, 'g');
        result = result.replace(regex, `${suffix} `);
    });
    
    // Apply company indicators spacing
    arabicProcessingData.morphologicalRules.companyIndicators.forEach(indicator => {
        const regex = new RegExp(`${indicator}(?=\\S)`, 'g');
        result = result.replace(regex, `${indicator} `);
    });
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    // Statistical analysis for confidence adjustment
    const hasKnownPatterns = arabicProcessingData.morphologicalRules.companyIndicators.some(indicator => 
        result.includes(indicator)
    );
    
    if (hasKnownPatterns) {
        confidence += 10;
    }
    
    // Cap confidence at 95 for local processing
    confidence = Math.min(confidence, 95);
    
    return { correctedArabic: result, confidence };
}

async function getTranslation(arabicText) {
    if (!arabicText || typeof arabicText !== 'string') {
        return { translation: '', serviceUsed: null };
    }
    
    // Check custom dictionary first
    if (customDictionary.has(arabicText)) {
        return { translation: customDictionary.get(arabicText), serviceUsed: 'Local Dictionary' };
    }
    
    // Check for partial matches in dictionary
    for (const [arabic, english] of customDictionary.entries()) {
        if (arabicText.includes(arabic)) {
            const translation = arabicText.replace(new RegExp(arabic, 'g'), english);
            return { translation, serviceUsed: 'Local Dictionary (Partial)' };
        }
    }
    
    // Use selected processing mode
    if (currentProcessingMode === 'offline') {
        return getOfflineTranslation(arabicText);
    } else if (currentProcessingMode === 'free') {
        return await getFreeAPITranslation(arabicText);
    } else { // hybrid
        const offlineResult = getOfflineTranslation(arabicText);
        if (offlineResult.translation === 'Arabic text') {
            return await getFreeAPITranslation(arabicText);
        }
        return offlineResult;
    }
}

function getOfflineTranslation(arabicText) {
    // Pattern-based translation for common business terms
    let translation = arabicText;
    let found = false;
    
    // Apply business term translations
    for (const [arabic, english] of Object.entries(arabicProcessingData.businessTerms)) {
        if (translation.includes(arabic)) {
            translation = translation.replace(new RegExp(arabic, 'g'), english);
            found = true;
        }
    }
    
    // Apply name translations
    for (const [arabic, english] of Object.entries(arabicProcessingData.commonNames)) {
        if (translation.includes(arabic)) {
            translation = translation.replace(new RegExp(arabic, 'g'), english);
            found = true;
        }
    }
    
    // Apply location translations
    for (const [arabic, english] of Object.entries(arabicProcessingData.locations)) {
        if (translation.includes(arabic)) {
            translation = translation.replace(new RegExp(arabic, 'g'), english);
            found = true;
        }
    }
    
    if (!found) {
        if (arabicText.includes('شركة')) {
            translation = 'Company (Arabic text)';
        } else if (arabicText.includes('مؤسسة')) {
            translation = 'Institution (Arabic text)';
        } else {
            translation = 'Arabic text';
        }
    }
    
    return { translation, serviceUsed: 'Local Processing' };
}

async function getFreeAPITranslation(arabicText) {
    // Try LibreTranslate first
    if (translationServices.libretranslate.active) {
        try {
            const response = await fetch('https://libretranslate.com/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: arabicText,
                    source: 'ar',
                    target: 'en'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.translatedText) {
                    return { translation: data.translatedText, serviceUsed: 'LibreTranslate' };
                }
            }
        } catch (error) {
            console.log('LibreTranslate failed:', error);
        }
    }
    
    // Try MyMemory as fallback
    if (translationServices.mymemory.active) {
        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(arabicText)}&langpair=ar|en`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.responseData && data.responseData.translatedText) {
                    return { translation: data.responseData.translatedText, serviceUsed: 'MyMemory' };
                }
            }
        } catch (error) {
            console.log('MyMemory failed:', error);
        }
    }
    
    // Fallback to offline translation
    return getOfflineTranslation(arabicText);
}

function displayResults(sampleResults) {
    // Update summary statistics
    const summaryHTML = `
        <div class="summary-item">
            <span class="summary-number">${processingReport.totalProcessed}</span>
            <span class="summary-label">Rows Processed</span>
        </div>
        <div class="summary-item">
            <span class="summary-number">${processingReport.successfulTranslations}</span>
            <span class="summary-label">Translated</span>
        </div>
        <div class="summary-item">
            <span class="summary-number">${processingReport.averageConfidence}%</span>
            <span class="summary-label">Avg Confidence</span>
        </div>
        <div class="summary-item">
            <span class="summary-number">${Math.round(processingReport.processingTime / 1000)}s</span>
            <span class="summary-label">Processing Time</span>
        </div>
    `;
    document.getElementById('resultsSummary').innerHTML = summaryHTML;
    
    // Display sample results
    let previewHTML = '<div class="preview-header">Sample Results</div>';
    
    if (sampleResults.length > 0) {
        previewHTML += `
            <div class="preview-row">
                <strong>Original</strong>
                <strong>Corrected Arabic</strong>
                <strong>English Translation</strong>
            </div>
            ${sampleResults.map(result => `
                <div class="preview-row">
                    <div class="preview-original">${result.original}</div>
                    <div class="preview-corrected">${result.corrected}</div>
                    <div class="preview-translation">${result.translation}</div>
                </div>
            `).join('')}
        `;
    } else {
        previewHTML += '<div class="preview-row"><em>No text data found in column M</em></div>';
    }
    
    document.getElementById('resultsPreview').innerHTML = previewHTML;
}

function downloadProcessedFile() {
    if (!processedWorkbook) {
        showError('No processed file available');
        return;
    }
    
    try {
        const wbout = XLSX.write(processedWorkbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        
        const originalName = uploadedFile.name;
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        const newName = `${nameWithoutExt}_processed_free.xlsx`;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = newName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('File downloaded successfully!');
        
    } catch (error) {
        showError('Error downloading file: ' + error.message);
    }
}

function downloadReport() {
    const report = {
        processingMode: currentProcessingMode,
        timestamp: new Date().toISOString(),
        statistics: processingReport,
        servicesConfiguration: {
            libretranslate: translationServices.libretranslate.active,
            mymemory: translationServices.mymemory.active
        },
        customDictionarySize: customDictionary.size
    };
    
    const reportText = `# SAP Arabic Processing Report

## Processing Summary
- **Mode**: ${currentProcessingMode.charAt(0).toUpperCase() + currentProcessingMode.slice(1)}
- **Total Rows Processed**: ${processingReport.totalProcessed}
- **Successful Translations**: ${processingReport.successfulTranslations}
- **Average Confidence**: ${processingReport.averageConfidence}%
- **Processing Time**: ${Math.round(processingReport.processingTime / 1000)} seconds
- **Services Used**: ${processingReport.servicesUsed.join(', ')}

## Translation Services Status
- **LibreTranslate**: ${translationServices.libretranslate.active ? 'Active' : 'Inactive'}
- **MyMemory**: ${translationServices.mymemory.active ? 'Active' : 'Inactive'}

## Dictionary Statistics
- **Custom Terms**: ${customDictionary.size}
- **Business Terms**: ${Object.keys(arabicProcessingData.businessTerms).length}
- **Names**: ${Object.keys(arabicProcessingData.commonNames).length}
- **Locations**: ${Object.keys(arabicProcessingData.locations).length}

Generated on: ${new Date().toLocaleString()}
`;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing_report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// UI helper functions
function showProcessingStatus(message, progress) {
    document.getElementById('processStatus').style.display = 'block';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('statusText').textContent = message;
    
    if (progress !== undefined) {
        document.getElementById('progressBar').style.display = 'block';
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('progressDetails').textContent = `${progress}% complete`;
    }
    
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.classList.add('btn--loading');
}

function updateConfidence(confidence) {
    const confidenceIndicator = document.getElementById('confidenceIndicator');
    const confidenceValue = document.getElementById('confidenceValue');
    
    confidenceIndicator.style.display = 'flex';
    confidenceValue.textContent = `${confidence}%`;
    
    // Update color based on confidence level
    if (confidence >= 80) {
        confidenceValue.style.color = 'var(--color-success)';
    } else if (confidence >= 60) {
        confidenceValue.style.color = 'var(--color-warning)';
    } else {
        confidenceValue.style.color = 'var(--color-error)';
    }
}

function hideProcessingStatus() {
    setTimeout(() => {
        document.getElementById('processStatus').style.display = 'none';
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('progressBar').style.display = 'none';
        document.getElementById('confidenceIndicator').style.display = 'none';
        
        const processBtn = document.getElementById('processBtn');
        processBtn.disabled = uploadedFile === null;
        processBtn.classList.remove('btn--loading');
    }, 1000);
}

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const processSection = document.querySelector('.process-section');
    processSection.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const downloadSection = document.getElementById('downloadSection');
    downloadSection.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}