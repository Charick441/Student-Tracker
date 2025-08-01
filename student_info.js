// --- Notification Popup Helper ---
function showAestheticAlert(message) {
  // Remove existing popup if any
  let old = document.getElementById('aestheticAlertOverlay');
  if (old) old.remove();
  let overlay = document.createElement('div');
  overlay.id = 'aestheticAlertOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.18)';
  overlay.style.backdropFilter = 'blur(2.5px)';
  overlay.style.zIndex = '10000';
  overlay.onclick = function(e) {
    if (e.target === overlay) overlay.remove();
  };
  let box = document.createElement('div');
  box.style.position = 'fixed';
  box.style.top = '50%';
  box.style.left = '50%';
  box.style.transform = 'translate(-50%,-50%)';
  box.style.background = 'rgba(217,4,41,0.92)';
  box.style.color = '#fff';
  box.style.minWidth = '320px';
  box.style.maxWidth = '90vw';
  box.style.boxShadow = '0 8px 32px #d9042940';
  box.style.borderRadius = '16px';
  box.style.padding = '32px 28px 24px 28px';
  box.style.textAlign = 'center';
  box.style.fontSize = '1.15em';
  box.style.fontWeight = '500';
  box.style.animation = 'fadeIn 0.3s, popUp 0.4s';
  box.style.display = 'flex';
  box.style.flexDirection = 'column';
  box.style.alignItems = 'center';
  let closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '12px';
  closeBtn.style.right = '18px';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '1.5em';
  closeBtn.style.color = '#fff';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.transition = 'color 0.2s';
  closeBtn.onmouseover = function(){ closeBtn.style.color = '#ffd6d6'; };
  closeBtn.onmouseout = function(){ closeBtn.style.color = '#fff'; };
  closeBtn.onclick = function(){ overlay.remove(); };
  box.appendChild(closeBtn);
  let icon = document.createElement('div');
  icon.innerHTML = '&#9888;';
  icon.style.fontSize = '2.2em';
  icon.style.marginBottom = '12px';
  icon.style.color = '#fff';
  box.appendChild(icon);
  let msg = document.createElement('div');
  msg.textContent = message;
  msg.style.margin = '0 0 8px 0';
  box.appendChild(msg);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}
// --- Student Info Page Logic ---
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}
function getCurrentSection() {
  return localStorage.getItem('currentSection');
}
function getCurrentStudentId() {
  return localStorage.getItem('currentStudentId');
}
function getStudents(username, section) {
  return JSON.parse(localStorage.getItem('students_' + username + '_' + section) || '[]');
}
function getStudent(username, section, studentId) {
  let students = getStudents(username, section);
  return students.find(s => s.id === studentId);
}
function getAttendance(username, section, studentId) {
  return JSON.parse(localStorage.getItem('attendance_' + username + '_' + section + '_' + studentId) || '{}');
}
function setAttendance(username, section, studentId, attendance) {
  localStorage.setItem('attendance_' + username + '_' + section + '_' + studentId, JSON.stringify(attendance));
}
function getPerformance(username, section, studentId) {
  return JSON.parse(localStorage.getItem('performance_' + username + '_' + section + '_' + studentId) || '[]');
}
function setPerformance(username, section, studentId, performance) {
  localStorage.setItem('performance_' + username + '_' + section + '_' + studentId, JSON.stringify(performance));
}
function renderStudentInfo() {
  const username = getCurrentUser();
  const section = getCurrentSection();
  const studentId = getCurrentStudentId();
  const titleDiv = document.getElementById('studentInfoTitle');
  if (!username || !section || !studentId || !titleDiv) {
    if (titleDiv) titleDiv.textContent = '';
    return;
  }
  const student = getStudent(username, section, studentId);
  if (!student) {
    titleDiv.textContent = '';
    return;
  }
  titleDiv.textContent = `${student.name} (${student.id})`;
}
function renderAttendanceCalendar() {
  const username = getCurrentUser();
  const section = getCurrentSection();
  const studentId = getCurrentStudentId();
  if (!username || !section || !studentId) return;
  const container = document.getElementById('calendarContainer');
  if (!container) return;
  let today = new Date();
  let month = typeof window.attendanceMonth === 'number' ? window.attendanceMonth : today.getMonth();
  let year = typeof window.attendanceYear === 'number' ? window.attendanceYear : today.getFullYear();
  window.attendanceMonth = month;
  window.attendanceYear = year;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
    <button id="prevMonthBtn">&#8592; Prev</button>
    <span>${monthNames[month]} <input type='number' id='yearInput' value='${year}' min='2000' max='2100' style='width:70px;padding:2px 6px;border-radius:4px;border:1px solid #b7e4c7;font-size:1em;margin-left:6px;'> </span>
    <button id="nextMonthBtn">Next &#8594;</button>
  </div>`;
  html += `<table style="width:100%;border-collapse:collapse;text-align:center;box-shadow:0 2px 8px #0001;">
    <thead><tr style="background:#e9c46a;color:#222;">
      <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
    </tr></thead><tbody>`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  let attendance = getAttendance(username, section, studentId);
  let day = 1;
  for (let r=0; r<6; r++) {
    html += '<tr>';
    for (let c=0; c<7; c++) {
      if (r===0 && c<firstDay) {
        html += '<td></td>';
      } else if (day > daysInMonth) {
        html += '<td></td>';
      } else {
        let mark = attendance[year]?.[month]?.[day] || '';
        let color = mark==='A' ? '#d90429' : mark==='P' ? '#40916c' : mark==='L' ? '#4361ee' : '#ccc';
        html += `<td style="padding:10px;cursor:pointer;background:${mark ? color+'22' : '#fff'};" data-day="${day}"><span style="font-weight:bold;color:${color};">${day}${mark ? ' - '+mark : ''}</span></td>`;
        day++;
      }
    }
    html += '</tr>';
    if (day > daysInMonth) break;
  }
  html += '</tbody></table>';
  html += `<div style="margin-top:12px;color:#888;font-size:0.95em;">Click a day to mark: <span style="color:#d90429;font-weight:bold;">A</span> (Absent), <span style="color:#40916c;font-weight:bold;">P</span> (Present), <span style="color:#4361ee;font-weight:bold;">L</span> (Late)</div>`;
  container.innerHTML = html;
  document.getElementById('prevMonthBtn').onclick = function() {
    window.attendanceMonth--;
    if (window.attendanceMonth < 0) {
      window.attendanceMonth = 11;
      window.attendanceYear--;
    }
    renderAttendanceCalendar();
  };
  document.getElementById('nextMonthBtn').onclick = function() {
    window.attendanceMonth++;
    if (window.attendanceMonth > 11) {
      window.attendanceMonth = 0;
      window.attendanceYear++;
    }
    renderAttendanceCalendar();
  };
  document.getElementById('yearInput').onchange = function() {
    let val = parseInt(this.value);
    if (!isNaN(val) && val >= 2000 && val <= 2100) {
      window.attendanceYear = val;
      renderAttendanceCalendar();
    }
  };
  Array.from(container.querySelectorAll('td[data-day]')).forEach(td => {
    td.onclick = function() {
      let day = parseInt(td.getAttribute('data-day'));
      let att = getAttendance(username, section, studentId);
      if (!att[window.attendanceYear]) att[window.attendanceYear] = {};
      if (!att[window.attendanceYear][window.attendanceMonth]) att[window.attendanceYear][window.attendanceMonth] = {};
      let current = att[window.attendanceYear][window.attendanceMonth][day] || '';
      let next = current === '' ? 'A' : current === 'A' ? 'P' : current === 'P' ? 'L' : '';
      att[window.attendanceYear][window.attendanceMonth][day] = next;
      setAttendance(username, section, studentId, att);

      // --- Notification logic for 3 absences/lates ---
      let monthAtt = att[window.attendanceYear][window.attendanceMonth];
      let absentCount = Object.values(monthAtt).filter(v => v === 'A').length;
      let lateCount = Object.values(monthAtt).filter(v => v === 'L').length;
      let notifKey = 'notif_' + studentId + '_' + window.attendanceYear + '_' + window.attendanceMonth;
      let notifState = JSON.parse(localStorage.getItem(notifKey) || '{}');
      let student = getStudent(username, section, studentId);
      let studentName = student ? student.name : studentId;
      let notifications = JSON.parse(localStorage.getItem('notifications_' + username) || '[]');
      // Absent notification
      if (absentCount === 3 && !notifState.absent) {
        let msg = `Alert: Student ${studentName} (${studentId}) has been marked absent 3 times this month.`;
        notifications.push(msg);
        localStorage.setItem('notifications_' + username, JSON.stringify(notifications));
        notifState.absent = true;
        localStorage.setItem(notifKey, JSON.stringify(notifState));
        setTimeout(function(){
          showAestheticAlert(msg);
        }, 100);
      }
      // Late notification
      if (lateCount === 3 && !notifState.late) {
        let msg = `Alert: Student ${studentName} (${studentId}) has been marked late 3 times this month.`;
        notifications.push(msg);
        localStorage.setItem('notifications_' + username, JSON.stringify(notifications));
        notifState.late = true;
        localStorage.setItem(notifKey, JSON.stringify(notifState));
        setTimeout(function(){
          showAestheticAlert(msg);
        }, 100);
      }

      renderAttendanceCalendar();
    };
  });
}
function renderPerformanceList() {
  const username = getCurrentUser();
  const section = getCurrentSection();
  const studentId = getCurrentStudentId();
  if (!username || !section || !studentId) return;
  const list = document.getElementById('performanceList');
  if (!list) return;
  let performance = getPerformance(username, section, studentId);
  list.innerHTML = performance.length === 0 ? '<div style="color:#888;text-align:center;">No performance records yet.</div>' :
    performance.map((p, i) => `<div><span>${p}</span> <button class='delete-btn' onclick="removePerformance(${i})">Delete</button> <button class='edit-btn' onclick="editPerformance(${i})">Edit</button></div>`).join('');
}
window.removePerformance = function(idx) {
  const username = getCurrentUser();
  const section = getCurrentSection();
  const studentId = getCurrentStudentId();
  let performance = getPerformance(username, section, studentId);
  performance.splice(idx, 1);
  setPerformance(username, section, studentId, performance);
  renderPerformanceList();
};

window.editPerformance = function(idx) {
  const username = getCurrentUser();
  const section = getCurrentSection();
  const studentId = getCurrentStudentId();
  let performance = getPerformance(username, section, studentId);
  let current = performance[idx];
  let updated = prompt('Edit performance:', current);
  if (updated && updated.trim()) {
    performance[idx] = updated.trim();
    setPerformance(username, section, studentId, performance);
    renderPerformanceList();
  }
};
document.addEventListener('DOMContentLoaded', function() {
  function renderStudentDropdown() {
    const username = getCurrentUser();
    const section = getCurrentSection();
    const studentId = getCurrentStudentId();
    const studentDropdown = document.getElementById('studentDropdown');
    if (!studentDropdown) return;
    let students = getStudents(username, section);
    students.sort((a, b) => a.name.localeCompare(b.name));
    studentDropdown.innerHTML = students.length === 0
      ? '<option disabled selected>No students yet</option>'
      : students.map(student => `<option value="${student.id}">${student.name} (${student.id})</option>`).join('');
    if (studentId) studentDropdown.value = studentId;
  }
  function attachStudentDropdownActions() {
    const goStudentBtn = document.getElementById('goStudentBtn');
    const editStudentBtn = document.getElementById('editStudentBtn');
    const removeStudentBtn = document.getElementById('removeStudentBtn');
    const studentDropdown = document.getElementById('studentDropdown');
    if (goStudentBtn && studentDropdown) {
      goStudentBtn.onclick = function() {
        const selected = studentDropdown.value;
        if (selected && selected !== 'No students yet') {
          localStorage.setItem('currentStudentId', selected);
          renderStudentInfo();
          renderAttendanceCalendar();
          renderPerformanceList();
        }
      };
    }
    if (editStudentBtn && studentDropdown) {
      editStudentBtn.onclick = function() {
        const selected = studentDropdown.value;
        if (!selected || selected === 'No students yet') return;
        const username = getCurrentUser();
        const section = getCurrentSection();
        let students = getStudents(username, section);
        let student = students.find(s => s.id === selected);
        if (student) {
          // Fill form for editing (if you have a form in this page)
          // For demo, just update name/id/age in localStorage
          let newName = prompt('Edit name:', student.name);
          let newId = prompt('Edit ID:', student.id);
          let newAge = prompt('Edit age:', student.age);
          if (newName && newId && newAge) {
            students = students.filter(s => s.id !== selected);
            students.push({ name: newName, id: newId, age: newAge });
            setStudents(username, section, students);
            localStorage.setItem('currentStudentId', newId);
            renderStudentDropdown();
            renderStudentInfo();
            renderAttendanceCalendar();
            renderPerformanceList();
          }
        }
      };
    }
    if (removeStudentBtn && studentDropdown) {
      removeStudentBtn.onclick = function() {
        const selected = studentDropdown.value;
        if (!selected || selected === 'No students yet') return;
        const username = getCurrentUser();
        const section = getCurrentSection();
        let students = getStudents(username, section);
        students = students.filter(s => s.id !== selected);
        setStudents(username, section, students);
        localStorage.removeItem('currentStudentId');
        renderStudentDropdown();
        renderStudentInfo();
        renderAttendanceCalendar();
        renderPerformanceList();
      };
    }
  }
  renderStudentDropdown();
  attachStudentDropdownActions();
  renderStudentInfo();
  // Tab logic
  const attendanceTabBtn = document.getElementById('attendanceTabBtn');
  const performanceTabBtn = document.getElementById('performanceTabBtn');
  const attendanceTab = document.getElementById('attendanceTab');
  const performanceTab = document.getElementById('performanceTab');
  attendanceTabBtn.onclick = function() {
    attendanceTabBtn.classList.add('active');
    performanceTabBtn.classList.remove('active');
    attendanceTab.classList.add('active');
    performanceTab.classList.remove('active');
  };
  performanceTabBtn.onclick = function() {
    performanceTabBtn.classList.add('active');
    attendanceTabBtn.classList.remove('active');
    performanceTab.classList.add('active');
    attendanceTab.classList.remove('active');
  };
  renderAttendanceCalendar();
  renderPerformanceList();
  // Add performance
  const performanceForm = document.getElementById('performanceForm');
  if (performanceForm) {
    performanceForm.onsubmit = function(e) {
      e.preventDefault();
      const username = getCurrentUser();
      const section = getCurrentSection();
      const studentId = getCurrentStudentId();
      const input = document.getElementById('performanceInput');
      let val = input.value.trim();
      if (!val) return;
      let performance = getPerformance(username, section, studentId);
      performance.push(val);
      setPerformance(username, section, studentId, performance);
      input.value = '';
      renderPerformanceList();
    };
  }
  var backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.onclick = function() {
      window.location.href = 'section_identification.html';
    };
  }
});
