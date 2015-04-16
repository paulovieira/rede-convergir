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
