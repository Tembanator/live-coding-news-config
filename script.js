// const savedCategories = ['business', 'general', 'health', 'science', 'sports', 'technology'];
// localStorage.setItem('savedCategories', JSON.stringify(savedCategories));
// console.log(savedCategories)
const categoriesCheckboxes = document.querySelectorAll('input[type="checkbox"]');
const preferencesForm = document.getElementById('preferences-form');
const savePreferencesBtn = document.getElementById('save-preferences-btn');
const saveStatus = document.getElementById('save-status');
const loadFeedBtn = document.getElementById('load-feed-btn');
const initialMessage = document.getElementById('initial-message');
const articleCardGrid = document.querySelector('.article-card-grid');
const loaderOverlay = document.getElementById('loader-overlay');

function updateSaveButtonState(action) {
    if (action === 'enable') {
        savePreferencesBtn.disabled = true;
        savePreferencesBtn.style.opacity = 0.8;
        savePreferencesBtn.style.cursor = 'not-allowed';
        savePreferencesBtn.textContent = 'Saving Preferences';
    } else if (action === 'disable') {
        savePreferencesBtn.disabled = false;
        savePreferencesBtn.style.opacity = 1;
        savePreferencesBtn.style.cursor = 'pointer';
        savePreferencesBtn.innerHTML = '<span class="material-symbols-outlined"> save </span> Save Preferences';
    }
}
function showSaveStatus(message, isError = false) {
    saveStatus.classList.remove('hidden');
    saveStatus.classList.add(isError ? 'error-status' : 'success-status');
    saveStatus.textContent = message;
    setTimeout(() => {
        saveStatus.classList.add('hidden');
        saveStatus.textContent = '';
        saveStatus.classList.remove(isError ? 'error-status' : 'success-status');
    }, 3000);
    
}

preferencesForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    updateSaveButtonState('enable');
    const selectedCategories = [];
    categoriesCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedCategories.push(checkbox.value);
        }
    });

    if (selectedCategories.length === 0) {
        updateSaveButtonState('disable');
        showSaveStatus('Please select at least one category.', true);
        return;
    }

    localStorage.setItem('savedCategories', JSON.stringify(selectedCategories));
    updateSaveButtonState('disable');
    showSaveStatus('Preferences saved successfully!');
    loadFeed();
    
})
// Example: Check the first checkbox by default
// console.log(savedCategories)
const savedCategories = JSON.parse(localStorage.getItem('savedCategories')) || [];

if (savedCategories.length > 0) {
    categoriesCheckboxes.forEach(checkbox => {
        if (savedCategories.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
    window.onload = function() {
        loadFeed();
    };
} else {
    initialMessage.classList.remove('hidden');
}

function formatDateToMonthDayYear(isoString) {
    // 1. Create a Date object from the ISO string.
    // The 'Z' indicates UTC, and the Date object handles the time zone conversion.
    const date = new Date(isoString);

    // 2. Define the desired formatting options.
    const options = {
        year: 'numeric',
        month: 'long', // Full month name (e.g., 'October')
        day: 'numeric'  // Day of the month (e.g., '4')
    };

    // 3. Use toLocaleDateString() to format the date.
    // 'en-US' locale is used for the typical American date format.
    return date.toLocaleDateString('en-US', options);
}

function createArticleCardHtml(article) {
    const { image, source, title, description, publishedAt, content } = article;

    return `
        <div class="article-card">
            <div class="thumbnail" style="background-image: url('${image}');">
                
            </div>
            <div class="article-content">
                <p class="category">${source.name}</p>
                <h3 class="article-title">${title}</h3>
                <p class="article-description">${description}</p>
                <p class="article-date">
                    <span class="material-symbols-outlined">
                        schedule
                    </span>
                    ${formatDateToMonthDayYear(publishedAt)}
                </p>
            </div>
        </div>
    `;
}

// --- Example Usage ---
// const articleData = { ... }; // Use the same data object
// const cardHtml = createArticleCardHtml(articleData);
// document.getElementById('articles-container').insertAdjacentHTML('beforeend', cardHtml);
async function loadFeed() {
    articleCardGrid.innerHTML = '';
    loaderOverlay.style.display = 'flex';
    // localStorage.clear()
    const savedCategories = JSON.parse(localStorage.getItem('savedCategories')) || [];

    if (savedCategories.length === 0) {
        initialMessage.classList.remove('hidden');
        return;
    }
    initialMessage.classList.add('hidden');
    console.log(savedCategories)
    const API_KEY = 'a712c92853669d1a67090a8decfbc992';

    const url = `https://gnews.io/api/v4/search?q=finance&lang=en&max=5&country=us&apikey=${API_KEY}`;

    async function fetchParallelData(savedCategories) {
        const requests = savedCategories.map(category => {
            const url = `https://gnews.io/api/v4/search?q=${category}&lang=en&max=5&country=us&apikey=${API_KEY}`;
            return fetch(url);
        });

        try {
            const responses = await Promise.all(requests);
            const news = await Promise.all(responses.map(res => res.json()));
            return news;
        } catch (error) {
            console.error('Error fetching parallel data:', error);
        }
    }


    const fetchedNews = await fetchParallelData(savedCategories);
    // console.log(fetchedNews)
    const newsArray = fetchedNews.flatMap(news => news.articles);
    console.log(newsArray)
    newsArray.forEach(article => {
        const cardHtml = createArticleCardHtml(article);
        articleCardGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
    loaderOverlay.style.display = 'none';
}
loadFeedBtn.addEventListener('click', loadFeed);