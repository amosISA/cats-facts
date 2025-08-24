import { Pipe, PipeTransform, ResourceStatus } from '@angular/core';

@Pipe({
  name: 'resourceStatus',
  standalone: true,
})
export class ResourceStatusPipe implements PipeTransform {
  transform(status: ResourceStatus): string {
    console.log(status);
    switch (status) {
      case 'idle':
        return 'Idle';
      case 'error':
        return 'Error';
      case 'loading':
        return 'Loading';
      case 'resolved':
        return 'Resolved';
      case 'reloading':
        return 'Reloading';
      case 'local':
        return 'Local';
      default:
        return 'Unknown';
    }
  }
}
