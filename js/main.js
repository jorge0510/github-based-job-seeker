const getJobs = async languages => {
    const p = document.querySelector('p');
    const languageUl = document.querySelector('ul');
    languageUl.innerHTML = ``;
    p.innerText = `I see that you have worked with: ${languages.join(', ')}`;

    for (const language of languages) {
        const languageLi = document.createElement('li');
        const jobsUl = document.createElement('ul');

        const jobsRes = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=20&tag=${language.toLowerCase()}`);
        const jobsData = await jobsRes.json();

        if (Array.isArray(jobsData.jobs)) {
            const languageTitle = document.createElement('h2');
            languageTitle.setAttribute('class', 'languageTitle')
            languageTitle.innerText = language;
            languageLi.append(languageTitle);
            
            for (const job of jobsData.jobs) {
                const jobLi = document.createElement('li');
                jobLi.innerHTML = `
                    <a href="${job.url}" target="_blank">
                        <h3> ${job.jobTitle} | ${job.jobType && job.jobType.join(', ')} | Level: ${job.jobLevel} | Company: ${job.companyName} | Location: ${job.jobGeo} | (${job.annualSalaryMin && job.annualSalaryMin.toLocaleString('en-US', { style: 'currency', currency: job.salaryCurrency })} - ${job.annualSalaryMax && job.annualSalaryMax.toLocaleString('en-US', { style: 'currency', currency: job.salaryCurrency })})</h3>
                        <div class="jobDescription">${job.jobExcerpt}</div>
                    </a>
                `;
                jobsUl.append(jobLi);
            }
        } else {
            console.log(`no Jobs was found for ${language}`)
        }

        languageLi.append(jobsUl);
        languageUl.append(languageLi);
    }
};

async function getRoles() {
    const username = document.querySelector('input').value;
    try {
        const profileResponse = await fetch(`https://api.github.com/users/${username}`);
        const profileData = await profileResponse.json();

        document.querySelector('h2').innerText = `Hey ${profileData.name}!`;

        const repositoryResponse = await fetch(profileData.repos_url);
        const repositoryData = await repositoryResponse.json();

        let languages = {};

        await Promise.all(repositoryData.map(async repo => {
            const languagesResponse = await fetch(repo.languages_url);
            const languagesData = await languagesResponse.json();
            languages = { ...languages, ...languagesData };
        }));

        getJobs(Object.keys(languages));
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

document.querySelector('button').addEventListener('click', getRoles);
