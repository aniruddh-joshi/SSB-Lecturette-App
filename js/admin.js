// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Security check
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }

    const API_URL = 'http://localhost:3000/api/lecturettes';

    // --- DOM Elements ---
    const logoutBtn = document.getElementById('logout-btn');
    const lecturetteListView = document.getElementById('lecturette-list-view');
    const lecturetteFormView = document.getElementById('lecturette-form-view');
    const showAddFormBtn = document.getElementById('show-add-form-btn');
    const lecturetteListAdmin = document.getElementById('lecturette-list-admin');
    const addLecturetteForm = document.getElementById('add-lecturette-form');
    const formTitle = document.getElementById('form-title');
    const cancelBtn = document.getElementById('cancel-btn');
    const successMessage = document.getElementById('success-message');
    
    const topicNameInput = document.getElementById('topicName');
    const topicContentInput = document.getElementById('topicContent');
    const editLecturetteId = document.getElementById('edit-lecturette-id');

    // --- State Management ---
    const showListView = () => {
        lecturetteListView.style.display = 'block';
        lecturetteFormView.style.display = 'none';
        renderLecturettes();
    };

    const showFormView = async (mode = 'add', lecturetteId = null) => {
        lecturetteListView.style.display = 'none';
        lecturetteFormView.style.display = 'block';
        addLecturetteForm.reset();
        successMessage.textContent = '';
        
        if (mode === 'edit') {
            // Fetch the specific lecturette data from the API
            const res = await fetch(`${API_URL}`);
            const lecturettes = await res.json();
            const lecturette = lecturettes.find(l => l._id === lecturetteId);

            if(lecturette) {
                formTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Lecturette';
                topicNameInput.value = lecturette.topic;
                topicContentInput.value = lecturette.content;
                editLecturetteId.value = lecturette._id; // Use the MongoDB _id
                addLecturetteForm.querySelector('button[type="submit"]').textContent = 'Update Lecturette';
            }
        } else {
            formTitle.innerHTML = '<i class="fa-solid fa-plus-circle"></i> Add a New Lecturette';
            editLecturetteId.value = '';
            addLecturetteForm.querySelector('button[type="submit"]').textContent = 'Save Lecturette';
        }
    };

    // --- Data Functions using API ---
    const renderLecturettes = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch lecturettes');
            const lecturettes = await response.json();
            
            lecturetteListAdmin.innerHTML = '';
            if (lecturettes.length === 0) {
                lecturetteListAdmin.innerHTML = '<p class="empty-list-msg">No lecturettes found. Add one to get started!</p>';
                return;
            }

            lecturettes.forEach((lecturette) => {
                const item = document.createElement('div');
                item.className = 'lecturette-admin-item';
                item.innerHTML = `
                    <span class="topic-title">${lecturette.topic}</span>
                    <div class="item-actions">
                        <button class="edit-btn" data-id="${lecturette._id}"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="delete-btn" data-id="${lecturette._id}"><i class="fa-solid fa-trash"></i> Delete</button>
                    </div>
                `;
                lecturetteListAdmin.appendChild(item);
            });
        } catch (error) {
            lecturetteListAdmin.innerHTML = `<p class="empty-list-msg" style="color: red;">Error: ${error.message}</p>`;
        }
    };
    
    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'index.html';
    });

    showAddFormBtn.addEventListener('click', () => showFormView('add'));
    cancelBtn.addEventListener('click', showListView);

    lecturetteListAdmin.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');
        if (!targetButton) return;
        const lecturetteId = targetButton.dataset.id;

        if (targetButton.classList.contains('edit-btn')) {
            showFormView('edit', lecturetteId);
        } else if (targetButton.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this lecturette?')) {
                fetch(`${API_URL}/${lecturetteId}`, { method: 'DELETE' })
                    .then(res => {
                        if(!res.ok) throw new Error('Failed to delete');
                        renderLecturettes();
                    })
                    .catch(err => console.error(err));
            }
        }
    });

    addLecturetteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const lecturetteData = {
            topic: topicNameInput.value,
            content: topicContentInput.value
        };
        const id = editLecturetteId.value;
        const isEditing = id !== '';
        
        const url = isEditing ? `${API_URL}/${id}` : API_URL;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lecturetteData)
            });

            if (!response.ok) throw new Error('Failed to save lecturette');

            successMessage.textContent = 'Lecturette saved successfully!';
            setTimeout(showListView, 1500);
        } catch (error) {
            successMessage.textContent = `Error: ${error.message}`;
            successMessage.style.color = 'red';
        }
    });

    showListView();
});