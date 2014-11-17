(function() {

    var module = angular.module('nzAccordiScroll', []);

    module.directive('nzAccordiScroll', function() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                stackSize: '=',
            },
            replace: true,
            template: [
                '<div class="nzAccordiScroll" ng-transclude></div>'
            ].join(' '),
            controller: function($scope) {

                var root = this;
                root.states = [];
                root.stacks = [];
                root.stackElements = [];
                root.topActive = [];
                root.bottomActive = [];
                root.topBreaks = [];
                root.bottomBreaks = [];
                root.toppedOut = 0;
                root.bottomedOut = 0;

                if ($scope.stackSize &&
                    typeof $scope.stackSize == 'object') {
                    root.maxTop = $scope.stackSize[0];
                    root.maxBottom = $scope.stackSize[1];
                } else if ($scope.stackSize) {
                    root.maxTop = $scope.stackSize;
                    root.maxBottom = $scope.stackSize;
                } else {
                    root.maxTop = null;
                    root.maxBottom = null;
                }

                console.log(root.maxTop, root.maxBottom);

                root.register = function(index, el) {
                    root.states[index] = 3;
                    root.stacks[index] = el.outerHeight();
                    root.stackElements[index] = el;
                    calculateBreaks();
                    $scope.$broadcast('build');
                };

                function calculateBreaks() {
                    root.topBreaks = [];
                    root.bottomBreaks = [];
                    for (var i = 0; i < root.stacks.length; i++) {
                        var topBreak = 0;
                        var start = i - root.maxTop >= 0 ? i - root.maxTop : 0;
                        for (var c = start; c < i; c++) {
                            topBreak += root.stacks[c];
                        }
                        var bottomBreak = 0;
                        var end = i + root.maxBottom <= root.stacks.length - 1 ? i + root.maxBottom : root.stacks.length - 1;
                        for (var b = i; b < end; b++) {
                            bottomBreak += root.stacks[b];
                        }
                        root.topBreaks[i] = topBreak;
                        root.bottomBreaks[i] = bottomBreak;
                    }
                    console.log(root.topBreaks);
                    console.log(root.bottomBreaks);
                }

                root.refresh = function() {
                    root.topBreaks = [];
                    root.bottomBreaks = [];
                    $scope.$broadcast('reregister');
                };
            },
            link: function($scope, el, attrs) {
                el.css('overflow', 'scroll');
            }
        };
    });

    module.directive('stack', function() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: true,
            replace: true,
            require: '^nzAccordiScroll',
            template: [
                '<div class="stack" ng-transclude ng-click="go()"></div>'
            ].join(' '),
            link: function($scope, el, attrs, root) {

                el.css({
                    cursor: 'pointer',
                    position: 'relative'
                });

                var container = el.closest('.nzAccordiScroll');
                var index = el.siblings(".stack").andSelf().index(el);
                var scrollTop = container.scrollTop();
                var scrollBottom = scrollTop + container.innerHeight();
                var containerTop = container[0].offsetTop;
                var elementTop = el[0].offsetTop;
                var elementRelativeTop = elementTop - containerTop;
                var elementRelativeBottom = elementRelativeTop + el.outerHeight();
                var previousHeight;
                var previousBreak;
                var nextHeight;
                var nextBreak;

                root.register(index, el);
                update();

                container.bind('scroll', update);

                $scope.go = function() {
                    container.animate({
                        scrollTop: elementRelativeTop - previousBreak
                    }, 800);
                };

                $scope.$on('$destroy', function() {
                    root.refresh();
                });

                $scope.$on('reregister', function() {
                    root.register(index, el);
                });

                $scope.$on('build', function() {
                    update();
                });


                function update() {
                    scrollTop = container.scrollTop();
                    scrollBottom = scrollTop + container.innerHeight();
                    containerTop = container[0].offsetTop;
                    elementTop = el[0].offsetTop;
                    elementRelativeTop = elementTop - containerTop;
                    elementRelativeBottom = elementRelativeTop + el.outerHeight();
                    previousBreak = root.topBreaks[index - root.toppedOut];
                    nextBreak = root.bottomBreaks[index + root.bottomedOut];

                    if (!previousHeight) {
                        previousHeight = root.stackElements[index - 1] ? root.stackElements[index - 1].outerHeight() : 0;
                    }
                    if (!nextHeight) {
                        nextHeight = root.stackElements[index + 1] ? root.stackElements[index + 1].outerHeight() : 0;
                    }

                    var state = root.states[index];
                    var pastTop = scrollTop + previousBreak + previousHeight > elementRelativeTop;
                    var pastPreviousBreak = scrollTop + previousBreak > elementRelativeTop;
                    var pastNextBreak = scrollBottom - nextBreak < elementRelativeBottom;
                    var pastBottom = scrollBottom - nextBreak - nextHeight < elementRelativeBottom;




                    // Determine State

                    if (root.states[index] === 1) {
                        if (root.states[index + root.maxTop] == 3) {
                            // Move Down
                            root.states[index] = 2;
                            root.toppedOut--;
                            return;
                        }
                        return;
                    }

                    if (root.states[index] === 2) {
                        if (root.states[index + root.maxTop] == 2) {
                            // Move Up
                            root.states[index] = 1;
                            root.toppedOut++;
                            return;
                        }
                        if (!pastTop) {
                            // Move Down
                            root.states[index] = 3;
                            update();
                            return;
                        }
                        el.css({
                            transform: 'translateY(' + (scrollTop + previousBreak - elementRelativeTop) + 'px)',
                            zIndex: 1
                        });
                        return;
                    }

                    if (root.states[index] == 3) {
                        if (pastPreviousBreak) {
                            // Move Up
                            root.states[index] = 2;
                            update();
                            return;
                        }
                        if (pastNextBreak) {
                            // Move Down
                            root.states[index] = 4;
                            update();
                            return;
                        }
                        el.css({
                            transform: 'translateY(0px)',
                            zIndex: -index + root.stacks.length
                        });
                        return;
                    }

                    if (root.states[index] === 4) {
                        if (root.states[index - root.maxBottom] == 4) {
                            // Move down
                            root.states[index] = 5;
                            root.bottomedOut++;
                            update();
                            return;
                        }
                        if (!pastBottom) {
                            // Move Down
                            root.states[index] = 3;
                            update();
                            return;
                        }
                        el.css({
                            transform: 'translateY(' + (scrollBottom - nextBreak - elementRelativeBottom) + 'px)',
                            zIndex: -index + root.stacks.length
                        });
                        return;
                    }


                    if (root.states[index] === 5) {
                        if (root.states[index - root.maxTop] == 3) {
                            // Move Up
                            root.states[index] = 4;
                            root.bottomedOut--;
                            update();
                            return;
                        }
                        el.css({
                            transform: 'translateY(0px)',
                            zIndex: -index + root.stacks.length
                        });
                        return;
                    }
                }
            },
        };
    });

})();
