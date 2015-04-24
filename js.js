//********** GLOBALS *******************

var current_tab = "genre";

$(document).ready(function () {
	changeGenre();
}); 


$(document).on("click", ".genre_href", function() {
	if (current_tab == "genre") {
		return;
	}
	else {
		d3.select(".genre_href").classed("selected", true);
		d3.select(".date_href").classed("selected", false);
		current_tab = "genre";
		changeGenre();
	}
});

$(document).on("click", ".date_href", function() {
	if (current_tab == "date") {
		return;
	}
	else {
		d3.select(".genre_href").classed("selected", false);
		d3.select(".date_href").classed("selected", true);
		current_tab = "date";
		changeDate();
	}
});


//********** LOAD GENRE INFO ***********
function changeGenre() {
	d3.select("#filter").html("");
	d3.select("#svg").html("");
	d3.select("#info_content").html("<h4> Please select a book / movie on the graph for more information</h4>");

	var genresList = ["Adventure", "Comedy", "Drama", "Family", "Fantasy", "Romance", "Sci-Fi", "Thriller", "Horror"];
	var genresString = "<h4> Genres </h4>";
	genresList.forEach(function(d, i) {
		var checkbox = "<input type='checkbox' id='cb_" + d + "' value='" + d + "' class='css-checkbox' checked='checked'></input>";
		var label = "<label for='cb_" + d + "' name='genre' class='css-label lite-cyan-check'> " + d + "</label><br/>"; 
		genresString += checkbox + label;
	});
	var print = d3.select("#filter").html(genresString);

	$(document).on("change", ".css-checkbox", function() {
		var selection = this.value;
		var checked = this.checked;
		editGraph(selection, checked);
	});

	$(window).on("resize", function () {
		$("#info").css("width", $(window).width() * .20);
	});

	// Create SVG elements
	var height = 550;
	var width = 900;
	var padding = 100;
	var svg = d3.select("#svg").append("svg").attr("height", height).attr("width", width);

	// xScale == tomatoRating (movie)
	var xScale = d3.scale.linear().domain([4,9.5]).range([padding, width - padding]);
	var xAxis = d3.svg.axis().scale(xScale);
	svg.append("g")
	  .attr("class", "axis")
	  .attr("transform", "translate(0, " + (height - padding) + ")")
	  .call(xAxis);
	// yScale == bookRating (book)
	var yScale = d3.scale.linear().domain([3.3,4.7]).range([height - padding, padding]);
	var yAxis = d3.svg.axis().scale(yScale).orient("left");
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis);
	// Add labels
	var xLabel = svg.append("text")
		.attr("x", width / 2)
		.attr("y", height - (padding / 2))
		.style("text-anchor", "middle")
		.text("IMDB Movie Ratings");
	var yLabel = svg.append("text")
		.attr("x", padding / 3)
		.attr("y", height / 2)
		.attr("transform", "rotate(270 " + padding / 3 + "," + height / 2 + ")")
		.style("text-anchor", "middle")
		.text("GoodReads Book Ratings");
	var title = svg.append("text")
		.attr("x", width / 2)
		.attr("y", padding / 2)
		.style("text-anchor", "middle")
		.text("Movie Book Adaptions: Rating Comparisons");

	// Clear Graph
	function editGraph(selection, checked) {
		var change = checked == true ? "visible" : "hidden";
		var data = svg.selectAll("#" + selection);
		var opacityLevel = checked == true ? ".9" : "0";

		data.transition().duration(300).style("opacity", opacityLevel);

		if (checked == true) {
			data.attr("visibility", change);
		}
			else {
				setTimeout(function(){ 
					data.attr("visibility", change); 
				}, 300);
			}
	}

	var colorList = ["#ba3006", "#d2853f", "#cf000f", "#08133c", "#4F4F4F", "#E26A6A", "#6eceda", "#760b1c", "#000000"];


	// Moves the selection to the front: credit = https://gist.github.com/trtg/3922684
	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
	    this.parentNode.appendChild(this);
	  });
	};

	d3.json("./text.json", function(error, data) {
		var current;
		// Appending Data
		var genresSelected = d3.selectAll("checkbox").property('checked', true);
		var circles = svg.append("g");
		circles.selectAll("#circles")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function (d) {
				return d.mainGenre;
			}) // may change this to be mainGenre
			.attr("cx", function (d) {
				return xScale(Number(d.imdbRating));
			})
			.attr("cy", function (d) {
				return yScale(Number(d.bookRating));
			})
			.attr("r", 10)
			.style("fill", function (d) {	
				if(d.mainGenre.indexOf("Adventure") != -1){
					return "#ba3006"; // orange
		  		}
		  		if(d.mainGenre.indexOf("Comedy") != -1){
		  			return "#d2853f"; // yellow
		  		}
		  		if(d.mainGenre.indexOf("Drama") != -1){
					return "#cf000f"; // deep red
			  	}
		  		if(d.mainGenre.indexOf("Family") != -1){
					return "#08133c"; // normal blue
		  		}  
		  		if(d.mainGenre.indexOf("Fantasy") != -1){
					return "#4F4F4F"; // purple
		  		}  	
		  		if(d.mainGenre.indexOf("Romance") != -1){
					return "#E26A6A"; // pink
		  		} 	
		  		if(d.mainGenre.indexOf("Sci-Fi") != -1){
					return "#6eceda"; // light blue
		  		} 
		  		if(d.mainGenre.indexOf("Thriller") != -1){
					return "#760b1c"; // grey-blue
		  		} 
		  		if(d.mainGenre.indexOf("Horror") != -1){
		  			return "#000000";
		  		}
			})
			.style("opacity", 0.9)
			.on("mouseover", function (d) {
				if (current != null) {
					current.remove();
				}
				if (d3.select(this).classed("node_selected") == true) {
					return;
				}
				current = svg.append("text")
					.attr("x", padding)
					.attr("y", height - 15)
					.style("font-size", 15)
					.text("Selected: " + d.movieTitle);
					d3.select(this).attr("r", 15).attr("stroke", "#7e7e7e").attr("stroke-width", "1px");
			})
			.on("mouseout", function (d) {
				if (d3.select(this).classed("node_selected") == false) {
					current.remove();
					d3.select(this).attr("r", 10).attr("stroke", "none").attr("stroke-width", "0px");
				}
			})
			.on("click", function (d) {
				d3.selectAll(".node_selected").classed("node_selected", false).attr("r", 10).attr("stroke-width", "0px");
				d3.select(this).classed("node_selected", true);
				d3.select(this).attr("r", 20).attr("stoke", "black").attr("stroke-width", "3px").moveToFront();
				var string = "<h3> <span class='highlighted'>Book Title: </span>" + d.bookTitle + "</h3>";
				string += "<span class='highlighted'>Author:</span> " + d.author;
				string += "<br/> <span class='highlighted'>Release Year: </span> " + d.bookReleaseDate + "<br/><br/><hr/>";
				string += "<br/><h3> <span class='highlighted'>Movie Title:</span> " + d.movieTitle + "</h3>";
				string += "<span class='highlighted'>Main Genre:</span> " + d.mainGenre + "<br/>";
				string += "<span class='highlighted'>Genres:</span> " + d.genre + "<br/>";
				string += "<span class='highlighted'>Rated:</span> " + d.rated + "<br/><br/><hr/><br/>";
				string += "<h3><span class='highlighted'>Plot Summary:</span></h3> " + d.plot + "<br/>";
				d3.select("#info_content").html(string);
			});				
		}); 

	// Legend
	var legend = d3.select("#filter").append("svg").attr("height", 300).attr("width", 120);
		legend.append("text")
			.attr("x", 0)
			.attr("y", 40)
			.text("Legend")
			.style("font-size", 30);
	for (var i = 0; i < genresList.length; i++) {
		legend.append("rect")
			.attr("x", 0)
			.attr("y", 60 + i * 25)
			.attr("height", 20)
			.attr("width", 20)
			.style("fill", colorList[i])
			.style("opacity", 0.9);
		legend.append("text")
			.attr("x", 25)
			.attr("y", 75 + i * 25)
			.text(genresList[i]);		
	}
}

function changeDate() {
	d3.select("#filter").html("");
	d3.select("#svg").html("");
	d3.select("#info_content").html("<h4> Please select a book / movie on the graph for more information</h4>");

	var dateString = "<h4> Date </h4> <label for='amount'> Movie Release Date: </label><br/><br/>"
				   + "<div id='sliders'><div id='moviedateslider'></div><input type='text' id='lower_input'></input> "
				   + "<input type='text' id='upper_input'></input></sliders>";
 	var print = d3.select("#filter").html(dateString);

	$(window).on("resize", function () {
		$("#info").css("width", $(window).width() * .20);
	});

	// Create SVG elements
	var height = 550;
	var width = 900;
	var padding = 100;
	var svg = d3.select("#svg").append("svg").attr("height", height).attr("width", width);

	// xScale == tomatoRating (movie)
	var xScale = d3.scale.linear().domain([4,9.5]).range([padding, width - padding]);
	var xAxis = d3.svg.axis().scale(xScale);
	svg.append("g")
	  .attr("class", "axis")
	  .attr("transform", "translate(0, " + (height - padding) + ")")
	  .call(xAxis);
	// yScale == bookRating (book)
	var yScale = d3.scale.linear().domain([3.3,4.7]).range([height - padding, padding]);
	var yAxis = d3.svg.axis().scale(yScale).orient("left");
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis);
	// Add labels
	var xLabel = svg.append("text")
		.attr("x", width / 2)
		.attr("y", height - (padding / 2))
		.style("text-anchor", "middle")
		.text("IMDB Movie Ratings");
	var yLabel = svg.append("text")
		.attr("x", padding / 3)
		.attr("y", height / 2)
		.attr("transform", "rotate(270 " + padding / 3 + "," + height / 2 + ")")
		.style("text-anchor", "middle")
		.text("GoodReads Book Ratings");
	var title = svg.append("text")
		.attr("x", width / 2)
		.attr("y", padding / 2)
		.style("text-anchor", "middle")
		.text("Movie Book Adaptions: Rating Comparisons");

	function changeSelection(lower, upper) {
		var data = d3.selectAll("#dated")
			.each(function (d, i) {
				var selection = d3.select(this);

				if (Number(d.movieReleaseDate) > Number(lower) && Number(d.movieReleaseDate) < Number(upper)) {
					d3.select(this).attr("visibility", "visible"); 
					d3.select(this).transition().duration(300).style("opacity", .9);
				}
				else {
					d3.select(this).transition().duration(300).style("opacity", 0);
					setTimeout(function(){ 
						d3.select(this).attr("visibility", "hidden");
					}, 300); 
				};
			});
	}

	// Moves the selection to the front: credit = https://gist.github.com/trtg/3922684
	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
	    this.parentNode.appendChild(this);
	  });
	};

	var colorScale;

	d3.json("./text.json", function(error, data) {
		var minDateMovie = d3.min(data, function(d) {return d.movieReleaseDate;}); 
		var minDateBook = d3.min(data, function(d) {return d.bookReleaseDate;}); 
		var maxDateMovie = d3.max(data, function(d) {return d.movieReleaseDate;}); 
		var maxDateBook = d3.min(data, function(d) {return d.bookReleaseDate;}); 

		$('#moviedateslider').noUiSlider({
			start: [1931, 2015],
			connect: true,
			range: {
				'min': 1931,
				'max': 2015
			},
			format: wNumb({
				decimals: 0
			})
		});

		$('#moviedateslider').Link('lower').to($('#lower_input'));
		$('#moviedateslider').Link('upper').to($('#upper_input'));

		$('#moviedateslider').on("change", function(d) {
			console.log("yo");
			var values = ($('#moviedateslider').val());
			changeSelection(values[0], values[1]);
		});

		colorScale = d3.scale.linear().domain([minDateMovie, maxDateMovie]).range(["#2a3252", "#D63A26"]);
		
		var current;
		// Appending Data
		var genresSelected = d3.selectAll("checkbox").property('checked', true);
		var circles = svg.append("g");
		circles.selectAll("#circles")
			.data(data)
			.enter()
			.append("circle")
			.attr("id", function (d) {
				return "dated";
			}) // may change this to be mainGenre
			.attr("cx", function (d) {
				return xScale(Number(d.imdbRating));
			})
			.attr("cy", function (d) {
				return yScale(Number(d.bookRating));
			})
			.attr("r", 10)
			.style("fill", function (d) {
				return colorScale(d.movieReleaseDate);
			})
			.style("opacity", 0.9)
			.on("mouseover", function (d) {
				if (current != null) {
					current.remove();
				}
				if (d3.select(this).classed("node_selected") == true) {
					return;
				}
				current = svg.append("text")
					.attr("x", padding)
					.attr("y", height - 15)
					.style("font-size", 15)
					.text("Selected: " + d.movieTitle);
					d3.select(this).attr("r", 15).attr("stroke", "#7e7e7e").attr("stroke-width", "1px");
			})
			.on("mouseout", function (d) {
				if (d3.select(this).classed("node_selected") == false) {
					current.remove();
					d3.select(this).attr("r", 10).attr("stroke", "none").attr("stroke-width", "0px");
				}
			})
			.on("click", function (d) {
				d3.selectAll(".node_selected").classed("node_selected", false).attr("r", 10).attr("stroke-width", "0px");
				d3.select(this).classed("node_selected", true);
				d3.select(this).attr("r", 20).attr("stoke", "black").attr("stroke-width", "3px").moveToFront();
				var string = "<h3> <span class='highlighted'>Book Title: </span>" + d.bookTitle + "</h3>";
				string += "<span class='highlighted'>Author:</span> " + d.author;
				string += "<br/> <span class='highlighted'>Release Year: </span> " + d.bookReleaseDate + "<br/><br/><hr/>";
				string += "<br/><h3> <span class='highlighted'>Movie Title:</span> " + d.movieTitle + "</h3>";
				string += "<span class='highlighted'>Main Genre:</span> " + d.mainGenre + "<br/>";
				string += "<span class='highlighted'>Genres:</span> " + d.genre + "<br/>";
				string += "<span class='highlighted'>Rated:</span> " + d.rated + "<br/><br/><hr/><br/>";
				string += "<h3><span class='highlighted'>Plot Summary:</span></h3> " + d.plot + "<br/>";
				d3.select("#info_content").html(string);
			});				

		// Legend
		var legend = d3.select("#filter").append("svg").attr("height", 300).attr("width", 120);
			legend.append("text")
				.attr("x", 0)
				.attr("y", 40)
				.text("Legend")
				.style("font-size", 30);
		for (var i = 0; i < 7; i++) {
			legend.append("rect")
				.attr("x", 0)
				.attr("y", 60 + i * 25)
				.attr("height", 20)
				.attr("width", 20)
				.style("fill", colorScale(Number(minDateMovie) + ((Number(maxDateMovie) - Number(minDateMovie)) / 6 * i)) )
				.style("opacity", 0.9);
			legend.append("text")
				.attr("x", 25)
				.attr("y", 75 + i * 25)
				.text(Number(minDateMovie) + ((Number(maxDateMovie) - Number(minDateMovie)) / 6 * i));		
		}

	}); 


}