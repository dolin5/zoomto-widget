The Zoom To Dijit zooms to a state or county in the United States. This 
is done with a drop down button that contains two combo boxes (filtering 
selects in dojo terms): one to select a state, and one to select a county. 
Once a state or county is selected, the map zooms to that state or county. 

State and county extents are retrieved from JSON files via a dojo data 
store. Web Mercator extents are used by default but JSON files are provided 
with NAD83 and WGS84 extents. If the map's spatial reference doesn't 
match the spatial reference of the extents in the JSON file, the extent 
is sent to a geometry service to be projected before being passed to the map.

This dijit has been is intended to be used with v2.1 of the ArcGIS JavaScript
API but it also works with 1.x versions of the API.

Set up steps:
1. copy the ZoomTo folder and zoomTo.html to a directory on your web server
2. make the following edits to ZoomTo.js:
    -line 29: provide the url to a geometry service
3. load zoomTo.html in a browser

Use WGS84 or NAD83 extents:
1. Make the following edits ZoomTo.js 
    -line 25: change the spatial reference wkid (NAD83 is 4269, WGS84 is 4326) 
    -line 66: change the url for the states drop down to the proper JSON
    -line 71: change the url for the counties drop down to the proper JSON

FAQ:
Why do I get "uncaught exception: Access to restricted URI denied 
(NS_ERROR_DOM_BAD_URI)" as an error in the firebug console when loading 
zoomTo.html?
--You probably haven't completed step two of the set up steps. Make the 
required edit to ZoomTo.js.

Why do I get a 404 for the JSON file for states?
--In testing, this was a common issue on IIS servers. The solution is to 
add a JSON mime type to IIS. Detailed steps on how to do this are here:  
http://technet.microsoft.com/en-us/library/cc725608(WS.10).aspx

How can I generate custom extents for use with the Zoom To Dijit?
--Use the included python file in the /extras folder to generate custom 
extents (requires ArcGIS 10).
