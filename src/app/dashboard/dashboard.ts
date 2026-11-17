import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { Order, OrderStatus } from '../models/restaurant.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  db = inject(DatabaseService);
  auth = inject(AuthService);

  get averageOrderValue(): number {
    const orders = this.db.orders().filter(o => o.status !== 'CANCELLED');
    if (orders.length === 0) return 0;
    const total = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    return Math.round(total / orders.length);
  }

  get projectedRevenue(): number {
    return this.db.orders()
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.grandTotal, 0);
  }

  get occupancyRate(): number {
    const total = this.db.tables().length;
    if (total === 0) return 0;
    return Math.round((this.db.occupiedTablesCount() / total) * 100);
  }

  get orderTypeCounts(): { dineIn: number; takeaway: number; delivery: number } {
    const orders = this.db.orders();
    return {
      dineIn: orders.filter(o => o.type === 'DINE_IN').length,
      takeaway: orders.filter(o => o.type === 'TAKEAWAY').length,
      delivery: orders.filter(o => o.type === 'DELIVERY').length
    };
  }

  get categorySales(): { category: string; revenue: number; percent: number }[] {
    const totals: Record<string, number> = {};
    let maxRev = 1;

    for (const order of this.db.orders()) {
      if (order.status === 'CANCELLED') continue;
      for (const item of order.items) {
        const menuItem = this.db.menu().find(m => m.id === item.menuItemId || m.name === item.name);
        const cat = menuItem ? menuItem.category : 'Main Course (Curries)';
        totals[cat] = (totals[cat] || 0) + item.price * item.quantity;
        if (totals[cat] > maxRev) maxRev = totals[cat];
      }
    }

    return Object.entries(totals)
      .map(([category, revenue]) => ({
        category,
        revenue,
        percent: Math.round((revenue / maxRev) * 100)
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  get topSellingDishes(): { name: string; category: string; count: number; revenue: number; isVeg: boolean }[] {
    const counts: { [name: string]: { count: number; revenue: number; category: string; isVeg: boolean } } = {};

    for (const order of this.db.orders()) {
      for (const item of order.items) {
        if (!counts[item.name]) {
          const menuItem = this.db.menu().find(m => m.name === item.name);
          counts[item.name] = {
            count: 0,
            revenue: 0,
            category: menuItem ? menuItem.category : 'Main Course',
            isVeg: item.isVeg
          };
        }
        counts[item.name].count += item.quantity;
        counts[item.name].revenue += item.price * item.quantity;
      }
    }

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  advanceOrderStatus(order: Order): void {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      'RECEIVED': 'PREPARING',
      'PREPARING': 'READY',
      'READY': 'SERVED',
      'SERVED': 'COMPLETED',
      'COMPLETED': null,
      'CANCELLED': null
    };

    const next = flow[order.status];
    if (next) {
      this.db.updateOrderStatus(order.id, next);
      this.auth.recordAudit(`Updated ${order.orderNumber} status to ${next}`);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'RECEIVED': return 'status-received';
      case 'PREPARING': return 'status-preparing';
      case 'READY': return 'status-ready';
      case 'SERVED': return 'status-served';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  }
}
