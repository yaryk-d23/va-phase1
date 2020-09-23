<html>
 <head></head>
 <body>
 <div class="app-container" id="business-cycle-memos" ng-app="App" ng-controller="AppCtrl as ctrl">
    <div ng-view></div>
 </div>
<script>
  window["SITE_LOCATION_URL"] = "https://chironitcom.sharepoint.com/sites/Demo/va"; //https://dvagov.sharepoint.com/sites/VACOOMOBO/FROS/a123 Relative
  window["SITE_RELATIVE_URL"] = "/sites/Demo/va"; ///sites/VACOOMOBO/FROS/a123 

  var modules = [
      //modules
      "modules/angular/angular.min.js",
      "modules/angular/angular-route.min.js",
      "modules/angular/angular-animate.min.js",
      "modules/angular/angular-sanitize.min.js",
      "modules/angular/angular-touch.min.js",
      "modules/jquery-1.12.4.min.js",
      "modules/bootstrap/js/bootstrap.min.js",
      "modules/bootstrap/js/ui-bootstrap-tpls-2.5.0.min.js",
      "modules/ui-select/select.js",
      
    ];
var scripts = [

      //app
      "app.js",
      "services/api.service.js",
      "services/preloader.js",
      "services/fileSelect.js",
      "components/bcm-dashboard/bcm-dashboard.js",
      "components/forms-list/forms-list.js",
      "components/assign-form/assign-form.js",
      "components/section-modal/section-modal.js",
    ];
  var styles = [
      "modules/bootstrap/css/bootstrap.min.css",
      "modules/ui-select/select.css",
      "style.css",
      "components/bcm-dashboard/bcm-dashboard.style.css",
      "components/forms-list/forms-list.style.css",
      "components/assign-form/assign-form.style.css",
      "components/section-modal/section-modal.style.css",
    ];

  for (var i = 0; i < styles.length; i++) {
    document.write(
      '<link rel="stylesheet" type="text/css" href="' +
        window.SITE_LOCATION_URL +
        "/SiteAssets/app/" +
        styles[i] +
        "?rnd=" +
        new Date().getTime() +
        '">'
    );
  }

  for (var i = 0; i < modules.length; i++) {
    document.write(
      '<script language="javascript" type="text/javascript" src="' +
        window.SITE_LOCATION_URL +
        "/SiteAssets/app/" +
        modules[i] +
        '"><\/script>'
    );
  }

  for (var i = 0; i < scripts.length; i++) {
    document.write(
      '<script language="javascript" type="text/javascript" src="' +
        window.SITE_LOCATION_URL +
        "/SiteAssets/app/" +
        scripts[i] +
        "?rnd=" +
        new Date().getTime() +
        '"><\/script>'
    );
  }
</script>
<body>
</html>
