
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

 --------------------

 See the documentation at:
 https://github.com/alexbrombal/betterText.js

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
                        obj.updatePlaceholder();
                    });
                else
                    return $(this).betterText('object').input.val();
                break;

            case 'create':
                var focus = this.find(':focus');
                this.filter('textarea, input[type=text], input[type=password]').each(function () {
                    if ($(this).betterText('object')) return;
                    new BetterText(this, options);
                });
                focus.focus();
                break;

            case 'validate':
                var result = '';
                this.each(function () {
                    var obj = $(this).betterText('object');
                    if (obj) result = obj.validate(options) || result;
                });
                return !result;
                break;

            case 'error':
                this.each(function () {
                    var obj = $(this).betterText('object');
                    if (obj) obj.error(options);
                });
        }
        return this;
    };

    $.fn.betterText.defaults = {
        wrapper: '<span></span>',
        placeholder: null,
        validate: null,
        inputClass: '',
        errorGraphic: '&#9660;'
    };

    /**
     * Settings can contain:
     *  wrapper: An element to use to wrap the input. Defaults to a <span> element.
     *  placeholder: The placeholder to overlay. Defaults to the "title" attribute of the input or textarea.
     */
    var BetterText = function (input, settings) {
        var _this = this;
        this.input = $(input);

        // Extend settings from defaults
        this.settings = $.extend($.extend({}, $.fn.betterText.defaults), settings);

        // Create the wrapper span
        this.wrapper = $(this.settings.wrapper)
            .addClass('betterText')
            .addClass(this.input[0].tagName.toLowerCase() === 'input' ? 'text' : 'textarea')
            .mousedown(function (e) {
                if($(e.target).closest('.error').length || e.target === _this.input[0]) return;
                setTimeout(function() { _this.input.focus(); });
            })
            .addClass(this.input.attr('class'));

        // Replace the input with the wrapper
        this.wrapper.insertAfter(this.input);
        this.wrapper.append(this.input);

        // if inputClass is set, apply inputClass to the input tag
        this.input.attr('class', this.settings.inputClass);

        // Insert the placeholder
        if (this.settings.placeholder === null)
            this.settings.placeholder = BetterText.isPlaceholderSupported ? null : this.input.attr('placeholder');

        if (this.settings.placeholder) {
            this.placeholder = $('<span class="placeholder"></span>')
                .html(this.settings.placeholder)
                .click(function () { _this.input.focus(); });
            this.wrapper.prepend(this.placeholder);

            this.input.bind('focus blur change keydown keyup', function (e) {
                _this.updatePlaceholder(e);
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
        this.updatePlaceholder();
        return this;
    };

    $.extend(BetterText.prototype, {

        updatePlaceholder: function (e) {
            if (!this.settings.placeholder) return;
            if (this.input.val() != '') this.placeholder.css('display', 'none');
            else if ((e && e.type == 'focus') || this.input.is(':focus')) this.placeholder.css({ display: 'block', opacity: 0.5 });
            else this.placeholder.css({ display: 'block', opacity: 1 });
        },

        /**
         * Validates the input using an array of validation functions.
         * Each function is run and if it returns an error string, validation
         * stops immediately and the error message is shown.
         * If there are no validation methods supplied, any error messages are cleared.
         */
        validate: function (validate) {
            var _this = this;
            var message = true;
            validate = validate || this.settings.validate;
            if(!validate) {
                this.error(false);
                return;
            }
            var validateOne = function(validate) {
                var error = '';
                if (validate && (error = validate(_this.input.val())))
                    return error;
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
        },

        /**
         * Displays 'text' in a floating error message bubble above the input.
         * If 'text' is true (not a string) only an 'error' class is added to the input.
         */
        error: function (text) {
            var el = this.wrapper.find('.error');
            if (text) {
                if(typeof text === 'string')
                {
                    if (!el.length) el = $('<span class="error"><span class="arrow"></span><span class="text"></span><a href="" class="close" tabindex="-1"></a></span>').appendTo(this.wrapper);
                    el.find('.arrow').html(this.settings.errorGraphic);
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
        }

    });

    BetterText.fields = [];

    /**
     * Fix the placeholders on all textfields.
     */
    BetterText.updateAll = function () {
        $.each(BetterText.fields, function () {
            this.updatePlaceholder();
        });
    };

    BetterText.isPlaceholderSupported = ('placeholder' in document.createElement('input'));

})();
