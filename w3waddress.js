if (Meteor.isClient) {
  // client method stubs
  Meteor.methods({
    getAddress:function(string){
      Session.set("address","Getting address for: " + string);
    }
  });

  Session.set("address","");

  Template.main.address = function() {
    return Session.get("address");
  }

  Template.main.events({
    'click #getAddressBtn': function () {
      Meteor.call("getAddress",$("#string").val(),function(error,address){
        console.log(error);
        console.log(address);
        Session.set("address",address);
      });
    }
  });
}


if (Meteor.isServer) {
  Meteor.methods({
      getAddress:function(string,cb) {
      // we need to use "future" because our calls are async and the client
      // needs to wait to set values until after they come back from the server
      Future = Npm.require('fibers/future');
      var fut = new Future();

      console.log(string);
      var params = {
          'key':    '9IWU41N4',
          'string': string
        };

      HTTP.post('http://api.what3words.com/w3w', {params:params}, function(err,res) {
        if ("error" in res) {
          // Session.set("address","Error! "+res.message);
          fut.return(res.message);
        }

        console.log("result:"+JSON.stringify(res));
        var result = JSON.parse(res.content);
        if (!("position" in result)) {
          fut.return("W3W not found!");
        }
        var latLng = result.position[0] + "," + result.position[1];
        params = {
          'latlng':latLng,
          'sensor':'true'
        };

        HTTP.get('http://maps.googleapis.com/maps/api/geocode/json',{params:params}, function(err,res) {
          // console.log("geocoded:"+JSON.stringify(res.content));
          // console.log(res.results[0].formatted_address);

          var result = JSON.parse(res.content);
          address = result.results[0].formatted_address;
          console.log(address);
          fut.return(address);
      });  
      });  
      return fut.wait();
}
});
}
