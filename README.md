# AEM Mobile: _hybrid reference app_

This is a basic AEM Mobile Hybrid reference application authored using [Ionic Framework](http://ionicframework.com/).

It includes:

1. Mobile application written in [Ionic Framework](http://ionicframework.com/)
2. ContentSync OTA updates
3. Basic authentication
4. Extensions to add authorable pages for: locations, events, and about us.
5. Native device feature support with: location services, beacons, camera, accelerometer, file system, file transfer and, vibration.

## Minimum requirements for development

1. Maven (tested: Apache Maven `3.2.2`)
2. Git (tested: git version `2.3.2`)
3. Xcode (tested: `6.4`)
4. Cordova (tested: `5.3.3`)
5. [node.js](http://nodejs.org/) version `>=0.12.x`
6. AEM 6.1 
    - AEM [Service Pack 1](https://www.adobeaemcloud.com/content/marketplace/marketplaceProxy.html?packagePath=/content/companies/public/adobe/packages/cq610/servicepack/AEM-6.1-Service-Pack-1)
    - Apps [Feature Pack 3](https://www.adobeaemcloud.com/content/marketplace/marketplaceProxy.html?packagePath=/content/companies/public/adobe/packages/cq610/featurepack3/cq-6.1.0-apps-featurepack)

## Getting Started

Clone this repository to your machine to begin.

This repository consists of a [hybrid app](hybrid-app) built using the [Ionic Framework](http://ionicframework.com/) and an associated [AEM Package](aem-package) that will enable authoring once installed to an AEM instance.

# Demo

## Create Hybrid App Archive

A script is available that will create an archive of the app or you can use any ZIP creation tool of your choosing.

    cd aem-mobile-hybrid-reference/hybrid-app
    npm install
    npm run zip

## Import Hybrid App into AEM

1. Drag and drop archive onto AEM 6.1 FP3 [Apps admin console](http://localhost:4502/aem/apps.html/content/phonegap)
1. Configure your [dashboard](http://localhost:4502/libs/mobileapps/admin/content/dashboard.html/content/mobileapps/hybrid-reference-app/shell) with analytics, push and phonegap build support
1. Create, read, update and, delete (CRUD) app pages
1. Publish updates OTA with ContentSync
1. Open [AEM Mobile Verify](https://itunes.apple.com/us/app/phonegap-enterprise/id924780940?ls=1&mt=8) to view your app

## Install AEM Package

    cd aem-mobile-hybrid-reference/aem-package
    mvn -PautoInstallPackage clean install

NOTE: If you are installing the packages manually you need to install content-dev first.

NOTE: For logout, user profile creation and update, the packages must be installed on the publisher.

    mvn -PautoInstallPackagePublish clean install

## Edit in AEM

NOTE: Once built and installed via maven, your hybrid app should be editable in AEM.  

WARNING: You should only edit the sample that is deployed for quick demo purposes. If you plan to create content and expect to continue to redeploy developer updates over time (you will), you need to create a new application based on this template by selecting the '+' new app button on the Mobile Console and selecting the Hybrid Template during the creation process.  This will create a clean separation between the Author creating content in the new application and any developer updates (the newly created app will pick up the developer updates without clobbering the author's content).  Taking this one step further, navigate into the package manager and create a new package for your new application (including assets). Then download and save this package as a backup (you can automate this process).

The [dashbaord](http://localhost:4502/libs/mobileapps/admin/content/dashboard.html/content/mobileapps/hybrid-reference-app/shell) for the app that was previously added will
now contain a new entry called *English* under the *Manage Content* section.

If you followed the instructions correctly and have your author instance running locally on `:4502`, you should be able to author the hybrid app that was previously added via the following link:
[http://localhost:4502/editor.html/content/mobileapps/hybrid-reference-app/en/about.html](http://localhost:4502/editor.html/content/mobileapps/hybrid-reference-app/en/about.html)

# Production

When deploying an existing hybrid app for production it should be wrapped in an AEM package to simplify versioning and deployment.
An additional content package is included with this sample which will wrap the existing ionic app into the correct JCR structure.
Undesirable results may occur when installing this package to a server instance that previously imported the app via drag and drop.

    cd aem-mobile-hybrid-reference/aem-package
    mvn -PautoInstallProduction clean install

# Build Hybrid App

Building the hybrid app can be completed entirely from the command line.

First ensure your script dependencies are up-to-date.

    cd aem-mobile-hybrid-reference/hybrid-app
    npm install

## Merge Authored Content

This method would generally be used by the ionic developer to test the app with authored content.

NOTE:  Default AEM server is http://localhost:4502 with credentials admin:admin.  Modify scripts/fetch.sh if needed.

Content being managed by AEM will be automatically merged into the hybrid app during the Cordova build process when the `--aem-merge` argument is provided.

    cd aem-mobile-hybrid-reference/hybrid-app
    cordova platform add ios
    cordova run ios --emulator --aem-merge

## Build a Single Package

This allows you to build the sample as one content package.

    cd aem-mobile-hybrid-reference/aem-package/hybrid-reference-app-all-pkg
    mvn clean install content-package:install
