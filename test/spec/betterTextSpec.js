$(function () {
    describe("BetterText", function () {

        it("should exist on page", function () {
            expect($).not.toBe(undefined);
            expect($.fn.betterText).not.toBe(undefined);
        });

        it("should initialize", function () {
            $('input.testInput').betterText();
        });

        it("should wrap item", function () {
            expect($('.betterText').length).toBe(1);
        });

        it("should set and get the input value", function () {
            $('.testInput').betterText('value', 'test123');
            expect($('.testInput').betterText('value')).toBe('test123');
        });

    });
});
