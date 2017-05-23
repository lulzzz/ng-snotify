import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  /**
   * Get toast type, to select an item from the list
   * TODO: Allow user to choose an icon
   */
  @Input() types;
  constructor() { }
}
