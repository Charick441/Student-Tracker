// --- Auth & Navigation Logic ---
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function setCurrentUser(username) {
  localStorage.setItem('currentUser', username);
}
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

// --- Section Management Logic ---
function getSections(username) {
  return JSON.parse(localStorage.getItem('sections_' + username) || '[]');
}
function setSections(username, sections) {
  localStorage.setItem('sections_' + username, JSON.stringify(sections));
}
function renderSectionList() {
  const username = getCurrentUser();
  if (!username) return;
  const sectionList = document.getElementById('sectionList');
  if (!sectionList) return;
  let sections = getSections(username);
  sections.sort((a, b) => a.localeCompare(b));
  sectionList.innerHTML = `
    <label for="sectionDropdown" style="font-weight:bold;color:#2d6a4f;display:block;margin-bottom:8px;">Select Section</label>
    <select id="sectionDropdown" class="input" style="width:100%;margin-bottom:12px;">
      ${sections.length === 0
        ? '<option disabled selected>No sections yet</option>'
        : sections.map(section => `<option value="${section}">${section}</option>`).join('')}
    </select>
    <div style="display:flex;gap:8px;justify-content:center;">
      <button id="goSectionBtn" class="btn" style="padding:4px 12px;font-size:0.95em;">Go</button>
      <button id="editSectionBtn" class="btn" style="background:#1b6ca8;padding:4px 12px;font-size:0.95em;">Edit</button>
      <button id="removeSectionBtn" class="btn" style="background:#d90429;padding:4px 12px;font-size:0.95em;">Remove</button>
    </div>
  `;
window.editSection = function(section) {
  const input = document.getElementById('sectionInput');
  input.value = section;
  const username = getCurrentUser();
  let sections = getSections(username);
  sections = sections.filter(s => s !== section);
  setSections(username, sections);
  renderSectionList();
};
window.removeSection = function(section) {
  const username = getCurrentUser();
  let sections = getSections(username);
  sections = sections.filter(s => s !== section);
  setSections(username, sections);
  renderSectionList();
};
}
window.goToSection = function(section) {
  localStorage.setItem('currentSection', section);
  window.location.href = 'section_identification.html';
};



// Section page logic and settings menu remain unchanged for sections.html only
document.addEventListener('DOMContentLoaded', function() {
  // --- Notification Bell Logic ---
  // Remove notificationBell and duplicate declarations
  // Use only one set of notificationOverlay, notificationBox, notifList, closeNotifBtn
  // Notification logic for settings menu
  const notificationOverlay = document.getElementById('notificationOverlay');
  const notificationBox = document.getElementById('notificationBox');
  const closeNotifBtn = document.getElementById('closeNotifBtn');
  const notifList = document.getElementById('notifList');
  const notifDot = document.getElementById('notifDot');
  const notifMenuBtn = document.getElementById('notifMenuBtn');
  const username = localStorage.getItem('currentUser');
  let notifications = JSON.parse(localStorage.getItem('notifications_' + username) || '[]');
  let notifRead = JSON.parse(localStorage.getItem('notifRead_' + username) || 'false');

  function renderNotifications() {
    notifList.innerHTML = '';
    if (notifications.length === 0) {
      notifList.innerHTML = '<div style="color:#888;text-align:center;">No notifications.</div>';
    } else {
      notifications.slice().reverse().forEach(function(msg) {
        const item = document.createElement('div');
        item.className = 'notif-item';
        item.innerHTML = '<span class="notif-icon">&#9888;</span>' + msg;
        notifList.appendChild(item);
      });
    }
  }

  function showNotifications() {
    renderNotifications();
    notificationOverlay.style.display = 'block';
    notificationBox.style.display = 'block';
    localStorage.setItem('notifRead_' + username, 'true');
    notifDot.style.display = 'none';
  }

  function hideNotifications() {
    notificationOverlay.style.display = 'none';
    notificationBox.style.display = 'none';
  }

  notifMenuBtn.onclick = function(e) {
    e.stopPropagation();
    showNotifications();
    // Hide settings menu after click
    document.getElementById('settingsMenu').style.display = 'none';
  };
  closeNotifBtn.onclick = hideNotifications;
  notificationOverlay.onclick = hideNotifications;

  // Show red dot if unread
  function updateNotifDot() {
    if (!notifRead && notifications.length > 0) {
      notifDot.style.display = 'inline-block';
    } else {
      notifDot.style.display = 'none';
    }
  }
  updateNotifDot();

  // If notifications updated elsewhere, update dot
  window.addEventListener('storage', function(e) {
    if (e.key === 'notifications_' + username) {
      notifications = JSON.parse(localStorage.getItem('notifications_' + username) || '[]');
      notifRead = false;
      updateNotifDot();
    }
  });
  // Go, Edit, Remove section logic for dropdown
  function attachDropdownActions() {
    const goSectionBtn = document.getElementById('goSectionBtn');
    const editSectionBtn = document.getElementById('editSectionBtn');
    const removeSectionBtn = document.getElementById('removeSectionBtn');
    const sectionDropdown = document.getElementById('sectionDropdown');
    if (goSectionBtn && sectionDropdown) {
      goSectionBtn.onclick = function() {
        const selected = sectionDropdown.value;
        if (selected && selected !== 'No sections yet') {
          window.goToSection(selected);
        }
      };
    }
    if (editSectionBtn && sectionDropdown) {
      editSectionBtn.onclick = function() {
        const selected = sectionDropdown.value;
        if (!selected || selected === 'No sections yet') return;
        const input = document.getElementById('sectionInput');
        input.value = selected;
        const username = getCurrentUser();
        let sections = getSections(username);
        sections = sections.filter(s => s !== selected);
        setSections(username, sections);
        renderSectionList();
        attachDropdownActions();
      };
    }
    if (removeSectionBtn && sectionDropdown) {
      removeSectionBtn.onclick = function() {
        const selected = sectionDropdown.value;
        if (!selected || selected === 'No sections yet') return;
        const username = getCurrentUser();
        let sections = getSections(username);
        sections = sections.filter(s => s !== selected);
        setSections(username, sections);
        renderSectionList();
        attachDropdownActions();
      };
    }
  }
  // Section add logic
  const sectionForm = document.getElementById('sectionForm');
  if (sectionForm) {
    sectionForm.onsubmit = function(e) {
      e.preventDefault();
      const username = getCurrentUser();
      if (!username) return;
      const input = document.getElementById('sectionInput');
      let section = input.value.trim();
      if (!section) return;
      let sections = getSections(username);
      if (!sections.includes(section)) {
        sections.push(section);
        setSections(username, sections);
        input.value = '';
        renderSectionList();
        attachDropdownActions();
      }
    };
    renderSectionList();
    attachDropdownActions();
  }

  // Settings menu logic
  var settingsBtn = document.getElementById('settingsBtn');
  var settingsMenu = document.getElementById('settingsMenu');
  var logoutBtn = document.getElementById('logoutBtn');
  if (settingsBtn && settingsMenu) {
    settingsBtn.onclick = function(e) {
      e.stopPropagation();
      settingsMenu.style.display = settingsMenu.style.display === 'none' || settingsMenu.style.display === '' ? 'block' : 'none';
    };
    document.body.onclick = function() {
      settingsMenu.style.display = 'none';
    };
    settingsMenu.onclick = function(e) {
      e.stopPropagation();
    };
  }
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    };
  }
});
