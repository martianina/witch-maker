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
  
  // Keep an array with weighted values. Each object should have a name key
  // and a weight key.
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
  
  var WitchGen = {
    loadData: function (data) {
      this.data = data;
    },

    // Parse the source data. This function is dependent on the source
    // data hierarchy…
    parseSource: function () {
      // Nation data contains nations, strikers, weapons
      var nationData = this.data["Nations"];

      this.mappings = {};
      _.each(nationData, function (nation) {
        this.mappings[nation["name"]] = nation;
      }, this);

      this.nations = _.map(this.mappings, function (nation, key) {
        return {
          name: nation["name"],
          weight: nation["weight"]
        };
      });
    },

    // Parse list items from a nation
    arrayToObjects: function (array) {
      return _.map(array, function (item) {
        return {
          name: item,
          weight: 1
        };
      });
    },

    generate: function (given_name) {
      this.parseSource();
      var hash = new NameHash(given_name.toLowerCase());
      
      var nation = this.pickNation(hash);
      var striker = this.pickStriker(hash, this.mappings[nation]["strikers"]);
      var weapon = this.pickWeapon(hash, this.mappings[nation]["weapons"]);
      var familiar = this.pickFamiliar(hash, this.data["Familiars"]);
      var personality = this.pickPersonality(hash, this.data["Personalities"]);
      var accessory = this.pickAccessory(hash, this.data["Accessories"]);
      
      return {
        name: given_name,
        nation: nation,
        striker: striker,
        weapon: weapon,
        familiar: familiar,
        personality: personality,
        accessories: accessory
      };
    },

    pickNation: function (hash) {
      var nations = new WeightedList(this.nations);
      return nations.pick(hash.hash_index(0), 255);
    },

    pickStriker: function (hash, list) {
      var strikers = new WeightedList(this.arrayToObjects(list));
      return strikers.pick(hash.hash_index(1), 255);
    },

    pickWeapon: function (hash, list) {
      var weapons = new WeightedList(this.arrayToObjects(list));
      return weapons.pick(hash.hash_index(2), 255);
    },

    pickFamiliar: function (hash, list) {
      var familiars = new WeightedList(this.arrayToObjects(list));
      return familiars.pick(hash.hash_index(3), 255);
    },

    pickPersonality: function (hash, list) {
      var personalities = new WeightedList(list);
      return personalities.pick(hash.hash_index(4), 255);
    },

    pickAccessory: function (hash, list) {
      var accessories = new WeightedList(list);
      return accessories.pick(hash.hash_index(5), 255);
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

    WitchGen.loadData(Data);
    var witch = WitchGen.generate( $("#inputName").val() );
    DisplayWitch( $("#results"), witch );
    return false;
  })
});