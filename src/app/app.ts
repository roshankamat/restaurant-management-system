import { Component } from '@angular/core';
import { Dashboard } from './dashboard/dashboard';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [Dashboard, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

}