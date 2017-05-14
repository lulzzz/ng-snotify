import {Component, ElementRef, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {SnotifyService} from './snotify.service';
import {SnotifyToast} from './toast/snotify-toast.model';
import {Subscription} from 'rxjs/Subscription';
import {SnotifyAction, SnotifyInfo, SnotifyOptions, SnotifyPosition} from './snotify-config';

@Component({
  selector: 'app-snotify',
  templateUrl: './snotify.component.html',
  styleUrls: ['./snotify.component.css']
})
export class SnotifyComponent implements OnInit, OnDestroy {
  notifications: SnotifyToast[];
  emitter: Subscription;
  dockSize_a: number;
  dockSize_b: number | undefined;
  constructor(private service: SnotifyService, private render: Renderer2, private snotify: ElementRef) { }

  ngOnInit() {
    this.setOptions(this.service.options);
    this.service.optionsChanged.subscribe((options: SnotifyOptions) => {
      this.setOptions(options);
    });
    this.setPosition(this.service.options.position);

    this.emitter = this.service.emitter.subscribe(
      (toasts: SnotifyToast[]) => this.notifications = toasts
    );
    this.service.lifecycle.subscribe(
      (info: SnotifyInfo) => {
        switch (info.action) {
          case SnotifyAction.onInit:
            if (this.service.onInit) {
              this.service.onInit(info.toast);
            }
            break;
          case SnotifyAction.onClick:
            if (this.service.onClick) {
              this.service.onClick(info.toast);
            }
            break;
          case SnotifyAction.onHoverEnter:
            if (this.service.onHoverEnter) {
              this.service.onHoverEnter(info.toast);
            }
            break;
          case SnotifyAction.onHoverLeave:
            if (this.service.onHoverLeave) {
              this.service.onHoverLeave(info.toast);
            }
            break;
          case SnotifyAction.beforeDestroy:
            if (this.service.beforeDestroy) {
              this.service.beforeDestroy(info.toast);
            }
            break;
          case SnotifyAction.afterDestroy:
            if (this.service.afterDestroy) {
              this.service.afterDestroy(info.toast);
            }
            break;
        }
      }
    );

  }

  setOptions(options: SnotifyOptions) {
    if (this.service.options.newOnTop) {
      this.dockSize_a = -options.maxOnScreen;
      this.dockSize_b = undefined;
    } else {
      this.dockSize_a = 0;
      this.dockSize_b = options.maxOnScreen;
    }

    this.setPosition(options.position);
  }

  setPosition(position: SnotifyPosition) {
    this.render.removeAttribute(this.snotify.nativeElement, 'class');
      switch (position) {
        case SnotifyPosition.left_top:
          this.render.addClass(this.snotify.nativeElement, 'snotify-leftTop');
          break;
        case SnotifyPosition.left_center:
          this.render.addClass(this.snotify.nativeElement, 'snotify-leftCenter');
          break;
        case SnotifyPosition.left_bottom:
          this.render.addClass(this.snotify.nativeElement, 'snotify-leftBottom');
          break;
        case SnotifyPosition.right_top:
          this.render.addClass(this.snotify.nativeElement, 'snotify-rightTop');
          break;
        case SnotifyPosition.right_center:
          this.render.addClass(this.snotify.nativeElement, 'snotify-rightCenter');
          break;
        case SnotifyPosition.right_bottom:
          this.render.addClass(this.snotify.nativeElement, 'snotify-rightBottom');
          break;
        case SnotifyPosition.center_top:
          this.render.addClass(this.snotify.nativeElement, 'snotify-centerTop');
          break;
        case SnotifyPosition.center_center:
          this.render.addClass(this.snotify.nativeElement, 'snotify-centerCenter');
          break;
        case SnotifyPosition.center_bottom:
          this.render.addClass(this.snotify.nativeElement, 'snotify-centerBottom');
          break;
      }
  }


  ngOnDestroy() {
    this.emitter.unsubscribe();
  }

}
