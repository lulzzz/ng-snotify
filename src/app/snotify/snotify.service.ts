import {Injectable} from '@angular/core';
import {SnotifyToast} from './toast/snotify-toast.model';
import {Subject} from 'rxjs/Subject';
import {SnotifyConfig, SnotifyInfo, SnotifyOptions, SnotifyPosition, SnotifyType} from './snotify-config';
import {Snotify} from './snotify';
import {Observable} from 'rxjs/Observable';
import {PromiseObservable} from 'rxjs/observable/PromiseObservable';
import {Subscription} from 'rxjs/Subscription';


@Injectable()
export class SnotifyService {
  readonly emitter = new Subject<SnotifyToast[]>();
  readonly lifecycle = new Subject<SnotifyInfo>();
  readonly optionsChanged = new Subject<SnotifyOptions>();
  readonly typeChanged = new Subject<{id: number, type: SnotifyType, closeOnClick?: boolean}>();
  readonly transitionDelay = 400;
  private config: SnotifyConfig;
  options: SnotifyOptions;
  private notifications: SnotifyToast[] = [];

  // Callbacks
  onInit: (info?: SnotifyToast) => void;
  onClick: (info?: SnotifyToast) => void;
  onHoverEnter: (info?: SnotifyToast) => void;
  onHoverLeave: (info?: SnotifyToast) => void;
  beforeDestroy: (info?: SnotifyToast) => void;
  afterDestroy: (info?: SnotifyToast) => void;

  static generateRandomId(): number {
    return Math.floor(Math.random() * (Date.now() - 1)) + 1;
  }

  constructor() {
    this.config = {
      showProgressBar: true,
      timeout: 2000,
      closeOnClick: true,
      pauseOnHover: true
    };
    this.options = {
      newOnTop: true,
      position: SnotifyPosition.right_bottom,
      maxOnScreen: 8
    };
  }

  private emmit(): void {
    this.emitter.next(this.getAll());
  }

  setConfig(config: SnotifyConfig, options?: SnotifyOptions): void {
    this.config = Object.assign(this.config, config);
    this.options = Object.assign(this.options, options);
    this.optionsChanged.next(this.options);
  }

  getConfig(id: number): SnotifyConfig {
    const config = this.get(id).config;
    if (config) {
      return Object.assign({}, this.config, config);
    } else {
      return Object.assign({}, this.config);
    }
  }

  get(id: number): SnotifyToast {
    return this.notifications.find(toast => toast.id === id);
  }

  private getAll(): SnotifyToast[] {
    return this.notifications.slice();
  }

  private add(toast: SnotifyToast): void {
    if (this.options.newOnTop) {
      this.notifications.unshift(toast);
    } else {
      this.notifications.push(toast);
    }
    this.emmit();
  }

  remove(id: number, callback: () => void): void {
    callback();
    setTimeout(() => {
      this.notifications = this.notifications.filter(toast => toast.id !== id);
      this.emmit();
    }, this.transitionDelay);
  }

  clear() {
    this.notifications = [];
    this.emmit();
  }

  private create(snotify: Snotify): number {
    const id = SnotifyService.generateRandomId();
    this.add(new SnotifyToast(id, snotify.title, snotify.body, snotify.config || null));
    return id;
  }

  success(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, config, {type: SnotifyType.SUCCESS})
    });
  }

  error(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, config, {type: SnotifyType.ERROR})
    });
  }

  info(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, config, {type: SnotifyType.INFO})
    });
  }

  warning(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, config, {type: SnotifyType.WARNING})
    });
  }

  bare(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, config, {type: SnotifyType.BARE})
    });
  }

  async(title: string, body: string, action: Promise<any> | Observable<any>) {
    let async: Observable<any>;
    if (action instanceof Promise) {
      async = PromiseObservable.create(action);
    } else {
      async = action;
    }

    const id = this.info(title, body, {
      pauseOnHover: false,
      closeOnClick: false,
      timeout: 0,
      showProgressBar: false
    });

    const toast = this.get(id);
    toast.config.type = SnotifyType.ASYNC;
    this.typeChanged.next({id, type: toast.config.type, closeOnClick: true});


    const subscription: Subscription = async.subscribe(
      (next) => {
        toast.config.type = SnotifyType.SUCCESS;
        this.typeChanged.next({id, type: toast.config.type, closeOnClick: true});
      },
      (error) => {
        toast.config.type = SnotifyType.ERROR;
        this.typeChanged.next({id, type: toast.config.type, closeOnClick: true});
        subscription.unsubscribe();
      },
      () => subscription.unsubscribe()
    );

  }

}
