// Ensure user is logged in
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
// 1. FETCH & DISPLAY USER REQUEST LOGS (FIXED FOR OBJECT RESPONSES)
// -------------------------------------------------------------
async function loadUserRequests() {
  const tableBody = document.getElementById('requestsTable');
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'GET',
      headers: authHeaders()
    });

    if (!res.ok) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Failed to load requests.</td></tr>`;
      return;
    }

    const data = await res.json();

    // Safely extract the array whether data is [...] or { requests: [...] } or { data: [...] }
    const requestsArray = Array.isArray(data) 
      ? data 
      : (data.requests || data.data || []);

    tableBody.innerHTML = '';

    if (!Array.isArray(requestsArray) || requestsArray.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No request logs found.</td></tr>`;
      return;
    }

    requestsArray.forEach(req => {
      const row = document.createElement('tr');
      
      const status = req.status || 'Pending';
      const statusClass = status.toLowerCase() === 'approved' ? 'text-success' : 
                          status.toLowerCase() === 'rejected' ? 'text-danger' : 'text-warning';

      const formattedDate = req.createdAt 
        ? new Date(req.createdAt).toLocaleDateString() 
        : '-';

      row.innerHTML = `
        <td>${req.operation || req.type || 'Creation'}</td>
        <td>${req.title || req.resourceTitle || req.name || 'N/A'}</td>
        <td><strong class="${statusClass}">${status}</strong></td>
        <td>${formattedDate}</td>
        <td>${req.adminRemark || req.remark || '-'}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error('Error loading user requests:', err);
  }
}

// -------------------------------------------------------------
// 2. FETCH & DISPLAY ACTIVE RESOURCES (SAFE FETCH)
// -------------------------------------------------------------
async function loadUserResources() {
  const grid = document.getElementById('resourceGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'GET',
      headers: authHeaders()
    });

    // Handle 404 cleanly without crashing res.json()
    if (!res.ok) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No active resources available.</p>`;
      return;
    }

    const data = await res.json();
    const resourcesArray = Array.isArray(data) ? data : (data.resources || data.data || []);

    grid.innerHTML = '';

    if (resourcesArray.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No active resources available yet.</p>`;
      return;
    }

    resourcesArray.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${item.title || 'Untitled'}</h3>
        <p><strong>Category:</strong> ${item.category || 'General'}</p>
        <p>${item.description || ''}</p>
      `;
      grid.appendChild(card);
    });

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
        showNotification('Creation request submitted successfully!', 'success');
        createForm.reset();
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