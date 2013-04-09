
;(function() {


    if(typeof $ === 'undefined')
    {
        if(typeof jQuery !== 'undefined') $ = jQuery;
        else if(typeof require !== 'undefined') $ = require('jquery');
        if(typeof $ === 'undefined')
            throw "jQuery is required to use this tool.";
    }

    var defaults = $.fn.betterText.defaults;

    $.fn.betterText = function (action, options) {

        if (!action || (typeof action == 'object' && !options)) {
            options = action;
            action = 'create';
        }
        switch (action) {
            case 'object':
                return this.__betterText ? this.__betterText : (this.__betterText = new BetterText());

            case 'value':
                if (options !== undefined)
                    this.betterText('object').value = options;
                else
                    return this.betterText('object').value;
                break;

            case 'create':
                var focus = this.find(':focus');
                if (this.betterText('object')) return;
                new BetterText(this, options);
                break;

            case 'validate':
                var result = '';
                var obj = this.betterText('object');
                if (obj) result = obj.validate(options) || result;
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

    $.fn.betterText.defaults = defaults;

    var BetterText = function (input, settings) {
        var _this = this;
        this.input = $();
        this.input.__betterText = this;

        // Extend settings from defaults
        this.settings = $.extend($.extend({}, $.fn.betterText.defaults), settings);

        // Create the wrapper span
        this.wrapper = $(this.settings.wrapper).addClass('betterText');

        $(this.wrapper).data('BetterText', this);
        BetterText.fields.push(this);
        this.updatePlaceholder();
        return this;
    };

    $.extend(BetterText.prototype, {

        /**
         * No-op for unit testing.
         */
        updatePlaceholder: function () {},

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
                if (validate && (error = validate(_this.value)))
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
         * No-op for unit testing.
         */
        error: function () {}

    });

    BetterText.fields = [];

    /**
     * No-op for unit testing.
     */
    BetterText.updateAll = function () {};

    BetterText.isPlaceholderSupported = false;

})();