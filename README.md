# zoomto-widget

[Demo:  Zoom To widget](http://swingley.github.com/zoomto-widget/)

The Zoom To widget zooms to a state or county in the United States. This is done with a drop down button that contains two combo boxes (filtering selects in Dojo terms): one to select a state, and one to select a county. Once a state or county is selected, the map zooms to that state or county.

State and county extents are retrieved from JSON files via a dojo data store. Web Mercator extents are used by default. If the map's spatial reference doesn't match the spatial reference of the extents in the JSON file, the extent is sent to a geometry service to be projected before being passed to the map. Using a non-Web Mercator map requires additional configuration as you have to supply a URL for a geometry service to project extents, or you have to supply your own JSON file with extents.

The widget is created from a page that includes an ArcGIS API for JavaScript map. Refer to index.html to see code required to use the widget in a web page. 

## Instructions

1. Fork and then clone the repo (preferably to a directory accessible to a web server)
2. Load zoomto-widget/index.html in a browser
3. Click the "Zoom To" button in the upper right corner of the page and start zoomin'.

## Requirements

* Notepad or your favorite HTML editor
* Web browser with access to the Internet

## Resources

* [ArcGIS for JavaScript API Resource Center](http://esriurl.com/js)
* [@derekswingley](http://twitter.com/derekswingley)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Anyone and everyone is welcome to contribute. 

## TODO

* nuthin'

## Licensing
Copyright 2013 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[](Esri Tags: JavaScript ArcGIS API Mapping Widget Zoom)
[](Esri Language: JavaScript)​
