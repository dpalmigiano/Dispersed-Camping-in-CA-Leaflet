(function(root, factory){
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('@turf/turf'));
  } else {
    root.findCamping = factory(root.turf);
  }
}(this, function(turf){
  async function loadGeoJSON(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error('Failed to fetch ' + url);
    return res.json();
  }

  function pointInFeatures(point, features){
    for (const feature of features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        return true;
      }
    }
    return false;
  }

  function nearestLegal(point, features){
    let nearest = null;
    let minDist = Infinity;
    for(const feature of features){
      const centroid = turf.centroid(feature);
      const dist = turf.distance(point, centroid, {units: 'kilometers'});
      if(dist < minDist){
        minDist = dist;
        nearest = centroid;
      }
    }
    return nearest;
  }

  function checkLocation(){
    if(!navigator.geolocation){
      document.getElementById('status').textContent = 'Geolocation is not supported.';
      return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
      document.getElementById('status').textContent = 'Checking location...';
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const point = turf.point([lon, lat]);
      try{
        const camp = await loadGeoJSON('https://gist.githubusercontent.com/EricSamsonCarto/af6dc91c42439d8319ab1659981f003e/raw/c8f595f6d29fa828c4c8f6e0c869c62992c74384/CampLand.geojson');
        const noCamp = await loadGeoJSON('https://gist.githubusercontent.com/EricSamsonCarto/7e726743481826e0a4c5dff96f99db38/raw/b114b9b9438783b9479f4b08e0031f03f7a83ae2/NoCampLand.geojson');
        if(pointInFeatures(point, noCamp.features)){
          document.getElementById('result').textContent = 'Dispersed camping is not allowed at your current location.';
          const nearest = nearestLegal(point, camp.features);
          if(nearest){
            const [nLon, nLat] = nearest.geometry.coordinates;
            const gLink = `https://www.google.com/maps/dir/?api=1&destination=${nLat},${nLon}&travelmode=driving&dir_action=navigate`;
            const a = document.createElement('a');
            a.href = gLink;
            a.textContent = 'Navigate to nearest legal location';
            a.target = '_blank';
            document.getElementById('link').appendChild(a);
          }
        } else if(pointInFeatures(point, camp.features)){
          document.getElementById('result').textContent = 'You are currently in an area where dispersed camping is allowed.';
        } else {
          document.getElementById('result').textContent = 'Unable to determine legality at your location.';
        }
      }catch(err){
        document.getElementById('status').textContent = 'Error: ' + err.message;
      }
    }, err => {
      document.getElementById('status').textContent = 'Location error: ' + err.message;
    });
  }

  return {loadGeoJSON, pointInFeatures, nearestLegal, checkLocation};
}));
