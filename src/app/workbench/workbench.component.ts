import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropListGroup, CdkDropList, CdkDrag, DragDropModule, CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
import { AccountComponent } from '../account/account.component';
import { ContactComponent } from '../contact/contact.component';
import { FilterComponent } from '../filter/filter.component';
import { TargetGroupComponent } from '../target-group/target-group.component';
import { ConnectionService } from '../connection.service';

declare let LeaderLine: any;

interface ComponentConfig {
  name: string;
  component: any;
  id: string;
  position?: { x: number, y: number };
}

@Component({
  selector: 'app-workbench',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    DragDropModule,
    AccountComponent,
    ContactComponent,
    FilterComponent,
    TargetGroupComponent
  ],
  templateUrl: './workbench.component.html',
  styleUrl: './workbench.component.scss'
})
export class WorkbenchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('workbench', { static: true }) workbench!: ElementRef;

  availableComponents: ComponentConfig[] = [
    { name: 'Account', component: AccountComponent, id: 'account' }, // add unique ids
    { name: 'Contact', component: ContactComponent, id: 'contact' },
    { name: 'Target Group', component: TargetGroupComponent, id: 'target-group' },
    { name: 'Filter', component: FilterComponent, id: 'filter' }
  ];

  instantiatedComponents: ComponentConfig[] = [];
  selectedElements: string[] = [];
  isConnecting = false;
  connectionLines: { source: string; target: string }[] = [];
  leaderLines: InstanceType<typeof LeaderLine>[] = [];

  constructor(private connectionService: ConnectionService, private injector: Injector) { }

  ngAfterViewInit() {}

  onComponentClick(component: ComponentConfig) {
    this.instantiateComponent(component);
  }

  instantiateComponent(component: ComponentConfig) {
    const componentId = `comp-${this.instantiatedComponents.length}-${component.name.toLowerCase()}`;

    this.instantiatedComponents.push({
      ...component,
      id: componentId
    });
  }

  getInjector(componentId: string) {
    return Injector.create({
      providers: [{ provide: 'COMPONENT_ID', useValue: componentId }],
      parent: this.injector
    });
  }

  startConnecting() {
    this.isConnecting = true;
    this.selectedElements = [];
  }

  onElementClick(elementId: string) {
    if (this.isConnecting) {
      if (this.selectedElements.length < 2) {
        this.selectedElements.push(elementId);
        if (this.selectedElements.length === 2) {
          this.connectSelectedComponents();
        }
      }
    }
  }
  
  connectSelectedComponents() {
    if (this.selectedElements.length === 2) {
      const sourceId = this.selectedElements[0];
      const targetId = this.selectedElements[1];
      const sourceElement = document.getElementById(sourceId);
      const targetElement = document.getElementById(targetId);

      if (sourceElement && targetElement) {
        const sourceDot = this.findClosestDot(sourceElement, targetElement);
        const targetDot = this.findClosestDot(targetElement, sourceElement);

        const leaderLine = new LeaderLine({
          start: sourceDot,
          end: targetDot,
          path: 'grid',
          startSocket: 'auto',
          endSocket: 'auto'
        });

        this.leaderLines.push(leaderLine);

        const lineElement = document.createElement('div');
        lineElement.className = 'line';
        sourceElement.appendChild(lineElement);

        console.log(`Connecting ${sourceId} to ${targetId}`); 
        this.connectionService.addConnection(sourceElement, targetElement, lineElement);
      }

      this.connectionLines.push({ source: sourceId, target: targetId });
      this.isConnecting = false;
      this.selectedElements = [];
    }
  }

  findClosestDot(element: HTMLElement, target: HTMLElement): HTMLElement {
    const dots = element.querySelectorAll('.glowing-dot');
    let closestDot: HTMLElement = dots[0] as HTMLElement;
    let minDistance = Infinity;
    dots.forEach((dot) => {
      const dotRect = dot.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const distance = Math.hypot(dotRect.left - targetRect.left, dotRect.top - targetRect.top);

      if (distance < minDistance) {
        minDistance = distance;
        closestDot = dot as HTMLElement;
      }
    });
    return closestDot;
  }

  onDragMoved(event: CdkDragMove<ComponentConfig>, comp: ComponentConfig) {
    this.leaderLines.forEach(line => line.position());
    this.updateComponentPosition(comp.id, event.pointerPosition);
    this.connectionService.updateLineForComponent(comp.id); 
  }

  onDragEnded(event: CdkDragEnd<ComponentConfig>, comp: ComponentConfig) {
    this.leaderLines.forEach(line => line.position());
    this.updateComponentPosition(comp.id, event.source.getFreeDragPosition());  
    this.connectionService.updateLineForComponent(comp.id);
  }

  private updateComponentPosition(componentId: string, position: { x: number, y: number }) {
    const componentIndex = this.instantiatedComponents.findIndex(c => c.id === componentId);
    if (componentIndex !== -1) {
      this.instantiatedComponents[componentIndex].position = position;
    }
  }
  trackByFn(index: number, component: ComponentConfig) {
    return component.id; // Use the component ID as the unique identifier
  }
  ngOnDestroy() {
    this.leaderLines.forEach(line => line.remove());
  }
}
