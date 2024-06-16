import { run, parseTextContentAndTokenize } from "./module.mjs";
const fileInput = document.getElementById("resume");
const pdfPreviewModal = document.getElementById("pdfPreviewModal");
const pdfPreview = document.getElementById("pdfPreview");
const closePreview = document.getElementById("closePreview");
const previewButton = document.getElementById("previewButton");
const submitButton = document.getElementById("submitButton");
const extractButton = document.getElementById("extractButton");

// Add event listener to the Preview button
previewButton.addEventListener("click", function () {
    const file = fileInput.files[0];
    if (!file || !file.type.includes("application/pdf")) {
        alert("Please upload a PDF file.");
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        // Load the PDF document
        pdfjsLib
            .getDocument({ data: typedarray })
            .promise.then(function (pdf) {
                // Fetch the first page
                pdf.getPage(1).then(function (page) {
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");
                    const viewport = page.getViewport({ scale: 1.5 });

                    // Set canvas dimensions
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into canvas context
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    page.render(renderContext).promise.then(function () {
                        // Set iframe src to data URL of rendered PDF
                        pdfPreview.src = canvas.toDataURL();
                        // Show the PDF preview modal
                        pdfPreviewModal.style.display = "block";
                    });
                });
            })
            .catch(function (err) {
                console.error("Error loading PDF:", err);
                alert("Error loading PDF. Please try again.");
            });
    };

    // Read the uploaded file as array buffer
    fileReader.readAsArrayBuffer(file);
});

// Close PDF preview modal when close button is clicked
closePreview.addEventListener("click", function () {
    pdfPreviewModal.style.display = "none";
});

// Close PDF preview modal when clicking outside of the modal content
window.addEventListener("click", function (event) {
    if (event.target === pdfPreviewModal) {
        pdfPreviewModal.style.display = "none";
    }
});

submitButton.addEventListener("click", function () {});

extractButton.addEventListener("click", function () {
    const file = fileInput.files[0];
    if (!file || !file.type.includes("application/pdf")) {
        alert("Please upload a PDF file.");
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            let textContent = "";
            const numPages = pdf.numPages;
            const promises = [];
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                promises.push(
                    pdf.getPage(pageNum).then(function (page) {
                        return page.getTextContent().then(function (text) {
                            text.items.forEach(function (item) {
                                textContent += item.str + " ";
                            });
                        });
                    })
                );
            }
            Promise.all(promises).then(function () {
                console.log(textContent);
                const form = document.getElementById("filterForm");

                // Access form elements and retrieve their values
                const selectedRole = form.elements["roles"].value;
                // const jobType = form.elements["jobType"].value;
                // const skills = form.elements["skills"].value;
                // const experienceMin = form.elements["experienceMin"].value;
                // const experienceMax = form.elements["experienceMax"].value;
                // const country = form.elements["country"].value;
                // const city = form.elements["city"].value;
                // const resumeFile = form.elements["resume"].files[0];
                console.log(selectedRole);
                parseTextContentAndTokenize(selectedRole, textContent);
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
});
