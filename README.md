# An onOutsideEvent mixin for React components

This is a React mixin that you can add to your React components if you want to have them listen for events that occur somewhere in the document, outside of the element itself (for instance, if you need to hide a menu when people click anywhere else on your page).

Note that this mixin relies on the `.classList` property, which is supported by all modern browsers, but not by no longer supported browsers like IE8 or even older. For setups that need to support deprecated browsers, using something like the [MDN classlist-polyfill](https://www.npmjs.com/package/classlist-polyfill) will be necessary.

## installation

There are two ways to install this mixin, depending on your development process.

### NPM

If you have Node.js needs, you can install this mixin via `npm`, using:

```
npm install react-onoutsideevent --save
```

(or `--save-dev` depending on your needs). You then use it in your components as:

```
var Component = React.createClass({
  mixins: [
    require('react-onoutsideevent')
  ],

  handleOutsideEvent: function(evt) {
    // ...handling code goes here...
  }
});
```
### For the browser (not recommended)

If you have plain-old-browser needs and for some reason are unable to use the modern browserify/webpack approach to building your JS payloads, you can install this mixin via `bower`, using:

```
bower install react-onoutsideevent
```

and then include it as script via:

```
<script src="bower_components/react-onoutsideevent/index.js"></script>
```

Then use it as:

```
var Component = React.createClass({
  mixins: [
    onoutsideevent
  ],

  handleOutsideEvent: function(evt) {
    // ...handling code goes here...
  }
});
```

## Regulate whether or not to listen for outside events

When using this mixin, a component has two functions that can be used to explicitly listen for, or do nothing with, outside events

- `enableOnOutsideEvent()` - Enables outside click listening by setting up the event listening bindings.
- `disableOnOutsideEvent()` - Disables outside click listening by explicitly removing the event listening bindings.
 
In addition, you can create a component that uses this mixin such that it has the code set up and ready to go, but not listening for outside events until you explicitly issue its `enableOnOutsideEvent()`, by passing in a properly called `disableonoutsideevent`:

```
var Component = React.createClass({
  mixins: [ ... ],
  handleOutsideEvent: function(evt) {
    // ...
  }
});

var Container = React.createClass({
  render: function(evt) {
    return <Component disableonoutsideevent={true} />
  }
});
```

## Marking elements as "skip over this one" during the event loop

If you want the mixin to ignore certain elements, then add the class `ignore-react-onoutsideevent` to that element and the callback won't be invoked when the click happens inside elements with that class.

For bugs and enhancements hit up https://github.com/Pomax/react-onoutsideevent/issues
