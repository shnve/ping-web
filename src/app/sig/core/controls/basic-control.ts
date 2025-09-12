import Control, { Options as ControlOptions } from 'ol/control/Control';


export interface Options extends ControlOptions {
  className?: string;
  iconClassName?: string;
  text?: string;
  title?: string;
  actionOnClick?: () => void;
}

/**
 * Simple button (openlayers) display on map
 */
export class BasicControl extends Control {
  divButton: HTMLElement;
  element: HTMLElement;

  constructor(options: Options = {}) {
    const divButton = document.createElement('div');
    divButton.className = 'ol-control-button';
    divButton.innerText = options.text || '';
    divButton.title = options.title || '';
    const element = options.element || document.createElement('div');
    if (!options.element) {
      element.className = `ol-unselectable ol-control ${options.className || ''}`;
      if (options.iconClassName) {
        const divIcon = document.createElement('div');
        divIcon.className = 'ol-control-div';
        const icon = document.createElement('i');
        icon.className = options.iconClassName;
        divIcon.appendChild(icon);
        divButton.appendChild(divIcon);
      }
      element.appendChild(divButton);
    }
    super({
      ...options,
      element
    });

    this.divButton = divButton;

    if (options.actionOnClick) {
      divButton.addEventListener('click', options.actionOnClick.bind(this), false);
    }

  }

  updateTitle(newtitle: string): void {
    this.divButton.title = newtitle;
  }

  updateClass(newClass: string): void {
    this.element.className = newClass;
  }
}
