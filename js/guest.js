// js/guest.js

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api/lecturettes';

    if (document.getElementById('topic-list')) {
        initGuestIndex();
    } else if (document.getElementById('lecturette-title')) {
        initLecturetteView();
    }

    async function fetchAllLecturettes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch lecturettes:', error);
            return []; // Return empty array on error
        }
    }

    async function initGuestIndex() {
        const topicList = document.getElementById('topic-list');
        const searchBar = document.getElementById('search-bar');
        const allLecturettes = await fetchAllLecturettes();

        function displayTopics(topics) {
            topicList.innerHTML = '';
            if (topics.length === 0) {
                topicList.innerHTML = '<p>No lecturette topics available yet.</p>';
                return;
            }
            topics.forEach((lecturette) => {
                // We will pass the whole object via localStorage for the next page to use
                // This avoids making a second API call for a single item
                const topicLink = document.createElement('a');
                topicLink.href = `lecturette-view.html?id=${lecturette._id}`;
                topicLink.className = 'topic-item';
                topicLink.textContent = lecturette.topic;
                topicLink.addEventListener('click', () => {
                    // Temporarily store the clicked item's data for the view page
                    sessionStorage.setItem('selectedLecturette', JSON.stringify(lecturette));
                });
                topicList.appendChild(topicLink);
            });
        }

        displayTopics(allLecturettes);

        searchBar.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredTopics = allLecturettes.filter(l => l.topic.toLowerCase().includes(searchTerm));
            displayTopics(filteredTopics);
        });
    }

    function initLecturetteView() {
        const titleEl = document.getElementById('lecturette-title');
        const textEl = document.getElementById('lecturette-text');
        const ttsButton = document.getElementById('tts-button');

        // Get lecturette data from sessionStorage (set in initGuestIndex)
        const lecturette = JSON.parse(sessionStorage.getItem('selectedLecturette'));

        if (lecturette) {
            titleEl.textContent = lecturette.topic;
            textEl.textContent = lecturette.content;
            sessionStorage.removeItem('selectedLecturette'); // Clean up
        } else {
            titleEl.textContent = 'Topic Not Found';
            textEl.textContent = 'The requested lecturette could not be found. Please go back to the topic list.';
        }

        ttsButton.addEventListener('click', () => {
            const synth = window.speechSynthesis;
            const textToSpeak = `${lecturette.topic}. ${lecturette.content}`;
            if (synth.speaking) {
                synth.cancel();
                ttsButton.classList.remove('speaking');
                return;
            }
            if (textToSpeak.trim() !== '') {
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.onstart = () => ttsButton.classList.add('speaking');
                utterance.onend = () => ttsButton.classList.remove('speaking');
                utterance.onerror = () => ttsButton.classList.remove('speaking');
                synth.speak(utterance);
            }
        });

        window.addEventListener('beforeunload', () => window.speechSynthesis.cancel());
    }
});