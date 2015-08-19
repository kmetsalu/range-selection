# range-selection

AngularJS directive for range selection

Included range:
![Included range](https://cloud.githubusercontent.com/assets/3165311/9356642/d63b410e-468a-11e5-9b6e-bde4ff9b7788.png)

Excluded range:
![Excluded range](https://cloud.githubusercontent.com/assets/3165311/9356643/d63f15d6-468a-11e5-9c7e-8a8c9dd794df.png)

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

