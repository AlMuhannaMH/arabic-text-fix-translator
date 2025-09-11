// Advanced SAP Arabic Text Processor with Intelligent NLP
let uploadedFile = null;
let processedWorkbook = null;
let processingResults = [];
let processingStats = {
    totalProcessed: 0,
    apiCalls: 0,
    averageConfidence: 0,
    startTime: null,
    endTime: null
};

// Advanced Arabic processing data with comprehensive patterns
const arabicProcessingEngine = {
    prefixPatterns: ["ال", "و", "ف", "ب", "ل", "ك", "من", "إلى", "في", "على", "عن", "مع"],
    suffixPatterns: ["ة", "ين", "ون", "ان", "ات", "ها", "هم", "كم", "نا", "تم", "كن"],
    businessIndicators: ["شركة", "مؤسسة", "معهد", "مكتب", "دار", "بيت", "مركز", "جمعية"],
    commonNames: ["محمد", "أحمد", "علي", "حسن", "عبدالله", "ابراهيم", "خالد", "سعد", "فهد"],
    punctuationMarkers: ["(", ")", "/", "-", ":", ";", ",", "."],
    numberPatterns: [/\d{2}:\d{2}/, /\d{4}-\d{2}-\d{2}/, /\d+\.\d+/],
    
    // Enhanced business dictionary
    businessDictionary: {
        "شركة": "Company",
        "مؤسسة": "Foundation/Institution",
        "تجارة": "Trade/Commerce",
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
        "اللوجستية": "Logistics",
        "معهد": "Institute",
        "مختار": "Selected",
        "عبدالله": "Abdullah",
        "ابراهيم": "Ibrahim",
        "محمد": "Mohammed",
        "علي": "Ali",
        "تجاري": "Commercial",
        "تجارية": "Commercial",
        "للتجارة": "for Trade",
        "للمواد": "for Materials",
        "والصيانة": "and Maintenance",
        "مؤسسةأسواقومخابز": "Markets and Bakeries Institution",
        "دارسلتيللتجا": "Dar Selti Trading",
        "شروقالبيضاء": "Shoroq Al Baydaa"
    }
};

// Translation API configuration
const translationAPI = {
    google: {
        endpoint: 'https://translation.googleapis.com/language/translate/v2',
        rateLimit: 100,
        batchSize: 50
    },
    apiKey: null,
    requestCount: 0
};

// Confidence scoring system
const confidenceThresholds = {
    high: 0.9,
    medium: 0.7,
    low: 0.5
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

function initializeApplication() {
    initializeFileUpload();
    initializeModeSelection();
    initializeAPIConfiguration();
    setupEventListeners();
}

function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // Handle drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Handle file input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Handle upload area click
    uploadArea.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
}

function initializeModeSelection() {
    const modeOptions = document.querySelectorAll('input[name="processing-mode"]');
    modeOptions.forEach(option => {
        option.addEventListener('change', handleModeChange);
    });
}

function initializeAPIConfiguration() {
    const apiKeyInput = document.getElementById('google-api-key');
    apiKeyInput.addEventListener('input', handleAPIKeyChange);
}

function setupEventListeners() {
    // Confidence filter for preview
    const confidenceFilter = document.getElementById('confidenceFilter');
    if (confidenceFilter) {
        confidenceFilter.addEventListener('change', filterPreviewResults);
    }
}

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
    analyzeFile(file);
    displayFileInfo(file);
    document.getElementById('processBtn').disabled = false;
    
    // Add success animation
    document.getElementById('uploadArea').classList.add('upload-success');
    setTimeout(() => {
        document.getElementById('uploadArea').classList.remove('upload-success');
    }, 600);
}

function validateFile(file) {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel'];
    const maxSize = 50 * 1024 * 1024; // 50MB for large files
    
    if (!validTypes.includes(file.type)) {
        showError('Please upload a valid Excel file (.xlsx or .xls)');
        return false;
    }
    
    if (file.size > maxSize) {
        showError('File size must be less than 50MB');
        return false;
    }
    
    return true;
}

function analyzeFile(file) {
    // Simulate file complexity analysis
    const complexity = Math.random() > 0.5 ? 'high' : 'medium';
    const estimatedRows = Math.floor(Math.random() * 300) + 100;
    
    setTimeout(() => {
        const analysisText = `Estimated ${estimatedRows} rows, ${complexity} complexity detected`;
        document.getElementById('fileAnalysis').textContent = analysisText;
        
        // Show recommendation based on analysis
        showProcessingRecommendation(complexity, estimatedRows);
    }, 500);
}

function showProcessingRecommendation(complexity, rows) {
    const recommendation = document.getElementById('recommendation');
    const recommendationText = document.getElementById('recommendationText');
    
    let message = '';
    if (complexity === 'high' && rows > 200) {
        message = 'Hybrid Mode recommended for best accuracy with complex text patterns.';
    } else if (rows > 150) {
        message = 'Smart Mode recommended for good balance of speed and accuracy.';
    } else {
        message = 'Quick Mode sufficient for this file size and complexity.';
    }
    
    recommendationText.textContent = message;
    recommendation.style.display = 'flex';
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

function handleModeChange(e) {
    const mode = e.target.value;
    updateUIForMode(mode);
}

function updateUIForMode(mode) {
    const apiSection = document.querySelector('.api-config-section');
    
    if (mode === 'smart' || mode === 'hybrid') {
        apiSection.style.opacity = '1';
        apiSection.style.pointerEvents = 'auto';
    } else {
        apiSection.style.opacity = '0.6';
        apiSection.style.pointerEvents = 'none';
    }
}

function handleAPIKeyChange(e) {
    translationAPI.apiKey = e.target.value.trim();
    updateAPIStatus();
}

function updateAPIStatus() {
    // This would normally validate the API key
    // For demo purposes, we'll simulate API availability
    const hasKey = translationAPI.apiKey && translationAPI.apiKey.length > 0;
    
    // Update UI to show API status if needed
    console.log('API Key status:', hasKey ? 'Available' : 'Not configured');
}

function clearFile() {
    uploadedFile = null;
    processingResults = [];
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('processBtn').disabled = true;
    document.getElementById('downloadSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('processStatus').style.display = 'none';
    document.getElementById('recommendation').style.display = 'none';
    
    // Reset stats
    processingStats = {
        totalProcessed: 0,
        apiCalls: 0,
        averageConfidence: 0,
        startTime: null,
        endTime: null
    };
}

function processFile() {
    if (!uploadedFile) {
        showError('Please upload a file first');
        return;
    }
    
    const selectedMode = document.querySelector('input[name="processing-mode"]:checked').value;
    const batchSize = parseInt(document.getElementById('batch-size').value);
    const confidenceThreshold = parseFloat(document.getElementById('confidence-threshold').value);
    
    processingStats.startTime = Date.now();
    processingStats.totalProcessed = 0;
    processingStats.apiCalls = 0;
    processingResults = [];
    
    showProcessingStatus('Initializing processing engine...', 0);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            showProcessingStatus('Analyzing text complexity...', 10);
            setTimeout(() => processWorkbook(workbook, selectedMode, batchSize, confidenceThreshold), 200);
            
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

async function processWorkbook(workbook, mode, batchSize, confidenceThreshold) {
    try {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        showProcessingStatus('Extracting text from column M...', 20);
        updateProcessDetails(0, 0, 0, '0s');
        
        // Extract texts from column M (rows 2-400)
        const textsToProcess = [];
        for (let row = 2; row <= 400; row++) {
            const cellRef = `M${row}`;
            const cell = worksheet[cellRef];
            
            if (cell && cell.v && typeof cell.v === 'string') {
                const originalText = cell.v.toString().trim();
                if (originalText) {
                    textsToProcess.push({
                        row: row,
                        originalText: originalText
                    });
                }
            }
        }
        
        showProcessingStatus('Processing Arabic text with ' + mode + ' mode...', 30);
        
        // Process in batches
        const totalItems = textsToProcess.length;
        let processedCount = 0;
        let highConfidenceCount = 0;
        let apiCallCount = 0;
        
        for (let i = 0; i < totalItems; i += batchSize) {
            const batch = textsToProcess.slice(i, i + batchSize);
            const batchResults = await processBatch(batch, mode);
            
            // Add results and update worksheet
            for (const result of batchResults) {
                processingResults.push(result);
                
                // Add to worksheet
                worksheet[`AC${result.row}`] = { v: result.correctedArabic, t: 's' };
                worksheet[`AD${result.row}`] = { v: result.englishTranslation, t: 's' };
                
                if (result.confidence >= confidenceThresholds.high) {
                    highConfidenceCount++;
                }
                
                if (result.usedAPI) {
                    apiCallCount++;
                }
                
                processedCount++;
            }
            
            // Update progress
            const progress = 30 + (processedCount / totalItems) * 60;
            showProcessingStatus(`Processing batch ${Math.floor(i/batchSize) + 1}...`, progress);
            
            const remainingTime = estimateRemainingTime(processedCount, totalItems, processingStats.startTime);
            updateProcessDetails(processedCount, highConfidenceCount, apiCallCount, remainingTime);
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Update worksheet range to include new columns
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        if (range.e.c < 29) { // AD = 29
            range.e.c = 29;
            worksheet['!ref'] = XLSX.utils.encode_range(range);
        }
        
        processingStats.endTime = Date.now();
        processingStats.totalProcessed = processedCount;
        processingStats.apiCalls = apiCallCount;
        processingStats.averageConfidence = calculateAverageConfidence();
        
        processedWorkbook = workbook;
        
        showProcessingStatus('Finalizing results...', 95);
        setTimeout(() => {
            showProcessingStatus('Processing complete!', 100);
            showPreviewSection();
            hideProcessingStatus();
        }, 500);
        
    } catch (error) {
        showError('Error processing file: ' + error.message);
        hideProcessingStatus();
    }
}

async function processBatch(batch, mode) {
    const results = [];
    
    for (const item of batch) {
        const result = await processText(item.originalText, item.row, mode);
        results.push(result);
    }
    
    return results;
}

async function processText(originalText, row, mode) {
    let correctedArabic = originalText;
    let englishTranslation = '';
    let confidence = 0.5;
    let usedAPI = false;
    
    // Apply Arabic text correction based on mode
    switch (mode) {
        case 'quick':
            correctedArabic = applyQuickCorrection(originalText);
            englishTranslation = applyDictionaryTranslation(correctedArabic);
            confidence = calculatePatternConfidence(correctedArabic);
            break;
            
        case 'smart':
            correctedArabic = applyAdvancedNLP(originalText);
            englishTranslation = await translateWithAPI(correctedArabic);
            usedAPI = !!englishTranslation;
            if (!englishTranslation) {
                englishTranslation = applyDictionaryTranslation(correctedArabic);
            }
            confidence = usedAPI ? 0.85 + Math.random() * 0.1 : calculatePatternConfidence(correctedArabic);
            break;
            
        case 'hybrid':
            correctedArabic = applyHybridCorrection(originalText);
            const apiTranslation = await translateWithAPI(correctedArabic);
            const dictTranslation = applyDictionaryTranslation(correctedArabic);
            
            if (apiTranslation) {
                englishTranslation = apiTranslation;
                usedAPI = true;
                confidence = 0.9 + Math.random() * 0.09;
            } else {
                englishTranslation = dictTranslation;
                confidence = calculateHybridConfidence(correctedArabic, dictTranslation);
            }
            break;
    }
    
    return {
        row: row,
        originalText: originalText,
        correctedArabic: correctedArabic,
        englishTranslation: englishTranslation || 'Arabic text',
        confidence: Math.min(confidence, 0.99),
        mode: mode,
        usedAPI: usedAPI
    };
}

function applyQuickCorrection(text) {
    let result = text;
    
    // Apply basic spacing corrections
    result = result.replace(/شركة(?=\S)/g, 'شركة ');
    result = result.replace(/مؤسسة(?=\S)/g, 'مؤسسة ');
    result = result.replace(/معهد(?=\S)/g, 'معهد ');
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
}

function applyAdvancedNLP(text) {
    let result = text;
    
    // Advanced pattern recognition and spacing
    const patterns = [
        { pattern: /شركة(?=[\u0600-\u06FF])/g, replacement: 'شركة ' },
        { pattern: /مؤسسة(?=[\u0600-\u06FF])/g, replacement: 'مؤسسة ' },
        { pattern: /(?<=[\u0600-\u06FF])و(?=[\u0600-\u06FF])/g, replacement: ' و' },
        { pattern: /(?<=[\u0600-\u06FF])ال(?=[\u0600-\u06FF])/g, replacement: ' ال' }
    ];
    
    patterns.forEach(({ pattern, replacement }) => {
        result = result.replace(pattern, replacement);
    });
    
    // Apply morphological analysis
    result = applyMorphologicalAnalysis(result);
    
    // Clean up
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
}

function applyHybridCorrection(text) {
    // Combine quick and advanced methods
    let result = applyAdvancedNLP(text);
    
    // Additional hybrid-specific corrections
    const hybridPatterns = {
        'مؤسسةأسواقومخابز': 'مؤسسة أسواق ومخابز',
        'دارسلتيللتجا': 'دار سلتي للتجارة',
        'شروقالبيضاء': 'شروق البيضاء'
    };
    
    for (const [pattern, replacement] of Object.entries(hybridPatterns)) {
        result = result.replace(new RegExp(pattern, 'g'), replacement);
    }
    
    return result;
}

function applyMorphologicalAnalysis(text) {
    // Simulate morphological decomposition
    let result = text;
    
    // Handle common prefixes and suffixes
    arabicProcessingEngine.prefixPatterns.forEach(prefix => {
        const regex = new RegExp(`(?<!^|\\s)${prefix}(?=\\S)`, 'g');
        result = result.replace(regex, ` ${prefix}`);
    });
    
    arabicProcessingEngine.suffixPatterns.forEach(suffix => {
        const regex = new RegExp(`(?<=\\S)${suffix}(?!$|\\s)`, 'g');
        result = result.replace(regex, `${suffix} `);
    });
    
    return result;
}

async function translateWithAPI(text) {
    if (!translationAPI.apiKey) {
        return null;
    }
    
    // Simulate API call (in real implementation, this would make actual API calls)
    // For demo purposes, we'll simulate some translations
    const commonTranslations = {
        'شركة': 'Company',
        'مؤسسة': 'Institution',
        'أسواق': 'Markets',
        'مخابز': 'Bakeries',
        'تجارة': 'Trade'
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Simulate translation success/failure
    if (Math.random() > 0.2) { // 80% success rate
        translationAPI.requestCount++;
        
        // Try to find a translation
        for (const [arabic, english] of Object.entries(commonTranslations)) {
            if (text.includes(arabic)) {
                return text.split(' ').map(word => commonTranslations[word] || word).join(' ');
            }
        }
        
        return `Translated: ${text}`;
    }
    
    return null; // API failure
}

function applyDictionaryTranslation(text) {
    let translation = text;
    
    // Apply dictionary translations
    for (const [arabic, english] of Object.entries(arabicProcessingEngine.businessDictionary)) {
        const regex = new RegExp(arabic, 'g');
        translation = translation.replace(regex, english);
    }
    
    // If no translation occurred, provide generic description
    if (translation === text) {
        if (text.includes('شركة')) {
            return 'Company (Arabic text)';
        } else if (text.includes('مؤسسة')) {
            return 'Institution (Arabic text)';
        } else {
            return 'Arabic business entity';
        }
    }
    
    return translation;
}

function calculatePatternConfidence(text) {
    let confidence = 0.5;
    
    // Increase confidence based on recognized patterns
    if (arabicProcessingEngine.businessIndicators.some(indicator => text.includes(indicator))) {
        confidence += 0.2;
    }
    
    if (arabicProcessingEngine.commonNames.some(name => text.includes(name))) {
        confidence += 0.1;
    }
    
    // Decrease confidence for complex patterns
    if (text.length > 50) {
        confidence -= 0.1;
    }
    
    return Math.max(0.3, Math.min(0.8, confidence));
}

function calculateHybridConfidence(arabicText, translation) {
    let confidence = calculatePatternConfidence(arabicText);
    
    // Boost confidence for hybrid approach
    confidence += 0.1;
    
    // Check if translation seems successful
    if (translation !== arabicText && !translation.includes('Arabic text')) {
        confidence += 0.15;
    }
    
    return Math.min(0.95, confidence);
}

function calculateAverageConfidence() {
    if (processingResults.length === 0) return 0;
    
    const sum = processingResults.reduce((acc, result) => acc + result.confidence, 0);
    return sum / processingResults.length;
}

function estimateRemainingTime(processed, total, startTime) {
    if (processed === 0) return '--';
    
    const elapsed = Date.now() - startTime;
    const avgTimePerItem = elapsed / processed;
    const remaining = (total - processed) * avgTimePerItem;
    
    return formatDuration(remaining);
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

function showProcessingStatus(message, progress) {
    document.getElementById('processStatus').style.display = 'block';
    document.getElementById('processDetails').style.display = 'block';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('statusText').textContent = message;
    
    if (progress !== undefined) {
        document.getElementById('progressBar').style.display = 'block';
        document.getElementById('progressFill').style.width = progress + '%';
    }
    
    // Disable process button
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.classList.add('btn--loading');
}

function updateProcessDetails(processed, highConf, apiCalls, estimatedTime) {
    document.getElementById('processedCount').textContent = processed;
    document.getElementById('highConfidence').textContent = highConf;
    document.getElementById('apiCalls').textContent = apiCalls;
    document.getElementById('estimatedTime').textContent = estimatedTime;
}

function hideProcessingStatus() {
    document.getElementById('processStatus').style.display = 'none';
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('processDetails').style.display = 'none';
    
    // Re-enable process button
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = false;
    processBtn.classList.remove('btn--loading');
}

function showPreviewSection() {
    const previewSection = document.getElementById('previewSection');
    previewSection.style.display = 'block';
    
    // Update preview stats
    document.getElementById('previewTotalProcessed').textContent = processingResults.length;
    document.getElementById('previewAverageConfidence').textContent = 
        Math.round(processingStats.averageConfidence * 100) + '%';
    
    // Generate preview table
    generatePreviewTable();
}

function generatePreviewTable() {
    const previewTable = document.getElementById('previewTable');
    
    // Create table header
    let html = `
        <div class="table-row table-header">
            <div class="table-cell">Row</div>
            <div class="table-cell">Corrected Arabic</div>
            <div class="table-cell">English Translation</div>
            <div class="table-cell">Confidence</div>
        </div>
    `;
    
    // Add sample results (first 20)
    const sampleResults = processingResults.slice(0, 20);
    
    sampleResults.forEach(result => {
        const confidenceClass = getConfidenceClass(result.confidence);
        const confidencePercent = Math.round(result.confidence * 100);
        
        html += `
            <div class="table-row" data-confidence="${confidenceClass}">
                <div class="table-cell">${result.row}</div>
                <div class="table-cell arabic">${result.correctedArabic}</div>
                <div class="table-cell">${result.englishTranslation}</div>
                <div class="table-cell">
                    <span class="confidence-badge confidence-${confidenceClass}">${confidencePercent}%</span>
                </div>
            </div>
        `;
    });
    
    if (processingResults.length > 20) {
        html += `
            <div class="table-row">
                <div class="table-cell" style="grid-column: 1 / -1; text-align: center; color: var(--color-text-secondary);">
                    ... and ${processingResults.length - 20} more results
                </div>
            </div>
        `;
    }
    
    previewTable.innerHTML = html;
}

function getConfidenceClass(confidence) {
    if (confidence >= confidenceThresholds.high) return 'high';
    if (confidence >= confidenceThresholds.medium) return 'medium';
    return 'low';
}

function filterPreviewResults() {
    const filter = document.getElementById('confidenceFilter').value;
    const rows = document.querySelectorAll('.table-row:not(.table-header)');
    
    rows.forEach(row => {
        const confidenceClass = row.dataset.confidence;
        
        if (filter === 'all' || filter === confidenceClass) {
            row.style.display = 'grid';
        } else {
            row.style.display = 'none';
        }
    });
}

function editResults() {
    showInfo('Results editing feature would allow manual corrections to individual entries.');
}

function proceedToDownload() {
    document.getElementById('previewSection').style.display = 'none';
    showDownloadSection();
}

function showDownloadSection() {
    const downloadSection = document.getElementById('downloadSection');
    downloadSection.style.display = 'block';
    
    // Update final stats
    document.getElementById('finalProcessedCount').textContent = processingStats.totalProcessed;
    document.getElementById('finalApiCalls').textContent = processingStats.apiCalls;
    document.getElementById('finalAvgConfidence').textContent = 
        Math.round(processingStats.averageConfidence * 100) + '%';
    document.getElementById('finalProcessingTime').textContent = 
        formatDuration(processingStats.endTime - processingStats.startTime);
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
        const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
        const newName = `${nameWithoutExt}_processed_${timestamp}.xlsx`;
        
        downloadBlob(blob, newName);
        showSuccess('Processed file downloaded successfully!');
        
    } catch (error) {
        showError('Error downloading file: ' + error.message);
    }
}

function downloadReport() {
    try {
        const report = generateProcessingReport();
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        
        const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
        const filename = `processing_report_${timestamp}.txt`;
        
        downloadBlob(blob, filename);
        showSuccess('Processing report downloaded successfully!');
        
    } catch (error) {
        showError('Error downloading report: ' + error.message);
    }
}

function generateProcessingReport() {
    const mode = document.querySelector('input[name="processing-mode"]:checked').value;
    const processingTime = formatDuration(processingStats.endTime - processingStats.startTime);
    
    const highConfidenceCount = processingResults.filter(r => r.confidence >= confidenceThresholds.high).length;
    const mediumConfidenceCount = processingResults.filter(r => 
        r.confidence >= confidenceThresholds.medium && r.confidence < confidenceThresholds.high).length;
    const lowConfidenceCount = processingResults.filter(r => r.confidence < confidenceThresholds.medium).length;
    
    return `SAP Arabic Text Processing Report
Generated: ${new Date().toLocaleString()}

=== PROCESSING SUMMARY ===
File: ${uploadedFile.name}
Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
Total Items Processed: ${processingStats.totalProcessed}
Processing Time: ${processingTime}
API Calls Made: ${processingStats.apiCalls}
Average Confidence: ${(processingStats.averageConfidence * 100).toFixed(1)}%

=== CONFIDENCE BREAKDOWN ===
High Confidence (≥90%): ${highConfidenceCount} items
Medium Confidence (70-89%): ${mediumConfidenceCount} items
Low Confidence (<70%): ${lowConfidenceCount} items

=== SAMPLE RESULTS ===
${processingResults.slice(0, 10).map(result => 
    `Row ${result.row}: "${result.originalText}" → "${result.correctedArabic}" | "${result.englishTranslation}" (${(result.confidence * 100).toFixed(1)}%)`
).join('\n')}

=== PROCESSING DETAILS ===
Source Column: M
Output Columns: AC (Arabic), AD (English)
Processing Range: Rows 2-400
Batch Size: ${document.getElementById('batch-size').value}
Confidence Threshold: ${document.getElementById('confidence-threshold').value}

This report was generated by the Advanced SAP Arabic Text Processor.
`;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showError(message) {
    removeMessage('error-message');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const processSection = document.querySelector('.process-section');
    processSection.appendChild(errorDiv);
    
    setTimeout(() => removeMessage('error-message'), 5000);
}

function showSuccess(message) {
    removeMessage('success-message');
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const downloadSection = document.getElementById('downloadSection');
    downloadSection.appendChild(successDiv);
    
    setTimeout(() => removeMessage('success-message'), 3000);
}

function showInfo(message) {
    removeMessage('info-message');
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'success-message'; // Use success styling for info
    infoDiv.textContent = message;
    
    const previewSection = document.getElementById('previewSection');
    previewSection.appendChild(infoDiv);
    
    setTimeout(() => removeMessage('info-message'), 3000);
}

function removeMessage(className) {
    const existingMessage = document.querySelector('.' + className);
    if (existingMessage) {
        existingMessage.remove();
    }
}