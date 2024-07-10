import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  connections: Record<string, { source: HTMLElement, target: HTMLElement, line: HTMLElement }> = {};
  connectionEstablished: Subject<{ source: string, target: string }> = new Subject();

  addConnection(source: HTMLElement, target: HTMLElement, line: HTMLElement) {
    const connectionId = `${source.id}-${target.id}`;
    if (!this.connections[connectionId]) {
      this.connections[connectionId] = { source, target, line };
      this.updateLine(source, target, line);
      this.connectionEstablished.next({ source: source.id, target: target.id });
      console.log(`Connection added: ${source.id} to ${target.id}`);
    } else {
      console.log(`Connection already exists: ${source.id} to ${target.id}`);
    }
  }

  updateLine(source: HTMLElement, target: HTMLElement, line: HTMLElement) {
    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const workbenchRect = source.parentElement!.getBoundingClientRect();

    const x1 = sourceRect.left + sourceRect.width / 2 - workbenchRect.left;
    const y1 = sourceRect.top + sourceRect.height / 2 - workbenchRect.top;
    const x2 = targetRect.left + targetRect.width / 2 - workbenchRect.left;
    const y2 = targetRect.top + targetRect.height / 2 - workbenchRect.top;

    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.width = `${Math.hypot(x2 - x1, y2 - y1)}px`;
    line.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
    console.log(`Line updated: ${source.id} to ${target.id}`);
  }

  updateLineForComponent(componentId: string) {
    for (const connectionId in this.connections) {
      const { source, target, line } = this.connections[connectionId];
      if (source.id === componentId || target.id === componentId) {
        this.updateLine(source, target, line);
        console.log(`Line updated for component: ${componentId}`);
      }
    }
  }
}
