/**
jquery.betterText.js

Copyright (c) 2012 Alex Brombal

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, 
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT 
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.




Wraps all text inputs and textareas with a span so that they are easier to style.
Adds placeholder support for older browsers.

Usage:


To initialize an input or set of inputs:

    $('input[type=text]').betterText();
    (Any selector that selects text inputs or textareas is valid)


To validate a field:

    var success = $('...').betterText('validate', [
        function(value) {
            // validate 'value' and return an error message string if it fails
        },
        // ... more validation functions
    ]);

    Each validation function will be called, until the first one returns an error message.
    The return value will be true if all validation functions were successfull,
    otherwise false if any validation function returned an error.

    The first error message returned will be shown in a floating bubble above the field.


To show an error message:

    $('...').betterText('error', 'The error message to show');

*/

; (function () {

    if(typeof $ === 'undefined')
    {
        if(typeof jQuery !== 'undefined') $ = jQuery;
        else if(typeof require !== 'undefined') $ = require('jquery');
        if(typeof $ === 'undefined')
            throw "jQuery is required to use this tool.";
    }

    $.fn.betterText = function (action, options) {

        if (!action || (typeof action == 'object' && !options)) {
            options = action;
            action = 'create';
        }
        switch (action) {
            case 'object':
                return $(this).eq(0).closest('.betterText').data('BetterText');

            case 'value':
                if (options !== undefined)
                    this.each(function () {
                        var obj = $(this).betterText('object');
                        obj.input.val(options);
                        obj.updateLabel();
                    });
                else
                    return $(this).betterText('object').input.val();
                break;

            case 'create':
                var focus = this.find(':focus');
                this.filter('input[type=text], input[type=password]').each(function () {
                    if ($(this).betterText('object')) return;
                    var t = new BetterText(this, options);
                });
                focus.focus();
                break;

            case 'validate':
                var result = '';
                this.each(function () {
                    var obj = $(this).betterText('object');
                    if (obj) result = obj.validate(options) || result;
                });
                return result;
                break;

            case 'error':
                this.each(function () {
                    var obj = $(this).betterText('object');
                    if (obj) obj.error(options);
                });
        }
        return this;
    };


    /**
    * Settings can contain:
    * 	wrapper: An element to use to wrap the input. Defaults to a <span> element.
    *  wrapperPos: CSS positioning for the wrapper. Defaults to 'relative'.
    *  label: The label to overlay. Defaults to the "title" attribute of the input or textarea.
    *  labelTop: 
    */
    var BetterText = function (input, settings) {
        var _this = this;
        this.input = $(input);

        // Extend settings from default
        this.settings = $.extend({
            wrapper: '<span></span>',
            wrapperPos: 'relative',
            label: BetterText.isPlaceholderSupported ? null : this.input.attr('placeholder'),
            labelTop: null,
            labelLeft: null
        }, settings);

        // Create the wrapper span
        this.wrapper = $(this.settings.wrapper).addClass('betterText')
					    .mousedown(function (e) { 
                            if($(e.target).closest('.error').length || e.target === _this.input[0]) return;
                            setTimeout(function() { _this.input.focus(); }); 
                        })
					    .css({ position: this.settings.wrapperPos, display: 'inline-block', cursor: 'text', 'line-height': 'normal' })
					    .addClass(this.input.attr('class'));

        // Replace the input with the wrapper
        this.wrapper.insertAfter(this.input);
        this.wrapper.append(this.input);

        this.input
            .attr('class', '')
            // "hide" the input
            .css({ 
                border: 0, 
                padding: 0, 
                margin: 0, 
                background: 'transparent', 
                'border-radius': 0, 
                '-moz-border-radius': 0, 
                '-webkit-border-radius': 0, 
                width: '100%' 
            });

        // Insert the label
        if (this.settings.label) {
            this.label = $('<span class="betterText-label"></span>');
            this.label.css({
                'position': 'absolute',
                'pointer-events': 'none',
                'cursor': 'text',
                'z-index': 1,
                'background': '#FFF',
                'transition': 'opacity 1s',
                'white-space' : 'nowrap',
                'overflow': 'hidden'
            });
            
            if (this.settings.labelTop !== null) this.label.css('top', this.settings.labelTop + parseInt(this.wrapper.css('padding-top')));
            if (this.settings.labelLeft !== null) this.label.css('left', this.settings.labelLeft + + parseInt(this.wrapper.css('padding-left')));

            this.label.html(this.settings.label);
            this.label.click(function () { _this.input.focus(); });
            this.wrapper.prepend(this.label);

            this.input.bind('focus blur change keydown keyup', function (e) {
                _this.updateLabel(e);
            });
        }

        // Bind the focus attacher
        this.input.bind('focus blur', function (e) {
            $(this).closest('.betterText').toggleClass('focus', e.type == 'focus');
            if (e.type == 'blur')
                _this.validate();
        });

        $(window).blur(function() {
            _this.input.trigger('change');
        });

        $(this.wrapper).data('BetterText', this);
        BetterText.fields.push(this);
        this.updateLabel();
        return this;
    };


    BetterText.prototype.updateLabel = function (e) {
        if (!this.settings.label) return;
        if (this.input.val() != '') this.label.css('display', 'none');
        else if ((e && e.type == 'focus') || this.input.is(':focus')) this.label.css({ display: 'block', opacity: 0.5 });
        else this.label.css({ display: 'block', opacity: 1 });
    };

    /**
     * Validates the input using an array of validation functions.
     * Each function is run and if it returns an error string, validation
     * stops immediately and the error message is shown.
     * If there are no validation methods supplied, any error messages are cleared.
     */
    BetterText.prototype.validate = function (validate) {
        var _this = this;
        var message = true;
        validate = validate || this.settings.validate;
        if(!validate) {
            this.error(false);
            return;
        }
        var validateOne = function (v) {
            var e = '';
            if (v && (e = v(_this.input.val())))
                return e;
            return '';
        };
        if (validate.constructor === Array && validate.length) {
            for (var i = 0, ii = validate.length; i < ii; i++)
                if (message = validateOne(validate[i]))
                    break;
        }
        else if(validate.constructor === Function) 
            message = validateOne(validate);
        this.error(message);
        return message;
    };

    /**
     * Displays 'text' in a floating error message bubble above the input. 
     * If 'text' is true (not a string) only an 'error' class is added to the input.
     */
    BetterText.prototype.error = function (text) {
        var el = this.wrapper.find('.error');
        if (text) {
            if(typeof text === 'string')
            {
                if (!el.length) el = $('<span class="error"><span class="arrow">&#9660;</span><span class="text"></span><a href="" class="close" tabindex="-1"></a></span>').appendTo(this.wrapper);
                el.find('.text').html(text);
                el.find('a').click(function () { $(this).closest('.error').remove(); return false; });
            }
            this.wrapper.addClass('error');
            return false;
        }
        else {
            el.remove();
            this.wrapper.removeClass('error');
            return true;
        }
    };

    BetterText.fields = [];

    /**
     * Fix the placeholders on all textfields.
     */
    BetterText.updateAll = function () {
        $.each(BetterText.fields, function () {
            this.updateLabel();
        });
    };

    BetterText.isPlaceholderSupported = ('placeholder' in document.createElement('input'));

})();