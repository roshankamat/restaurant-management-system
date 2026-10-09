import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  imports: [FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu {

  menuItems = [
    {
      name: 'Margherita Pizza',
      price: 299,
      category: 'Main Course',
      available: true
    },
    {
      name: 'Classic Burger',
      price: 199,
      category: 'Fast Food',
      available: true
    },
    {
      name: 'White Sauce Pasta',
      price: 249,
      category: 'Main Course',
      available: true
    },
    {
      name: 'Paneer Tikka',
      price: 279,
      category: 'Starter',
      available: false
    }
  ];

  showForm = false;

  newItem = {
    name: '',
    price: 0,
    category: '',
    available: true
  };

  editingIndex = -1;

  editItem = {
    name: '',
    price: 0,
    category: '',
    available: true
  };

  openForm() {
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  addItem() {

    this.menuItems.push({
      name: this.newItem.name,
      price: this.newItem.price,
      category: this.newItem.category,
      available: true
    });

    this.newItem = {
      name: '',
      price: 0,
      category: '',
      available: true
    };

    this.showForm = false;
  }
    editMenuItem(index: number) {

    this.editingIndex = index;

    this.editItem = {
      name: this.menuItems[index].name,
      price: this.menuItems[index].price,
      category: this.menuItems[index].category,
      available: this.menuItems[index].available
    };

  }
    saveEdit() {

    if (this.editingIndex === -1) {
      return;
    }

    this.menuItems[this.editingIndex] = {
      name: this.editItem.name,
      price: this.editItem.price,
      category: this.editItem.category,
      available: this.editItem.available
    };

    this.editingIndex = -1;
  }
    cancelEdit() {

    this.editingIndex = -1;

  }
    deleteMenuItem(index: number) {

    this.menuItems.splice(index, 1);

  }

}

