(function() {
  var selectRange;

  selectRange = angular.module('range-selection', []);

  selectRange.controller("SelectRangeCtrl", [
    "$scope", "$element", "$attrs", "$log", "$window", function($scope, $element, $attrs, $log, $window) {
      $scope.includes = true;
      this.offset = $element[0].getBoundingClientRect().left;
      this.totalSize = $element[0].getBoundingClientRect().width;
      this.range = $scope.max - $scope.min;
      this.step = this.totalSize / this.range;
      $scope.left = $scope.start * this.step;
      $scope.width = ($scope.end - $scope.start) * this.step;
      $scope.toggleIncludes = function() {
        return $scope.$apply(function() {
          return $scope.includes = !$scope.includes;
        });
      };
      $scope.updateValues = (function(_this) {
        return function() {
          return $scope.$apply(function() {
            var size;
            $log.debug("updateValues()");
            $scope.start = ($scope.left / _this.totalSize) * _this.range;
            size = ($scope.width / _this.totalSize) * _this.range;
            $scope.end = $scope.start + size;
            $log.debug($scope.left, $scope.width, _this.totalSize);
            return $log.debug($scope.start, size, $scope.end);
          });
        };
      })(this);
      this.addBarElem = function(elem) {
        var startLeft, startWidth;
        this.barElem = elem;
        startWidth = ($scope.end - $scope.start) * this.step;
        startLeft = $scope.start * this.step;
        return $scope.startPosition(startLeft, startWidth);
      };
      return angular.element($window).on("resize", (function(_this) {
        return function() {
          _this.offset = $element[0].getBoundingClientRect().left;
          return _this.totalSize = $element[0].getBoundingClientRect().width;
        };
      })(this));
    }
  ]);

  selectRange.directive('rangeSelection', [
    "$log", function($log) {
      var conf;
      return conf = {
        restrict: "E",
        transclude: true,
        scope: {
          min: "=",
          max: "=",
          start: "=",
          end: "=",
          inclusive: "=",
          onChange: "@"
        },
        replace: true,
        controller: 'SelectRangeCtrl',
        templateUrl: "select_range/select_range.html"
      };
    }
  ]);

  selectRange.controller("SelectRangeBarCtrl", [
    "$scope", "$element", "$attrs", "$log", "$document", function($scope, $element, $attrs, $log, $document) {
      var mouseMove, mouseUp, move, movement, startEvent, startWidth;
      $log.debug("bar initialized");
      startEvent = {};
      startWidth = null;
      movement = false;
      $scope.startPosition = function(left, width) {
        if ($scope.left == null) {
          $scope.left = left;
        }
        return $scope.width != null ? $scope.width : $scope.width = width;
      };
      this.update = function(startEvent, endEvent) {
        if (startEvent.target.classList.contains("start-handle")) {
          return this.startResize(startEvent, endEvent);
        } else if (startEvent.target.classList.contains("end-handle")) {
          return this.endResize(startEvent, endEvent);
        } else {
          return $log.error("something moved");
        }
      };
      this.startResize = function(s, e) {
        var sizeChange;
        $log.debug("startResize()");
        sizeChange = s.pageX - e.pageX;
        $scope.width = startWidth + sizeChange;
        $scope.left = e.pageX - s.offsetX - $scope.mainCtrl.offset;
        return $scope.updateValues();
      };
      this.endResize = function(s, e) {
        var sizeChange;
        $log.debug("endResize()");
        sizeChange = e.pageX - s.pageX;
        $scope.width = startWidth + sizeChange;
        return $scope.updateValues();
      };
      move = function(startEvent, endEvent) {
        var newLeft;
        newLeft = endEvent.pageX - startEvent.offsetX - $scope.mainCtrl.offset;
        if (newLeft < 0) {
          newLeft = 0;
        }
        if (newLeft > $scope.mainCtrl.totalSize - startWidth) {
          newLeft = $scope.mainCtrl.totalSize - startWidth;
        }
        $scope.$apply(function() {
          return $scope.left = newLeft;
        });
        return $scope.updateValues();
      };
      mouseMove = function(event) {
        movement = true;
        return move(startEvent, event);
      };
      mouseUp = function() {
        $log.debug("mouseup");
        if (!movement) {
          $log.debug("toggle");
          $scope.toggleIncludes();
        }
        $document.off('mousemove', mouseMove);
        return $document.off('mouseup', mouseUp);
      };
      return $element.on("mousedown", function(event) {
        $log.debug("bar mousedown");
        movement = false;
        startEvent = event;
        startWidth = $element[0].clientWidth;
        if (!event.target.classList.contains("handle")) {
          $document.on('mousemove', mouseMove);
          return $document.on('mouseup', mouseUp);
        }
      });
    }
  ]);

  selectRange.directive('rangeSelectionBar', [
    "$document", "$log", "$timeout", function($document, $log, $timeout) {
      var conf;
      return conf = {
        restrict: "E",
        require: "^rangeSelection",
        replace: true,
        transclude: true,
        controller: 'SelectRangeBarCtrl',
        link: function(scope, elem, attrs, rangeSelection) {
          rangeSelection.addBarElem(elem);
          return scope.mainCtrl = rangeSelection;
        },
        templateUrl: "select_range/bar.html"
      };
    }
  ]);

  selectRange.directive("rangeSelectionHandle", [
    "$document", "$log", function($document, $log) {
      var conf;
      return conf = {
        restrict: "E",
        require: ["^rangeSelection", "^rangeSelectionBar"],
        replace: true,
        link: function(scope, elem, attrs, arg) {
          var barCtrl, mainCtrl, mouseMove, mouseUp, startEvent;
          mainCtrl = arg[0], barCtrl = arg[1];
          console.log("handle initialized");
          startEvent = {};
          elem.on("mousedown", function(event) {
            $log.debug("handle mousedown");
            event.preventDefault();
            startEvent = event;
            $document.on('mousemove', mouseMove);
            return $document.on('mouseup', mouseUp);
          });
          mouseMove = function(event) {
            $log.debug("handle mousemove");
            barCtrl.update(startEvent, event);
            return false;
          };
          return mouseUp = function() {
            $document.off('mousemove', mouseMove);
            return $document.off('mouseup', mouseUp);
          };
        },
        templateUrl: "select_range/handle.html"
      };
    }
  ]);

  selectRange.run([
    "$templateCache", function($templateCache) {
      $templateCache.put("select_range/handle.html", "<div class='handle'></div>");
      $templateCache.put("select_range/bar.html", "<div class='bar' ng-class='{includes: includes}' ng-style='{width: width, left: left}'>\n  <range-selection-handle class='start-handle'></range-selection-handle>\n  <div class='content'>\n    <span class='start pull-left'>{{start | number : 2}}</span>\n     -\n    <span class='end pull-right'>{{end | number : 2}}</span>\n  </div>\n  <range-selection-handle class='end-handle'></range-selection-handle>\n</div>");
      return $templateCache.put("select_range/select_range.html", "<div class='c-range progress' ng-class='{includes:!includes}'>\n  <range-selection-bar></range-selection-bar>\n</div>");
    }
  ]);

}).call(this);
