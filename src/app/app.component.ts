import {Component, OnInit} from '@angular/core';
import {SnotifyService} from './snotify/snotify.service';
import {SnotifyAction, SnotifyInfo, SnotifyPosition} from './snotify/snotify-config';
import {SnotifyToast} from './snotify/toast/snotify-toast.model';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Snotify title!';
  body = 'Lorem ipsum dolor sit amet!';
  timeout = 3000;
  position = SnotifyPosition.right_bottom;
  progressBar = true;
  closeClick = true;
  newTop = true;
  dockMax = 6;
  pauseHover = true;
  constructor(private snotifyService: SnotifyService) {}

  ngOnInit() {
    this.snotifyService.setConfig({
      timeout: 3000
    }, {
      newOnTop: false,
      position: this.position
    });

    this.snotifyService.onInit = (toast: SnotifyToast) => {
      console.log('on Init', toast);
    };

    this.snotifyService.onHoverEnter = (toast: SnotifyToast) => {
      console.log('Hover enter', toast);
      toast.body = 'Hover enter';
    };

    this.snotifyService.onHoverLeave = (toast: SnotifyToast) => {
      console.log('Hover leave', toast);
      toast.body = 'Hover leave';
    };

    this.snotifyService.onClick = (toast: SnotifyToast) => {
      console.log('Clicked', toast);
      toast.body = 'Clicked';
    };

    this.snotifyService.beforeDestroy = (toast: SnotifyToast) => {
      console.log('Before Destroy', toast);
      toast.body = 'Before Destory';
    };

    this.snotifyService.afterDestroy = (toast: SnotifyToast) => {
      console.log('After Destroy', toast);
    };
  }

  setGlobal() {
    this.snotifyService.setConfig(null, {
      newOnTop: this.newTop,
      position: this.position,
      maxOnScreen: this.dockMax
    });
  }

  onSuccess() {
    this.setGlobal();
    this.snotifyService.success(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }
  onInfo() {
    this.setGlobal();
    this.snotifyService.info(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }
  onError() {
    this.setGlobal();
    this.snotifyService.error(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }
  onWarning() {
    this.setGlobal();
    this.snotifyService.warning(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }
  onBare() {
    this.setGlobal();
    this.snotifyService.bare(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }

  onAsyncLoading() {
    this.snotifyService.async(this.title, this.body,
      // new Promise((resolve, reject) => {
      //   setTimeout(() => reject(), 1000);
      //   setTimeout(() => resolve(), 1500);
      // })
      Observable.create(observer => {
          setTimeout(() => observer.next(), 2000);
          setTimeout(() => {
            observer.error();
            observer.complete();
          }, 3000);

        }
      )
    );
  }

  onConfirmation() {
    this.setGlobal();
    this.snotifyService.bare(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }

  onPrompt() {
    this.setGlobal();
    this.snotifyService.bare(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }


  onClear() {
    this.snotifyService.clear();
  }

}
