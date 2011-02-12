// NAMESPACE 
dojo.provide("drs.ZoomTo");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dojo.data.ItemFileWriteStore");

dojo.require("esri.map");

//
// URL TO LOCATION OF NAMESPACE
// CHANGE URL TO WEB LOCATION OF THIS JS FILE
dojo.registerModulePath("drs.ZoomTo", "http://localhost/sandbox/zoomy/ZoomToDijit/extras/central_america/ZoomTo");

/**
 * ZoomToBTN CLASS  
 * @classDescription The ZoomTo Button 
 */
dojo.declare("drs.ZoomTo.ZoomToBtn", [dijit._Widget, dijit._Templated], {
  templatePath: dojo.moduleUrl("drs.ZoomTo", "templates/ZoomToBtn.html"),		
  started: false,
  map: null,
  mapSpatRef: null,
  defaultSpatRef: 3857, //MAKE SURE THIS MATCHES THE SRID OF THE EXTENTS IN THE JSON FILE BEING USED
  countryStore: null,
  //ArcGIS Online can be used:  http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer
  geomServiceUrl: 'http://your_geometry_service_url',
  
  /**
   * The ZoomTo Button
   */
  constructor: function(){
    // ADD CSS
    var head = document.getElementsByTagName("head")[0], css = document.createElement("link");
    css.setAttribute("rel", "stylesheet");
    css.setAttribute("type", "text/css");
    css.setAttribute("media", "all");
    css.setAttribute("href", dojo.moduleUrl("drs.ZoomTo", "css/ZoomTo.css"));
    head.appendChild(css);
    
    // PROVIDE PROPER CONTEXT FOR EVENTS
    this.countryZoomer = dojo.hitch(this, this.countryZoomer);
    this._zoomer = dojo.hitch(this, this._zoomer);
    this.zoomerComplete = dojo.hitch(this, this.zoomerComplete);
    this.handleExtent = dojo.hitch(this, this.handleExtent);
    this.showExtent = dojo.hitch(this, this.showExtent);
  },
  
  /**
   * BUILD RENDERING
   */
  buildRendering: function(){
    this.inherited("buildRendering", arguments);
    dojo.parser.parse(this.domNode);
  },
    
  /**
   * STARTUP
   */
  startup: function(){
    if (!this.started) {
      this.countryStore = new dojo.data.ItemFileReadStore({
        url: dojo.moduleUrl("drs.ZoomTo", "data/central_america.json"), 
        typeMap: { 'Extent': esri.geometry.Extent}
      });
          
      //populate the countrys combo box with the country names
      var countryFS = new dijit.form.FilteringSelect({ 
        name: "countrys", 
        required: false,
        store: this.countryStore, 
        searchAttr: "name",
      }, this.id + ".countryInput");
            
      //zoom to the extent for a country after a selection is made
      dojo.connect(dijit.byId(this.id + ".countryInput"), "onChange", this, "countryZoomer");
    }
    this.started = true;
  },
    
  /**
   * INITIALIZE DIJIT WITH MAP		  
   * @param {Object} map
   */
  init: function(map){
    // SET THE MAP
    this.map = map;
    this.mapSpatRef = map.spatialReference.wkid; //keep track of the map's wkid so we know whether or not to use a geom. service
  },   
    
  onDlgOpen: function(pos){
    dijit.byId(this.id + ".countryInput").focus();
  },

	handleExtent: function(item){
    //console.log('map: ', this.mapSpatRef, 'default: ', this.defaultSpatRef);
    if (this.mapSpatRef != this.defaultSpatRef) {
      //console.log('projecting the extent...');
      var origExtGraphic = new esri.Graphic(item.extent[0]);
      var geomSvc = new esri.tasks.GeometryService(this.geomServiceUrl);
      geomSvc.project([origExtGraphic], map.spatialReference, this.showExtent);
    } else {  
      this.showExtent(item.extent[0]);
    }
	},
    
  showExtent: function(newExtent) {
    //figure out if the object passed in came from a geometry service or if it's straight from our json file
    if (newExtent[0] && typeof(newExtent[0].geometry) != 'undefined') { 
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
	
	oops: function(error){
		console.log('boooooo...', error);
	},
    
  _zoomer: function(event){
    if (event.keyCode == dojo.keys.ENTER) {
      this.zoomer();
      return false;
    }
    else {
      return true;
    }
  },
    
	countryZoomer: function(){  
    if (this.map != null) {
      var placeName = dojo.byId(this.id + '.countryInput').value;
      if (placeName != "") {
        this.countryStore.fetchItemByIdentity({identity: placeName, onItem: this.handleExtent, onError: this.oops});
      }
    }
  }
});
