// Arabic Text Processor - Main Application Logic
class ArabicTextProcessor {
    constructor() {
        this.sampleText = `(06:51)شركةأسواقومخابزال/شركةأسواقومخابزالمختار
(01:28)
(03:07)طارقعبداللهابراهيم/طارقعبداللهابراهيمالس
Unidentified Deposits Movement Aug'2025
(11:54)تمويناتوتينمدىللم/تمويناتوتينمدىللموادال
(11:38)مؤسسةدارسلتيللتجا/مؤسسةدارسلتيللتجارة/CA
(11:30)تمويناتعربةلينللم/تمويناتعربةلينللموادال
(11:20)مؤسسةأسوارتيماءاث/مؤسسةأسوارتيماءاثنينال
(11:12)مؤسسةعليمحمدعليق/مؤسسةعليمحمدعليقحلالتجا
(11:10)مؤسسةشروقالبيضاء/مؤسسةشروقالبيضاء/CA:236
(11:02)20250901SABSFRBSFR6BCFT12302807881/SAMAA
(10:56)شركةنهلةالواديالت/شركةنهلةالواديالتجارية`;

        this.patterns = {
            timestamp: /^\((\d{2}:\d{2})\)(.*)$/,
            arabic: /[\u0600-\u06FF]+/g,
            englishCodes: /[A-Z]{2,}:\d+/g,
            accountCodes: /CA:\d+/g,
            bankCodes: /\d{8}[A-Z0-9]+/g,
            separators: /[\/]/g
        };

        this.debounceTimer = null;
        this.lastResults = null;
        
        this.initializeEventListeners();
        this.loadUserPreferences();
    }

    initializeEventListeners() {
        // Get DOM elements
        this.elements = {
            inputText: document.getElementById('inputText'),
            lineCount: document.getElementById('lineCount'),
            processButton: document.getElementById('processButton'),
            loadSample: document.getElementById('loadSample'),
            clearInput: document.getElementById('clearInput'),
            autoProcess: document.getElementById('autoProcess'),
            outputSection: document.getElementById('outputSection'),
            statisticsPanel: document.getElementById('statisticsPanel'),
            resultsTableBody: document.getElementById('resultsTableBody'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            processingStatus: document.getElementById('processingStatus'),
            exportCSV: document.getElementById('exportCSV'),
            exportJSON: document.getElementById('exportJSON'),
            copyResults: document.getElementById('copyResults'),
            
            // Processing options
            extractTimestamps: document.getElementById('extractTimestamps'),
            separateArabicText: document.getElementById('separateArabicText'),
            extractEnglishCodes: document.getElementById('extractEnglishCodes'),
            cleanText: document.getElementById('cleanText'),
            showStatistics: document.getElementById('showStatistics'),

            // Statistics elements
            totalLines: document.getElementById('totalLines'),
            timestampedEntries: document.getElementById('timestampedEntries'),
            arabicSegments: document.getElementById('arabicSegments'),
            extractedCodes: document.getElementById('extractedCodes')
        };

        // Input event listeners
        this.elements.inputText.addEventListener('input', this.handleInputChange.bind(this));
        this.elements.inputText.addEventListener('paste', this.handleInputChange.bind(this));

        // Button event listeners
        this.elements.processButton.addEventListener('click', this.processText.bind(this));
        this.elements.loadSample.addEventListener('click', this.loadSampleText.bind(this));
        this.elements.clearInput.addEventListener('click', this.clearInput.bind(this));
        
        // Export listeners
        this.elements.exportCSV.addEventListener('click', this.exportToCSV.bind(this));
        this.elements.exportJSON.addEventListener('click', this.exportToJSON.bind(this));
        this.elements.copyResults.addEventListener('click', this.copyToClipboard.bind(this));

        // Auto-process checkbox
        this.elements.autoProcess.addEventListener('change', this.saveUserPreferences.bind(this));

        // Processing option checkboxes
        const checkboxes = [
            'extractTimestamps', 'separateArabicText', 'extractEnglishCodes', 
            'cleanText', 'showStatistics'
        ];
        checkboxes.forEach(id => {
            this.elements[id].addEventListener('change', () => {
                this.saveUserPreferences();
                if (this.elements.autoProcess.checked && this.elements.inputText.value.trim()) {
                    this.debouncedProcess();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Initial line count update
        this.updateLineCount();
    }

    handleInputChange() {
        this.updateLineCount();
        
        if (this.elements.autoProcess.checked) {
            this.debouncedProcess();
        }
    }

    debouncedProcess() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (this.elements.inputText.value.trim()) {
                this.processText();
            }
        }, 1000);
    }

    updateLineCount() {
        const lines = this.elements.inputText.value.split('\n').filter(line => line.trim());
        this.elements.lineCount.textContent = lines.length;
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.processText();
        }
        
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            this.loadSampleText();
        }
    }

    loadSampleText() {
        this.elements.inputText.value = this.sampleText;
        this.updateLineCount();
        
        if (this.elements.autoProcess.checked) {
            this.debouncedProcess();
        }
    }

    clearInput() {
        this.elements.inputText.value = '';
        this.elements.outputSection.style.display = 'none';
        this.updateLineCount();
        this.showStatus('تم مسح النص - Text cleared', 'success');
    }

    async processText() {
        const inputText = this.elements.inputText.value.trim();
        
        if (!inputText) {
            this.showStatus('يرجى إدخال نص للمعالجة - Please enter text to process', 'error');
            return;
        }

        this.showLoading(true);

        try {
            // Get processing options
            const options = this.getProcessingOptions();
            
            // Process the text
            const results = await this.processArabicText(inputText, options);
            
            // Display results
            this.displayResults(results, options);
            
            this.lastResults = results;
            this.showStatus(`تمت معالجة ${results.processedLines.length} سطر بنجاح - Successfully processed ${results.processedLines.length} lines`, 'success');
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showStatus('خطأ في المعالجة - Processing error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    getProcessingOptions() {
        return {
            extractTimestamps: this.elements.extractTimestamps.checked,
            separateArabicText: this.elements.separateArabicText.checked,
            extractEnglishCodes: this.elements.extractEnglishCodes.checked,
            cleanText: this.elements.cleanText.checked,
            showStatistics: this.elements.showStatistics.checked
        };
    }

    async processArabicText(inputText, options) {
        return new Promise((resolve) => {
            // Simulate processing delay for better UX
            setTimeout(() => {
                const lines = inputText.split('\n');
                const results = {
                    processedLines: [],
                    timestamps: [],
                    arabicSegments: [],
                    englishCodes: [],
                    statistics: {
                        totalLines: 0,
                        timestampedEntries: 0,
                        arabicSegments: 0,
                        extractedCodes: 0,
                        emptyLines: 0
                    }
                };

                lines.forEach((line, index) => {
                    const processedLine = this.processLine(line, index + 1, options);
                    if (processedLine) {
                        results.processedLines.push(processedLine);
                        
                        // Collect statistics
                        if (processedLine.timestamp) {
                            results.timestamps.push(processedLine.timestamp);
                            results.statistics.timestampedEntries++;
                        }
                        
                        if (processedLine.arabicTexts.length > 0) {
                            results.arabicSegments.push(...processedLine.arabicTexts);
                            results.statistics.arabicSegments += processedLine.arabicTexts.length;
                        }
                        
                        if (processedLine.codes.length > 0) {
                            results.englishCodes.push(...processedLine.codes);
                            results.statistics.extractedCodes += processedLine.codes.length;
                        }
                    } else if (line.trim() === '') {
                        results.statistics.emptyLines++;
                    }
                });

                results.statistics.totalLines = lines.length;
                resolve(results);
            }, 300);
        });
    }

    processLine(line, lineNumber, options) {
        if (!line.trim()) {
            return null;
        }

        const result = {
            lineNumber,
            originalLine: line,
            timestamp: null,
            arabicTexts: [],
            codes: [],
            notes: []
        };

        let processedContent = line;

        // Extract timestamp if enabled
        if (options.extractTimestamps) {
            const timestampMatch = line.match(this.patterns.timestamp);
            if (timestampMatch) {
                result.timestamp = timestampMatch[1];
                processedContent = timestampMatch[2].trim();
            }
        }

        // Clean text if enabled
        if (options.cleanText) {
            processedContent = this.cleanText(processedContent);
        }

        // Extract English codes if enabled
        if (options.extractEnglishCodes) {
            const codes = this.extractCodes(processedContent);
            result.codes = codes;
            
            // Remove codes from content for Arabic text extraction
            codes.forEach(code => {
                processedContent = processedContent.replace(code, '');
            });
        }

        // Separate Arabic text if enabled
        if (options.separateArabicText) {
            result.arabicTexts = this.extractArabicTexts(processedContent);
        }

        // Add notes based on content
        this.addNotes(result, line);

        return result;
    }

    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/[^\u0600-\u06FF\u0020-\u007E]/g, '')
            .trim();
    }

    extractCodes(text) {
        const codes = [];
        
        // Extract account codes (CA:xxx)
        const accountMatches = text.match(this.patterns.accountCodes) || [];
        codes.push(...accountMatches);
        
        // Extract bank codes (8+ digits followed by letters/numbers)
        const bankMatches = text.match(this.patterns.bankCodes) || [];
        codes.push(...bankMatches);
        
        // Extract other English codes
        const englishMatches = text.match(this.patterns.englishCodes) || [];
        codes.push(...englishMatches.filter(code => !code.startsWith('CA:')));
        
        return [...new Set(codes)]; // Remove duplicates
    }

    extractArabicTexts(text) {
        // Split by common separators
        const parts = text.split(/[\/\|]/);
        const arabicTexts = [];
        
        parts.forEach(part => {
            const cleaned = part.trim();
            if (cleaned && this.containsArabic(cleaned)) {
                // Extract only Arabic portions
                const arabicMatches = cleaned.match(this.patterns.arabic) || [];
                if (arabicMatches.length > 0) {
                    const arabicText = arabicMatches.join(' ').trim();
                    if (arabicText) {
                        arabicTexts.push(arabicText);
                    }
                }
            }
        });
        
        return arabicTexts;
    }

    containsArabic(text) {
        return this.patterns.arabic.test(text);
    }

    addNotes(result, originalLine) {
        if (!result.timestamp && result.arabicTexts.length === 0) {
            result.notes.push('لا يحتوي على نص عربي - No Arabic text');
        }
        
        if (result.codes.length > 0) {
            result.notes.push('يحتوي على أكواد - Contains codes');
        }
        
        if (originalLine.includes('Payment') || originalLine.includes('FT')) {
            result.notes.push('معاملة مالية - Financial transaction');
        }
        
        if (!result.timestamp) {
            result.notes.push('بدون طابع زمني - No timestamp');
        }
    }

    displayResults(results, options) {
        // Show output section
        this.elements.outputSection.style.display = 'block';
        
        // Show/hide statistics panel
        if (options.showStatistics) {
            this.displayStatistics(results.statistics);
            this.elements.statisticsPanel.style.display = 'block';
        } else {
            this.elements.statisticsPanel.style.display = 'none';
        }
        
        // Populate results table
        this.populateResultsTable(results.processedLines);
        
        // Scroll to results
        this.elements.outputSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    displayStatistics(stats) {
        this.elements.totalLines.textContent = stats.totalLines;
        this.elements.timestampedEntries.textContent = stats.timestampedEntries;
        this.elements.arabicSegments.textContent = stats.arabicSegments;
        this.elements.extractedCodes.textContent = stats.extractedCodes;
    }

    populateResultsTable(processedLines) {
        const tbody = this.elements.resultsTableBody;
        tbody.innerHTML = '';
        
        if (processedLines.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div>
                            <h4>لا توجد نتائج</h4>
                            <p>No results found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        processedLines.forEach(line => {
            const row = document.createElement('tr');
            
            // Add CSS classes based on content
            if (line.timestamp) row.classList.add('has-timestamp');
            if (line.codes.length > 0) row.classList.add('has-codes');
            if (line.arabicTexts.length === 0) row.classList.add('no-arabic');
            
            row.innerHTML = `
                <td>${line.lineNumber}</td>
                <td>${line.timestamp || '-'}</td>
                <td class="rtl-text">${line.arabicTexts[0] || '-'}</td>
                <td class="rtl-text">${line.arabicTexts[1] || '-'}</td>
                <td class="ltr-text">${line.codes.join(', ') || '-'}</td>
                <td class="ltr-text">${line.notes.join('; ') || '-'}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    async exportToCSV() {
        if (!this.lastResults) {
            this.showStatus('لا توجد نتائج للتصدير - No results to export', 'error');
            return;
        }

        try {
            const csv = this.generateCSV(this.lastResults.processedLines);
            this.downloadFile(csv, 'arabic-text-results.csv', 'text/csv;charset=utf-8;');
            this.showStatus('تم تصدير CSV بنجاح - CSV exported successfully', 'success');
        } catch (error) {
            this.showStatus('خطأ في تصدير CSV - CSV export error', 'error');
        }
    }

    generateCSV(data) {
        const headers = [
            'الرقم,الوقت,النص العربي الأول,النص العربي الثاني,الأكواد,الملاحظات',
            'Number,Time,First Arabic Text,Second Arabic Text,Codes,Notes'
        ].join('\n');
        
        const rows = data.map(line => {
            return [
                line.lineNumber,
                line.timestamp || '',
                `"${line.arabicTexts[0] || ''}"`,
                `"${line.arabicTexts[1] || ''}"`,
                `"${line.codes.join(', ')}"`,
                `"${line.notes.join('; ')}"`
            ].join(',');
        }).join('\n');
        
        return '\ufeff' + headers + '\n' + rows; // Add BOM for proper UTF-8 handling
    }

    async exportToJSON() {
        if (!this.lastResults) {
            this.showStatus('لا توجد نتائج للتصدير - No results to export', 'error');
            return;
        }

        try {
            const jsonData = {
                exportDate: new Date().toISOString(),
                statistics: this.lastResults.statistics,
                processedLines: this.lastResults.processedLines
            };
            
            const json = JSON.stringify(jsonData, null, 2);
            this.downloadFile(json, 'arabic-text-results.json', 'application/json;charset=utf-8;');
            this.showStatus('تم تصدير JSON بنجاح - JSON exported successfully', 'success');
        } catch (error) {
            this.showStatus('خطأ في تصدير JSON - JSON export error', 'error');
        }
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async copyToClipboard() {
        if (!this.lastResults) {
            this.showStatus('لا توجد نتائج للنسخ - No results to copy', 'error');
            return;
        }

        try {
            const text = this.generateTextOutput(this.lastResults.processedLines);
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            this.elements.copyResults.classList.add('copy-success');
            setTimeout(() => {
                this.elements.copyResults.classList.remove('copy-success');
            }, 300);
            
            this.showStatus('تم نسخ النتائج - Results copied to clipboard', 'success');
        } catch (error) {
            this.showStatus('خطأ في النسخ - Copy error', 'error');
        }
    }

    generateTextOutput(data) {
        let output = 'معالج النصوص العربية - نتائج المعالجة\nArabic Text Processor - Processing Results\n\n';
        
        data.forEach(line => {
            output += `[${line.lineNumber}] `;
            if (line.timestamp) output += `(${line.timestamp}) `;
            if (line.arabicTexts.length > 0) {
                output += line.arabicTexts.join(' / ');
            }
            if (line.codes.length > 0) {
                output += ` [${line.codes.join(', ')}]`;
            }
            output += '\n';
        });
        
        return output;
    }

    showLoading(show) {
        if (show) {
            this.elements.loadingOverlay.classList.add('active');
        } else {
            this.elements.loadingOverlay.classList.remove('active');
        }
    }

    showStatus(message, type) {
        const statusElement = this.elements.processingStatus;
        const messageElement = statusElement.querySelector('.status-message');
        
        statusElement.className = `processing-status ${type}`;
        messageElement.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }

    saveUserPreferences() {
        const preferences = {
            autoProcess: this.elements.autoProcess.checked,
            extractTimestamps: this.elements.extractTimestamps.checked,
            separateArabicText: this.elements.separateArabicText.checked,
            extractEnglishCodes: this.elements.extractEnglishCodes.checked,
            cleanText: this.elements.cleanText.checked,
            showStatistics: this.elements.showStatistics.checked
        };
        
        // Note: localStorage is not used as per strict instructions
        // Preferences are saved only for the current session
        this.currentPreferences = preferences;
    }

    loadUserPreferences() {
        // Set default preferences (localStorage not used)
        const defaults = {
            autoProcess: false,
            extractTimestamps: true,
            separateArabicText: true,
            extractEnglishCodes: false,
            cleanText: false,
            showStatistics: true
        };
        
        Object.keys(defaults).forEach(key => {
            if (this.elements[key]) {
                this.elements[key].checked = defaults[key];
            }
        });
        
        this.currentPreferences = defaults;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArabicTextProcessor();
});