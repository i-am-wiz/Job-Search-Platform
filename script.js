import { run, parseTextContentAndTokenize } from "./module.mjs";
const fileInput = document.getElementById("resume");
const pdfPreviewModal = document.getElementById("pdfPreviewModal");
const pdfPreview = document.getElementById("pdfPreview");
const closePreview = document.getElementById("closePreview");
const previewButton = document.getElementById("previewButton");
const submitButton = document.getElementById("submitButton");
const extractButton = document.getElementById("extractButton");
const resumeInput = document.getElementById("resume");
const rolesInput = document.getElementById("roles");

let pdfTextContent, geminiResponseForPdfParseInput;
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

resumeInput.addEventListener("change", parsePdf);

rolesInput.addEventListener("change", parsePdf);

function parsePdf() {
    console.log("ParsePDF triggered");
    const file = fileInput.files[0];
    if (!file || !file.type.includes("application/pdf")) {
        //alert("Please upload a PDF file.");
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
            Promise.all(promises).then(async function () {
                console.log(textContent);
                pdfTextContent = textContent;
                //window.pdfTextContent = pdfTextContent;
                console.log("Find jobs triggered");
                const form = document.getElementById("filterForm");

                // Access form elements and retrieve their values
                const selectedRole = form.elements["roles"].value;
                // const jobType = form.elements["jobType"].value;
                const skills = form.elements["skills"].value;
                const experience = form.elements["years"].value;
                // const experienceMax = form.elements["experienceMax"].value;
                const location = form.elements["location"].value;
                // const city = form.elements["city"].value;
                // const resumeFile = form.elements["resume"].files[0];
                console.log(skills);
                console.log(experience);
                console.log(selectedRole);
                console.log(location);
                console.log(pdfTextContent);
                if (!selectedRole || !pdfTextContent) {
                    console.log("Inside if nahi jaana chahiye tha");
                    return;
                }
                geminiResponseForPdfParseInput =
                    await parseTextContentAndTokenize(
                        selectedRole,
                        pdfTextContent
                    );
                window.geminiResponseForPdfParseInput =
                    geminiResponseForPdfParseInput;
                console.log(geminiResponseForPdfParseInput);
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
}

extractButton.addEventListener("click", findJobs);

async function findJobs() {
    const file = fileInput.files[0];
    if (!file || !file.type.includes("application/pdf")) {
        alert("Please upload a PDF file.");
        return;
    }

    let responseFromAnuj = {
        jobs: [
            { jobTitle: "Backend", links: [], description: "" },
            { jobTitle: "Frontend", links: [], description: "" },
        ],
    };

    let jobOpportunities = responseFromAnuj.jobs;

    jobOpportunities = jobOpportunities.map((jobOpportunity, index) => {
        jobOpportunity.jobId = index;
        return jobOpportunity;
    });

    console.log(jobOpportunities);

    let prompt = `You are given a candidate's profile and an array of job opportunities. Based on the candidate's profile, you have to shortlist a maximum of 10 jobs among the available. Select only the jobs that are highly aligned with the candidate's profile. If there are 34 jobs provided in the input and there are only 5 strongly matching jobs, then provide only 5. You don't have to necessarily list 10 jobs. 10 is just the maximum limit which indicates that the number of matching jobs in your response should never exceed 10. If there are 15 matching jobs, then narrow down the resulting set and list the best 10 jobs instead of 15. 
    
    Here are some preferences based on which you can decide whether the candidate's profile is best matching or not and if best matching, by what degree it is best matching.
    1. Top priority is job title. 
    Backend developer should not be matched with frontend, but can be matched with fullstack but with a low score

    2. You can check the description field of a given job from the input job opportunities array and compare it against the candidate's profile.


    Candidate's profile: ${geminiResponseForPdfParseInput}
    Job Opportunities: ${jobOpportunities}

    Response format:
    Each job has a jobId. You have to return an array of jobIds which correspond to the matching jobs shortlisted by you. Return only the array, no english words, no formatting characters, nothing except from an array. Ids should be in ascending sorted order.

    Sample response:
    [0, 2, 6]

    Explanation: Here, jobs with jobId 0, 2, 6 were shortlisted by you as best matching for the candidate

    `;

    //const response = await
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const matchingJobs = response.text();
    console.log(matchingJobs);

    let resultingJobs = [];
    let id = 0,
        ind = 0;
    for (
        let i = 0;
        i < jobOpportunities.length && ind < matchingJobs.length;
        ++i
    ) {
        jobOpportunity = jobOpportunities[i];
        if (jobOpportunity.jobId == matchingJobs[ind]) {
            resultingJobs.push(jobOpportunity);
            ++ind;
        }
    }

    const jobListings = document.getElementById("jobListings");
    jobListings.innerHTML = "";

    resultingJobs.forEach((job) => {
        const jobElement = document.createElement("div");
        jobElement.classList.add("job-listing");

        const jobTitle = document.createElement("div");
        jobTitle.classList.add("job-title");
        jobTitle.textContent = job.title;

        const jobDetails = document.createElement("div");
        jobDetails.classList.add("job-details");
        jobDetails.textContent = `${job.location} • ${job.type} • ${
            job.experience || ""
        } • ${job.salary || job.pay} • Skills: ${job.skills.join(", ")}`;

        jobElement.appendChild(jobTitle);
        jobElement.appendChild(jobDetails);

        jobListings.appendChild(jobElement);
    });

    // anuj logic
}
