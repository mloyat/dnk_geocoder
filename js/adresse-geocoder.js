/**
 * @file
 * Javascript for the Google Geocoding API geocoder.
 */

/**
 * @typedef {Object} AdresseDataGouvFrResult
 * @property {Object} properties
 * @property {String} properties.street
 * @property {String} properties.city
 * @property {String} properties.postcode
 */

/**
 * @property {String[]} drupalSettings.geolocation.geocoder.adresse_data_gouv_fr.inputIds
 * @property {String} drupalSettings.geolocation.geocoder.adresse_data_gouv_fr.locationPriority
 * @property {float} drupalSettings.geolocation.geocoder.adresse_data_gouv_fr.locationPriority.lat
 * @property {float} drupalSettings.geolocation.geocoder.adresse_data_gouv_fr.locationPriority.lon
 */

(function ($, Drupal) {
  'use strict';

  if (typeof Drupal.geolocation.geocoder === 'undefined') {
    return false;
  }

  drupalSettings.geolocation.geocoder.adresse_data_gouv_fr = drupalSettings.geolocation.geocoder.adresse_data_gouv_fr || {};

  /**
   * Attach geocoder input for AdresseDataGouvFr.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches views geocoder input for AdresseDataGouvFr to relevant elements.
   */
  Drupal.behaviors.geolocationGeocoderAdresseDataGouvFr = {
    attach: function (context) {
      $.each(drupalSettings.geolocation.geocoder.adresse_data_gouv_fr.inputIds, function (index, inputId) {
        var geocoderInput = $('input.geolocation-geocoder-address[data-source-identifier="' + inputId + '"]', context);

        if (geocoderInput.length === 0) {
          return;
        }

        if (geocoderInput.hasClass('geocoder-attached')) {
          return;
        }
        else {
          geocoderInput.addClass('geocoder-attached');
        }

        geocoderInput.autocomplete({
          autoFocus: true,
          source: function (request, response) {
            var autocompleteResults = [];

            var options = {
              q: request.term,
              limit: 3
            };

            var lang = $('html').attr('lang');
            if ($.inArray(lang, ['de', 'en', 'it', 'fr']) !== -1) {
              options.lang = lang;
            }

            if (typeof drupalSettings.geolocation.geocoder.adresse_data_gouv_fr.locationPriority !== 'undefined') {
              $.extend(options, drupalSettings.geolocation.geocoder.adresse_data_gouv_fr.locationPriority);
            }

            $.getJSON(
                'https://api-adresse.data.gouv.fr/search/?q=',
                options,
                function (data) {
                  if (typeof data.features === 'undefined') {
                    response();
                    return;
                  }
                  /**
                   * @param {int} index
                   * @param {AdresseDataGouvFrResult} result
                   */
                  $.each(data.features, function (index, result) {
                    var formatted_address = [];
                    if (typeof result.properties.street !== 'undefined') {
                      formatted_address.push(result.properties.street);
                    }
                    if (typeof result.properties.city !== 'undefined') {
                      formatted_address.push(result.properties.city);
                    }
                    if (typeof result.properties.postcode !== 'undefined') {
                      formatted_address.push(result.properties.postcode);
                    }
                    autocompleteResults.push({
                      value: result.properties.name + ' - ' + formatted_address.join(', '),
                      result: result
                    });
                  });
                  response(autocompleteResults);
                }
            );
          },

          /**
           * Option form autocomplete selected.
           *
           * @param {Object} event - See jquery doc
           * @param {Object} ui - See jquery doc
           * @param {Object} ui.item - See jquery doc
           */
          select: function (event, ui) {
            Drupal.geolocation.geocoder.resultCallback({
                geometry: {
                  location: {
                    lat: function () {
                      return ui.item.result.geometry.coordinates[1];
                    },
                    lng: function () {
                      return ui.item.result.geometry.coordinates[0];
                    }
                  },
                  bounds: ui.item.result.properties.extend
                }
            }, $(event.target).data('source-identifier').toString());
          }
        })
        .on('input', function () {
          Drupal.geolocation.geocoder.clearCallback($(this).data('source-identifier').toString());
        });

      });
    },
    detach: function () {}
  };

})(jQuery, Drupal);
