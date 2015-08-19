selectRange = angular.module 'range-selection', []

selectRange.controller "SelectRangeCtrl", ["$scope", "$element", "$attrs", "$log", "$window",
  ($scope, $element, $attrs, $log, $window) ->
    $scope.includes = true
    @offset = $element[0].getBoundingClientRect().left
    @totalSize = $element[0].getBoundingClientRect().width
    @range = $scope.max - $scope.min
    @step = @totalSize / @range

    $scope.left = $scope.start * @step
    $scope.width = ($scope.end - $scope.start) * @step

    $scope.toggleIncludes = ->
      $scope.$apply ->
        $scope.includes = !$scope.includes

    $scope.updateValues = =>
      $scope.$apply =>
        $log.debug "updateValues()"
        $scope.start = ($scope.left / @totalSize) * @range
        size = ($scope.width / @totalSize) * @range
        $scope.end = $scope.start + size
        $log.debug $scope.left, $scope.width, @totalSize
        $log.debug $scope.start, size, $scope.end

    @addBarElem = (elem) ->
      @barElem = elem
      startWidth = ($scope.end - $scope.start) * @step
      startLeft = $scope.start * @step
      $scope.startPosition(startLeft, startWidth)

    angular.element($window).on "resize", =>
      @offset = $element[0].getBoundingClientRect().left
      @totalSize = $element[0].getBoundingClientRect().width
]

selectRange.directive 'rangeSelection', ["$log", ($log) ->
  conf = {
    restrict: "E"
    transclude: true
    scope: {
      min: "="
      max: "="
      start: "="
      end: "="
      inclusive: "="
      onChange: "@"
    }
    replace: true
    controller: 'SelectRangeCtrl'
    templateUrl: "select_range/select_range.html"
  }
]

selectRange.controller "SelectRangeBarCtrl", ["$scope", "$element", "$attrs", "$log", "$document",
  ($scope, $element, $attrs, $log, $document) ->
    $log.debug "bar initialized"
    startEvent = {}
    startWidth = null
    movement = false

    $scope.startPosition = (left, width) ->
      $scope.left ?= left
      $scope.width ?= width

    @update = (startEvent, endEvent) ->
      if startEvent.target.classList.contains("start-handle")
        @startResize(startEvent, endEvent)
      else if startEvent.target.classList.contains("end-handle")
        @endResize(startEvent, endEvent)
      else
        $log.error "something moved"

    @startResize = (s, e) ->
      $log.debug "startResize()"
      sizeChange = s.pageX - e.pageX
      $scope.width = startWidth + sizeChange
      $scope.left = e.pageX - s.offsetX - $scope.mainCtrl.offset
      $scope.updateValues()

    @endResize = (s, e) ->
      $log.debug "endResize()"
      sizeChange = e.pageX - s.pageX
      $scope.width = startWidth + sizeChange
      $scope.updateValues()

    move = (startEvent, endEvent) ->
      newLeft = endEvent.pageX - startEvent.offsetX - $scope.mainCtrl.offset
      if newLeft < 0
        newLeft = 0
      if newLeft > $scope.mainCtrl.totalSize - startWidth
        newLeft = $scope.mainCtrl.totalSize - startWidth

      $scope.$apply ->
        $scope.left = newLeft

      $scope.updateValues()

    mouseMove = (event) ->
      movement = true
      move(startEvent, event)

    mouseUp = ->
      $log.debug "mouseup"
      unless movement
        $log.debug "toggle"
        $scope.toggleIncludes()

      $document.off 'mousemove', mouseMove
      $document.off 'mouseup', mouseUp

    $element.on "mousedown", (event) ->
      $log.debug "bar mousedown"
      movement = false
      startEvent = event
      startWidth = $element[0].clientWidth
      unless event.target.classList.contains("handle")
        $document.on('mousemove', mouseMove)
        $document.on('mouseup', mouseUp)
]

selectRange.directive 'rangeSelectionBar', ["$document", "$log", "$timeout", ($document, $log, $timeout)->
  conf = {
    restrict: "E"
    require: "^rangeSelection"
    replace: true
    transclude: true
    controller: 'SelectRangeBarCtrl'
    link: (scope, elem, attrs, rangeSelection) ->
      rangeSelection.addBarElem(elem)
      scope.mainCtrl = rangeSelection
    templateUrl: "select_range/bar.html"
  }
]

selectRange.directive "rangeSelectionHandle", ["$document", "$log", ($document, $log)->
  conf = {
    restrict: "E"
    require: ["^rangeSelection", "^rangeSelectionBar"]
    replace: true
    link: (scope, elem, attrs, [mainCtrl, barCtrl]) ->
      console.log "handle initialized"
      startEvent = {}
      elem.on "mousedown", (event) ->
        $log.debug "handle mousedown"
        event.preventDefault()
        startEvent = event
        $document.on('mousemove', mouseMove)
        $document.on('mouseup', mouseUp)

      mouseMove = (event) ->
        $log.debug "handle mousemove"
        barCtrl.update(startEvent, event)
        return false;

      mouseUp = ->
        $document.off 'mousemove', mouseMove
        $document.off 'mouseup', mouseUp

    templateUrl: "select_range/handle.html"
  }
]

selectRange.run ["$templateCache", ($templateCache) ->
  $templateCache.put "select_range/handle.html", """
  <div class='handle'></div>
  """

  $templateCache.put "select_range/bar.html", """
  <div class='bar' ng-class='{includes: includes}' ng-style='{width: width, left: left}'>
    <range-selection-handle class='start-handle'></range-selection-handle>
    <div class='content'>
      <span class='start pull-left'>{{start | number : 2}}</span>
       -
      <span class='end pull-right'>{{end | number : 2}}</span>
    </div>
    <range-selection-handle class='end-handle'></range-selection-handle>
  </div>
  """

  $templateCache.put "select_range/select_range.html", """
  <div class='c-range progress' ng-class='{includes:!includes}'>
    <range-selection-bar></range-selection-bar>
  </div>
  """
]