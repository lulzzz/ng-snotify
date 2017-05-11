import {Component, OnInit} from '@angular/core';
import {SnotifyService} from './snotify/snotify.service';
import {SnotifyPosition} from './snotify/snotify-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Snotify title!';
  body = 'Lorem ipsum dolor sit amet!';
  timeout = 3000;
  position_a = 1;
  position_b = 2;
  progressBar = true;
  closeClick = true;
  newTop = true;
  dockMax = 6;
  pauseHover = true;
  constructor(private snotifyService: SnotifyService) {}

  ngOnInit() {
    this.snotifyService.setConfig({
      timeout: 30000
    }, {
      newOnTop: false,
      position: [SnotifyPosition.RIGHT, SnotifyPosition.TOP]
    });
  }

  setGlobal() {
    this.snotifyService.setConfig(null, {
      newOnTop: this.newTop,
      position: [this.getPosition(this.position_b), this.getPosition(this.position_a)],
      maxOnScreen: this.dockMax
    });
  }

  getPosition(position) {
    switch (parseInt(position, 10)) {
      case 0:
        return SnotifyPosition.TOP;
      case 1:
        return SnotifyPosition.BOTTOM;
      case 2:
        return SnotifyPosition.RIGHT;
      case 3:
        return SnotifyPosition.LEFT;
    }
  }

  onSuccess() {
    this.setGlobal();
    this.snotifyService.success(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick
    });
  }
  onInfo() {
    this.setGlobal();
    this.snotifyService.info(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick
    });
  }
  onError() {
    this.setGlobal();
    this.snotifyService.error(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick
    });
  }
  onWarning() {
    this.setGlobal();
    this.snotifyService.warning(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick
    });
  }
  onBare() {
    this.setGlobal();
    this.snotifyService.bare(this.title, this.body, {
      timeout: this.timeout,
      showProgressBar: this.progressBar,
      closeOnClick: this.closeClick
    });
  }

  onClear() {
    this.snotifyService.clear();
  }

}
