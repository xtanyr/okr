"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUserStore = void 0;
exports.getUserAvatar = getUserAvatar;
const zustand_1 = require("zustand");
exports.useUserStore = (0, zustand_1.create)((set) => ({
    user: null,
    token: null,
    login: (user, token) => {
        set((state) => (Object.assign(Object.assign({}, state), { user, token })));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    logout: () => {
        set((state) => (Object.assign(Object.assign({}, state), { user: null, token: null })));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    register: (user, token) => {
        set((state) => (Object.assign(Object.assign({}, state), { user, token })));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    setUser: (user) => {
        set((state) => (Object.assign(Object.assign({}, state), { user })));
        if (user)
            localStorage.setItem('user', JSON.stringify(user));
        else
            localStorage.removeItem('user');
    },
}));
// Генерация аватарки: первые буквы имени и фамилии + цвет, зависящий от id/email
function getUserAvatar(firstName, lastName, idOrEmail) {
    const initials = `${((firstName === null || firstName === void 0 ? void 0 : firstName[0]) || '').toUpperCase()}${((lastName === null || lastName === void 0 ? void 0 : lastName[0]) || '').toUpperCase()}`;
    // Цвет выбирается детерминированно по id/email
    const colors = ['#FFB300', '#1E88E5', '#43A047', '#E53935', '#8E24AA', '#F4511E', '#2563eb', '#f59e42'];
    let hash = 0;
    const str = idOrEmail || firstName + lastName;
    for (let i = 0; i < str.length; i++)
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const color = colors[Math.abs(hash) % colors.length];
    return { initials, color };
}
// Инициализация из localStorage при старте
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
if (token && user) {
    exports.useUserStore.setState((state) => (Object.assign(Object.assign({}, state), { token, user: JSON.parse(user) })));
}
