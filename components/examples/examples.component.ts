import {
  AfterContentChecked,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'fs-examples',
  templateUrl: 'examples.component.html'
})
export class FsExamplesComponent implements OnInit, AfterContentChecked {
  @Input() public title: string;
  @Input('name') public submoduleName: string;

  @ViewChild('body', { read: ElementRef }) public bodyRef;
  public examples: any = [];

  public loaded = false;

  private _submoduleUrl;

  constructor(public el: ElementRef,
              private sanitizer: DomSanitizer) {
  }

  public ngOnInit() {
    this._submoduleUrl = this.sanitizer
      .bypassSecurityTrustResourceUrl(`https://${this.submoduleName}.components.firestitch.com/docs`);

    this.loaded = true;
  }

  public ngAfterContentChecked() {
    this.getExampleElements()
  }

  get submoduleUrl() {
    return this._submoduleUrl;
  }

  public scrollTo(example) {
    if (this.bodyRef && this.bodyRef.nativeElement && example && example.el) {
      this.bodyRef.nativeElement.scrollTo(0, example.el.offsetTop);
    }
  }

  private getExampleElements() {
    this.examples = Array.from(
      this.el.nativeElement.querySelectorAll('fs-example')
    ).reduce((acc: any[], rowElement: any, index) => {
      const title: string = rowElement.getAttribute('title');
      if (title) {
        acc.push({el: rowElement, title: title});
      }

      return acc;
    }, []);
  }
}
