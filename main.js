const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const challengeGrid = document.getElementById('challenge-grid');
    const applyModal = document.getElementById('apply-modal');
    const closeModal = document.querySelector('.close-modal');
    const applyForm = document.getElementById('apply-form');
    const modalTitle = document.getElementById('modal-title');
    const challengeIdInput = document.getElementById('challenge-id');

    // Fetch and display challenges
    async function fetchChallenges() {
        try {
            const response = await fetch(`${API_URL}/challenges`);
            const challenges = await response.json();
            renderChallenges(challenges);
        } catch (error) {
            console.error('Error fetching challenges:', error);
            challengeGrid.innerHTML = '<div class="error">Failed to load challenges. Is the server running?</div>';
        }
    }

    function renderChallenges(challenges) {
        challengeGrid.innerHTML = '';
        challenges.forEach(challenge => {
            const card = document.createElement('div');
            card.className = 'challenge-card';
            card.innerHTML = `
                <div class="category">${challenge.category}</div>
                <h3>${challenge.title}</h3>
                <p>${challenge.description}</p>
                <div class="card-footer">
                    <div class="prize">${challenge.prize}</div>
                    <div class="difficulty">${challenge.difficulty}</div>
                </div>
                <button class="btn-small apply-btn" data-id="${challenge.id}" data-title="${challenge.title}" style="margin-top: 1.5rem">Grab Prize</button>
            `;
            challengeGrid.appendChild(card);
        });

        // Add event listeners to apply buttons
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const title = e.target.getAttribute('data-title');
                openModal(id, title);
            });
        });
    }

    // Modal logic
    function openModal(id, title) {
        modalTitle.textContent = `Apply for: ${title}`;
        challengeIdInput.value = id;
        applyModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    closeModal.addEventListener('click', () => {
        applyModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === applyModal) {
            applyModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // Form submission
    applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = applyForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending Vibe...';
        submitBtn.disabled = true;

        const formData = {
            challengeId: challengeIdInput.value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            github: document.getElementById('github').value,
            eligibility: document.getElementById('eligibility').value,
            message: document.getElementById('message').value,
        };

        try {
            const response = await fetch(`${API_URL}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Vibe Received! We will be in touch.');
                applyForm.reset();
                applyModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            } else {
                alert('Oops! Something went wrong. Try again.');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Could not reach the server. Please check your connection.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    fetchChallenges();
});
