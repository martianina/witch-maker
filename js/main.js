/* Code for generating details from an input name */
(function() {
	var WitchGen = {
		generate: function (given_name) {
			
			return {
				name: given_name,
				nation: "Imperial Karlsland",
				striker: "Messerschmitt Me 163",
				weapon: "Mondragón rifle",
				familiar: "Stoat",
				personality: "Jolly",
				accessories: "N/A"
			};
		}
	};
	
	window.WitchGen = WitchGen;
}());

/* Output rendering code */
(function() {
	var listItem = function (key, value) {
		return $("<p></p>").html(key + ": " + value);
	};
	
	var DisplayWitch = function ($container, witch) {
		$container.removeClass("hide");
		var $list = $container.children("p");
		
		$list.append( listItem("Name", witch.name) );
		$list.append( listItem("Nation", witch.nation) );
		$list.append( listItem("Striker", witch.striker) );
		$list.append( listItem("Weapon", witch.weapon) );
		$list.append( listItem("Familiar", witch.familiar) );
		$list.append( listItem("Personality", witch.personality) );
		$list.append( listItem("Accessories", witch.accessories) );
	};
	
	window.DisplayWitch = DisplayWitch;
}());

/* init code */
$(document).ready(function() {
	$("#generator").on("submit", function (e) {
		e.preventDefault();
		
		var witch = WitchGen.generate( $("#inputName").val() );
		DisplayWitch( $("#results"), witch );
		return false;
	})
});