// NAMESPACE 
dojo.provide("extras.ZoomTo");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dojo.data.ItemFileReadStore");

dojo.require("esri.map");

/**
 * ZoomToBTN CLASS  
 * @classDescription The ZoomTo Button 
 */
dojo.declare("extras.ZoomTo", [dijit._Widget, dijit._Templated], {
  templatePath: dojo.moduleUrl("extras", "templates/ZoomToBtn.html"),   
  widgetsInTemplate: true,
  started: false,
  map: null,
  mapSpatRef: null,
  defaultSpatRef: 102100, //MAKE SURE THIS MATCHES THE SRID OF THE EXTENTS IN THE JSON FILE BEING USED
  stateStore: null,
  countyStore: null,
  //ArcGIS Online can be used:  http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer
  geomServiceUrl: 'http://your_geometry_service_url',
  
  /**
   * The ZoomTo Button
   */
  constructor: function(options, srcNodeRef){
    console.log("zoom to ctor: ", options, srcNodeRef);
    this.map = options.map;
    // PROVIDE PROPER CONTEXT FOR EVENTS
    this.stateZoomer = dojo.hitch(this, this.stateZoomer);
    this.countyZoomer = dojo.hitch(this, this.countyZoomer);
    this.zoomerComplete = dojo.hitch(this, this.zoomerComplete);
    this.handleExtent = dojo.hitch(this, this.handleExtent);
    this.showExtent = dojo.hitch(this, this.showExtent);
  },
  
  buildRendering: function(){
    this.inherited(arguments);
  },
    
  startup: function() {
    this.inherited(arguments);

    // if the map isn't loaded, wait for it to load
    if ( !this.map.loaded ) {
      console.log("map not loaded");
      this.mapLoadConnect = dojo.connect(this.map, "onLoad", dojo.hitch(this, this.startup));
      return;
    }
    dojo.disconnect(this.mapLoadConnect);

    this.stateStore = new dojo.data.ItemFileReadStore({
      url: dojo.moduleUrl("extras", "data/states_web_merc.json"), 
      typeMap: { "Extent": esri.geometry.Extent}
    });
    // console.log("state store: ", this.stateStore);
    
    this.countyStore = new dojo.data.ItemFileReadStore({
      url: dojo.moduleUrl("extras", "data/counties_web_merc.json"), 
      typeMap: { "Extent": esri.geometry.Extent}
    });

    //populate the states combo box with the state names
    var stateFS = new dijit.form.FilteringSelect({ 
      name: "states", 
      required: false,
      store: this.stateStore, 
      searchAttr: "name"
    }, this.id + ".stateInput");
    // console.log("states FS: ", stateFS);
    
    //populate the counties combo box with the county names
    var countyFS = new dijit.form.FilteringSelect({ 
      disabled: true,
      displayedValue: "Please select a state.",
      label: "name",
      name: "counties", 
      required: false, //disables warnings about invalid input
      searchAttr: "name"
    }, this.id + ".countyInput");
          
    //zoom to the extent for a state or county after a selection is made
    dojo.connect(dijit.byId(this.id + ".stateInput"), "onChange", this, this.stateZoomer);
    dojo.connect(dijit.byId(this.id + ".countyInput"), "onChange", this, this.countyZoomer);
    this.mapSpatRef = this.map.spatialReference.wkid; //keep track of the map's wkid so we know whether or not to use a geom. service
    this.started = true;
  },
    
  onDlgOpen: function(pos){
    dijit.byId(this.id + ".stateInput").focus();
  },

  handleExtent: function(item){
    //console.log('map: ', this.mapSpatRef, 'default: ', this.defaultSpatRef);
    if (this.mapSpatRef != this.defaultSpatRef) {
      //console.log('projecting the extent...');
      var origExtGraphic = new esri.Graphic(item.extent[0]);
      var geomSvc = new esri.tasks.GeometryService(this.geomServiceUrl);
      geomSvc.project([origExtGraphic], this.map.spatialReference, this.showExtent);
    } else {  
      this.showExtent(item.extent[0]);
    }
  },
    
  showExtent: function(newExtent) {
    //figure out if the object passed in came from a geometry service or if it's straight from our json file
    if (newExtent[0] && typeof(newExtent[0].geometry) != "undefined") { 
      var ext = newExtent[0].geometry; //from a geom service
    } else { 
      var ext = newExtent; //straight from the json file
    }
    
    //create a copy of the extent because sending the extent to map.setExtent() alters 
    //the extent passed to it which screws up the graphic that we draw...
    var newMapExtent = dojo.clone(ext); 
    this.map.setExtent(newMapExtent, true);
    
    var opac = 1;
    //don't start the fade out right away so the map has time to update
    //should probably be listening to a layer's onUpdate event instead but...this is easier
    setTimeout(function() { 
      var outline = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 1]), 3);
      var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, outline, new dojo.Color([0, 0, 128, 0]));
      var extGraphic = new esri.Graphic(ext, symbol);
      this.map.graphics.add(extGraphic);
      var i_id = setInterval(function() { //fade out the graphic representing the new extent
        //if you want a different color for the extent graphic, alter the rgb values below
        symbol.outline.setColor(new dojo.Color([102, 0, 153, opac])); 
        extGraphic.setSymbol(symbol);
        if (opac < 0.01) { //once the graphic is no longer visible:  clear the interval, remove the graphic
          clearInterval(i_id); 
          map.graphics.remove(extGraphic);
        }
        opac -= 0.01;
      }, 10);
    }, 1500);
  },
  
  errorHandler: function(error){
    console.log("ZoomTo widget error: ", error);
  },
    
  stateZoomer: function(){  
    if (this.map != null) {
      var placeName = dojo.byId(this.id + ".stateInput").value;
      if (placeName != "") {
        //dijit.byId(this.id + '.ddDialog').onCancel(); //this will close the drop down button
        //query the data store to get the extent set the map extent equal to the extent from the store
        dijit.byId(this.id + ".countyInput").attr({ disabled: false, displayedValue: "" });
        dijit.byId(this.id + ".countyInput").query = { state_name: placeName }
        dijit.byId(this.id + ".countyInput").set("store", this.countyStore);
          
          //give focus to the county filtering select
          dijit.byId(this.id + ".countyInput").focus();
          this.stateStore.fetchItemByIdentity({
            identity: placeName, 
            onItem: this.handleExtent, 
            onError: this.errorHandler
          });
      }
    }
  },
    
  countyZoomer: function(){  
    if (this.map != null) {
      var countyFips = dijit.byId(this.id + ".countyInput").value;
      if (countyFips != "") {
        //query the data store to get the extent and set the map extent equal to the extent from the store
        this.countyStore.fetchItemByIdentity({
          identity: countyFips, 
          onItem: this.handleExtent, 
          onError: this.errorHandler
        });
      }
    }
  }
});
