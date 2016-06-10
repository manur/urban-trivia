
var API_KEY = 'AIzaSyD1UtTaoZKhoM6yAAgLCgRy8o2A-HcArYQ';

var City = Backbone.Model.extend({
  initialize: function() {
              },

  geocode: function() {
             var address = this.get('address');
             var model = this;

             if(this.cached(address)) {
               console.log('Using cached geocode');
               var cache = this.cached(address);
               this.set('lat', cache[0]);
               this.set('lng', cache[1]);
               model.trigger('ready');
             } else {
               console.log("Geocoding " + address);
               var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=' + API_KEY;
               var city = this;

               $.get(url, function(response) {
                 city.set('lat', response.results[0].geometry.location.lat);
                 city.set('lng', response.results[0].geometry.location.lng);

                 if(city.lat && city.lng) {
                   city.encache(address, city.lat, city.lng);
                 }

                 model.trigger('ready');
               });
             }
           },

    encache: function(address, lat, lng) {
               window.localStorage.setItem('geocode:' + address, [lat, lng]);
             },

    cached: function(address) {
             console.log("Getting geocode from cache for " + address);
              window.localStorage.getItem('geocode:' + address);
            }
});

var Cities = Backbone.Collection.extend({
  model: City,

  initialize: function(attrs) {
  }
});


var Map = Backbone.View.extend({
  initialize: function() {
              },

  styles: [
     {
         "featureType": "all",
         "elementType": "geometry",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "all",
         "elementType": "labels",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "landscape",
         "elementType": "all",
         "stylers": [
             {
                 "color": "#ffffff"
             },
             {
                 "visibility": "on"
             }
         ]
     },
     {
         "featureType": "poi",
         "elementType": "labels",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "road",
         "elementType": "geometry",
         "stylers": [
             {
                 "visibility": "on"
             },
             {
                 "color": "#000000"
             }
         ]
     },
     {
         "featureType": "road",
         "elementType": "labels",
         "stylers": [
             {
                 "visibility": "on"
             }
         ]
     },
     {
         "featureType": "road",
         "elementType": "labels.text",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "road.highway",
         "elementType": "all",
         "stylers": [
             {
                 "weight": "0.6"
             }
         ]
     },
     {
         "featureType": "road.highway.controlled_access",
         "elementType": "all",
         "stylers": [
             {
                 "weight": "0.6"
             }
         ]
     },
     {
         "featureType": "road.arterial",
         "elementType": "all",
         "stylers": [
             {
                 "weight": "0.5"
             }
         ]
     },
     {
         "featureType": "road.local",
         "elementType": "all",
         "stylers": [
             {
                 "weight": "0"
             }
         ]
     },
     {
         "featureType": "road.highway",
         "elementType": "labels",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "road.highway.controlled_access",
         "elementType": "labels",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "road.arterial",
         "elementType": "labels",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "road",
         "elementType": "labels.icon",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
     {
         "featureType": "road.local",
         "elementType": "all",
         "stylers": [
             {
                 "visibility": "off"
             }
         ]
     },
    {
        "featureType": "administrative",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#444444",
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#7e8aa2"
            },
            {
                "visibility": "on"
            }
        ]
    }
  ], 

    render: function() {
      console.log('Creating map');

      var mapStyles = this.styles;


      // Basic options for a simple Google Map
      // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
      var mapOptions = {
        // How zoomed in you want the map to start at (always required)
        zoom: 12,
        minZoom: 11,
        maxZoom: 14,

        // The latitude and longitude to center the map (always required)
        center: new google.maps.LatLng(this.model.get('lat'), this.model.get('lng')),

        // How you would like to style the map. 
        // This is where you would paste any style found on Snazzy Maps.
        styles: mapStyles
      };

      // Get the HTML DOM element that will contain your map 
      // We are using a div with id="map" seen below in the <body>
      var mapElement = this.$el[0];
      var useragent = navigator.userAgent;

      if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
        mapElement.style.height = '100%';
      } else {
        mapElement.style.height = '600px';
      }

      // Create the Google Map using our element and options defined above
      var map = new google.maps.Map(mapElement, mapOptions);
    }
});


var Question = Backbone.View.extend({
  template: Handlebars.compile($('#question-template').html()),
  optionsTemplate: Handlebars.compile($('#options-template').html()),

    initialize: function() {
    },

    render: function() {
              var question = this;
              this.$el.html(this.template());

              var options = this.model.get('options');
              console.log(options);

              _.each(options, function(option) {
                var $option = $(question.optionsTemplate({ address: option }));
                $option.appendTo(question.$el.find('#answers .options'))
              });

              var map = new Map({
                model: this.model,
                  el: this.$el.find('.map')
              });

              map.render();
              console.log("Rendering $map:", this.$el.find('.map'));

            },

    answer: function() {

            }
});

var Questions = Backbone.View.extend({
  initialize: function() {
              },

  render: function() {
            this.$el.html('');
            var questions = this;

            this.collection.each(function(city) {
              console.log("Rendering model: ", city);

              city.on('ready', function() {
                console.log('Geocoded', this.attributes);

                var qn = new Question({
                  model: city
                });

                qn.render();
                qn.$el.appendTo(questions.$el);
              });

              city.geocode();
            });
          }
});



function initMap() {
  window.game = {};

  game.addresses = [
    'Bengaluru, India',
    'Mumbai, India',
    'Kolkata, India',
    'Chandigarh, India',
    'Tokyo, Japan',
    'Singapore',
    'Hong Kong',
    'Shanghai, China',
    'Paris, France',
    'London, United Kingdom',
    'Rome, Italy',
    'Washington DC, USA',
    'New York, USA',
    'San Francisco, USA',
    'Cape Town, South Africa',
    'Mombasa, Kenya',
    'St. Petersburg, Russia',
    'Istanbul, Turkey'
  ];

  game.cities = new Cities({
  });

  game.addresses.forEach(function(address) {

    options = _.sample(_.shuffle(_.reject(game.addresses, address)), 3);
    options.push(address);

    game.cities.push(new City({
      address: address,
      options: options
    }));
  });

  game.questions = new Questions({
    el: $('.questions'),
    collection: game.cities
  });

  game.questions.render();
}

