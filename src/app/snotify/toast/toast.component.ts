import {
  AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2,
  ViewChild
} from '@angular/core';
import {SnotifyService} from '../snotify.service';
import {SnotifyToast} from './snotify-toast.model';
import {SnotifyAction, SnotifyType} from '../snotify-config';

@Component({
  selector: 'app-snotify-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() toast: SnotifyToast;
  @ViewChild('wrapper') wrapper: ElementRef;
  @ViewChild('progress') progressBar: ElementRef;

  frameRate = 10;

  progress: number;
  interval: any;

  types = {
    success: false,
    warning: false,
    error: false,
    info: false,
    bare: false,
    async: false,
    confirm: false,
    prompt: false,
  };

  constructor(private service: SnotifyService, private render: Renderer2, private zone: NgZone) { }

  ngOnInit() {
    console.log(this.toast);
    this.initToast();
    this.service.toastChanged.subscribe(
      (toast: SnotifyToast) => {
        if (this.toast.id === toast.id) {
          this.initToast(toast);
        }
      }
    );
  }

  initToast(toast?: SnotifyToast) {
    if (toast) {
      if (this.toast.config.type !== toast.config.type) {
        clearInterval(this.interval);
      }
      this.toast = toast;
    }

    this.setType(this.toast.config.type);
    if (this.toast.config.timeout > 0) {
      this.startTimeout(0);
    } else {
      this.toast.config.showProgressBar = false;
    }
  }

  setType(type: SnotifyType) {
    this.resetTypes();

    switch (type) {
      case SnotifyType.SUCCESS:
        this.types.success = true;
        break;
      case SnotifyType.ERROR:
        this.types.error = true;
        break;
      case SnotifyType.WARNING:
        this.types.warning = true;
        break;
      case SnotifyType.INFO:
        this.types.info = true;
        break;
      case SnotifyType.ASYNC:
        this.types.info = true;
        this.types.async = true;
        break;
      case SnotifyType.CONFIRM:
        this.types.confirm = true;
        break;
      case SnotifyType.PROMPT:
        this.types.prompt = true;
        break;
      default:
        this.types.bare = true;
        break;
    }
  }

  resetTypes() {
    this.types.info =
    this.types.error =
    this.types.warning =
    this.types.bare =
    this.types.success =
    this.types.async =
    this.types.confirm =
    this.types.prompt =
      false;
  }

  ngAfterViewInit() {
    setTimeout(() => this.onShow(), 50);
  }

  onClick() {
    this.lifecycle(SnotifyAction.onClick);
    if (this.toast.config.closeOnClick) {
      this.service.remove(this.toast.id, this.onRemove.bind(this));
      clearInterval(this.interval);
    }
  }

  onRemove() {
    this.lifecycle(SnotifyAction.beforeDestroy);
    this.render.addClass(this.wrapper.nativeElement, 'snotify-remove');
  }

  onShow() {
    this.render.addClass(this.wrapper.nativeElement, 'snotify-show');
    this.lifecycle(SnotifyAction.onInit);
  }

  onEnter() {
    this.lifecycle(SnotifyAction.onHoverEnter);
    if (this.toast.config.pauseOnHover) {
      clearInterval(this.interval);
    }
  }

  onLeave() {
    if (this.toast.config.pauseOnHover) {
      this.startTimeout(this.progress);
    }
    this.lifecycle(SnotifyAction.onHoverLeave);
  }

  onPrompt() {

  }


  startTimeout(currentProgress: number) {
    this.progress = currentProgress;
    const step = this.frameRate / this.toast.config.timeout * 100;
    this.zone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.progress += step;
        if (this.progress >= 100) {
          this.zone.run(() => {
            clearInterval(this.interval);
            this.service.remove(this.toast.id, this.onRemove.bind(this));
          });
        }
        if (this.toast.config.showProgressBar) {
          this.drawProgressBar(this.progress);
        }
      }, this.frameRate);
    });
  }

  drawProgressBar(width: number) {
    this.render.setStyle(this.progressBar.nativeElement, 'width', width + '%');
  }

  private lifecycle(action: SnotifyAction) {
    return this.service.lifecycle.next({
      action,
      toast: this.toast
    });
  }

  ngOnDestroy(): void {
    this.lifecycle(SnotifyAction.afterDestroy);
  }

}
