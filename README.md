# dnk_geocoder
Provides a geocoder plugin for leaflet geolocation field (drupal 8) connected with adresse.data.gouv.fr (french opendata geocoding service).

Only works with french addresses.

## Installation
- Install the drupal 8 geolocation module (https://www.drupal.org/project/geolocation) and this module.
- Create a geolocation field whose form widget will be "Geolocation Leaflet - Geocoding and Map"
- In widget settings > Leaflet settings  > Map Control - Geocoder, chose adresse.data.gouv.fr

