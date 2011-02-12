# January 21, 2011
# Derek Swingley(swingley@gmail.com)
#
# PURPOSE:  Create a .json file for use with the Zoom To Dijit
# which is in turn used by a dojo.data.ItemFileReadStore and a 
# dijit.form.FilteringSelect
#
# REQUIREMENTS:  ArcGIS 10 (python 2.6.x and arcpy)
#
# USAGE:  modify the variables in the section higlighted below
# and run from a command prompt. if using a spatial reference 
# other than web mercator, the int() calls should probably be 
# removed on lines 45-48.
#
#######################################################################
# VARIABLES TO MODIFY:
dataSource = 'central_america.shp'
dataWKID = 3857 # look up your wkid:  http://spatialreference.org/
nameField = 'CNTRY_NAME'
labelField = 'CNTRY_NAME'
outIdentifier = 'name'
outLabel = 'name'
outFile = 'central_america.json'
#######################################################################

print '\n---SCRIPT START---\n'
import os, json
import arcpy
print '\timported arcpy'

outputObj = {
  'identifier': outIdentifier,
  'label': outLabel,
  'items': []
}

# get the shape field name
shapeField = arcpy.Describe(dataSource).ShapeFieldName

# create a search cursor to loop through features
searchCursor = arcpy.SearchCursor(dataSource, '')
feature = searchCursor.next()
print '\tprocessing features...'
while feature:
  ext = feature.getValue(shapeField).extent
  featureExt = {
    outIdentifier: feature.getValue(nameField),
    outLabel: feature.getValue(labelField),
    'extent': {
      '_type': 'Extent',
      '_value': {
        'xmin': int(ext.XMin),
        'ymin': int(ext.YMin),
        'xmax': int(ext.XMax),
        'ymax': int(ext.YMax),
        'spatialReference': {
          'wkid': dataWKID
        }
      }
    }
  }
  outputObj['items'].append(featureExt)
  feature = searchCursor.next()

print '\tfinished processing features.'
output = open(outFile, 'w')
output.write(json.dumps(outputObj, indent=2))
output.close()
print '\twrote output file:  %s' % outFile  
print '\n---SCRIPT FINISHED---\n'
