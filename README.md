# range-selection

AngularJS directive for range selection

# Usage

### Add bootstrap CSS and AngularJS to your project
	
	<script src="/path/to/angularjs/angular.min.js"></script>
	<link href="/path/to/bootstrap/bootstrap.css" rel="stylesheet">

### Add new module.

	<link href="/path/to/range-selection/dist/range-selection.css" rel="stylesheet">
	<script src="/path/to/range-selection/dist/range-selection.js"></script>

### Import module 
	
	app = angular.module "my-app", ["range-selection"]

### In HTML

	<div>
		<selection-range min="0" max="100" start="25" end="35"></selection-range>
	</div>

