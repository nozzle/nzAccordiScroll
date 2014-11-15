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
                root.stacks = [];
                root.topStacks = [];
                root.bottomStacks = [];

                if ($scope.stackSize &&
                    typeof $scope.stackSize == 'object') {
                    root.maxTop = $scope.stackSize[0];
                    root.maxBottom = $scope.stackSize[1];
                } else if ($scope.stackSize) {
                    root.maxTop = $scope.stackSize;
                    root.maxBottom = $scope.stackSize;
                } else {
                    root.maxTop = 9999999;
                    root.maxBottom = 9999999;
                }

                console.log(root.maxTop, root.maxBottom);

                root.register = function(index, el) {
                    var topHeight = index + 1 > root.maxTop ? 4 : el.outerHeight();
                    var bottomHeight = /*index < root.maxBottom ? 4 :*/ el.outerHeight();
                    var previous = root.topStacks[index - 1];
                    root.topStacks[index] = topHeight + (previous ? previous : 0);
                    root.stacks[index] = bottomHeight;
                    calculateNexts(index, el);
                    $scope.$broadcast('build');
                };

                function calculateNexts() {
                    root.bottomStacks = [];
                    for (var i = 0; i < root.stacks.length; i++) {
                        var height = 0;
                        for (var i2 = i; i2 < root.stacks.length; i2++) {

                            height += root.stacks[i2];
                        }
                        root.bottomStacks[i] = height;
                    }
                    //root.bottomStacks = root.bottomStacks.reverse();
                    window.tanner = root.bottomStacks;
                }

                root.refresh = function() {
                    root.topStacks = [];
                    root.bottomStacks = [];
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
                var previousBuffer;
                var nextBuffer;

                root.register(index, el);
                update();

                container.bind('scroll', update);

                $scope.go = function() {
                    container.animate({
                        scrollTop: elementRelativeTop - previousBuffer
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
                    previousBuffer = root.topStacks[index - 1];
                    nextBuffer = root.bottomStacks[index + 1];
                    previousBuffer = previousBuffer ? previousBuffer : 0;
                    nextBuffer = nextBuffer ? nextBuffer : 0;

                    if (scrollTop + previousBuffer > elementRelativeTop) {
                        el.css({
                            transform: 'translateY(' + (previousBuffer + scrollTop - elementRelativeTop) + 'px)',
                            zIndex: 1
                        });
                    } else if (scrollBottom - nextBuffer < elementRelativeBottom) {
                        el.css({
                            transform: 'translateY(' + (scrollBottom - elementRelativeBottom - nextBuffer) + 'px)',
                            zIndex: -index + root.stacks.length
                        });
                    } else {
                        el.css({
                            transform: 'translateY(0px)',
                            zIndex: -index + root.stacks.length
                        });
                    }
                }
            },
        };
    });

})();
