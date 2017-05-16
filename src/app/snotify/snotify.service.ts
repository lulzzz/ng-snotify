import {Injectable} from '@angular/core';
import {SnotifyToast} from './toast/snotify-toast.model';
import {Subject} from 'rxjs/Subject';
import {
  SnotifyAsync, SnotifyConfig, SnotifyButtons, SnotifyInfo, SnotifyOptions, SnotifyPosition,
  SnotifyType
} from './snotify-config';
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

  /**
   * Simple is object check.
   * @param item
   * @returns {boolean}
   */
  static isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
  }

  static merge (...objects: any[]) {
    const newObject = {};
    let src;
    const objectsArray = [].splice.call(objects, 0);

    while (objectsArray.length > 0) {
      src = objectsArray.splice(0, 1)[0];
      if (SnotifyService.isObject(src)) {
        for (const property in src) {
          if (src.hasOwnProperty(property)) {
            if (SnotifyService.isObject(src[property])) {
              newObject[property] = SnotifyService.merge(newObject[property] || {}, src[property]);
            } else {
              newObject[property] = src[property];
            }
          }
        }
      }
    }

    return newObject;
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
      config: Object.assign({}, config)
    });
  }
  // TODO: Apply defaults if button not set
  confirm(title: string, body: string, config: SnotifyConfig): number {
    const buttonKeys = Object.keys(config.buttons);
    const resultButtons = {
      yes: {
        text: buttonKeys[0],
        action: config.buttons[buttonKeys[0]]
      },
      no: {
        text: buttonKeys[1],
        action: config.buttons[buttonKeys[1]]
      }
    };
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, config, {type: SnotifyType.CONFIRM}, {buttons: resultButtons, closeOnClick: false})
    });
  }
  // TODO: Apply defaults if button not set
  prompt(title: string, body: string, config: SnotifyConfig): number {
    const buttonKeys = Object.keys(config.buttons);
    const resultButtons = {
      yes: {
        text: buttonKeys[0],
        action: config.buttons[buttonKeys[0]]
      },
      no: {
        text: buttonKeys[1],
        action: config.buttons[buttonKeys[1]]
      }
    };
    return this.create({
      title: title,
      body: body,
      config: Object.assign({}, config, {type: SnotifyType.PROMPT}, {buttons: resultButtons, timeout: 0, closeOnClick: false})
    });
  }

  async(title: string, body: string, action: Promise<SnotifyAsync> | Observable<SnotifyAsync>) {
    let async: Observable<any>;
    if (action instanceof Promise) {
      async = PromiseObservable.create(action);
    } else {
      async = action;
    }

    const id = this.bare(title, body, {
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
        latestToast = SnotifyService.merge(toast, latestToast, {config: {type: type}}) as SnotifyToast;
      } else {
        latestToast = SnotifyService.merge(toast, data, {config: {type: type}}) as SnotifyToast;
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

  }

}
