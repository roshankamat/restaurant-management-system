import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { Customer, CustomerTier } from '../models/restaurant.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers {
  db = inject(DatabaseService);
  router = inject(Router);

  searchQuery: string = '';
  tierFilter: string = 'ALL';
  dietFilter: string = 'ALL';

  // Modal State
  showModal: boolean = false;
  isEditing: boolean = false;
  editingId: string | null = null;

  modalCustomer: {
    name: string;
    phone: string;
    email: string;
    dietaryPreference: 'PURE_VEG' | 'NON_VEG';
    favoriteDish: string;
    notes: string;
  } = this.getEmptyCustomer();

  get filteredCustomers(): Customer[] {
    return this.db.customers().filter(c => {
      if (this.tierFilter !== 'ALL' && c.tier !== this.tierFilter) return false;
      if (this.dietFilter !== 'ALL' && c.dietaryPreference !== this.dietFilter) return false;

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesPhone = c.phone.includes(q);
        const matchesEmail = c.email ? c.email.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesPhone && !matchesEmail) return false;
      }

      return true;
    });
  }

  get totalCustomerSpend(): number {
    return this.db.customers().reduce((sum, c) => sum + c.totalSpent, 0);
  }

  get platinumCount(): number {
    return this.db.customers().filter(c => c.tier === 'PLATINUM').length;
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.modalCustomer = this.getEmptyCustomer();
    this.showModal = true;
  }

  openEditModal(customer: Customer): void {
    this.isEditing = true;
    this.editingId = customer.id;
    this.modalCustomer = {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      dietaryPreference: customer.dietaryPreference,
      favoriteDish: customer.favoriteDish || '',
      notes: customer.notes || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  saveCustomer(): void {
    if (!this.modalCustomer.name.trim() || !this.modalCustomer.phone.trim()) {
      alert('Please enter guest name and phone number.');
      return;
    }

    if (this.isEditing && this.editingId) {
      this.db.updateCustomer(this.editingId, this.modalCustomer);
    } else {
      const newCust: Customer = {
        id: 'c-' + Date.now(),
        name: this.modalCustomer.name,
        phone: this.modalCustomer.phone,
        email: this.modalCustomer.email,
        tier: 'SILVER',
        totalVisits: 1,
        totalSpent: 0,
        dietaryPreference: this.modalCustomer.dietaryPreference,
        favoriteDish: this.modalCustomer.favoriteDish,
        notes: this.modalCustomer.notes,
        lastVisit: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.db.customers.set([newCust, ...this.db.customers()]);
    }

    this.closeModal();
  }

  startOrderForCustomer(c: Customer): void {
    this.router.navigate(['/orders'], {
      queryParams: {
        customerName: c.name,
        customerPhone: c.phone
      }
    });
  }

  private getEmptyCustomer() {
    return {
      name: '',
      phone: '',
      email: '',
      dietaryPreference: 'NON_VEG' as const,
      favoriteDish: '',
      notes: ''
    };
  }
}
