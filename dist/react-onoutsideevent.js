/**
 * A mixin for handling (effectively) onOutsideEvent for React components.
 * Note that we're not intercepting any events in this approach, and we're
 * not using double events for capturing and discarding in layers or wrappers.
 *
 * The idea is that components define function
 *
 *   handleOutsideEvent: function() { ... }
 *
 * If no such function is defined, an error will be thrown, as this means
 * either it still needs to be written, or the component should not be using
 * this mixing since it will not exhibit onOutsideEvent behaviour.
 *
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['react-dom'], factory);
  } else if (typeof exports === 'object') {
    // Node. Note that this does not work with strict
    // CommonJS, but only CommonJS-like environments
    // that support module.exports
    module.exports = factory(require('react-dom'));
  } else {
    // Browser globals (root is window)
    root.OnOutsideEvent = factory(ReactDOM);
  }
}(this, function (ReactDOM) {
  "use strict";

  // Use a parallel array because we can't use
  // objects as keys, they get toString-coerced
  var registeredComponents = [];
  var handlers = [];

  var IGNORE_CLASS = 'ignore-react-onoutsideevent';
  var DEFAULT_EVT_TYPE = 'mousedown';

  var isSourceFound = function(source, localNode) {
    if (source === localNode) {
      return true;
    }
    // SVG <use/> elements do not technically reside in the rendered DOM, so
    // they do not have classList directly, but they offer a link to their
    // corresponding element, which can have classList. This extra check is for
    // that case.
    // See: http://www.w3.org/TR/SVG11/struct.html#InterfaceSVGUseElement
    // Discussion: https://github.com/Pomax/react-onclickoutside/pull/17
    if (source.correspondingElement) {
      return source.correspondingElement.classList.contains(IGNORE_CLASS);
    }
    return source.classList.contains(IGNORE_CLASS);
  };

  var onOutsideEventMixin = {
    componentDidMount: function() {
      if (typeof this.handleOutsideEvent !== "function") {
        throw new Error("Component lacks a handleOutsideEvent(event) function for processing outside events.");
      }

      var fn = this.__outsideEventHandler = (function(localNode, eventHandler) {
        return function(evt) {
          evt.stopPropagation();
          var source = evt.target;
          var found = false;
          // If source=local then this event came from "somewhere"
          // inside and should be ignored. We could handle this with
          // a layered approach, too, but that requires going back to
          // thinking in terms of Dom node nesting, running counter
          // to React's "you shouldn't care about the DOM" philosophy.
          while(source.parentNode) {
            found = isSourceFound(source, localNode);
            if(found) return;
            source = source.parentNode;
          }
          eventHandler(evt);
        }
      }(ReactDOM.findDOMNode(this), this.handleOutsideEvent));

      var pos = registeredComponents.length;
      registeredComponents.push(this);
      handlers[pos] = fn;

      this.__activeOutsideEvents = [];

      // Only start immediately listening for outside events if there is no
      // truthy disableOnOutsideEvent prop, and a valid listenToOutsideEvent
      // prop exists.
      if (!this.props.disableOnOutsideEvent) {
        var evtTypeProp = this.props.listenToOutsideEvent || DEFAULT_EVT_TYPE;
        if (typeof evtTypeProp === 'string' || evtTypeProp instanceof Array) {
          this.enableOnOutsideEvent(evtTypeProp);
        }
      }
    },

    componentWillUnmount: function() {
      this.disableOnOutsideEvent(this.__activeOutsideEvents);
      this.__outsideEventHandler = false;
      var pos = registeredComponents.indexOf(this);
      if (pos > -1) {
        if (handlers[pos]) {
          // clean up so we don't leak memory
          handlers.splice(pos, 1);
          registeredComponents.splice(pos, 1);
        }
      }
    },

    /**
     * Can be called to explicitly enable event listening
     * for events outside of this element.
     */
    enableOnOutsideEvent: function(evtType) {
      var evtTypes = evtType || this.props.listenToOutsideEvent || DEFAULT_EVT_TYPE;
      if (typeof evtTypes === 'string') {
        evtTypes = [evtTypes];
      }

      var fn = this.__outsideEventHandler;
      var activeEvts = this.__activeOutsideEvents;
      evtTypes.forEach(function(type) {
        if (activeEvts.indexOf(type) < 0) {
          activeEvts.push(type);
          document.addEventListener(type, fn);
        }
      });
    },

    /**
     * Can be called to explicitly disable event listening
     * for events outside of this element.
     */
    disableOnOutsideEvent: function(evtType) {
      var evtTypes = evtType || this.props.listenToOutsideEvent || DEFAULT_EVT_TYPE;
      if (typeof evtTypes === 'string') {
        evtTypes = [evtTypes];
      }

      var fn = this.__outsideEventHandler;
      var activeEvts = this.__activeOutsideEvents;
      evtTypes.forEach(function(type) {
        var index = activeEvts.indexOf(type);
        if (index >= 0) {
          activeEvts.splice(index, 1);
        }
        document.removeEventListener(type, fn);
      });
    },
  };

  if ("development" !== 'production') {
    /**
     * Returns a list of all the active outside events that
     * are currently being listened for.
     */
    onOutsideEventMixin.getActiveOutsideEvents = function() {
      return this.__activeOutsideEvents;
    },

    /**
     * Returns whether or not the given even type is active.
     * If an array is provided, will return true only if
     * all of the given event types are active.
     */
    onOutsideEventMixin.isOutsideEventActive = function(evtTypes) {
      var evtTypes = evtType || this.props.listenToOutsideEvent || DEFAULT_EVT_TYPE;
      if (typeof evtTypes === 'string') {
        evtTypes = [evtTypes];
      }

      var allAreActive;
      evtTypes.forEach(function(type) {
        if (this.__activeOutsideEvents.indexOf(type) < 0) {
          allAreActive = false;
        }
      });
      return allAreActive;
    }
  }

  return onOutsideEventMixin;
}));
