(function() {

    var module = angular.module('nzAccordiScroll', []);

    module.directive('nzAccordiScroll', function() {
        return {
            restrict: 'EA',
            transclude: true,
            scope: true,
            replace: true,
            template: [
                '<div class="nzAccordiScroll" ng-transclude></div>'
            ].join(' '),
            controller: function($scope) {
                var _this = this;
                _this.stacks = [];
                _this.topStacks = [];

                _this.register = function(index, el) {
                    var height = el.outerHeight();
                    var previous = _this.topStacks[index - 1];
                    _this.stacks[index] = height;
                    _this.topStacks[index] = height + (previous ? previous : 0);
                    calculateNexts(index, el);
                    $scope.$broadcast('build');
                };

                function calculateNexts() {
                    _this.bottomStacks = [];
                    for (var i = 0; i < _this.stacks.length; i++) {
                        var height = 0;
                        for (var i2 = i; i2 < _this.stacks.length; i2++) {
                            height += _this.stacks[i2];
                        }
                        _this.bottomStacks[i] = height;
                    }
                    //_this.bottomStacks = _this.bottomStacks.reverse();
                    window.tanner = _this.bottomStacks;
                }

                _this.refresh = function() {
                    _this.topStacks = [];
                    _this.bottomStacks = [];
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
                '<div class="stack" ng-transclude></div>'
            ].join(' '),
            link: function($scope, el, attrs, parentCtrl) {

                var container = el.closest('.nzAccordiScroll');
                var index = el.siblings(".stack").andSelf().index(el);

                parentCtrl.register(index, el);
                update();

                container.bind('scroll', update);

                $scope.$on('$destroy', function() {
                    parentCtrl.refresh();
                });

                $scope.$on('reregister', function() {
                    parentCtrl.register(index, el);
                });

                $scope.$on('build', function() {
                    update();
                });

                function update() {
                    var scrollTop = container.scrollTop();
                    var scrollBottom = scrollTop + container.innerHeight();
                    var containerTop = container[0].offsetTop;
                    var elementTop = el[0].offsetTop;
                    var elementRelativeTop = elementTop - containerTop;
                    var elementRelativeBottom = elementRelativeTop + el.outerHeight();
                    var previousBuffer = parentCtrl.topStacks[index - 1];
                    var nextBuffer = parentCtrl.bottomStacks[index + 1];
                    previousBuffer = previousBuffer ? previousBuffer : 0;
                    nextBuffer = nextBuffer ? nextBuffer : 0;

                    console.log(nextBuffer);

                    if (scrollTop + previousBuffer > elementRelativeTop) {
                        el.css({
                            transform: 'translateY(' + (previousBuffer + scrollTop - elementRelativeTop) + 'px)'
                        });
                    } else if (scrollBottom - nextBuffer < elementRelativeBottom) {
                        el.css({
                            transform: 'translateY(' + (scrollBottom - elementRelativeBottom - nextBuffer) + 'px)',
                        });
                    } else {
                        el.css({
                            transform: 'translateY(0px)',
                        });
                    }
                }
            },
        };
    });

})();
