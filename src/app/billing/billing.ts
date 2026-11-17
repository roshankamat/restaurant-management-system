import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { Order, PaymentMethod } from '../models/restaurant.model';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class Billing implements OnInit {
  db = inject(DatabaseService);
  route = inject(ActivatedRoute);

  selectedOrderId: string = '';
  paymentMethod: PaymentMethod = 'UPI';
  cashTendered: number = 0;
  transactionReference: string = '';

  showPrintModal: boolean = false;
  settledSuccessMessage: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.selectedOrderId = params['orderId'];
      } else if (this.unpaidOrders.length > 0) {
        this.selectedOrderId = this.unpaidOrders[0].id;
      } else if (this.db.orders().length > 0) {
        this.selectedOrderId = this.db.orders()[0].id;
      }
    });
  }

  get unpaidOrders(): Order[] {
    return this.db.orders().filter(o => o.paymentStatus === 'PENDING' && o.status !== 'CANCELLED');
  }

  get selectedOrder(): Order | undefined {
    return this.db.orders().find(o => o.id === this.selectedOrderId);
  }

  get cashChangeReturn(): number {
    if (!this.selectedOrder || this.cashTendered <= 0) return 0;
    return Math.max(0, this.cashTendered - this.selectedOrder.grandTotal);
  }

  selectOrder(order: Order): void {
    this.selectedOrderId = order.id;
    this.cashTendered = order.grandTotal;
    this.settledSuccessMessage = '';
  }

  settleBill(): void {
    if (!this.selectedOrder) return;

    if (this.paymentMethod === 'CASH' && this.cashTendered < this.selectedOrder.grandTotal) {
      alert(`Cash tendered (₹${this.cashTendered}) is less than total bill amount (₹${this.selectedOrder.grandTotal}).`);
      return;
    }

    const orderNum = this.selectedOrder.orderNumber;
    this.db.completeAndPayOrder(this.selectedOrder.id, this.paymentMethod, this.transactionReference);

    this.settledSuccessMessage = `Order ${orderNum} has been successfully settled via ${this.paymentMethod}! Table has been marked Available.`;
    
    // Select next unpaid order if available
    setTimeout(() => {
      if (this.unpaidOrders.length > 0) {
        this.selectedOrderId = this.unpaidOrders[0].id;
      }
    }, 2000);
  }

  printThermalReceipt(): void {
    window.print();
  }
}
