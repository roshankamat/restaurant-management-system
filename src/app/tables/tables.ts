import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { RestaurantTable, TableStatus, TableZone } from '../models/restaurant.model';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.html',
  styleUrl: './tables.css'
})
export class Tables {
  db = inject(DatabaseService);
  router = inject(Router);

  selectedZone: string = 'All';
  selectedStatus: string = 'All';

  // Reserve modal state
  showReserveModal: boolean = false;
  reserveTableId: string = '';
  reservationData = {
    customerName: '',
    customerPhone: '',
    guests: 4,
    timeSlot: '08:00 PM',
    notes: ''
  };

  zones: TableZone[] = ['Royal AC Hall', 'Garden Courtyard', 'Shahi Cabana'];

  get filteredTables(): RestaurantTable[] {
    return this.db.tables().filter(t => {
      if (this.selectedZone !== 'All' && t.zone !== this.selectedZone) return false;
      if (this.selectedStatus !== 'All' && t.status !== this.selectedStatus) return false;
      return true;
    });
  }

  getTableOrder(table: RestaurantTable) {
    if (!table.currentOrderId) return null;
    return this.db.orders().find(o => o.orderNumber === table.currentOrderId);
  }

  setTableStatus(table: RestaurantTable, status: TableStatus): void {
    this.db.updateTableStatus(table.id, status);
  }

  freeTable(table: RestaurantTable): void {
    if (confirm(`Are you sure you want to mark Table ${table.number} as Available?`)) {
      this.db.freeTable(table.id);
    }
  }

  openReserveModal(table: RestaurantTable): void {
    this.reserveTableId = table.id;
    this.reservationData = {
      customerName: '',
      customerPhone: '',
      guests: table.capacity,
      timeSlot: '08:30 PM',
      notes: ''
    };
    this.showReserveModal = true;
  }

  closeReserveModal(): void {
    this.showReserveModal = false;
    this.reserveTableId = '';
  }

  saveReservation(): void {
    if (!this.reservationData.customerName || !this.reservationData.customerPhone) {
      alert('Please enter guest name and phone number for the reservation.');
      return;
    }

    this.db.reserveTable(this.reserveTableId, {
      customerName: this.reservationData.customerName,
      customerPhone: this.reservationData.customerPhone,
      guests: this.reservationData.guests,
      timeSlot: this.reservationData.timeSlot,
      notes: this.reservationData.notes
    });

    this.closeReserveModal();
  }

  startOrderForTable(table: RestaurantTable): void {
    // Navigate to orders with query param
    this.router.navigate(['/orders'], { queryParams: { tableNumber: table.number, tableId: table.id } });
  }

  goToBilling(table: RestaurantTable): void {
    const order = this.getTableOrder(table);
    if (order) {
      this.router.navigate(['/billing'], { queryParams: { orderId: order.id } });
    } else {
      this.router.navigate(['/billing']);
    }
  }

  checkInReservedTable(table: RestaurantTable): void {
    const res = table.reservation;
    this.db.updateTableStatus(table.id, 'OCCUPIED');
    if (res) {
      this.router.navigate(['/orders'], {
        queryParams: {
          tableNumber: table.number,
          tableId: table.id,
          customerName: res.customerName,
          customerPhone: res.customerPhone
        }
      });
    }
  }
}
