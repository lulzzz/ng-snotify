import {Injectable} from '@angular/core';
import {SnotifyToast} from './toast/snotify-toast.model';
import {Subject} from 'rxjs/Subject';
import {SnotifyAsync, SnotifyConfig, SnotifyInfo, SnotifyOptions, SnotifyPosition, SnotifyType} from './snotify-config';
import {Snotify} from './snotify';
import {Observable} from 'rxjs/Observable';
import {PromiseObservable} from 'rxjs/observable/PromiseObservable';
import {Subscription} from 'rxjs/Subscription';


@Injectable()
export class SnotifyService {
  readonly emitter = new Subject<SnotifyToast[]>();
  readonly lifecycle = new Subject<SnotifyInfo>();
  readonly optionsChanged = new Subject<SnotifyOptions>();
  readonly toastChanged = new Subject<SnotifyToast>();
  readonly toastDeleted = new Subject<number>();
  private config: SnotifyConfig;
  private _options: SnotifyOptions;
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

  /**
   * Simple is object check.
   * @param item {Object<any>}
   * @returns {boolean}
   */
  static isObject(item): boolean {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
  }

  /**
   * Deep merge objects.
   * @param sources {Array<Object>}
   * @returns {Object<any>}
   */
  static mergeDeep(...sources) {
    const target = {};
    if (!sources.length) {
      return target;
    }

    while (sources.length > 0) {
      const source = sources.shift();
      if (SnotifyService.isObject(source)) {
        for (const key in source) {
          if (SnotifyService.isObject(source[key])) {
            target[key] = SnotifyService.mergeDeep(target[key], source[key]);
          } else if (Array.isArray(source[key])) {
            if (!target[key]) {
              Object.assign(target, { [key]: source[key] });
            } else {
              target[key].forEach((value, i) => {
                target[key][i] = SnotifyService.mergeDeep(value, source[key][i]);
              });
            }
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }
    }

    return target;
  }

  constructor() {
    this.config = {
      showProgressBar: true,
      timeout: 2000,
      closeOnClick: true,
      pauseOnHover: true,
      buttons: [
        {text: 'Ok', action: null, bold: true},
        {text: 'Cancel', action: null, bold: false},
      ]
    };
    this._options = {
      newOnTop: true,
      position: SnotifyPosition.right_bottom,
      maxOnScreen: 8,
      transition: 400
    };
  }

  private emmit(): void {
    this.emitter.next(this.getAll());
  }

  setConfig(config: SnotifyConfig, options?: SnotifyOptions): void {
    this.config = Object.assign(this.config, config);
    this._options = Object.assign(this._options, options);
    this.optionsChanged.next(this._options);
  }

  get options(){
    return this._options;
  }

  get(id: number): SnotifyToast {
    return this.notifications.find(toast => toast.id === id);
  }

  private getAll(): SnotifyToast[] {
    return this.notifications.slice();
  }

  private add(toast: SnotifyToast): void {
    if (this._options.newOnTop) {
      this.notifications.unshift(toast);
    } else {
      this.notifications.push(toast);
    }
    this.emmit();
  }

  remove(id?: number, remove?: boolean): void {
    if (!id) {
      return this.clear();
    } else if (remove) {
      this.notifications = this.notifications.filter(toast => toast.id !== id);
      return this.emmit();
    }
    this.toastDeleted.next(id);
  }

  clear(): void {
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
      config: Object.assign({}, this.config, config, {type: SnotifyType.SUCCESS})
    });
  }

  error(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, this.config, config, {type: SnotifyType.ERROR})
    });
  }

  info(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, this.config, config, {type: SnotifyType.INFO})
    });
  }

  warning(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, this.config, config, {type: SnotifyType.WARNING})
    });
  }

  simple(title: string, body: string, config?: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, this.config, config)
    });
  }

  confirm(title: string, body: string, config: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: SnotifyService.mergeDeep(this.config, config, {type: SnotifyType.CONFIRM}, {closeOnClick: false})
    });
  }

  prompt(title: string, body: string, config: SnotifyConfig): number {
    return this.create({
      title: title,
      body: body,
      config: SnotifyService.mergeDeep(this.config, config, {type: SnotifyType.PROMPT}, {timeout: 0, closeOnClick: false})
    });
  }

  async(title: string, body: string, action: Promise<SnotifyAsync> | Observable<SnotifyAsync>): number {
    let async: Observable<any>;
    if (action instanceof Promise) {
      async = PromiseObservable.create(action);
    } else {
      async = action;
    }

    const id = this.simple(title, body, {
      pauseOnHover: false,
      closeOnClick: false,
      timeout: 0,
      showProgressBar: false,
      type: SnotifyType.ASYNC
    });

    const toast = this.get(id);
    let latestToast = Object.assign({}, toast);

    const updateToast = (type: SnotifyType, data?: SnotifyAsync) => {
      if (!data) {
        latestToast = SnotifyService.mergeDeep(toast, latestToast, {config: {type: type}}) as SnotifyToast;
      } else {
        latestToast = SnotifyService.mergeDeep(toast, data, {config: {type: type}}) as SnotifyToast;
      }

      this.toastChanged.next(latestToast);
    };

    const subscription: Subscription = async.subscribe(
      (next?: SnotifyAsync) => {
        updateToast(SnotifyType.ASYNC, next);
      },
      (error?: SnotifyAsync) => {
        updateToast(SnotifyType.ERROR, error);
        subscription.unsubscribe();
      },
      () => {
        updateToast(SnotifyType.SUCCESS);
        subscription.unsubscribe();
      }
    );

    return id;
  }

}
