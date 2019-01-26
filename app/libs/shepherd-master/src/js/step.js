import _ from 'lodash';
import { Evented } from './evented.js';
import 'element-matches';
import { bindAdvance, bindButtonEvents, bindCancelLink, bindMethods } from './bind.js';
import { createFromHTML, parsePosition, setupPopper } from './utils.js';

/**
 * Creates incremented ID for each newly created step
 *
 * @private
 * @return {Number} The unique id for the step
 */
const uniqueId = (function() {
  let id = 0;
  return function() {
    return ++id;
  };
})();

/**
 * Class representing steps to be added to a tour
 * @extends {Evented}
 */
export class Step extends Evented {
  /**
   * Create a step
   * @param {Tour} tour The tour for the step
   * @param {Object} options The options for the step
   * @param {function} options.beforeShowPromise A function that returns a promise.
   * When the promise resolves, the rest of the `show` code for the step will execute.
   * @param {Object[]} options.buttons An array of buttons to add to the step. By default
   * we add a Next button which triggers `next()`, set this to `false` to disable.
   * @param {Object} options.buttons.button.text The HTML text of the button
   * @param {string} options.title The step's title. It becomes an `h3` at the top of the step.
   * @return {Step} The newly created Step instance
   */
  constructor(tour, options) {
    super(tour, options);
    this.tour = tour;
    bindMethods.call(this, [
      '_show',
      'cancel',
      'complete',
      'destroy',
      'hide',
      'isOpen',
      'render',
      'scrollTo',
      'show'
    ]);
    this.setOptions(options);
    this.bindAdvance = bindAdvance.bind(this);
    this.bindButtonEvents = bindButtonEvents.bind(this);
    this.bindCancelLink = bindCancelLink.bind(this);
    this.setupPopper = setupPopper.bind(this);
    return this;
  }

  /**
   * Adds buttons to the step as passed into options
   *
   * @private
   * @param {HTMLElement} content The element for the step, to append the footer with buttons to
   */
  _addButtons(content) {
    if (this.options.buttons) {
      const footer = document.createElement('footer');
      const buttons = createFromHTML('<ul class="shepherd-buttons"></ul>');

      this.options.buttons.map((cfg) => {
        const button = createFromHTML(`<li><a class="shepherd-button ${cfg.classes || ''}">${cfg.text}</a>`);
        buttons.appendChild(button);
        this.bindButtonEvents(cfg, button.querySelector('a'));
      });

      footer.appendChild(buttons);
      content.appendChild(footer);
    }
  }

  /**
   * Adds the "x" button to cancel the tour
   * @param {HTMLElement} element The step element
   * @param {HTMLElement} header The header element for the step
   * @private
   */
  _addCancelLink(element, header) {
    if (this.options.showCancelLink) {
      const link = createFromHTML('<a href class="shepherd-cancel-link"></a>');
      header.appendChild(link);

      element.classList.add('shepherd-has-cancel-link');
      this.bindCancelLink(link);
    }
  }

  /**
   * Adds text passed in as options
   *
   * @private
   * @param {HTMLElement} content The content to append the text to
   */
  _addContent(content) {
    const text = createFromHTML('<div class="shepherd-text"></div>');
    let paragraphs = this.options.text;

    if (_.isFunction(paragraphs)) {
      paragraphs = paragraphs.call(this, text);
    }

    if (paragraphs instanceof HTMLElement) {
      text.appendChild(paragraphs);
    } else {
      if (_.isString(paragraphs)) {
        paragraphs = [paragraphs];
      }

      paragraphs.map((paragraph) => {
        text.innerHTML += `<p>${paragraph}</p>`;
      });
    }

    content.appendChild(text);
  }

  /**
   * Attaches final element to default or passed location
   *
   * @private
   * @param {HTMLElement} element The element to attach
   */
  _attach(element) {
    const { renderLocation } = this.options;

    if (renderLocation) {
      if (renderLocation instanceof HTMLElement) {
        return renderLocation.appendChild(element);
      }
      if (_.isString(renderLocation)) {
        return document.querySelector(renderLocation).appendChild(element);
      }
    }
    return document.body.appendChild(element);
  }

  /**
   * Creates Shepherd element for step based on options
   *
   * @private
   * @return {HTMLElement} The DOM element for the step
   */
  _createElement() {
    const content = document.createElement('div');
    const classes = this.options.classes || '';
    const element = createFromHTML(`<div class='${classes}' data-id='${this.id}' id="${this.options.idAttribute}"}>`);
    const header = document.createElement('header');

    if (this.options.title) {
      const title = document.createElement('h3');
      title.classList.add('shepherd-title');
      title.innerHTML = `${this.options.title}`;
      header.prepend(title);
      element.classList.add('shepherd-has-title');
    }

    content.classList.add('shepherd-content');
    element.appendChild(content);
    content.appendChild(header);

    if (this.options.attachTo) {
      element.appendChild(createFromHTML('<div class="popper__arrow" x-arrow></div>'));
    }

    if (!_.isUndefined(this.options.text)) {
      this._addContent(content);
    }

    this._addButtons(content);
    this._addCancelLink(element, header);

    return element;
  }

  /**
   * Returns the tour for the step
   * @return {Tour} The tour instance
   */
  getTour() {
    return this.tour;
  }

  /**
   * Passes `options.attachTo` to `parsePosition` to get the correct `attachTo` format
   * @returns {({} & {element, on}) | ({})}
   */
  getAttachTo() {
    const opts = parsePosition(this.options.attachTo) || {};
    const returnOpts = Object.assign({}, opts);

    if (_.isString(opts.element)) {
      // Can't override the element in user opts reference because we can't
      // guarantee that the element will exist in the future.
      try {
        returnOpts.element = document.querySelector(opts.element);
      } catch(e) {
        // TODO
      }
      if (!returnOpts.element) {
        console.error(`The element for this Shepherd step was not found ${opts.element}`);
      }
    }

    return returnOpts;
  }

  /**
   * Cancel the tour
   * Triggers the `cancel` event
   */
  cancel() {
    this.tour.cancel();
    this.trigger('cancel');
  }

  /**
   * Complete the tour
   * Triggers the `complete` event
   */
  complete() {
    this.tour.complete();
    this.trigger('complete');
  }

  /**
   * Remove the step, delete the step's element, and destroy the popper for the step
   * Triggers `destroy` event
   */
  destroy() {
    if (_.isElement(this.el) && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
      delete this.el;
    }

    if (this.popper) {
      this.popper.destroy();
    }
    this.popper = null;

    this.trigger('destroy');
  }

  /**
   * Hide the step and destroy the popper
   */
  hide() {
    this.trigger('before-hide');

    if (this.el) {
      this.el.hidden = true;
      // We need to manually set styles for < IE11 support
      this.el.style.display = 'none';
    }

    document.body.removeAttribute('data-shepherd-step');

    if (this.target) {
      this.target.classList.remove('shepherd-enabled', 'shepherd-target');
    }

    if (this.popper) {
      this.popper.destroy();
    }
    this.popper = null;

    this.trigger('hide');
  }

  /**
   * Check if the step is open and visible
   * @return {*|boolean} True if the step is open and visible
   */
  isOpen() {
    return this.el && !this.el.hidden;
  }

  /**
   * Create the element and set up the popper instance
   */
  render() {
    if (!_.isUndefined(this.el)) {
      this.destroy();
    }
    this.el = this._createElement();

    if (this.options.advanceOn) {
      this.bindAdvance();
    }

    this._attach(this.el);

    this.setupPopper();
  }

  /**
   * If a custom scrollToHandler is defined, call that, otherwise do the generic
   * scrollIntoView call.
   */
  scrollTo() {
    const { element } = this.getAttachTo();

    if (_.isFunction(this.options.scrollToHandler)) {
      this.options.scrollToHandler(element);
    } else if (_.isElement(element)) {
      element.scrollIntoView();
    }
  }

  /**
   * Sets the options for the step, maps `when` to events, sets up buttons
   * @param {Object} options The options for the step
   */
  setOptions(options = {}) {
    this.options = options;
    const { when } = this.options;

    this.destroy();
    this.id = this.options.id || `step-${uniqueId()}`;

    _.forOwn(when, (handler, event) => {
      this.on(event, handler, this);
    });

    this._setUpButtons();
  }

  /**
   * Wraps `_show` and ensures `beforeShowPromise` resolves before calling show
   * @return {*|Promise}
   */
  show() {
    if (_.isFunction(this.options.beforeShowPromise)) {
      const beforeShowPromise = this.options.beforeShowPromise();
      if (!_.isUndefined(beforeShowPromise)) {
        return beforeShowPromise.then(() => this._show());
      }
    }
    this._show();
  }

  /**
   * Determines button options prior to rendering
   *
   * @private
   */
  _setUpButtons() {
    const { buttons } = this.options;
    if (buttons) {
      const buttonsAreDefault = _.isUndefined(buttons) || _.isEmpty(buttons);
      if (buttonsAreDefault) {
        this.options.buttons = [{
          text: 'Next',
          action: this.tour.next,
          classes: 'btn'
        }];
      } else {
        const buttonsAreObject = _.isPlainObject(buttons);
        // Can pass in an object which will assume a single button
        if (buttonsAreObject) {
          this.options.buttons = [this.options.buttons];
        }
      }
    }
  }

  /**
   * Triggers `before-show` then renders the element, shows it, sets up popper and triggers `show`
   * @private
   */
  _show() {
    this.trigger('before-show');

    if (!this.el) {
      this.render();
    }

    this.el.hidden = false;
    // We need to manually set styles for < IE11 support
    this.el.style.display = 'block';

    document.body.setAttribute('data-shepherd-step', this.id);

    this.setupPopper();

    if (this.options.scrollTo) {
      setTimeout(() => {
        this.scrollTo();
      });
    }

    this.trigger('show');
  }
}
