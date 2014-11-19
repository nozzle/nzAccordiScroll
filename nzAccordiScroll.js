(function() {

    var module = angular.module('nzAccordiScroll', []);

    module.directive('nzAccordiScroll', function() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                showStacks: '=',
                collapseSize: '='
            },
            replace: true,
            template: [
                '<div class="nzAccordiScroll"><div class="nzAccordiScroll-content" ng-transclude></div></div>'
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

                root.collapseSize = $scope.collapseSize || 2;

                if (typeof $scope.showStacks != 'undefined') {
                    root.hasMaxTop = true;
                    root.hasMaxBottom = true;
                    if (typeof $scope.showStacks == 'object') {
                        root.maxTop = $scope.showStacks[0];
                        root.maxBottom = $scope.showStacks[1] + 2;
                    } else if (typeof $scope.showStacks == 'number') {
                        root.maxTop = $scope.showStacks;
                        root.maxBottom = $scope.showStacks + 2;
                    }
                    if (typeof root.maxTop != 'undefined' &&
                        root.maxTop < 1) {
                        root.maxTop = 1;
                    }

                    if (typeof root.maxBottom != 'undefined' &&
                        root.maxBottom < 3) {
                        root.maxBottom = 3;
                    }
                }




                root.register = function(index, el) {
                    root.stacks[index] = el.outerHeight() - 1;
                    root.states[index] = 3;
                    root.stackElements[index] = el;
                    if (!root.hasMaxTop) {
                        root.maxTop = root.stacks.length;
                    }
                    if (!root.hasMaxBottom) {
                        root.maxBottom = root.stacks.length;
                    }
                    calculateBreaks();
                };

                function calculateBreaks() {
                    root.topBreaks = [];
                    root.bottomBreaks = [];
                    for (var i = 0; i < root.stacks.length; i++) {
                        var topBreak = 0;
                        var start = i - root.maxTop >= 0 ? i - root.maxTop : 0;
                        for (var b = 0; b < root.stacks.length; b++) {
                            if (b > start && b <= i) {
                                topBreak += root.stacks[b];
                            }
                        }
                        var bottomBreak = 0;
                        var end = i + root.maxBottom <= root.stacks.length ? i + root.maxBottom : root.stacks.length;
                        for (var c = 0; c < root.stacks.length; c++) {
                            if (c > i && c <= end) {
                                bottomBreak += root.stacks[c];
                            }
                        }
                        root.topBreaks[i] = topBreak;
                        root.bottomBreaks[i] = bottomBreak;
                    }
                }

                root.refresh = function() {
                    root.topBreaks = [];
                    root.bottomBreaks = [];
                    $scope.$broadcast('reregister');
                };
            },
            link: function($scope, el, attrs) {
                el.css({
                    position: 'relative'
                });
                var content = el.find('.nzAccordiScroll-content').css({
                    overflowY: 'scroll',
                    height: '100%',
                    width: '100%',
                    zIndex: -1,
                    WebkitOverflowScrolling: 'touch'
                });
            }
        };
    });

    module.directive('stack', function() {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            require: '^nzAccordiScroll',
            template: [
                '<div class="stack" ng-transclude ng-click="go()"></div>'
            ].join(' '),
            link: function($scope, el, attrs, root) {

                var container = el.closest('.nzAccordiScroll');
                var content = el.closest('.nzAccordiScroll-content');

                el.css({
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all .1s linear'
                });

                var clone = el.clone().appendTo(container);

                clone.css({
                    position: 'absolute',
                    width: '100%',
                    display: 'none',
                    bottom: '0'
                });


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

                clone.click(go);
                root.register(index, el);
                angular.element(window).bind('scroll', update);
                content.bind('scroll', update);
                update();

                if (root.preScroll) {
                    clearTimeout(root.preScroll);
                }
                root.preScroll = setTimeout(function() {
                    content.animate({
                        scrollTop: content[0].scrollHeight > 800 ? 800 : content[0].scrollHeight
                    }, 0);
                    content.animate({
                        scrollTop: 0
                    }, 800);
                }, 400);

                $scope.go = go;

                function go() {
                    content.animate({
                        scrollTop: elementRelativeTop - previousBreak
                    }, 800);
                }

                $scope.$on('$destroy', function() {
                    root.refresh();
                });

                $scope.$on('reregister', function() {
                    root.register(index, el);
                });



                function update() {

                    root.toppedOut = 0;
                    root.bottomedOut = 0;
                    for (var i = root.states.length - 1; i >= 0; i--) {
                        if (root.states[i] == 1) {
                            root.toppedOut++;
                        }
                        if (root.states[i] == 5) {
                            root.bottomedOut++;
                        }
                    }

                    scrollTop = content.scrollTop();
                    scrollBottom = scrollTop + content.innerHeight();
                    contentTop = content[0].offsetTop;
                    elementTop = el[0].offsetTop;
                    elementRelativeTop = elementTop - contentTop;
                    elementRelativeBottom = elementRelativeTop + el.outerHeight();
                    previousBreak = root.topBreaks[index - root.toppedOut] ? root.topBreaks[index - root.toppedOut] : 0;
                    nextBreak = root.bottomBreaks[index + root.bottomedOut] ? root.bottomBreaks[index + root.bottomedOut] : 0;

                    if (!previousHeight) {
                        previousHeight = root.stackElements[index - 1] ? root.stackElements[index - 1].outerHeight() : 0;
                    }
                    if (!nextHeight) {
                        nextHeight = root.stackElements[index + 1] ? root.stackElements[index + 1].outerHeight() : 0;
                    }

                    var state = root.states[index];
                    var pastTop = scrollTop + previousBreak + previousHeight > elementRelativeTop;
                    var pastPreviousBreak = scrollTop + previousBreak + root.toppedOut * root.collapseSize + (index > root.maxTop ? el.outerHeight() : 0) > elementRelativeTop;
                    var pastNextBreak = scrollBottom - nextBreak - root.bottomedOut * root.collapseSize - ((root.stacks.length - 1 - index) > root.maxBottom ? el.outerHeight() : 0) < elementRelativeBottom;
                    var pastBottom = scrollBottom - nextBreak - nextHeight < elementRelativeBottom;

                    // Determine State

                    if (pastPreviousBreak) {

                        // if should be hidden
                        if (root.states[index + 1 + root.maxTop] < 3) {

                            if (root.states[index] > 1) {
                                root.states[index] = 1;
                                root.toppedOut++;
                            }

                            clone.css({
                                display: 'block',
                                top: index * root.collapseSize + 'px',
                                bottom: 'initial',
                                zIndex: -(index - root.stacks.length)
                            });

                            return;
                        } else {

                            // remove from hidden
                            if (root.states[index] == 1) {
                                root.states[index] = 2;
                                root.toppedOut--;
                            }

                            // make sticky
                            if (root.states[index] > 2) {
                                root.states[index] = 2;
                            }

                            clone.css({
                                display: 'block',
                                top: previousBreak + root.toppedOut * root.collapseSize + 'px',
                                bottom: 'initial',
                                zIndex: -(index - root.stacks.length)
                            });

                            return;
                        }
                    } else if (pastNextBreak) {

                        // if should be hidden
                        if (root.states[index + 1 - root.maxBottom] > 3) {

                            if (root.states[index] < 5) {
                                root.states[index] = 5;
                                root.bottomedOut++;
                            }

                            clone.css({
                                display: 'block',
                                bottom: (root.stacks.length - 1 - index) * root.collapseSize + 'px',
                                top: 'initial',
                                zIndex: index
                            });

                            return;
                        } else {

                            // remove from hidden
                            if (root.states[index] == 5) {
                                root.states[index] = 4;
                                root.bottomedOut--;
                            }

                            // make sticky
                            if (root.states[index] < 4) {
                                root.states[index] = 4;
                            }

                            clone.css({
                                display: 'block',
                                bottom: nextBreak + (root.bottomedOut * root.collapseSize) + 'px',
                                top: 'initial',
                                zIndex: 0
                            });

                            return;
                        }

                    } else {

                        root.states[index] = 3;

                        clone.css({
                            top: 'initial',
                            bottom: (root.stacks.length - index) * root.collapseSize + 'px',
                            zIndex: -(index - root.stacks.length),
                            display: 'none'
                        });

                        return;
                    }

                }
            },
        };
    });

})();
