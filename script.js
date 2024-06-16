const fileInput = document.getElementById('resume');
const previewButton = document.getElementById('previewButton');
const extractButton = document.getElementById('extractButton');
const pdfPreviewModal = document.getElementById('pdfPreviewModal');
const pdfPreviewContainer = document.getElementById('pdfPreviewContainer');
const closePreview = document.getElementById('closePreview');

previewButton.addEventListener('click', function () {
    const file = fileInput.files[0];
    if (!file || !file.type.includes('application/pdf')) {
        alert('Please upload a PDF file.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            pdfPreviewContainer.innerHTML = ''; // Clear previous content
            const numPages = pdf.numPages;
            const promises = [];
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                promises.push(pdf.getPage(pageNum).then(function (page) {
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    return page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
                        const div = document.createElement('div');
                        div.className = 'pdf-page';
                        div.appendChild(canvas);
                        pdfPreviewContainer.appendChild(div);
                    });
                }));
            }
            Promise.all(promises).then(function () {
                pdfPreviewModal.style.display = 'flex';
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
});

closePreview.addEventListener('click', function () {
    pdfPreviewModal.style.display = 'none';
    pdfPreviewContainer.innerHTML = ''; // Clear the content
});

extractButton.addEventListener('click', function () {
    const file = fileInput.files[0];
    if (!file || !file.type.includes('application/pdf')) {
        alert('Please upload a PDF file.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            let textContent = '';
            const numPages = pdf.numPages;
            const promises = [];
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                promises.push(pdf.getPage(pageNum).then(function (page) {
                    return page.getTextContent().then(function (text) {
                        text.items.forEach(function (item) {
                            textContent += item.str + ' ';
                        });
                    });
                }));
            }
            Promise.all(promises).then(function () {
                console.log(textContent);
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
});
