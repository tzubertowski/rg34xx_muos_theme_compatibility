// DOM Elements
let fileInput;
let convertBtn;
let uploadContainer;
let statusContainer;
let statusMessages;
let downloadContainer;
let downloadBtn;
let progressContainer;
let progressFill;
let progressText;

// Variables
let selectedFiles = []; // Array to store multiple files
let convertedZips = []; // Array to store multiple converted zips
let currentFileIndex = 0; // Index of the file currently being processed
let processedImages = 0;
let totalImages = 0;
let conversionType = "zoom"; // Default conversion type
let selectedDevice = localStorage.getItem('selectedDevice') || "rg34xx"; // Get from localStorage or default to rg34xx

// Device configurations
const deviceConfigs = {
    "rg34xx": {
        name: "RG34XX",
        width: 720,
        height: 480,
        folderName: "720x480",
        originalWidth: 640,
        originalHeight: 480,
        logoFile: "logo.png"
    },
    "rgcubexx": {
        name: "RG CUBEXX",
        width: 720,
        height: 720,
        folderName: "720x720",
        originalWidth: 640,
        originalHeight: 480,
        logoFile: "logocube.png"
    }
};

// Initialize all DOM elements and event listeners when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM element references
    fileInput = document.getElementById('file-input');
    convertBtn = document.getElementById('convert-btn');
    uploadContainer = document.getElementById('upload-container');
    statusContainer = document.getElementById('status-container');
    statusMessages = document.getElementById('status-messages');
    downloadContainer = document.getElementById('download-container');
    downloadBtn = document.getElementById('download-btn');
    progressContainer = document.getElementById('progress-container');
    progressFill = document.getElementById('progress-fill');
    progressText = document.getElementById('progress-text');
    
    // Set up event listeners
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (convertBtn) {
        convertBtn.addEventListener('click', processAllFiles);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadFile);
    }
    
    if (uploadContainer) {
        uploadContainer.addEventListener('dragover', handleDragOver);
        uploadContainer.addEventListener('dragleave', handleDragLeave);
        uploadContainer.addEventListener('drop', handleDrop);
    }
    
    // Add event listeners for conversion type radio buttons
    document.querySelectorAll('input[name="conversion-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            conversionType = this.value;
        });
    });
    
    // Add event listeners for device type radio buttons
    document.querySelectorAll('input[name="device-type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            selectedDevice = this.value;
            // Save selection to localStorage
            localStorage.setItem('selectedDevice', selectedDevice);
            // Update logo based on device selection
            updateDeviceLogo();
        });
    });
    
    // Set the radio button based on the stored selection
    const savedDevice = localStorage.getItem('selectedDevice') || 'rg34xx';
    const deviceRadio = document.querySelector(`input[name="device-type"][value="${savedDevice}"]`);
    if (deviceRadio) {
        deviceRadio.checked = true;
    }
    
    // Set initial logo based on saved device
    updateDeviceLogo();
});

// Function to update the logo based on selected device
function updateDeviceLogo() {
    const deviceLogo = document.getElementById('device-logo');
    if (deviceLogo) {
        if (selectedDevice === 'rgcubexx') {
            deviceLogo.src = 'images/logocube.png';
        } else {
            deviceLogo.src = 'images/logo.png';
        }
    }
}

// File Handling Functions
function handleFileSelect(event) {
    if (event.target.files && event.target.files.length > 0) {
        selectedFiles = Array.from(event.target.files);
        updateFileSelectionUI();
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadContainer.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadContainer.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadContainer.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        selectedFiles = Array.from(files);
        fileInput.files = files;
        updateFileSelectionUI();
    }
}

function updateFileSelectionUI() {
    if (selectedFiles && selectedFiles.length > 0) {
        // Enable the convert button
        if (convertBtn) {
            convertBtn.disabled = false;
        }
        
        // Create or update file list display
        let fileListContainer = document.querySelector('.file-list');
        if (!fileListContainer) {
            fileListContainer = document.createElement('div');
            fileListContainer.className = 'file-list';
            if (uploadContainer) {
                uploadContainer.appendChild(fileListContainer);
            }
        } else {
            fileListContainer.innerHTML = '';
        }
        
        const uploadText = document.querySelector('.upload-text');
        if (uploadText) {
            if (selectedFiles.length === 1) {
                uploadText.textContent = `Selected: ${selectedFiles[0].name}`;
                
                // Add the single file to the list
                const fileItem = document.createElement('div');
                fileItem.className = 'file-list-item';
                fileItem.textContent = selectedFiles[0].name;
                fileListContainer.appendChild(fileItem);
            } else {
                uploadText.textContent = `Selected: ${selectedFiles.length} files`;
                
                // Add all files to the list
                selectedFiles.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-list-item';
                    fileItem.textContent = file.name;
                    fileListContainer.appendChild(fileItem);
                });
            }
        }
    } else {
        // Disable the convert button
        if (convertBtn) {
            convertBtn.disabled = true;
        }
        
        const uploadText = document.querySelector('.upload-text');
        if (uploadText) {
            uploadText.textContent = 'Drag & drop your .muxthm files here';
        }
        
        // Remove file list if it exists
        const fileListContainer = document.querySelector('.file-list');
        if (fileListContainer) {
            fileListContainer.remove();
        }
    }
}

function addStatusMessage(message, type = 'normal') {
    if (!statusMessages) return;
    
    const msgElement = document.createElement('div');
    msgElement.classList.add('status-message');
    
    if (type === 'success') {
        msgElement.classList.add('status-success');
    } else if (type === 'error') {
        msgElement.classList.add('status-error');
    }
    
    msgElement.textContent = message;
    statusMessages.appendChild(msgElement);
    statusMessages.scrollTop = statusMessages.scrollHeight;
}

function updateProgress(processed, total) {
    if (!progressFill || !progressText) return;
    
    const percentage = Math.round((processed / total) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `Processing: ${percentage}%`;
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

function bumpVersion(versionText) {
    // Simple version bumping logic
    const version = versionText.trim();
    const versionParts = version.split('.');
    
    if (versionParts.length >= 2) {
        // If it's a semantic version, bump the minor version
        const major = parseInt(versionParts[0], 10) || 0;
        const minor = parseInt(versionParts[1], 10) || 0;
        return `${major}.${minor + 1}`;
    } else if (!isNaN(parseInt(version, 10))) {
        // If it's just a number, increment it
        return (parseInt(version, 10) + 1).toString();
    } else {
        // If it's something else, append "-updated"
        return version + "-updated";
    }
}

function isInImageFolder(path) {
    return path.includes('640x480/image/');
}

function isInExcludedFolder(path) {
    // No longer excluding muxlaunch subfolder
    return false;
}

function isImageFile(path) {
    const ext = path.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
}

async function getImageDimensions(imageData) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height
            });
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for dimension checking'));
        };
        img.src = URL.createObjectURL(new Blob([imageData]));
    });
}

async function resizeImage(imageData, targetWidth, targetHeight) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            const ctx = canvas.getContext('2d');
            
            // Get source dimensions
            const sourceWidth = img.width;
            const sourceHeight = img.height;
            
            // Calculate source and destination coordinates based on conversion type
            let sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight;
            
            switch(conversionType) {
                case 'zoom':
                    // Fill the entire target area, cropping if necessary
                    const sourceRatio = sourceWidth / sourceHeight;
                    const targetRatio = targetWidth / targetHeight;
                    
                    if (sourceRatio > targetRatio) {
                        // Source is wider than target relative to height
                        sHeight = sourceHeight;
                        sWidth = sourceHeight * targetRatio;
                        sX = (sourceWidth - sWidth) / 2;
                        sY = 0;
                    } else {
                        // Source is taller than target relative to width
                        sWidth = sourceWidth;
                        sHeight = sourceWidth / targetRatio;
                        sX = 0;
                        sY = (sourceHeight - sHeight) / 2;
                    }
                    
                    dX = 0;
                    dY = 0;
                    dWidth = targetWidth;
                    dHeight = targetHeight;
                    break;
                    
                case 'crop':
                    // Center crop to the target aspect ratio
                    const targetAspectRatio = targetWidth / targetHeight;
                    
                    if (sourceWidth / sourceHeight > targetAspectRatio) {
                        // Image is wider than target aspect ratio
                        sHeight = sourceHeight;
                        sWidth = sourceHeight * targetAspectRatio;
                        sX = (sourceWidth - sWidth) / 2;
                        sY = 0;
                    } else {
                        // Image is taller than target aspect ratio
                        sWidth = sourceWidth;
                        sHeight = sourceWidth / targetAspectRatio;
                        sX = 0;
                        sY = (sourceHeight - sHeight) / 2;
                    }
                    
                    dX = 0;
                    dY = 0;
                    dWidth = targetWidth;
                    dHeight = targetHeight;
                    break;
                    
                case 'fit':
                    // Fit the entire image within the target dimensions
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, targetWidth, targetHeight);
                    
                    const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
                    dWidth = sourceWidth * scale;
                    dHeight = sourceHeight * scale;
                    dX = (targetWidth - dWidth) / 2;
                    dY = (targetHeight - dHeight) / 2;
                    
                    sX = 0;
                    sY = 0;
                    sWidth = sourceWidth;
                    sHeight = sourceHeight;
                    break;
                    
                default:
                    // Default to zoom behavior
                    sX = 0;
                    sY = 0;
                    sWidth = sourceWidth;
                    sHeight = sourceHeight;
                    dX = 0;
                    dY = 0;
                    dWidth = targetWidth;
                    dHeight = targetHeight;
            }
            
            // Draw the image with calculated parameters
            ctx.drawImage(img, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);
            
            canvas.toBlob(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            }, 'image/png');
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(new Blob([imageData]));
    });
}

async function copyFile(zip, path, newZip) {
    const fileData = await zip.file(path).async('arraybuffer');
    newZip.file(path, fileData);
}

async function copyFileWithRename(zip, sourcePath, destinationPath, newZip) {
    try {
        const fileData = await zip.file(sourcePath).async('arraybuffer');
        newZip.file(destinationPath, fileData);
        addStatusMessage(`Copied file with rename: ${sourcePath} to ${destinationPath}`, 'success');
    } catch (error) {
        addStatusMessage(`Failed to copy file with rename ${sourcePath}: ${error.message}`, 'error');
    }
}

async function copyFileToNewLocation(zip, originalPath, newPath, newZip) {
    try {
        const fileData = await zip.file(originalPath).async('arraybuffer');
        newZip.file(newPath, fileData);
        addStatusMessage(`Copied file: ${originalPath} to ${newPath}`, 'normal');
    } catch (error) {
        addStatusMessage(`Failed to copy file ${originalPath}: ${error.message}`, 'error');
    }
}

async function processImageToNewLocation(zip, originalPath, newPath, newZip, deviceConfig) {
    try {
        const imageData = await zip.file(originalPath).async('arraybuffer');
        
        // Check if the image is actually 640x480 before converting
        const dimensions = await getImageDimensions(imageData);
        
        if (dimensions.width === deviceConfig.originalWidth && dimensions.height === deviceConfig.originalHeight) {
            addStatusMessage(`Converting image: ${originalPath} using ${conversionType} method for ${deviceConfig.name}`, 'normal');
            const convertedImage = await resizeImage(imageData, deviceConfig.width, deviceConfig.height);
            newZip.file(newPath, convertedImage);
            
            processedImages++;
            updateProgress(processedImages, totalImages);
            
            addStatusMessage(`Processed image: ${newPath}`, 'success');
        } else {
            addStatusMessage(`Skipping non-${deviceConfig.originalWidth}x${deviceConfig.originalHeight} image: ${originalPath} (${dimensions.width}x${dimensions.height})`, 'normal');
            // Just copy the original image to the new location without resizing
            newZip.file(newPath, imageData);
        }
    } catch (error) {
        addStatusMessage(`Failed to process image ${originalPath}: ${error.message}`, 'error');
    }
}

async function processIniFile(zip, path, newZip, deviceConfig) {
    try {
        let content = await zip.file(path).async('string');
        
        // Get original and new dimensions for text replacement
        const originalWidth = deviceConfig.originalWidth;
        const originalHeight = deviceConfig.originalHeight;
        const newWidth = deviceConfig.width;
        const newHeight = deviceConfig.height;
        
        // Look for original resolution values and replace with new ones
        const originalResolution = `${originalWidth}x${originalHeight}`;
        const newResolution = `${newWidth}x${newHeight}`;
        
        if (content.includes(originalResolution) || content.includes(originalWidth.toString())) {
            const originalContent = content;
            
            // Replace instances of oldResolution with newResolution
            content = content.replace(new RegExp(originalResolution, 'g'), newResolution);
            
            // Replace instances of just the original width that likely refer to width
            // This is a bit trickier - we want to replace the width but not if it's part of other numbers
            content = content.replace(new RegExp(`\\b${originalWidth}\\b`, 'g'), newWidth.toString());
            
            if (content !== originalContent) {
                addStatusMessage(`Updated resolution references in INI file: ${path}`, 'success');
            }
        }
        
        // Write the file back (modified or not)
        newZip.file(path, content);
    } catch (error) {
        addStatusMessage(`Failed to process INI file ${path}: ${error.message}`, 'error');
    }
}

function generateOutputFilename(originalFilename, deviceConfig) {
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    return `${deviceConfig.name}_${baseName}_${deviceConfig.width}x${deviceConfig.height}.muxthm`;
}

// Main processing functions
async function processAllFiles() {
    if (!selectedFiles || selectedFiles.length === 0) {
        addStatusMessage('No files selected. Please select at least one theme file.', 'error');
        return;
    }
    
    // Reset UI
    if (statusContainer) statusContainer.style.display = 'block';
    if (downloadContainer) downloadContainer.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'block';
    if (statusMessages) statusMessages.innerHTML = '';
    if (convertBtn) convertBtn.disabled = true;
    
    convertedZips = [];
    currentFileIndex = 0;
    
    // Update batch success message based on number of files
    const batchSuccessMsg = document.querySelector('.batch-success-message');
    if (batchSuccessMsg) {
        if (selectedFiles.length === 1) {
            batchSuccessMsg.textContent = "Your theme has been successfully converted!";
        } else {
            batchSuccessMsg.textContent = `Your ${selectedFiles.length} themes have been successfully converted!`;
        }
    }
    
    addStatusMessage(`Starting batch conversion of ${selectedFiles.length} theme files...`, 'normal');
    
    // Process each file sequentially
    await processNextFile();
}

async function processNextFile() {
    if (currentFileIndex >= selectedFiles.length) {
        // All files are processed
        addStatusMessage('All theme files have been successfully converted!', 'success');
        if (downloadContainer) downloadContainer.style.display = 'block';
        if (convertBtn) convertBtn.disabled = false;
        return;
    }
    
    const currentFile = selectedFiles[currentFileIndex];
    addStatusMessage(`Processing file ${currentFileIndex + 1} of ${selectedFiles.length}: ${currentFile.name}`, 'normal');
    
    try {
        await processFile(currentFile);
        currentFileIndex++;
        await processNextFile();
    } catch (error) {
        addStatusMessage(`Error processing ${currentFile.name}: ${error.message}`, 'error');
        currentFileIndex++;
        await processNextFile();
    }
}

async function processFile(file) {
    // Get device configuration
    const deviceConfig = deviceConfigs[selectedDevice];
    
    processedImages = 0;
    
    try {
        // Read the zip file
        addStatusMessage(`Reading theme file: ${file.name}...`, 'normal');
        const zipData = await readFileAsArrayBuffer(file);
        const zip = await JSZip.loadAsync(zipData);
        addStatusMessage('Theme file loaded successfully', 'success');
        
        // Create new zip for the converted theme
        const newZip = new JSZip();
        
        // Process version.txt
        addStatusMessage('Checking for version.txt...', 'normal');
        if (zip.file('version.txt')) {
            const versionText = await zip.file('version.txt').async('string');
            addStatusMessage(`Current version: ${versionText}`, 'normal');
            
            // Bump version
            const newVersion = bumpVersion(versionText);
            addStatusMessage(`Bumping version to: ${newVersion}`, 'normal');
            newZip.file('version.txt', newVersion);
        } else {
            addStatusMessage('Warning: version.txt not found in the theme', 'error');
            newZip.file('version.txt', '1.0');
        }
        
        // Count images to be processed for progress tracking and create paths map
        const imageFilePaths = [];
        const filesToCopyToNewLocation = new Map(); // Map of original path to new path
        const iniFiles = [];
        
        const originalFolderPrefix = `640x480/`;
        const newFolderPrefix = `${deviceConfig.folderName}/`;
        
        zip.forEach((relativePath, zipEntry) => {
            if (zipEntry.dir) return;
            
            // Track images to process
            if (isInImageFolder(relativePath) && isImageFile(relativePath)) {
                imageFilePaths.push(relativePath);
            }
            
            // Track files to copy to new resolution folder
            if (relativePath.startsWith(originalFolderPrefix)) {
                const newPath = relativePath.replace(originalFolderPrefix, newFolderPrefix);
                filesToCopyToNewLocation.set(relativePath, newPath);
            }
            
            // Track .ini files for text replacement
            if (relativePath.endsWith('.ini')) {
                iniFiles.push(relativePath);
            }
        });
        
        totalImages = imageFilePaths.length;
        addStatusMessage(`Found ${totalImages} images to process and ${filesToCopyToNewLocation.size} files to copy to ${newFolderPrefix} folder`, 'normal');
        
        // First, copy ALL original files and folders to the new zip
        addStatusMessage('Copying all original files and folders...', 'normal');
        
        // Step 1: Create all directories first to maintain structure
        const allFolders = new Set();
        zip.forEach((relativePath, zipEntry) => {
            if (zipEntry.dir) {
                allFolders.add(relativePath);
            } else {
                // Add parent folders for all files
                let parentPath = relativePath.substring(0, relativePath.lastIndexOf('/') + 1);
                while (parentPath) {
                    allFolders.add(parentPath);
                    // Move up one level
                    const lastSlashIndex = parentPath.slice(0, -1).lastIndexOf('/');
                    if (lastSlashIndex === -1) break;
                    parentPath = parentPath.substring(0, lastSlashIndex + 1);
                }
            }
        });
        
        // Add new resolution folder structure
        allFolders.forEach(folder => {
            if (folder.startsWith(originalFolderPrefix)) {
                allFolders.add(folder.replace(originalFolderPrefix, newFolderPrefix));
            }
        });
        
        // Create all folders in the zip
        allFolders.forEach(folder => {
            newZip.folder(folder);
        });
        
        // Step 2: Copy all files with their content
        const copyPromises = [];
        
        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const promise = copyFile(zip, relativePath, newZip);
                copyPromises.push(promise);
            }
        });
        
        // Wait for all files to be copied
        await Promise.all(copyPromises);
        addStatusMessage('All original files and folders copied successfully', 'success');
        
        // Process .ini files to replace resolution references
        const iniPromises = [];
        for (const iniPath of iniFiles) {
            const promise = processIniFile(zip, iniPath, newZip, deviceConfig);
            iniPromises.push(promise);
        }
        
        await Promise.all(iniPromises);
        addStatusMessage('Processed all .ini files', 'success');
        
        // Copy files from 640x480 to new resolution folder (processing images as needed)
        addStatusMessage(`Creating ${newFolderPrefix} folder structure with all files...`, 'normal');
        const conversionPromises = [];
        
        for (const [originalPath, newPath] of filesToCopyToNewLocation.entries()) {
            // Special handling for logo.png in the 640x480 folder structure
            if (originalPath.endsWith('/logo.png') && selectedDevice === 'rgcubexx') {
                const dirPath = originalPath.substring(0, originalPath.lastIndexOf('/') + 1);
                const possibleCubeLogoPath = dirPath + 'logocube.png';
                
                if (zip.file(possibleCubeLogoPath)) {
                    // Use logocube.png instead of logo.png for RG CUBEXX
                    addStatusMessage(`Using logocube.png instead of logo.png for ${dirPath} in ${deviceConfig.name}`, 'success');
                    const promise = copyFileWithRename(zip, possibleCubeLogoPath, newPath, newZip);
                    conversionPromises.push(promise);
                    continue;
                }
            }
            
            // Normal processing for non-logo files or if cube logo doesn't exist
            if (isInImageFolder(originalPath) && isImageFile(originalPath)) {
                // This is an image file that needs potential conversion
                const promise = processImageToNewLocation(zip, originalPath, newPath, newZip, deviceConfig);
                conversionPromises.push(promise);
            } else {
                // This is a non-image file, just copy it to the new location
                const promise = copyFileToNewLocation(zip, originalPath, newPath, newZip);
                conversionPromises.push(promise);
            }
        }
        
        // Wait for all files to be processed
        await Promise.all(conversionPromises);
        
        // Generate the new zip file
        addStatusMessage(`Creating converted theme file for ${file.name}...`, 'normal');
        const convertedZip = await newZip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        });
        
        // Add to converted zips array with filename
        convertedZips.push({
            blob: convertedZip,
            name: generateOutputFilename(file.name, deviceConfig)
        });
        
        addStatusMessage(`Theme ${file.name} conversion completed successfully!`, 'success');
        
    } catch (error) {
        addStatusMessage(`Error: ${error.message}`, 'error');
        console.error(error);
        throw error; // Re-throw to let the batch processor handle it
    }
}

function downloadFile() {
    if (!convertedZips || convertedZips.length === 0) {
        addStatusMessage('No converted files to download.', 'error');
        return;
    }
    
    if (convertedZips.length === 1) {
        // Single file download
        saveAs(convertedZips[0].blob, convertedZips[0].name);
        addStatusMessage(`Downloaded: ${convertedZips[0].name}`, 'success');
    } else {
        // Multiple files - create a zip containing all converted themes
        const batchZip = new JSZip();
        
        // Add each converted file to the batch zip
        convertedZips.forEach(file => {
            batchZip.file(file.name, file.blob);
        });
        
        // Generate the batch zip file
        batchZip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        }).then(content => {
            // Get device configuration
            const deviceConfig = deviceConfigs[selectedDevice];
            // Save the batch zip
            const batchFilename = `${deviceConfig.name}_ThemesBatch_${new Date().toISOString().slice(0,10)}.zip`;
            saveAs(content, batchFilename);
            addStatusMessage(`Downloaded batch of ${convertedZips.length} themes as: ${batchFilename}`, 'success');
        });
    }
}