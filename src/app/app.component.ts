import {Component, OnInit} from '@angular/core';
import {SnotifyService} from './snotify/snotify.service';
import {SnotifyToast} from './snotify/toast/snotify-toast.model';
import {Observable} from 'rxjs/Observable';
import {SnotifyPosition} from './snotify/enum/SnotifyPosition.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
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
      /*
       At each callback you can change toast data directly.
       toast.title = "New Title"
       toast.body = "Some new value"
       */
    };

    this.snotifyService.onHoverEnter = (toast: SnotifyToast) => {
      console.log('Hover enter', toast);
    };

    this.snotifyService.onHoverLeave = (toast: SnotifyToast) => {
      console.log('Hover leave', toast);
    };

    this.snotifyService.onClick = (toast: SnotifyToast) => {
      console.log('Clicked', toast);
    };

    this.snotifyService.beforeDestroy = (toast: SnotifyToast) => {
      console.log('Before Destroy', toast);
    };

    this.snotifyService.afterDestroy = (toast: SnotifyToast) => {
      console.log('After Destroy', toast);
    };
  }

  /*
  Change global configuration
   */
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
  onSimple() {
    this.setGlobal();
    this.snotifyService.simple(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover
    });
  }

  onAsyncLoading() {
    this.setGlobal();
    this.snotifyService.async(this.title, this.body,
      /*
      You should pass Promise or Observable of type SnotifyConfig to change some data or do some other actions
      More information how to work with observables:
      https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/create.md
       */

      // new Promise((resolve, reject) => {
      //   setTimeout(() => reject(), 1000);
      //   setTimeout(() => resolve(), 1500);
      // })
      Observable.create(observer => {
          setTimeout(() => {
            observer.next({
              body: 'Still loading.....',
            });
            }, 1000);

        setTimeout(() => {
          observer.next({
            title: 'Success',
            body: 'Example. Data loaded!',
            config: {
              closeOnClick: true,
              timeout: 5000,
              showProgressBar: true
            }
          });
          observer.complete();
        }, 5000);

          // setTimeout(() => {
          //   observer.error({
          //     title: 'Error',
          //     body: 'Example. Error 404. Service not found',
          //   });
          // }, 6000);

        }
      )
    );
  }

  onConfirmation() {
    this.setGlobal();
    /*
    Here we pass an buttons array, which contains of 2 element of type SnotifyButton
     */
    this.snotifyService.confirm(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover,
      buttons: [
        {text: 'Yes', action: () => console.log('Clicked: Yes'), bold: false},
        {text: 'No', action: () => console.log('Clicked: No'), bold: true},
      ]
    });
  }

  onPrompt() {
    this.setGlobal();
    /*
     Here we pass an buttons array, which contains of 2 element of type SnotifyButton
     At the action of the first button we can get what user entered into input field.
     At the second we can't get it. But we can remove this toast
     */
    const id = this.snotifyService.prompt(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick,
      pauseOnHover: this.pauseHover,
      buttons: [
        {text: 'Yes', action: (text) => console.log('Said Yes: ' + text)},
        {text: 'No', action: (text) => { console.log('Said No: ' + text); this.snotifyService.remove(id); }},
      ]
    });
  }


  onClear() {
    this.snotifyService.clear();
  }

}
