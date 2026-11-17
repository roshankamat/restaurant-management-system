import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminUser, AdminRole, AuditLogEntry } from '../models/restaurant.model';

const AUTH_KEYS = {
  ADMINS: 'royal_rasoi_admins_v1',
  SESSION: 'royal_rasoi_session_v1',
  AUDIT: 'royal_rasoi_audit_v1',
  THEME: 'royal_rasoi_theme_v1'
};

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'adm-1',
    username: 'admin',
    password: 'royal123',
    pin: '1111',
    fullName: 'Roshan Kamat',
    title: 'Owner & General Manager',
    role: 'SUPER_ADMIN',
    avatarInitials: 'RK',
    email: 'admin@kamatkadhaba.in',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'adm-2',
    username: 'chef',
    password: 'tandoor123',
    pin: '2222',
    fullName: 'Chef Ranveer Gill',
    title: 'Executive Master Chef',
    role: 'HEAD_CHEF',
    avatarInitials: 'RG',
    email: 'chef@kamatkadhaba.in'
  },
  {
    id: 'adm-3',
    username: 'cashier',
    password: 'pos123',
    pin: '3333',
    fullName: 'Priya Nair',
    title: 'Front Desk & POS Lead',
    role: 'CASHIER',
    avatarInitials: 'PN',
    email: 'billing@kamatkadhaba.in'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  readonly adminUsers = signal<AdminUser[]>([]);
  readonly currentUser = signal<AdminUser | null>(null);
  readonly auditLogs = signal<AuditLogEntry[]>([]);
  readonly theme = signal<'light' | 'dark'>('light');

  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isSuperAdmin = computed(() => this.currentUser()?.role === 'SUPER_ADMIN');

  constructor() {
    this.initAuth();
    this.initTheme();
  }

  private initAuth(): void {
    try {
      const storedAdmins = localStorage.getItem(AUTH_KEYS.ADMINS);
      if (storedAdmins) {
        let parsedAdmins: AdminUser[] = JSON.parse(storedAdmins);
        let migrated = false;
        parsedAdmins = parsedAdmins.map(u => {
          if (u.id === 'adm-1' && u.fullName === 'Rohan Malhotra') {
            migrated = true;
            return {
              ...u,
              fullName: 'Roshan Kamat',
              avatarInitials: 'RK',
              email: u.email.replace('shahirasoi.in', 'kamatkadhaba.in')
            };
          }
          if (u.email.includes('shahirasoi.in')) {
            migrated = true;
            return { ...u, email: u.email.replace('shahirasoi.in', 'kamatkadhaba.in') };
          }
          return u;
        });
        if (migrated) {
          localStorage.setItem(AUTH_KEYS.ADMINS, JSON.stringify(parsedAdmins));
        }
        this.adminUsers.set(parsedAdmins);
      } else {
        this.adminUsers.set(DEFAULT_ADMINS);
        localStorage.setItem(AUTH_KEYS.ADMINS, JSON.stringify(DEFAULT_ADMINS));
      }

      const storedSession = localStorage.getItem(AUTH_KEYS.SESSION);
      if (storedSession) {
        const parsed: AdminUser = JSON.parse(storedSession);
        const match = this.adminUsers().find(u => u.id === parsed.id);
        if (match) {
          this.currentUser.set(match);
          localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(match));
        }
      }

      const storedAudit = localStorage.getItem(AUTH_KEYS.AUDIT);
      if (storedAudit) {
        this.auditLogs.set(JSON.parse(storedAudit));
      } else {
        const seedLogs: AuditLogEntry[] = [
          {
            id: 'log-1',
            actor: 'System',
            role: 'SYSTEM',
            action: 'Kamat Ka Dhaba Hospitality OS initialized with Royal Indian Database',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          }
        ];
        this.auditLogs.set(seedLogs);
        localStorage.setItem(AUTH_KEYS.AUDIT, JSON.stringify(seedLogs));
      }
    } catch (e) {
      console.warn('Auth initialization fallback:', e);
      this.adminUsers.set(DEFAULT_ADMINS);
    }
  }

  private initTheme(): void {
    try {
      const saved = localStorage.getItem(AUTH_KEYS.THEME) as 'light' | 'dark' | null;
      const initial = saved === 'dark' ? 'dark' : 'light';
      this.theme.set(initial);
      this.applyThemeToDom(initial);
    } catch {
      this.applyThemeToDom('light');
    }
  }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    this.applyThemeToDom(next);
    try {
      localStorage.setItem(AUTH_KEYS.THEME, next);
    } catch {}
  }

  private applyThemeToDom(mode: 'light' | 'dark'): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }

  login(username: string, password: string): { success: boolean; message: string; user?: AdminUser } {
    const cleanUser = username.trim().toLowerCase();
    const user = this.adminUsers().find(
      u => (u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser) && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid username or password. Please check your admin credentials.' };
    }

    this.establishSession(user, 'Signed in via Admin Credentials');
    return { success: true, message: `Welcome back, ${user.fullName}!`, user };
  }

  loginWithPin(pin: string): { success: boolean; message: string; user?: AdminUser } {
    const user = this.adminUsers().find(u => u.pin === pin.trim());
    if (!user) {
      return { success: false, message: 'Unrecognized 4-digit Staff PIN.' };
    }

    this.establishSession(user, 'Signed in via Quick Staff PIN');
    return { success: true, message: `Unlocked for ${user.fullName}`, user };
  }

  private establishSession(user: AdminUser, methodText: string): void {
    const now = new Date().toISOString();
    const updatedUser: AdminUser = { ...user, lastLogin: now };

    const updatedList = this.adminUsers().map(u => u.id === user.id ? updatedUser : u);
    this.adminUsers.set(updatedList);
    this.currentUser.set(updatedUser);

    try {
      localStorage.setItem(AUTH_KEYS.ADMINS, JSON.stringify(updatedList));
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(updatedUser));
    } catch {}

    this.recordAudit(methodText, updatedUser);
  }

  logout(): void {
    const active = this.currentUser();
    if (active) {
      this.recordAudit('Signed out of Admin Console', active);
    }
    this.currentUser.set(null);
    try {
      localStorage.removeItem(AUTH_KEYS.SESSION);
    } catch {}
    this.router.navigate(['/login']);
  }

  addAdminUser(data: {
    username: string;
    password: string;
    pin: string;
    fullName: string;
    title: string;
    role: AdminRole;
    email: string;
  }): { success: boolean; message: string } {
    const exists = this.adminUsers().some(
      u => u.username.toLowerCase() === data.username.trim().toLowerCase() || u.pin === data.pin.trim()
    );
    if (exists) {
      return { success: false, message: 'Username or 4-digit PIN is already in use by another staff account.' };
    }

    const initials = data.fullName
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser: AdminUser = {
      id: 'adm-' + Date.now(),
      username: data.username.trim().toLowerCase(),
      password: data.password,
      pin: data.pin.trim(),
      fullName: data.fullName.trim(),
      title: data.title.trim() || this.formatRoleLabel(data.role),
      role: data.role,
      avatarInitials: initials || 'AD',
      email: data.email.trim()
    };

    const updated = [...this.adminUsers(), newUser];
    this.adminUsers.set(updated);
    try {
      localStorage.setItem(AUTH_KEYS.ADMINS, JSON.stringify(updated));
    } catch {}

    this.recordAudit(`Created admin account for ${newUser.fullName} (${newUser.role})`);
    return { success: true, message: `Admin account "${newUser.username}" created successfully.` };
  }

  deleteAdminUser(id: string): { success: boolean; message: string } {
    if (id === 'adm-1') {
      return { success: false, message: 'Primary Super Admin account cannot be removed.' };
    }
    if (this.currentUser()?.id === id) {
      return { success: false, message: 'You cannot delete the currently signed-in account.' };
    }
    const target = this.adminUsers().find(u => u.id === id);
    const updated = this.adminUsers().filter(u => u.id !== id);
    this.adminUsers.set(updated);
    try {
      localStorage.setItem(AUTH_KEYS.ADMINS, JSON.stringify(updated));
    } catch {}
    if (target) {
      this.recordAudit(`Removed admin account: ${target.fullName}`);
    }
    return { success: true, message: 'Admin account removed.' };
  }

  updateCurrentPassword(newPassword: string, newPin?: string): { success: boolean; message: string } {
    const active = this.currentUser();
    if (!active) return { success: false, message: 'Not authenticated.' };

    if (newPin && this.adminUsers().some(u => u.id !== active.id && u.pin === newPin)) {
      return { success: false, message: 'That 4-digit PIN is already assigned to another staff member.' };
    }

    const updatedUser: AdminUser = {
      ...active,
      password: newPassword || active.password,
      pin: newPin || active.pin
    };

    const updatedList = this.adminUsers().map(u => u.id === active.id ? updatedUser : u);
    this.adminUsers.set(updatedList);
    this.currentUser.set(updatedUser);
    try {
      localStorage.setItem(AUTH_KEYS.ADMINS, JSON.stringify(updatedList));
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(updatedUser));
    } catch {}

    this.recordAudit('Updated Admin security password / PIN');
    return { success: true, message: 'Security credentials updated successfully.' };
  }

  recordAudit(action: string, actorOverride?: AdminUser): void {
    const actor = actorOverride || this.currentUser();
    const entry: AuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      actor: actor ? actor.fullName : 'System',
      role: actor ? actor.role : 'SYSTEM',
      action,
      timestamp: new Date().toISOString()
    };

    const updated = [entry, ...this.auditLogs()].slice(0, 40);
    this.auditLogs.set(updated);
    try {
      localStorage.setItem(AUTH_KEYS.AUDIT, JSON.stringify(updated));
    } catch {}
  }

  formatRoleLabel(role: AdminRole | 'SYSTEM'): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'MANAGER': return 'Floor Manager';
      case 'HEAD_CHEF': return 'Master Chef';
      case 'CASHIER': return 'POS Cashier';
      default: return 'System';
    }
  }
}
