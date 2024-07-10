import { Component, OnInit, OnDestroy, AfterViewInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionService } from '../connection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {
  connectionSubscription!: Subscription;
  connectedComponents: string[] = ["1"];

  constructor(
    @Inject('COMPONENT_ID') public componentId: string,
    private connectionService: ConnectionService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.connectionSubscription = this.connectionService.connectionEstablished.subscribe(({ source, target }) => {
      console.log("FilterComponent received connection event for: ", this.componentId);
      if (source === this.componentId || target === this.componentId) {
        this.handleConnection(source, target);
      }
    })

  }

  ngOnDestroy(): void {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  handleConnection(source: string, target: string): void {
    console.log("we are handling connection: ", source, " -> ", target);
    const connectedId = source === this.componentId ? target : source;
    this.connectedComponents = [...this.connectedComponents, connectedId]; // Use spread operator to ensure change detection
    this.cd.detectChanges(); // Trigger change detection
    console.log(`FilterComponent connected with ${connectedId}`);
  }
}
