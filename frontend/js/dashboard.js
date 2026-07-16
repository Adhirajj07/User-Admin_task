checkAuth('User');

document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
  try {
    const res = await fetch(`${API_BASE}/dashboard`, { headers: authHeaders() });
    const data = await res.json();

    if (data.success) {
      renderResources(data.resources);
      renderRequests(data.requests);
    }
  } catch (err) {
    console.error(err);
  }
}

function renderResources(resources) {
  const container = document.getElementById('resourceGrid');
  container.innerHTML = resources.map(res => `
    <div class="card">
      <h3>${res.title}</h3>
      <p><strong>Category:</strong> ${res.category}</p>
      <p>${res.description}</p>
      <div style="margin-top: 1rem;">
        <button class="btn" onclick="openEditModal('${res._id}', '${res.title}', '${res.category}', \`${res.description}\`)">Edit</button>
        <button class="btn btn-danger" onclick="submitDeleteRequest('${res._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderRequests(requests) {
  const tableBody = document.getElementById('requestsTable');
  tableBody.innerHTML = requests.map(req => `
    <tr>
      <td>${req.operation}</td>
      <td>${req.data.title || 'N/A'}</td>
      <td><span class="badge badge-${req.status.toLowerCase()}">${req.status}</span></td>
      <td>${new Date(req.createdAt).toLocaleDateString()}</td>
      <td>${req.adminComment || '-'}</td>
    </tr>
  `).join('');
}

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;

  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title, category, description })
  });

  const data = await res.json();
  if (data.success) {
    alert(data.message);
    document.getElementById('createForm').reset();
    loadDashboard();
  }
});

async function submitDeleteRequest(resourceId) {
  if (!confirm('Submit a deletion request for admin approval?')) return;

  const res = await fetch(`${API_BASE}/requests`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ resourceId })
  });
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    loadDashboard();
  }
}