"use client";
// Хранилище демо-режима (localStorage этого браузера).
// Пароль не хранится: сохраняется только PBKDF2-хэш с солью.
const ACCOUNTS = "eq:accounts";
const SESSION = "eq:session";
const STATE = (id) => `eq:state:${id}`;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 120000, hash: "SHA-256" }, key, 256);
  return toHex(bits);
}

export const demoStore = {
  accounts() {
    return read(ACCOUNTS, {});
  },
  sessionUser() {
    const id = read(SESSION, null);
    if (!id) return null;
    return Object.values(this.accounts()).find((a) => a.id === id) || null;
  },
  async register({ name, username, email, password, grade }) {
    const accounts = this.accounts();
    const key = email.trim().toLowerCase();
    if (accounts[key]) throw new Error("Аккаунт с таким email уже есть на этом устройстве");
    if (Object.values(accounts).some((a) => a.username === username)) throw new Error("Этот никнейм уже занят");
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    const account = {
      id: crypto.randomUUID(),
      email: key,
      name,
      username,
      grade,
      salt,
      hash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    accounts[key] = account;
    if (!write(ACCOUNTS, accounts)) throw new Error("Браузер не разрешает сохранять данные (приватный режим?)");
    write(SESSION, account.id);
    return account;
  },
  async login({ email, password }) {
    const account = this.accounts()[email.trim().toLowerCase()];
    if (!account || (await hashPassword(password, account.salt)) !== account.hash) {
      throw new Error("Неверный email или пароль");
    }
    write(SESSION, account.id);
    return account;
  },
  logout() {
    try {
      localStorage.removeItem(SESSION);
    } catch {}
  },
  loadState(id) {
    return read(STATE(id), null);
  },
  saveState(id, state) {
    return write(STATE(id), state);
  },
  resetState(id) {
    try {
      localStorage.removeItem(STATE(id));
    } catch {}
  },
  stateKey: STATE,
};
