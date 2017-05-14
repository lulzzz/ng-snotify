import {SnotifyToast} from './toast/snotify-toast.model';
export enum SnotifyType {
  SUCCESS,
  ERROR,
  WARNING,
  INFO,
  BARE,
  ASYNC
}

export enum SnotifyPosition {
  left_top = 0,
  left_center = 1,
  left_bottom = 2,

  right_top = 3,
  right_center = 4,
  right_bottom = 5,

  center_top = 6,
  center_center = 7,
  center_bottom = 8
}

export enum SnotifyAction {
  onInit = 3,
  beforeDestroy = 0,
  afterDestroy = 1,
  onClick = 10,
  onHoverEnter = 11,
  onHoverLeave = 12
}


export interface SnotifyConfig {
  timeout?: number;
  showProgressBar?: boolean;
  type?: SnotifyType;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
}

export interface SnotifyOptions {
  maxOnScreen?: number;
  newOnTop?: boolean;
  position?: SnotifyPosition;
}

export interface SnotifyInfo {
  action: SnotifyAction;
  toast: SnotifyToast;
}
