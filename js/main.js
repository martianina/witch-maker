/* Code for generating details from an input name */
(function() {
  // Convert the name to a hash, and use that hash to make indexes for
  // later use by the data mapping.
  var NameHash = function (given_name) {
    this.given_name = given_name;
    this.hash = md5(given_name);
    
    this.hash_index = function (i) {
      var offset = 2 * i;
      var str = this.hash.slice(offset, offset + 2);
      return parseInt(str, 16);
    };
  };
  
  var WeightedList = function (rawList) {
    this.list = {};
    this.weightsTotal = 0;
    
    // Iterate through the array, and assign the weight to each item
    for (var i = 0; i < rawList.length; i++) {
      var item = rawList[i];
      this.weightsTotal += item.weight;
      this.list[item.name] = this.weightsTotal;
    }
    
    // Traverse the array in O(n) to find the closest weighted item
    this.pick = function (index, upper) {
      var r = this.weightsTotal * index / upper;
      
      for (var key in this.list) {
        if (this.list.hasOwnProperty(key)) {
          if (r <= this.list[key]) {
            return key;
          }
        }
      }
    };
  };
  
  // Filter a list by the nation in the nations array 
  var nationFilter = function (list, nation) {
    var newList = [];
    
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      
      if (item.nations.indexOf(nation) !== -1) {
        newList.push(item);
      }
    }
    
    return newList;
  };
  
  var WitchGen = {
    generate: function (given_name) {
      var hash = new NameHash(given_name.toLowerCase());
      
      var nations = new WeightedList(Data.nations);
      var nation = nations.pick(hash.hash_index(0), 255);
      
      var strikers = new WeightedList(nationFilter(Data.strikers, nation));
      var striker = strikers.pick(hash.hash_index(1), 255);
      
      return {
        name: given_name,
        nation: nation,
        striker: striker,
        weapon: "Erma EMP-35",
        familiar: "Rhodesian Ridgeback",
        personality: "Hasty",
        accessories: "Scarf"
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
    $list.empty();
    
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