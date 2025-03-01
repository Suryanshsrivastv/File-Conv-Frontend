document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const toDropdown = document.getElementById('to-file-type');
    const convertButton = document.getElementById('convert-button');
     const socketElement = document.querySelector('.smodal'); // Move this inside the event listener

    let selectedFile = null;
    let fileType = '';

    function getFileType(fileName) {
        const fileExtension = fileName.split('.').pop().toLowerCase();
        switch (fileExtension) {
            case 'pdf':
                return 'pdf';
            case 'pptx':
                return 'ppt';
            case 'docx':
                return 'docx';
            case 'txt':
                return 'text';
            default:
                return '';
        }
    }
    // Listen for file selection
    fileInput.addEventListener('change', function (event) {
        selectedFile = event.target.files[0];

        if (selectedFile) {
            fileType = getFileType(selectedFile.name);
            fileNameDisplay.textContent = `Selected file: ${selectedFile.name}`;
            convertButton.style.display = 'inline-block';
            console.log(fileType);
        } else {
            fileNameDisplay.textContent = 'No file selected';
            convertButton.style.display = 'none';
        }
    });

    // Listen for the convert button click
    convertButton.addEventListener('click', function () {
        const selectedToType = toDropdown.value; // Get the selected "To" file type
    
        if (fileType === selectedToType) {
            alert('Cannot convert to the same file type');
            return;
        } 
        if (selectedToType === '') {
            alert('Please select a "To" file type.');
            return;
        }
    
        // Dynamically build the endpoint URL
        const endpoint = `https://file-converter-fmu3.onrender.com/conv/${fileType}-to-${selectedToType}`;
        console.log(fileType, selectedToType, endpoint);
    
        // Prepare the data for the API request
        const formData = new FormData();
        formData.append('file', selectedFile); // Add the selected file
    
        fetch(endpoint, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.downloadUrl) {
                console.log('Conversion successful:', data);
                alert('File conversion successful. Click OK to download.');
        
                // Redirect user to Dropbox download link
                window.location.href = data.downloadUrl;
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while converting the file.');
        });        
    });

    // Function to identify the file type based on its extension
    function getFileType(fileName) {
        const fileExtension = fileName.split('.').pop().toLowerCase();
        switch (fileExtension) {
            case 'pdf':
                return 'pdf';
            case 'pptx':
                return 'ppt';
            case 'docx':
                return 'docx';
            case 'txt':
                return 'text';
            default:
                return '';
        }
    }
});

// Function to download the converted file into local storage
function downloadConvertedFile(fileLocation) {
    const fileName = fileLocation.split('/').pop(); // Extract the file name from the file path

    // Make the GET request to download the file
    fetch(`http://localhost:8080/conv/download/${fileName}`, {
        method: 'GET',
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to download the file');
            }
            return response.blob(); // Expecting the file as a blob
        })
        .then((blob) => {
            // Create a temporary link to trigger the file download and save it to local storage
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = fileName; // The downloaded file will have the same name as the original
            document.body.appendChild(link);
            link.click(); // Trigger the download
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up the object URL

            // Save the file to local storage
            const fileReader = new FileReader();
            fileReader.onload = function () {
                const fileData = fileReader.result;
                localStorage.setItem(fileName, fileData); // Save the file data in local storage
                console.log('File saved to local storage:', fileName);
            };
            fileReader.readAsDataURL(blob); // Read the blob as a data URL to save in local storage
        })
        .catch((error) => {
            console.error('Error downloading the file:', error);
            alert('An error occurred while downloading the file.');
        });
    }