<html>
 <head></head>
 <body>
 <div class="app-container" id="business-cycle-memos" ng-app="App" ng-controller="AppCtrl as ctrl">
    <div ng-view></div>
 </div>
<script>
  window["SITE_LOCATION_URL"] = "https://dvagov.sharepoint.com/sites/VACOOMOBO/FROS/a123"; //https://dvagov.sharepoint.com/sites/VACOOMOBO/FROS/a123 
  window["APP_PAGE_LOCATION_URL"] = "https://dvagov.sharepoint.com/sites/VACOOMOBO/FROS/a123/SitePages/BCM-Updates.aspx"; //https://dvagov.sharepoint.com/sites/VACOOMOBO/FROS/a123/SitePages/BCM-Updates.aspx 

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
      "services/email.service.js",
      "services/preloader.js",
      "services/fileSelect.js",
      "components/bcm-dashboard/bcm-dashboard.js",
      "components/forms-list/forms-list.js",
      "components/assign-form/assign-form.js",
      "components/section-modal/section-modal.js",
      "components/internal-control-modal/internal-control-modal.js",
      "components/assign-form-dashboard/assign-form-dashboard.js",
      "components/update-section/update-section.js",
      "components/my-assigned-forms-dashboard/my-assigned-forms-dashboard.js",
      "components/approve-section/approve-section.js",
      "components/combine-sections/combine-sections.js",
      "components/publish-sections/publish-sections.js",
      "components/approve-dashboard/approve-dashboard.js",
      "components/combine-dashboard/combine-dashboard.js",
      "components/publish-dashboard/publish-dashboard.js",
      "components/final-approve-section/final-approve-section.js",
      "components/final-approve-dashboard/final-approve-dashboard.js",
    ];
  var styles = [
      "modules/bootstrap/css/bootstrap.min.css",
      "modules/ui-select/select.css",
      "style.css",
      "components/bcm-dashboard/bcm-dashboard.style.css",
      "components/forms-list/forms-list.style.css",
      "components/assign-form/assign-form.style.css",
      "components/section-modal/section-modal.style.css",
      "components/internal-control-modal/internal-control-modal.style.css",
      "components/assign-form-dashboard/assign-form-dashboard.style.css",
      "components/update-section/update-section.style.css",
      "components/my-assigned-forms-dashboard/my-assigned-forms-dashboard.style.css",
      "components/approve-section/approve-section.style.css",
      "components/combine-sections/combine-sections.style.css",
      "components/publish-sections/publish-sections.style.css",
      "components/approve-dashboard/approve-dashboard.style.css",
      "components/combine-dashboard/combine-dashboard.style.css",
      "components/publish-dashboard/publish-dashboard.style.css",
      "components/final-approve-section/final-approve-section.style.css",
      "components/final-approve-dashboard/final-approve-dashboard.style.css",
    ];

  for (var i = 0; i < styles.length; i++) {
    document.write(
      '<link rel="stylesheet" type="text/css" href="' +
        window.SITE_LOCATION_URL +
        "/SiteAssets/bcm-updates/" +
        styles[i] +
        "?rnd=" +
        new Date().getTime() * new Date().getTime() +
        '">'
    );
  }

  for (var i = 0; i < modules.length; i++) {
    document.write(
      '<script language="javascript" type="text/javascript" src="' +
        window.SITE_LOCATION_URL +
        "/SiteAssets/bcm-updates/" +
        modules[i] +
        '"><\/script>'
    );
  }

  for (var i = 0; i < scripts.length; i++) {
    document.write(
      '<script language="javascript" type="text/javascript" src="' +
        window.SITE_LOCATION_URL +
        "/SiteAssets/bcm-updates/" +
        scripts[i] +
        "?rnd=" +
        new Date().getTime() * new Date().getTime() +
        '"><\/script>'
    );
  }
</script>
<body>
</html>
