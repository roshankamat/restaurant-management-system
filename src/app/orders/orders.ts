import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import {
  Order,
  OrderStatus,
  OrderType,
  OrderItem,
  MenuItem,
  DishCategory
} from '../models/restaurant.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  db = inject(DatabaseService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  // Tab View: 'KDS' (Kitchen Kanban) or 'LIST' (Orders Table)
  activeView: 'KDS' | 'LIST' = 'KDS';

  // Filters
  filterStatus: string = 'ACTIVE';
  filterType: string = 'ALL';
  searchQuery: string = '';

  // New Order Modal State
  showNewOrderModal: boolean = false;
  newOrderType: OrderType = 'DINE_IN';
  newOrderTableId: string = '';
  newOrderCustomerName: string = '';
  newOrderCustomerPhone: string = '';
  newOrderInstructions: string = '';
  discountCode: string = '';
  discountAmount: number = 0;

  // Items added to the new order ticket
  orderTicketItems: OrderItem[] = [];

  // Menu selector state for modal
  posSelectedCategory: string = 'All';
  posSearchQuery: string = '';

  categories: DishCategory[] = [
    'Starters & Kebabs',
    'Main Course (Curries)',
    'Royal Biryani & Rice',
    'Tandoori Breads',
    'Desserts & Mithai',
    'Desi Beverages'
  ];

  ngOnInit(): void {
    // Check if routed from Table screen
    this.route.queryParams.subscribe(params => {
      if (params['tableId'] || params['tableNumber']) {
        this.openNewOrderModal();
        if (params['tableId']) this.newOrderTableId = params['tableId'];
        if (params['customerName']) this.newOrderCustomerName = params['customerName'];
        if (params['customerPhone']) this.newOrderCustomerPhone = params['customerPhone'];
      }
    });
  }

  // Filtered Orders for List View
  get filteredOrders(): Order[] {
    return this.db.orders().filter(o => {
      if (this.filterStatus === 'ACTIVE' && (o.status === 'COMPLETED' || o.status === 'CANCELLED')) {
        return false;
      }
      if (this.filterStatus !== 'ALL' && this.filterStatus !== 'ACTIVE' && o.status !== this.filterStatus) {
        return false;
      }
      if (this.filterType !== 'ALL' && o.type !== this.filterType) {
        return false;
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const matchesNum = o.orderNumber.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone.includes(q);
        if (!matchesNum && !matchesName && !matchesPhone) return false;
      }
      return true;
    });
  }

  // KDS Kanban Columns
  get receivedOrders(): Order[] {
    return this.db.orders().filter(o => o.status === 'RECEIVED');
  }

  get preparingOrders(): Order[] {
    return this.db.orders().filter(o => o.status === 'PREPARING');
  }

  get readyOrders(): Order[] {
    return this.db.orders().filter(o => o.status === 'READY');
  }

  get servedOrders(): Order[] {
    return this.db.orders().filter(o => o.status === 'SERVED');
  }

  // POS Menu Items for Modal
  get posMenuItems(): MenuItem[] {
    return this.db.menu().filter(item => {
      if (!item.available) return false;
      if (this.posSelectedCategory !== 'All' && item.category !== this.posSelectedCategory) {
        return false;
      }
      if (this.posSearchQuery.trim()) {
        const q = this.posSearchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || (item.hindiName && item.hindiName.toLowerCase().includes(q));
      }
      return true;
    });
  }

  get availableTables() {
    return this.db.tables().filter(t => t.status === 'AVAILABLE');
  }

  // New Order Calculations
  get ticketSubtotal(): number {
    return this.orderTicketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get ticketCgst(): number {
    const taxable = Math.max(0, this.ticketSubtotal - this.discountAmount);
    return Math.round((taxable * (this.db.profile().cgstPercent / 100)) * 100) / 100;
  }

  get ticketSgst(): number {
    const taxable = Math.max(0, this.ticketSubtotal - this.discountAmount);
    return Math.round((taxable * (this.db.profile().sgstPercent / 100)) * 100) / 100;
  }

  get ticketGrandTotal(): number {
    const taxable = Math.max(0, this.ticketSubtotal - this.discountAmount);
    return Math.round(taxable + this.ticketCgst + this.ticketSgst);
  }

  // Modal Actions
  openNewOrderModal(): void {
    this.orderTicketItems = [];
    this.newOrderType = 'DINE_IN';
    this.newOrderTableId = this.availableTables[0]?.id || '';
    this.newOrderCustomerName = '';
    this.newOrderCustomerPhone = '';
    this.newOrderInstructions = '';
    this.discountCode = '';
    this.discountAmount = 0;
    this.showNewOrderModal = true;
  }

  closeNewOrderModal(): void {
    this.showNewOrderModal = false;
  }

  addItemToTicket(menuItem: MenuItem): void {
    const existing = this.orderTicketItems.find(i => i.menuItemId === menuItem.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.orderTicketItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        hindiName: menuItem.hindiName,
        price: menuItem.price,
        quantity: 1,
        isVeg: menuItem.isVeg
      });
    }
  }

  removeItemFromTicket(index: number): void {
    this.orderTicketItems.splice(index, 1);
  }

  incrementQty(item: OrderItem): void {
    item.quantity += 1;
  }

  decrementQty(item: OrderItem, index: number): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      this.removeItemFromTicket(index);
    }
  }

  applyDiscount(): void {
    if (this.discountCode.toUpperCase() === 'ROYAL10') {
      this.discountAmount = Math.round(this.ticketSubtotal * 0.1);
    } else if (this.discountCode.toUpperCase() === 'DIWALI20') {
      this.discountAmount = Math.round(this.ticketSubtotal * 0.2);
    } else if (this.discountCode.toUpperCase() === 'FLAT100') {
      this.discountAmount = 100;
    } else {
      alert('Invalid Promo Code. Try ROYAL10, DIWALI20, or FLAT100');
    }
  }

  submitNewOrder(): void {
    if (this.orderTicketItems.length === 0) {
      alert('Please add at least one dish to the order ticket.');
      return;
    }

    let selectedTableNum: number | undefined;
    if (this.newOrderType === 'DINE_IN') {
      const table = this.db.tables().find(t => t.id === this.newOrderTableId);
      selectedTableNum = table ? table.number : undefined;
    }

    this.db.createOrder({
      type: this.newOrderType,
      tableNumber: selectedTableNum,
      tableId: this.newOrderType === 'DINE_IN' ? this.newOrderTableId : undefined,
      customerName: this.newOrderCustomerName || 'Walk-in Guest',
      customerPhone: this.newOrderCustomerPhone || '',
      items: this.orderTicketItems,
      discountAmount: this.discountAmount,
      discountCode: this.discountCode,
      specialInstructions: this.newOrderInstructions
    });

    this.closeNewOrderModal();
  }

  advanceStatus(order: Order, nextStatus: OrderStatus): void {
    this.db.updateOrderStatus(order.id, nextStatus);
  }

  cancelOrder(order: Order): void {
    if (confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) {
      this.db.updateOrderStatus(order.id, 'CANCELLED');
      if (order.tableId) {
        this.db.freeTable(order.tableId);
      }
    }
  }

  navigateToBilling(order: Order): void {
    this.router.navigate(['/billing'], { queryParams: { orderId: order.id } });
  }

  selectCustomerLookup(phone: string): void {
    const cust = this.db.customers().find(c => c.phone === phone);
    if (cust) {
      this.newOrderCustomerName = cust.name;
    }
  }
}
