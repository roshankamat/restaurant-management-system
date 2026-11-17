import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { RestaurantProfile, AdminRole } from '../models/restaurant.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  db = inject(DatabaseService);
  auth = inject(AuthService);

  activeTab: 'ACCESS' | 'PROFILE' | 'DATABASE' = 'ACCESS';

  profileData: RestaurantProfile = { ...this.db.profile() };
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';

  // Add new staff / admin form
  newStaff = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    pin: '',
    title: '',
    role: 'MANAGER' as AdminRole
  };

  // Change own credentials form
  mySecurity = {
    newPassword: '',
    newPin: ''
  };

  saveProfile(): void {
    this.db.updateProfile(this.profileData);
    this.auth.recordAudit('Updated restaurant GST/FSSAI profile details');
    this.showMessage('Restaurant profile updated successfully!', 'success');
  }

  createStaffAccount(): void {
    if (!this.newStaff.fullName.trim() || !this.newStaff.username.trim() || !this.newStaff.password.trim()) {
      this.showMessage('Please fill in Full Name, Username, and Password.', 'error');
      return;
    }
    if (!/^\d{4}$/.test(this.newStaff.pin.trim())) {
      this.showMessage('Staff PIN must be exactly 4 numeric digits (e.g., 4455).', 'error');
      return;
    }

    const res = this.auth.addAdminUser(this.newStaff);
    this.showMessage(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      this.newStaff = {
        fullName: '',
        username: '',
        email: '',
        password: '',
        pin: '',
        title: '',
        role: 'MANAGER'
      };
    }
  }

  removeStaffAccount(id: string, name: string): void {
    if (confirm(`Revoke admin console access for "${name}"?`)) {
      const res = this.auth.deleteAdminUser(id);
      this.showMessage(res.message, res.success ? 'success' : 'error');
    }
  }

  updateMySecurity(): void {
    if (!this.mySecurity.newPassword.trim() && !this.mySecurity.newPin.trim()) {
      this.showMessage('Enter a new password or a new 4-digit PIN to update.', 'error');
      return;
    }
    if (this.mySecurity.newPin.trim() && !/^\d{4}$/.test(this.mySecurity.newPin.trim())) {
      this.showMessage('New PIN must be exactly 4 numeric digits.', 'error');
      return;
    }

    const res = this.auth.updateCurrentPassword(
      this.mySecurity.newPassword.trim(),
      this.mySecurity.newPin.trim() || undefined
    );
    this.showMessage(res.message, res.success ? 'success' : 'error');
    if (res.success) {
      this.mySecurity = { newPassword: '', newPin: '' };
    }
  }

  exportData(): void {
    const jsonStr = this.db.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kamat_ka_dhaba_db_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.auth.recordAudit('Exported full restaurant database backup (JSON)');
    this.showMessage('Database exported successfully as JSON file!', 'success');
  }

  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const ok = this.db.importDatabaseJSON(text);
        if (ok) {
          this.profileData = { ...this.db.profile() };
          this.auth.recordAudit('Restored restaurant database from JSON backup');
          this.showMessage('Database imported and restored successfully!', 'success');
        } else {
          this.showMessage('Invalid backup file. Could not parse JSON data.', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  resetDefaults(): void {
    if (confirm('Are you sure you want to restore the default Indian restaurant database? Any custom items will be overwritten with authentic seed data.')) {
      this.db.resetToDefaults();
      this.profileData = { ...this.db.profile() };
      this.auth.recordAudit('Reset database to default Royal Indian seed data');
      this.showMessage('Database reset to authentic Royal Indian default seed data!', 'success');
    }
  }

  private showMessage(msg: string, type: 'success' | 'error'): void {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => {
      this.feedbackMessage = '';
    }, 4000);
  }
}
