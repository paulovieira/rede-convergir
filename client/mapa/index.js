var typeFilter = [];

$("#filter-type").on("change", "input:checkbox", function(e){
	
	// if we checked the checkbox...
	if($(this).is(':checked')){

		// if it was the "all" checkbox, remove the checked prop from all the others
		if($(this).data("type")=="Todos"){
			//$("#filter-type input[data-type='all']").prop("checked", false);
			$("#filter-type input").each(function(index, el){
				if($(el).data("type")!="all"){
					$(el).prop("checked", false);
				}
			});
		}

		// if it was one of the others, remove the checked prop from the all
		else{
			$("#filter-type input[data-type='Todos']").prop("checked", false);
		}
	}


	typeFilter = [];
	$("#filter-type input").each(function(index, el){
		if($(el).prop("checked")==true){
			typeFilter.push($(el).data("type"));
		}
	});


	var noneChecked = true;
	$("#filter-type input").each(function(index, el){
		if($(el).prop("checked")==true){
			noneChecked = false;
		}
	});

	if(noneChecked === true){
		$("#filter-type input[data-type='Todos']").prop("checked", true);
	}

	var projectsCV = new ProjectsCV({
		collection: projectsC,
		id: "projects-list",
		filters: {
			type: typeFilter
		}
	});

	var loadingIV = new LoadingIV();
	RC.listRegion.show(loadingIV);


	Q.delay(Math.random()*1000).then(function(){
		RC.listRegion.show(projectsCV);	
		mapLV.resetGeoJson(typeFilter)
	})


});

$.easing.elasout = function(x, t, b, c, d) {
	var s=1.70158;var p=0;var a=c;
	if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
	if (a < Math.abs(c)) { a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};

var viewportHeight = $(document).height();
var footerHeight = $(".footer").height();
var navbarHeight = $(".navbar").height();

console.log("hello mapa!");

var RC = new Mn.Application();

RC.addRegions({
	listRegion: "#projects-list-region",
	mapRegion: "#map-region",
});


var projectsData = [
	{
		id: 1,
		projectName: "TU - Transição Universitária da Fcul",
		summary: "O TU - Transição Universitária é um grupo de da Faculdade de Ciências da Universidade de Lisboa (FCUL) que pretende facilitar a Transição na Universidade.",
		type: "Transição",
		url: "http://www.tu-fcul.net",
		logoImg: "/uploads/public/images/tulogo.gif",
		addedBy: "José Silva",
		lastUpdated: "2014-10-26",
		latLng: [38.2, -7.2]
	},

	{
		id: 2,
		projectName: "Canyaviva",
		summary: "Desenhamos e construímos estruturas, para espaços interiores e exteriores. Cada desenho é único, adaptando-se a localização e as diversas necessidades.",
		type: "Gestão da Terra e da Natureza",
		url: "http://www.canyaviva.com",
		logoImg: "/uploads/public/images/canyavivalogo.jpg",
		addedBy: "Manuel Silva",
		lastUpdated: "2015-01-13",
		latLng: [39.81, -7.21]
	},

	{
		id: 3,
		projectName: "Comunidade de Partilha",
		summary: "A Comunidade de Partilha do Bairro da Boavista promove a partilha de bens, espaços, produções, serviços e projectos empreendedores pelos moradores do bairro.",
		type: "Centro Comunitário",
		url: "https://www.facebook.com/comunidadepartilha",
		logoImg: "/uploads/public/images/logo_comunidade.png",
		addedBy: "Ana Silva",
		lastUpdated: "2014-12-04",
		latLng: [37.8, -7.82]
	},
];

var ProjectM = Backbone.Model.extend({
	initialize: function(){

		var marker = L.marker(this.get("latLng"));

		var self = this;
		marker.on("click", function(e){
			self.trigger("click:marker");
			console.log(self.toJSON());
		});

		this.set("marker", marker);


		this.set("latLng", L.latLng(this.get("geometry").coordinates[1], this.get("geometry").coordinates[0]));
		if(!this.get("properties").logoImage){
			this.get("properties").logoImage = "";
		}
	},
})

var ProjectsC = Backbone.Collection.extend({
	model: ProjectM
})
//var projectsC = new ProjectsC(projectsData);
var projectsC = new ProjectsC(rc_geojson);




var ProjectLV = Mn.LayoutView.extend({
	initialize: function(){
		this.$el.attr("id", "project-" + this.model.get("id"));
	},
	modelEvents: {
		"click:marker":"clickMarker"
	},
	template: "project/templates/project.html",
	clickMarker: function(){
		this.trigger("click:marker");
	}

});

var ProjectsCV = Mn.CollectionView.extend({

	filter: function(child){

		var bounds = this.options.bounds || mapLV.map.getBounds(),
			filters = this.options.filters;

		// if the collection view doesn't have bounds, there's nothing to filter
		if(!bounds && !filters){
			return true;
		}

		var isInBounds = true,
			isOfSelectedTypes = true;
		if(bounds){
			isInBounds = bounds.contains(child.get("latLng"));
		}

		if(filters){
			if(filters.type && filters.type.length > 0){
				isOfSelectedTypes = _.contains(this.options.filters.type, child.get("properties").type);
			}
			
		}

		return isInBounds && isOfSelectedTypes;
	},

	childView: ProjectLV,
	//id: "js-projects-container",
	childEvents: {
		"click:marker": function(childView){

			$("#projects-list-container").scrollTo(childView.$el, {
				duration: 300,
				offset: { top: -20 },
				easing: "swing"
			});
		}
	},
	onAttach: function(){
		
		//$("#projects-list").height(viewportHeight - footerHeight - navbarHeight - 2 - 50);
		//$("#projects-list").height(210);
	},
	scroll: function(feature){
		var model = this.collection.get(feature.id);
		var childView = this.children.findByModel(model);

		$("#projects-list-container").scrollTo(childView.$el, {
			duration: 300,
			offset: { top: -20 },
			easing: "swing"
		});
	}
});

var projectsCV = new ProjectsCV({
	collection: projectsC,
	id: "projects-list",
});



var MapLV = Mn.LayoutView.extend({

	template: "map/templates/map.html",

	addTiles: function(){
		L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
			maxZoom: 18,
			id: 'examples.map-i875mjb7'
		}).addTo(this.map);
	},

	addPopups: function(){
		this.collection.each(function(model){
			//model.set("popup", L.popup().setLatLng(model.get("latLng")).addTo(this.map));
		})
	},

	// addMarkers: function(){

	// 	this.collection.each(function(model){
	// 		model.get("marker").addTo(this.map);
	// 	}, this);
	// },

	resetGeoJson: function(type){
		if(this.geoJson){
			this.map.removeLayer(this.geoJson);			
		}

		this.geoJson = L.geoJson(rc_geojson, {
			onEachFeature: function(feature, layer){
				layer.on("click", function(){
					RC.listRegion.currentView.scroll(feature);
				})
			},

			filter: function(feature, layer){
				if(!type || !type.length){
					return true;
				}else{
					return _.contains(type, feature.properties.type);
				}
			}
		});

		this.map.addLayer(this.geoJson);
	},

	onAttach: function(){
		$("#map, #projects-list-container").outerHeight(viewportHeight - footerHeight - navbarHeight - 2);
		
		this.map = L.map('map').setView([39.8, -7.2], 7);
		this.addTiles();
		//this.addMarkers();
		this.resetGeoJson();

		//var self = this;
		this.map.on("moveend", function(e){
			var projectsCV = new ProjectsCV({
				collection: projectsC,
				id: "projects-list",
				bounds: this.map.getBounds(),
				filters: {
					type: typeFilter
				}
			});

			var loadingIV = new LoadingIV();
			RC.listRegion.show(loadingIV);


			Q.delay(Math.random()*1000).then(function(){
				RC.listRegion.show(projectsCV);	
			})
			//RC.listRegion.show(projectsCV);

		}, this);
	}
});

var mapLV = new MapLV({
//	collection: projectsC
});

RC.mapRegion.show(mapLV);
RC.listRegion.show(projectsCV);