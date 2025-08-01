// --- Section Identification Page Logic ---
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}
function getCurrentSection() {
  return localStorage.getItem('currentSection');
}
function getStudents(username, section) {
  return JSON.parse(localStorage.getItem('students_' + username + '_' + section) || '[]');
}
function setStudents(username, section, students) {
  localStorage.setItem('students_' + username + '_' + section, JSON.stringify(students));
}
function renderStudentList() {
  const username = getCurrentUser();
  const section = getCurrentSection();
  if (!username || !section) return;
  const studentDropdown = document.getElementById('studentDropdown');
  if (!studentDropdown) return;
  let students = getStudents(username, section);
  students.sort((a, b) => a.name.localeCompare(b.name));
  studentDropdown.innerHTML = students.length === 0
    ? '<option disabled selected>No students yet</option>'
    : students.map(student => `<option value="${student.id}">${student.name} (${student.id})</option>`).join('');
  studentDropdown.selectedIndex = 0;
}
window.goToStudent = function(studentId) {
  localStorage.setItem('currentStudentId', studentId);
  window.location.href = 'student_info.html';
};
document.addEventListener('DOMContentLoaded', function() {
  // Student dropdown actions (Go, Edit, Remove)
  function attachStudentDropdownActions() {
    const goStudentBtn = document.getElementById('goStudentBtn');
    const editStudentBtn = document.getElementById('editStudentBtn');
    const removeStudentBtn = document.getElementById('removeStudentBtn');
    const studentDropdown = document.getElementById('studentDropdown');
    if (goStudentBtn && studentDropdown) {
      goStudentBtn.onclick = function() {
        const selected = studentDropdown.value;
        if (selected && selected !== 'No students yet') {
          window.goToStudent(selected);
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
          document.getElementById('studentName').value = student.name;
          document.getElementById('studentId').value = student.id;
          document.getElementById('studentAge').value = student.age;
          students = students.filter(s => s.id !== selected);
          setStudents(username, section, students);
          renderStudentList();
          attachStudentDropdownActions();
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
        renderStudentList();
        attachStudentDropdownActions();
      };
    }
  }
  attachStudentDropdownActions();
  const studentForm = document.getElementById('studentForm');
  if (studentForm) {
    studentForm.onsubmit = function(e) {
      e.preventDefault();
      const username = getCurrentUser();
      const section = getCurrentSection();
      if (!username || !section) return;
      const name = document.getElementById('studentName').value.trim();
      const id = document.getElementById('studentId').value.trim();
      const age = document.getElementById('studentAge').value.trim();
      if (!name || !id || !age) return;
      let students = getStudents(username, section);
      if (!students.find(s => s.id === id)) {
        students.push({ name, id, age });
        setStudents(username, section, students);
        document.getElementById('studentName').value = '';
        document.getElementById('studentId').value = '';
        document.getElementById('studentAge').value = '';
        renderStudentList();
      }
    };
    renderStudentList();
  }
  var backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.onclick = function() {
      window.location.href = 'sections.html';
    };
  }
});
