document.getElementById('filterForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const jobs = [
        {
            title: "Software Engineer Intern (Fall 24) at Dolby Laboratories",
            location: "Remote (United States)",
            type: "Internship (3 months)",
            pay: "$45/hour",
            skills: ["C++", "Python", "CMake", "Conan"]
        },
        {
            title: "Software Engineer (Backend) at Ambient.ai",
            location: "In-Office (Bengaluru, India)",
            type: "Full-time",
            experience: "5+ years",
            skills: ["Python", "C++", "GoLang", "REST APIs"]
        },
        {
            title: "Software Engineer - Ecosystem Integrations at Ambient.ai",
            location: "In-Office (Montreal, Canada)",
            type: "Full-time",
            experience: "3+ years",
            skills: ["Python", "C++", "HTTP Requests"]
        },
        {
            title: "Android Developer, Authentication Experience at 1Password",
            location: "Remote (United States +1)",
            type: "Full-time",
            salary: "$121k - $163k",
            experience: "4+ years",
            skills: ["Android", "Kotlin", "Jetpack Compose", "Swift"]
        }
    ];

    const jobListings = document.getElementById('jobListings');
    jobListings.innerHTML = '';

    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.classList.add('job-listing');

        const jobTitle = document.createElement('div');
        jobTitle.classList.add('job-title');
        jobTitle.textContent = job.title;

        const jobDetails = document.createElement('div');
        jobDetails.classList.add('job-details');
        jobDetails.textContent = `${job.location} • ${job.type} • ${job.experience || ''} • ${job.salary || job.pay} • Skills: ${job.skills.join(', ')}`;

        jobElement.appendChild(jobTitle);
        jobElement.appendChild(jobDetails);

        jobListings.appendChild(jobElement);
    });
});
