betterText.js
=============

betterText.js is a jQuery plugin that wraps your text inputs with a span so they are easier to style consistently across browsers.

Adds placeholder support for older browsers that do not support it.

Provides a mechanism for displaying an inline error message on the input.

### Table of Contents

- [Usage](#usage)
	- [Creating a betterText element](#creating-a-bettertext-element)
	- [Using a placholder](#using-a-placholder)
	- [BetterText actions](#bettertext-actions)
		- [Getting the value from a betterText object](#getting-the-value-from-a-bettertext-object)
		- [Showing an error message](#showing-an-error-message)
		- [Validating an input's value](#validating-an-input-s-value)
- [BetterText Settings](#bettertext-settings)
- [Styling with CSS](#styling-with-css)
	- [The betterText wrapper](#the-bettertext-wrapper)
	- [Error messages](#error-messages)
	- [The placeholder](#the-placeholder)
- [License](#license)

Usage
-----

### Creating a betterText element

The most basic way to initialize a betterText element is to call the `betterText()` method on a jQuery object containing one or more text inputs: 

    $('input[type=text]').betterText();
    
The betterText plugin will have no effect on elements that are not text inputs.

Optionally, you can pass an object containing various settings to the `betterText()` method:

	$('input[type=text]').betterText({
		label: '...',
		// Other properties...
	});

Settings are described in detail below.

When creating a betterText element, the `betterText()` method returns the jQuery object so you can use method chaining.

### Using a placeholder

You can use HTML5's standard placeholder attribute on inputs. If the browser supports it, betterText will not make any change. Otherwise, betterText will provide an equivalent fallback behavior.

You can force betterText to use its own placeholder functionality (rather than standard HTML5), or provide a custom placeholder if you don't want to use the element's placeholder attribute, by using the `label` property in the settings object:

	$(selector).betterText({ label: 'My custom label' });



Check out the [CSS styling information](#styling-with-css) for information on styling placeholders.

-----

### BetterText actions

Other actions performed on a betterText element also use the `betterText` method, but will have an "action" parameter passed as the first argument, and optionally a second parameter (depending on the action).

#### Getting the value from a betterText object

	$(selector).betterText('value', 'The new text value');
	var value = $(selector).betterText('value');

The 'value' action sets the current value to the second parameter, or returns the current value if no second parameter is provided.


#### Showing an error message

	// To show an error message
	$(selector).betterText('error', 'This value is invalid.');

	// To clear an error
	$(selector).betterText('error', false);

The 'error' action will cause an span element to be inserted into the betterText wrapper.  This lets you easily display inline error messages for a field that doesn't validate.  You can style these messages however you wish.

Check out the [CSS styling information](#styling-with-css) for information on styling error messages.


#### Validating an input's value

    var success = $('...').betterText('validate', [
        function(value) {
			if (!value) {
				return "Please provide a value for this field.";
			}
        },
        // ... more validation functions
    ]);

The 'validate' action is a convenience wrapper around the 'error' action.  It allows you to specify an array of functions that validate the current value of the input. Validation functions will be called sequentially, and the first error message returned by any of the functions will be passed to the 'error' action (and therefore shown in the error box).

The return value will be true if all validation functions were successful, otherwise false if any validation function returned an error.

----------

BetterText Settings
-------------------

The settings object that you pass to the betterText initialization function can have the following properties. Also, you can set any of the properties on the `$.fn.betterText.defaults` object and they will apply automatically to any subsequent calls to `betterText()`.

- `wrapper` (default: `'<span></span>'`)
  
    This property specifies the HTML used for the wrapper element. You can use any html you want, including child elements.  The original `<input>` element will be appended to the topmost element.

- `placeholder` (default: `null`)

	The value of the placeholder text. If the value is null, it will use the input element's placeholder attribute.  Note that any other string value will force betterText to use its own placeholder fallback rather than the HTML5 standard.

- `validate` (default: `null`)

	An array of functions that automatically validate the input when the user moves focus away from the input element.

	This value gets passed to the "validate" action, so check out [Validating an input's value](#validating-an-input-s-value) for more information.

- `inputClass` (default: `''`)

	Since betterText automatically moves the input element's class attribute to the wrapper element, this value allows you to specify class names that should remain on the original input element.


----------

## Styling with CSS

#### The betterText wrapper

By default, betterText wraps text inputs with a `<span>` element, and adds a class of "betterText". It also moves any classes that were on the original input to the new wrapper element. 

For example, the following input element:

	<input type="text" name="myText" class="myTextInput" />

Would become:

	<span class="betterText myTextInput">
		<input type="text" name="myText" />
	</span>

To style this element, the following selector would work:

	.betterText.myTextInput { ... }

To style *all* betterText elements, the following selector would work:

	.betterText { ... }

BetterText does not add any styles to the original input.  You'll probably want to remove all styles from the input itself, and instead apply them to the betterText wrapper. To do this, you might use the following CSS:

	.betterText input {
	    border: 0;
	    padding: 0; 
	    margin: 0;
	    background: transparent;
	    width: 100%;
	}

These styles are included in the default stylesheet.


#### Error messages

When an error message is applied to a betterText element, the wrapper element receives an "error" class. You might style it like so:

	.betterText.error {
		border: 1px solid red;
	}

The error message itself is injected into the wrapper element, with the following structure:

	<span class="betterText error">
		<span class="error">
			<span class="text">Error message content here...</span>
			<span class="graphic"></span>
			<a href="" class="close" tabindex="-1"></a>
		<span>
		<input type="text" ... />
	</span>

The `span.graphic` element is there for you to style however you want.  You can inject content into it by passing the content to the `errorGraphic` property of the settings object (or more conveniently, using the `$.fn.betterText.defaults.errorGraphic` property).

The `a.close` element can be styled however you want, and will close the error message when clicked.


#### The placeholder

If the browser supports it, betterText will use the standard HTML5 placeholder. You can style these using the vendor-prefixed pseudo-selectors (shown below).

However, betterText's fallback behavior uses regular DOM elements, so the normal placeholder CSS pseudo-selectors will not apply to it. To style placeholders consistently across browsers, use the pseudo-selectors and the selector for the placeholder span:

	::-webkit-input-placeholder, 
	:-moz-placeholder,
	::-moz-placeholder,
	:-ms-input-placeholder,
	.betterText span.placeholder {
	   color: red;
	}

------------

License
-------

> Copyright (c) 2012 Alex Brombal

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
