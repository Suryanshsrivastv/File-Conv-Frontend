document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const toDropdown = document.getElementById('to-file-type');
    const convertButton = document.getElementById('convert-button');

    let selectedFile = null;
    let fileType = '';

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

        // Check if the selected file type and the "To" type are the same
        if (fileType === selectedToType) {
            alert('Cannot convert to the same file type');
        } else if (selectedToType !== '') {
            // Dynamically build the endpoint URL
            const endpoint = `http://localhost:8080/conv/${fileType}-to-${selectedToType}`;

            // Prepare the data for the API request
            const formData = new FormData();
            formData.append('file', selectedFile); // Add the selected file

            fetch(endpoint, {
                method: 'POST',
                body: formData,
            })
                .then((response) => response.text()) // Expecting the output file path in the response
                .then((fileLocation) => {
                    if (fileLocation) {
                        console.log('File converted. Output file location:', fileLocation);
                        alert('File conversion successful. Downloading the file now.');

                        // Now, trigger the download using the file location received
                        downloadConvertedFile(fileLocation);
                    } else {
                        alert('Error during conversion: No location returned.');
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('An error occurred while converting the file.');
                });
        } else {
            alert('Please select a "To" file type.');
        }
    });

    // Function to identify the file type based on its extension
    function getFileType(fileName) {
        const fileExtension = fileName.split('.').pop().toLowerCase();
        switch (fileExtension) {
            case 'pdf':
                return 'pdf';
            case 'ppt':
                return 'ppt';
            case 'docx':
                return 'docx';
            case 'txt':
                return 'text';
            default:
                return '';
        }
    }

    // Function to download the converted file
    function downloadConvertedFile(fileLocation) {
        const fileName = fileLocation.split('/').pop(); // Extract the file name from the file path

        // Make the GET request to download the file
        fetch(`http://localhost:8080/conv/download/${fileName}`, {
            method: 'GET',
        })
            .then((response) => response.blob()) // Expecting the file as a blob
            .then((blob) => {
                // Create a temporary link to trigger the file download
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = fileName; // The downloaded file will have the same name as the original
                document.body.appendChild(link);
                link.click(); // Trigger the download
                document.body.removeChild(link);
                URL.revokeObjectURL(url); // Clean up the object URL
            })
            .catch((error) => {
                console.error('Error downloading the file:', error);
                alert('An error occurred while downloading the file.');
            });
    }
});
