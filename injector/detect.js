"use strict";

module.exports = class Detector {
  static isWordPress(html) {
    return /wp-content|wp-includes|wordpress/i.test(html);
  }

  static isShopify(html) {
    return /shopify|cdn.shopify.com|shopify-section/i.test(html);
  }

  static detect(url, html) {
    if (this.isWordPress(html)) return 'wordpress';
    if (this.isShopify(html)) return 'shopify';
    return null;
  }
};