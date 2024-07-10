import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ZielgruppenService } from '../zielgruppen.service';
import { ConnectionService } from '../connection.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  providers: [],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit, OnChanges, OnDestroy {
  contacts: any;
  contactsCount: number = 0;
  private connectionSubscription!: Subscription;
  private dataSubscription!: Subscription;
  connectedComponents: string[] = [];

  constructor(
    @Inject('COMPONENT_ID') public componentId: string, 
    private zielgruppenService: ZielgruppenService, 
    private connectionService: ConnectionService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log("ngOnInit in contact");
    this.fetchContacts();
    this.subscribeToConnection();
  }

  ngAfterViewInit(): void {
    console.log(`ContactComponent view initialized with ID: ${this.componentId}`);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("we see changes in the component contact", changes);
  }

  ngOnDestroy(): void {
    console.log("ngOnDestroy contact");
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  private fetchContacts(): void {
    this.dataSubscription = this.zielgruppenService.getContacts().subscribe(response => {
      console.log(response);
      console.log(JSON.stringify(response, null, 2));
      this.contacts = response;
      this.contactsCount = this.contacts ? this.contacts.length : 0;
      console.log('Contacts fetched', response);
    });
  }

  private subscribeToConnection(): void {
    this.connectionSubscription = this.connectionService.connectionEstablished.subscribe(({ source, target }) => {
      if (source === this.getElementId() || target === this.getElementId()) {
        this.handleConnection(source, target);
        this.cd.markForCheck();
      }
    });
  }

  handleConnection(source: string, target: string): void {
    // Handle connection logic here, e.g., initiate communication
    console.log(`ContactComponent connected with ${source === this.getElementId() ? target : source}`);
  }

  private getElementId(): string {
    return this.componentId;
  }
}
