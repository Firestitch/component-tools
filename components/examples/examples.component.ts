import { Component, Input } from '@angular/core';

@Component({
  selector: 'fs-examples',
  templateUrl: 'examples.component.html'
})
export class FsExamplesComponent {
  @Input() public title: string;
}
