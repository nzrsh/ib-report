let currentPage = 0;
const pageSize = 10;

async function loadUsers() {
  const skip = currentPage * pageSize;
  const take = pageSize;

  const resp = await fetch(`/api/users?skip=${skip}&take=${take}`);
  const result = await resp.json();

  const tbody = document.getElementById("eventsBody");
  tbody.innerHTML = "";

  result.data.forEach((u) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${u.id}</td>
      <td>${u.login}</td>
      <td>${u.role}</td>
      <td>
        <button class="btn-delete" onclick="deleteUser(${u.id})">
          Удалить
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  document.getElementById("pageInfo").textContent = 
    `Страница ${currentPage + 1} из ${Math.ceil(result.total / pageSize)}`;
}

// кнопка удаления (делаем глобальной)
async function deleteUser(id) {
  if (!confirm("Удалить пользователя?")) return;

  const resp = await fetch(`/api/users/${id}`, { method: "DELETE" });

  if (resp.ok) {
    alert("Пользователь удалён");
    loadUsers();
  } else {
    alert("Ошибка удаления");
  }
}

window.deleteUser = deleteUser;

// пагинация
document.getElementById("nextBtn").onclick = () => {
  currentPage++;
  loadUsers();
};

document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 0) currentPage--;
  loadUsers();
};

loadUsers();