import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DOM, Logger, ReportRenderer, ReportUIFeatures, template } from 'lighthouse-viewer';

@Component({
  selector: 'ngx-lighthouse-viewer',
  template: `
    <div class="lh-root lh-vars">
      <div [innerHTML]="template"></div>
      <main class="ngx-lighthouse-viewer"></main>
      <div id="lh-log"></div>
    </div>
  `,
  styles: [],
})
export class NgxLighthouseViewerComponent implements AfterViewInit, OnChanges {
  @Input() json: any;


  @Input()  dark!: boolean;
  @Output() darkChange = new EventEmitter<boolean>();

  template;
  
  private _darkStatus!: boolean;

  private _viewInit: boolean = false;

  private _feature: any;

  private _pendingDarkStatus!: any;


  constructor() {
    this.template = template;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {json, dark} = changes;
    if (json) {
      this.generateReport();
    }

    if (dark && dark.currentValue != null && dark.currentValue !== this._darkStatus) {
      this._changeTheme();
    }
  }

  ngAfterViewInit(): void {
    this._viewInit = true;
    this.lhLogEventListener();
    this.generateReport();
  }

  lhLogEventListener = () => {
    document.addEventListener('lh-log', (e: CustomEventInit) => {
      if (e.detail.cmd === 'data' && e.detail.msg === 'toggle_theme') {
        this._onThemeChange(e.detail.data);
      }else {
        const logger = new Logger(document.querySelector('#lh-log'));
        switch (e.detail.cmd) {
          case 'log':
            logger.log(e.detail.msg);
            break;
          case 'warn':
            logger.warn(e.detail.msg);
            break;
          case 'error':
            logger.error(e.detail.msg);
            break;
          case 'hide':
            logger.hide();
            break;
          default:
        }
      }
    });
  };

  generateReport() {
    if (!this._viewInit || !this.json) {
      return;
    }

    const dom = new DOM(document);
    const renderer = new ReportRenderer(dom);

    const container = document.querySelector('main.ngx-lighthouse-viewer');

    renderer.renderReport(this.json, container);

    const features = new ReportUIFeatures(dom);
    features.initFeatures(this.json);
    this._feature = features;

    if (this._pendingDarkStatus != null) {
      this._feature.changeTheme(this._pendingDarkStatus);
      this._pendingDarkStatus = null;
    } 
  }

  _onThemeChange(darkTheme: boolean) {
    if (this._darkStatus !== darkTheme) {
      this._darkStatus = darkTheme;
      this.darkChange.emit(this._darkStatus);
    }
  }

  _changeTheme() {
    this._darkStatus = this.dark;
    if (!this._feature) {
      this._pendingDarkStatus = this._darkStatus;
      return;
    }

    this._feature.changeTheme(this._darkStatus);
  }
}
