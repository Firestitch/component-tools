import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'fs-examples',
  templateUrl: 'examples.component.html'
})
export class FsExamplesComponent implements OnInit {
  @Input() public title: string;
  @Input('name') public submoduleName: string;

  public loaded = false;

  private _submoduleUrl;

  constructor(private sanitizer: DomSanitizer) {
  }

  public ngOnInit() {
    this._submoduleUrl = this.sanitizer
      .bypassSecurityTrustResourceUrl(`https://${this.submoduleName}.components.firestitch.com/docs`);

    this.loaded = true;
  }

  get submoduleUrl() {
    return this._submoduleUrl;
  }
}
