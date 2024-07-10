import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkbenchComponent } from './workbench/workbench.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WorkbenchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'zge-ui';
}
