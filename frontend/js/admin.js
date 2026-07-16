checkAuth('Admin');

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  loadRequests();
});

async function loadUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
  const data = await res.json();
  if (data.success) {
    document.getElementById('usersTable').innerHTML = data.users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }
}

async function loadRequests() {
  const res = await fetch(`${API_BASE}/admin/requests`, { headers: authHeaders() });
  const data = await res.json();
  if (data.success) {
    document.getElementById('adminRequestsTable').innerHTML = data.requests.map(r => `
      <tr>
        <td>${r.userId ? r.userId.name : 'Unknown'} (${r.userId ? r.userId.email : ''})</td>
        <td>${r.operation}</td>
        <td>${r.data.title || 'N/A'}</td>
        <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
        <td>
          ${r.status === 'Pending' ? `
            <button class="btn btn-success" onclick="approveRequest('${r._id}')">Approve</button>
            <button class="btn btn-danger" onclick="rejectRequest('${r._id}')">Reject</button>
          ` : 'Processed'}
        </td>
      </tr>
    `).join('');
  }
}

async function approveRequest(id) {
  const res = await fetch(`${API_BASE}/admin/approve/${id}`, {
    method: 'PUT',
    headers: authHeaders()
  });
  const data = await res.json();
  alert(data.message);
  loadRequests();
}

async function rejectRequest(id) {
  const comment = prompt('Enter rejection reason (optional):');
  const res = await fetch(`${API_BASE}/admin/reject/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ comment })
  });
  const data = await res.json();
  alert(data.message);
  loadRequests();
}