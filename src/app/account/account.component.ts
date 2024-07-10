import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ZielgruppenService } from '../zielgruppen.service';
import { ConnectionService } from '../connection.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [],
  providers: [],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent implements OnInit, OnChanges, OnDestroy {
  @Input() componentId!: string;

  accounts: any;
  accountCount: number = 0;
  private connectionSubscription!: Subscription;
  private dataSubscription!: Subscription;

  constructor(
    @Inject('COMPONENT_ID') public compId: string, 
    private zielgruppenService: ZielgruppenService, 
    private connectionService: ConnectionService
  ) {
    console.log(`AccountComponent constructor called with componentId: ${this.compId}`);
  }

  ngOnInit(): void {
    console.log(`AccountComponent ngOnInit called with componentId: ${this.compId}`);
    this.fetchAccounts();
    this.subscribeToConnection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`AccountComponent ngOnChanges called with changes: ${JSON.stringify(changes)}`);
  }

  ngOnDestroy(): void {
    console.log(`AccountComponent ngOnDestroy called with componentId: ${this.compId}`);
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private fetchAccounts(): void {
    this.dataSubscription = this.zielgruppenService.getAccounts().subscribe(response => {
      this.accounts = response;
      this.accountCount = this.accounts ? this.accounts.length : 0;
      console.log('Accounts fetched', response);
    });
  }

  private subscribeToConnection(): void {
    this.connectionSubscription = this.connectionService.connectionEstablished.subscribe(({ source, target }) => {
      console.log(`AccountComponent received connection event with source: ${source}, target: ${target}`);
    });
  }
}
