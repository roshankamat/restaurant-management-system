import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../services/database.service';
import { MenuItem, DishCategory, SpiceLevel } from '../models/restaurant.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu {
  db = inject(DatabaseService);

  categories: DishCategory[] = [
    'Starters & Kebabs',
    'Main Course (Curries)',
    'Royal Biryani & Rice',
    'Tandoori Breads',
    'Desserts & Mithai',
    'Desi Beverages'
  ];

  selectedCategory: string = 'All';
  dietFilter: 'ALL' | 'VEG' | 'NON_VEG' = 'ALL';
  searchQuery: string = '';
  spiceFilter: string = 'All';

  // Modal State
  showModal: boolean = false;
  isEditing: boolean = false;
  editingId: string | null = null;

  modalItem: {
    name: string;
    hindiName: string;
    category: DishCategory;
    price: number;
    description: string;
    isVeg: boolean;
    spiceLevel: SpiceLevel;
    prepTimeMinutes: number;
    available: boolean;
    imageUrl: string;
    isChefSpecial: boolean;
    isJainFriendly: boolean;
  } = this.getEmptyItem();

  // Curated preset image options for easy selection
  presetImages = [
    { label: 'Paneer / Veg Starter', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60' },
    { label: 'Tandoori Murgh', url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=500&auto=format&fit=crop&q=60' },
    { label: 'Butter Chicken', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60' },
    { label: 'Dal Makhani', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60' },
    { label: 'Paneer Gravy', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60' },
    { label: 'Royal Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60' },
    { label: 'Tandoori Naan', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60' },
    { label: 'Gulab Jamun / Sweet', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60' },
    { label: 'Mango Lassi', url: 'https://images.unsplash.com/photo-1571006687898-3bfd45b23d9a?w=500&auto=format&fit=crop&q=60' }
  ];

  get filteredItems(): MenuItem[] {
    return this.db.menu().filter(item => {
      // Category filter
      if (this.selectedCategory !== 'All' && item.category !== this.selectedCategory) {
        return false;
      }
      // Diet filter
      if (this.dietFilter === 'VEG' && !item.isVeg) return false;
      if (this.dietFilter === 'NON_VEG' && item.isVeg) return false;

      // Spice filter
      if (this.spiceFilter !== 'All' && item.spiceLevel !== this.spiceFilter) {
        return false;
      }

      // Search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesHindi = item.hindiName ? item.hindiName.toLowerCase().includes(query) : false;
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesHindi && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }

  getCategoryCount(cat: string): number {
    if (cat === 'All') return this.db.menu().length;
    return this.db.menu().filter(m => m.category === cat).length;
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.modalItem = this.getEmptyItem();
    this.showModal = true;
  }

  openEditModal(item: MenuItem): void {
    this.isEditing = true;
    this.editingId = item.id;
    this.modalItem = {
      name: item.name,
      hindiName: item.hindiName || '',
      category: item.category,
      price: item.price,
      description: item.description,
      isVeg: item.isVeg,
      spiceLevel: item.spiceLevel,
      prepTimeMinutes: item.prepTimeMinutes,
      available: item.available,
      imageUrl: item.imageUrl,
      isChefSpecial: !!item.isChefSpecial,
      isJainFriendly: !!item.isJainFriendly
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
  }

  saveItem(): void {
    if (!this.modalItem.name.trim() || this.modalItem.price <= 0) {
      alert('Please provide a valid dish name and price.');
      return;
    }

    if (!this.modalItem.imageUrl) {
      this.modalItem.imageUrl = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60';
    }

    if (this.isEditing && this.editingId) {
      this.db.updateMenuItem(this.editingId, this.modalItem);
    } else {
      this.db.addMenuItem(this.modalItem);
    }

    this.closeModal();
  }

  deleteItem(id: string, name: string): void {
    if (confirm(`Are you sure you want to remove "${name}" from the menu?`)) {
      this.db.deleteMenuItem(id);
    }
  }

  toggleStock(id: string): void {
    this.db.toggleItemAvailability(id);
  }

  selectPresetImage(url: string): void {
    this.modalItem.imageUrl = url;
  }

  private getEmptyItem() {
    return {
      name: '',
      hindiName: '',
      category: 'Main Course (Curries)' as DishCategory,
      price: 350,
      description: '',
      isVeg: true,
      spiceLevel: 'Medium' as SpiceLevel,
      prepTimeMinutes: 20,
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
      isChefSpecial: false,
      isJainFriendly: false
    };
  }
}
