$(function () {
    describe("BetterText", function () {

        it("should exist on page", function () {
            expect($).not.toBe(undefined);
            expect($.fn.betterText).not.toBe(undefined);
        });

        it("should initialize", function () {
            $('input.testInput').betterText();
        });

        it("should set and get the input value", function () {
            var item = $('.testInput'); // .testInput doesn't exist
            item.betterText('value', 'test123');
            expect(item.betterText('value')).toBe('test123');
        });

        it("should validate", function () {
            var item = $('.testInput'); // .testInput doesn't exist
            item.betterText('value', 'abc123');
            expect(item.betterText('validate', [function(value) { return value === 'abc123' ? null : 'Some error message'; }]))
                .toBe(true);
        });

        it("should not validate", function () {
            var item = $('.testInput'); // .testInput doesn't exist
            expect(item.betterText('validate', [function(value) { return value === 'abc123' ? null : 'Some error message'; }]))
                .toBe(false);
        });

    });
});
