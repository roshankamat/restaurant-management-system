import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  imports: [],
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

}