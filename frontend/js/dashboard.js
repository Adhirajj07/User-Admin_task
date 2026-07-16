// Ensure user is logged in before rendering dashboard data
if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

// Global Headers Helper
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  };
}

// -------------------------------------------------------------
// 1. FETCH & DISPLAY USER REQUEST LOGS
// -------------------------------------------------------------
async function loadUserRequests() {
  const tableBody = document.getElementById('requestsTable');
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'GET',
      headers: authHeaders()
    });

    const data = await res.json();

    if (res.ok) {
      tableBody.innerHTML = '';

      if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No request logs found.</td></tr>`;
        return;
      }

      data.forEach(req => {
        const row = document.createElement('tr');
        
        // Status badge colors
        const statusClass = req.status === 'Approved' ? 'text-success' : 
                            req.status === 'Rejected' ? 'text-danger' : 'text-warning';

        const formattedDate = req.createdAt 
          ? new Date(req.createdAt).toLocaleDateString() 
          : new Date().toLocaleDateString();

        row.innerHTML = `
          <td>${req.operation || 'Creation'}</td>
          <td>${req.title || 'N/A'}</td>
          <td><strong class="${statusClass}">${req.status || 'Pending'}</strong></td>
          <td>${formattedDate}</td>
          <td>${req.adminRemark || '-'}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      showNotification(data.message || 'Failed to fetch request logs.', 'error');
    }
  } catch (err) {
    console.error('Error loading user requests:', err);
  }
}

// -------------------------------------------------------------
// 2. FETCH & DISPLAY ACTIVE RESOURCES
// -------------------------------------------------------------
async function loadUserResources() {
  const grid = document.getElementById('resourceGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'GET',
      headers: authHeaders()
    });

    const data = await res.json();

    if (res.ok) {
      grid.innerHTML = '';

      if (!data || data.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No active resources available yet.</p>`;
        return;
      }

      data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${item.title}</h3>
          <p><strong>Category:</strong> ${item.category || 'General'}</p>
          <p>${item.description || ''}</p>
        `;
        grid.appendChild(card);
      });
    }
  } catch (err) {
    console.error('Error loading resources:', err);
  }
}

// -------------------------------------------------------------
// 3. SUBMIT NEW CREATION REQUEST
// -------------------------------------------------------------
const createForm = document.getElementById('createForm');

if (createForm) {
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;

    try {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title, category, description })
      });

      const data = await res.json();

      if (res.ok) {
        // 🌟 In-screen Toast Notification
        showNotification('Creation request submitted successfully!', 'success');

        // Clear input form
        createForm.reset();

        // Refresh data tables immediately
        loadUserRequests();
        loadUserResources();
      } else {
        showNotification(data.message || 'Failed to submit request.', 'error');
      }
    } catch (err) {
      showNotification('Network error. Please try again.', 'error');
    }
  });
}

// -------------------------------------------------------------
// INITIAL LOAD
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadUserRequests();
  loadUserResources();
});