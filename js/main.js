/* Code for generating details from an input name */
(function() {
  // Convert the name to a hash, and use that hash to make indexes for
  // later use by the data mapping.
  var NameHash = function (given_name) {
    this.given_name = given_name;
    this.hash       = md5(given_name);
    
    this.hash_index = function (i) {
      var offset = 2 * i;
      var str    = this.hash.slice(offset, offset + 2);
      return parseInt(str, 16);
    };
  };
  
  // Keep an array with weighted values. Each object should have a name key
  // and a weight key.
  var WeightedList = function (rawList) {
    this.list         = {};
    this.weightsTotal = 0;
    
    // Iterate through the array, and assign the weight to each item
    for (var i = 0; i < rawList.length; i++) {
      var item             = rawList[i];
      this.weightsTotal   += item.weight;
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

  // Convert input data into a specific format. Result:
  // {
  //   accessories: [WeightedList],
  //   familiars: [WeightedList],
  //   nations: [WeightedList],
  //   personalities: [WeightedList],
  //   strikers: {
  //     nations[0]: [WeightedList],
  //     nations[1]: [WeightedList],
  //     ...
  //   },
  //   weapons: {
  //     nations[0]: [WeightedList],
  //     nations[1]: [WeightedList],
  //     ...
  //   }
  // }
  var SourceParser = function (source) {
    // Convert an array of items into an array of objects for WeightedList
    var arrayToObjects = function (array) {
      return _.map(array, function (item) {
        return {
          name:   item,
          weight: 1
        };
      });
    };

    var nations = _.collect(source.Nations, function (nation) {
      return {
          name:   nation.name,
          weight: nation.weight
      };
    });

    var nationStrikers = {};
    _.each(source.Nations, function (nation) {
      nationStrikers[nation.name] = new WeightedList(arrayToObjects(nation.strikers));
    });

    var nationWeapons = {};
    _.each(source.Nations, function (nation) {
      nationWeapons[nation.name] = new WeightedList(arrayToObjects(nation.weapons));
    });

    return {
      accessories:   new WeightedList(source.Accessories),
      familiars:     new WeightedList(arrayToObjects(source.Familiars)),
      nations:       new WeightedList(nations),
      personalities: new WeightedList(source.Personalities),
      strikers:      nationStrikers,
      weapons:       nationWeapons
    };
  };
  
  var WitchGen = {
    loadData: function (data) {
      this.data = SourceParser(data);
    },

    generate: function (given_name) {
      var hash = new NameHash(given_name.toLowerCase());
      
      var nation      = this.data.nations.pick(hash.hash_index(0), 255);
      var striker     = this.data.strikers[nation].pick(hash.hash_index(1), 255);
      var weapon      = this.data.weapons[nation].pick(hash.hash_index(2), 255);
      var familiar    = this.data.familiars.pick(hash.hash_index(3), 255);
      var personality = this.data.personalities.pick(hash.hash_index(4), 255);
      var accessory   = this.data.accessories.pick(hash.hash_index(5), 255);
      
      return {
        accessories: accessory,
        familiar:    familiar,
        name:        given_name,
        nation:      nation,
        personality: personality,
        striker:     striker,
        weapon:      weapon
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
    
    $list.append(listItem("Name", witch.name));
    $list.append(listItem("Nation", witch.nation));
    $list.append(listItem("Striker", witch.striker));
    $list.append(listItem("Weapon", witch.weapon));
    $list.append(listItem("Familiar", witch.familiar));
    $list.append(listItem("Personality", witch.personality));
    $list.append(listItem("Accessories", witch.accessories));
  };
  
  window.DisplayWitch = DisplayWitch;
}());

/* init code */
$(document).ready(function() {
  WitchGen.loadData(Data);

  $("#generator").on("submit", function (e) {
    e.preventDefault();

    var witch = WitchGen.generate($("#inputName").val());
    DisplayWitch($("#results"), witch);
    return false;
  });
});