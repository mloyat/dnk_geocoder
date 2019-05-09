<?php

namespace Drupal\dnk_geocoder\Plugin\geolocation\Geocoder;

use Drupal\geolocation\GeocoderBase;
use Drupal\geolocation\GeocoderInterface;
use Drupal\Component\Serialization\Json;
use GuzzleHttp\Exception\RequestException;
use Drupal\Core\Url;
use Drupal\Core\Render\BubbleableMetadata;

/**
 * Provides the Adresse Data Gouv.
 *
 * @Geocoder(
 *   id = "adresse_data_gouv_fr",
 *   name = @Translation("adresse.data.gouv.fr"),
 *   description = @Translation("See https://adresse.data.gouv.fr for details."),
 *   locationCapable = true,
 *   boundaryCapable = true,
 *   frontendCapable = true,
 *   reverseCapable = false,
 * )
 */
class AddresseDataGouvFr extends GeocoderBase implements GeocoderInterface {

  /**
   * {@inheritdoc}
   */
  protected function getDefaultSettings() {
    $default_settings = parent::getDefaultSettings();

    $default_settings['location_priority'] = [
      'lat' => '',
      'lng' => '',
    ];

    return $default_settings;
  }

  /**
   * {@inheritdoc}
   */
  public function getOptionsForm() {

    $settings = $this->getSettings();

    $form = parent::getOptionsForm();

    $form['location_priority'] = [
      '#type' => 'geolocation_input',
      '#title' => $this->t('Location Priority'),
      '#default_value' => [
        'lat' => $settings['location_priority']['lat'],
        'lng' => $settings['location_priority']['lng'],
      ],
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function formAttachGeocoder(array &$render_array, $element_name) {
    parent::formAttachGeocoder($render_array, $element_name);

    $settings = $this->getSettings();

    $render_array['#attached'] = BubbleableMetadata::mergeAttachments(
      empty($render_array['#attached']) ? [] : $render_array['#attached'],
      [
        'library' => [
          'dnk_geocoder/geocoder.adresse_data_gouv_fr',
        ],
        'drupalSettings' => [
          'geolocation' => [
            'geocoder' => [
              $this->getPluginId() => [
                'locationPriority' => [
                  'lat' => $settings['location_priority']['lat'],
                  'lon' => $settings['location_priority']['lng'],
                ],
              ],
            ],
          ],
        ],
      ]
    );
  }

  /**
   * {@inheritdoc}
   */
  public function geocode($address) {
    if (empty($address)) {
      return FALSE;
    }

    $options = [
      'q' => $address,
      'limit' => 1,
    ];

    $url = Url::fromUri('https://api-adresse.data.gouv.fr/search/', [
      'query' => $options,
    ]);

    try {
      $result = Json::decode(\Drupal::httpClient()->get($url->toString())->getBody());
    }
    catch (RequestException $e) {
      watchdog_exception('geolocation', $e);
      return FALSE;
    }

    $location = [];

    if (empty($result['features'][0])) {
      return FALSE;
    }

    $result = $result['features'][0];
    
    if (!empty($result['geometry']['coordinates'])) {
      $location['location'] = [
        'lat' => $result['geometry']['coordinates'][0],
        'lng' => $result['geometry']['coordinates'][1],
      ];
    }


    if (!empty($result['properties']['label'])) {
      $location['address'] = $result['properties']['label'];
    }

    return $location;
  }

}
