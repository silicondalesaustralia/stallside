/**
 * Persist Meta/Google click ids from the landing URL into a first-party cookie
 * before React hydrates, so OTP redirects cannot drop fbclid.
 * Loaded via next/script src (avoids React 19 inline <script> warning).
 */
(function () {
  try {
    var C = "ss_ad_attr";
    var MAX = 60 * 60 * 24 * 90;
    var KEYS = [
      "fbclid",
      "fbc",
      "fbp",
      "gclid",
      "gbraid",
      "wbraid",
      "ttclid",
      "msclkid",
      "rdt_cid",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ];
    function readCookie() {
      var m = document.cookie.match(new RegExp("(?:^|; )" + C + "=([^;]*)"));
      if (!m) return {};
      try {
        return JSON.parse(decodeURIComponent(m[1])) || {};
      } catch (e) {
        return {};
      }
    }
    function write(obj) {
      document.cookie =
        C +
        "=" +
        encodeURIComponent(JSON.stringify(obj)) +
        ";path=/;max-age=" +
        MAX +
        ";SameSite=Lax";
    }
    var prev = readCookie();
    var next = {};
    for (var k in prev) {
      if (prev[k]) next[k] = prev[k];
    }
    var q = new URLSearchParams(location.search);
    var hit = false;
    for (var i = 0; i < KEYS.length; i++) {
      var key = KEYS[i];
      var v = q.get(key);
      if (v) {
        next[key] = v;
        hit = true;
      }
    }
    if (hit) {
      if (!next.landingUrl) next.landingUrl = location.href;
      next.capturedAt = new Date().toISOString();
      if (next.fbclid && !next.fbc)
        next.fbc = "fb.1." + Date.now() + "." + next.fbclid;
      if (next.fbc)
        document.cookie =
          "_fbc=" + next.fbc + ";path=/;max-age=" + MAX + ";SameSite=Lax";
      write(next);
    }
  } catch (e) {}
})();
