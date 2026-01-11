document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    const userList = document.getElementById('userslist');

    // Если элемента вообще нет на странице — просто выходим
    if (!userList) {
        console.log("Элемент #userslist на этой странице не найден");
        return;
    }

    console.log("Роль:", role);

    if (role !== 'admin') {
        userList.classList.add('hidden');
        console.log("→ Скрыли список пользователей (не админ)");
    } else {
        userList.classList.remove('hidden');
        console.log("→ Показали список пользователей (админ)");
    }
});