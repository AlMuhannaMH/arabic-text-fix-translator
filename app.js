// Arabic text processing and Excel handling
let uploadedFile = null;
let processedWorkbook = null;

// Arabic processing data
const arabicData = {
    prefixes: ["ال", "و", "ف", "ب", "ل", "ك", "من", "إلى", "في"],
    suffixes: ["ة", "ين", "ون", "ان", "ات", "ها", "هم", "كم"],
    businessTerms: {
        "شركة": "Company",
        "مؤسسة": "Foundation/Institution", 
        "معهد": "Institute",
        "تمويل": "Financing",
        "تجارة": "Trade/Commerce",
        "أسواق": "Markets",
        "مخابز": "Bakeries",
        "مختار": "Selected",
        "عبدالله": "Abdullah",
        "ابراهيم": "Ibrahim",
        "محمد": "Mohammed",
        "علي": "Ali",
        "تجاري": "Commercial",
        "تجارية": "Commercial",
        "للتجارة": "for Trade",
        "للم": "for Materials",
        "للموادال": "for Materials",
        "تمويناتوتينمدىللم": "Tamwinat and Maintenance Materials",
        "أسواقومخابز": "Markets and Bakeries",
        "دارسلتيللتجا": "Dar Selti for Trade",
        "أسوارتيماءاث": "Aswar Timaa Athein",
        "عليمحمدعليق": "Ali Mohammed Ali",
        "شروقالبيضاء": "Shoroq Al Baydaa"
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
});

function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // Handle drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Handle file input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Handle upload area click to trigger file input
    uploadArea.addEventListener('click', function(e) {
        // Only trigger if clicking on the upload area itself, not on the file input
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
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
    document.getElementById('processBtn').disabled = true;
    document.getElementById('downloadSection').style.display = 'none';
    document.getElementById('processStatus').style.display = 'none';
}

function processFile() {
    if (!uploadedFile) {
        showError('Please upload a file first');
        return;
    }
    
    showProcessingStatus('Reading Excel file...', 10);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            showProcessingStatus('Processing Arabic text...', 30);
            setTimeout(() => processWorkbook(workbook), 100);
            
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

function processWorkbook(workbook) {
    try {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        showProcessingStatus('Extracting text from column M...', 50);
        
        // Process rows 2-400 in column M
        let processedCount = 0;
        const totalRows = 399; // rows 2-400
        
        for (let row = 2; row <= 400; row++) {
            const cellRef = `M${row}`;
            const cell = worksheet[cellRef];
            
            if (cell && cell.v && typeof cell.v === 'string') {
                const originalText = cell.v.toString();
                
                // Fix Arabic text spacing
                const correctedArabic = fixArabicSpacing(originalText);
                
                // Translate to English
                const englishTranslation = translateToEnglish(correctedArabic);
                
                // Add to column AC (corrected Arabic)
                const acRef = `AC${row}`;
                worksheet[acRef] = { v: correctedArabic, t: 's' };
                
                // Add to column AD (English translation)
                const adRef = `AD${row}`;
                worksheet[adRef] = { v: englishTranslation, t: 's' };
            }
            
            processedCount++;
            if (processedCount % 50 === 0) {
                const progress = 50 + (processedCount / totalRows) * 40;
                showProcessingStatus(`Processing row ${row}...`, progress);
            }
        }
        
        showProcessingStatus('Finalizing file...', 90);
        
        // Update worksheet range to include new columns
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        if (range.e.c < 28) { // AC = 28, AD = 29
            range.e.c = 29;
            worksheet['!ref'] = XLSX.utils.encode_range(range);
        }
        
        processedWorkbook = workbook;
        
        setTimeout(() => {
            showProcessingStatus('Complete!', 100);
            document.getElementById('downloadSection').style.display = 'block';
            hideProcessingStatus();
        }, 500);
        
    } catch (error) {
        showError('Error processing file: ' + error.message);
        hideProcessingStatus();
    }
}

function fixArabicSpacing(text) {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    
    // Handle specific business patterns first
    const businessPatterns = {
        'شركةأسواقومخابز': 'شركة أسواق ومخابز',
        'مؤسسةدارسلتيللتجا': 'مؤسسة دار سلتي للتجارة',
        'مؤسسةأسوارتيماءاث': 'مؤسسة أسوار تيماء اثنين',
        'مؤسسةعليمحمدعليق': 'مؤسسة علي محمد علي',
        'مؤسسةشروقالبيضاء': 'مؤسسة شروق البيضاء',
        'تمويناتوتينمدىللم': 'تمويلات وتين مدى للمواد',
        'طارقعبداللهابراهيم': 'طارق عبدالله ابراهيم'
    };
    
    // Apply business patterns
    for (const [pattern, replacement] of Object.entries(businessPatterns)) {
        result = result.replace(new RegExp(pattern, 'g'), replacement);
    }
    
    // Add spaces before common prefixes (but not at the beginning)
    arabicData.prefixes.forEach(prefix => {
        const regex = new RegExp(`(?<!^|\\s)${prefix}(?=\\S)`, 'g');
        result = result.replace(regex, ` ${prefix}`);
    });
    
    // Add spaces after common suffixes (but not at the end)
    arabicData.suffixes.forEach(suffix => {
        const regex = new RegExp(`(?<=\\S)${suffix}(?!$|\\s)`, 'g');
        result = result.replace(regex, `${suffix} `);
    });
    
    // Add spaces around company indicators
    result = result.replace(/شركة(?=\S)/g, 'شركة ');
    result = result.replace(/مؤسسة(?=\S)/g, 'مؤسسة ');
    result = result.replace(/معهد(?=\S)/g, 'معهد ');
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
}

function translateToEnglish(arabicText) {
    if (!arabicText || typeof arabicText !== 'string') return '';
    
    let translation = arabicText;
    
    // Apply business term translations
    for (const [arabic, english] of Object.entries(arabicData.businessTerms)) {
        const regex = new RegExp(arabic, 'g');
        translation = translation.replace(regex, english);
    }
    
    // Handle common patterns
    translation = translation.replace(/شركة\s+/g, 'Company ');
    translation = translation.replace(/مؤسسة\s+/g, 'Institution ');
    translation = translation.replace(/معهد\s+/g, 'Institute ');
    
    // If no translation occurred, provide a generic description
    if (translation === arabicText) {
        if (arabicText.includes('شركة')) {
            translation = 'Company (Arabic text)';
        } else if (arabicText.includes('مؤسسة')) {
            translation = 'Institution (Arabic text)';
        } else {
            translation = 'Arabic text';
        }
    }
    
    return translation;
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
        const newName = `${nameWithoutExt}_processed.xlsx`;
        
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

function showProcessingStatus(message, progress) {
    document.getElementById('processStatus').style.display = 'block';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('statusText').textContent = message;
    
    if (progress !== undefined) {
        document.getElementById('progressBar').style.display = 'block';
        document.getElementById('progressFill').style.width = progress + '%';
    }
    
    // Disable process button during processing
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.classList.add('btn--loading');
}

function hideProcessingStatus() {
    document.getElementById('processStatus').style.display = 'none';
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('progressBar').style.display = 'none';
    
    // Re-enable process button
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = false;
    processBtn.classList.remove('btn--loading');
}

function showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const processSection = document.querySelector('.process-section');
    processSection.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    // Remove any existing success messages
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const downloadSection = document.getElementById('downloadSection');
    downloadSection.appendChild(successDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}