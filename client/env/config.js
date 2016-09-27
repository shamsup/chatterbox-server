// All this is doing is inserting the parse API keys into every $.ajax
// request that you make so you don't have to.

// Put your parse application keys here!
$.ajaxPrefilter(function (settings, _, jqXHR) {
  jqXHR.setRequestHeader('X-Parse-Application-Id', 'voLazbq9nXuZuos9hsmprUz7JwM2N0asnPnUcI7r');
  jqXHR.setRequestHeader('X-Parse-REST-API-Key', 'QC2F43aSAghM97XidJw8Qiy1NXlpL5LR45rhAVAf');
});
