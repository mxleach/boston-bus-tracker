// window on load ??? 
window.onload = () => {
  reqRoutes();
}

// declare known variables
const routeList = document.getElementById("routeList");
const searchData = document.getElementById("searchBtn");
const busRoutes = document.getElementById("routesNum");
let markerArr = [];
let timerId = null;


// load mapbox and access token
mapboxgl.accessToken =
   "pk.eyJ1IjoibXhkZXYiLCJhIjoiY2wyamJnYTFqMHcyODNjbXNlaGY1ZzN1MyJ9.sxCnBK0jjlau6F4s6JD7_g";
  
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mxdev/cl2s1r1wj004t14p53t0m50mj",
    center: [-71.0942, 42.3601],
    zoom: 11
  });

  // draw geojson
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          message: "Foo",
          iconSize: [60, 60],
        },
        geometry: {
          type: "Point",
          coordinates: [],
        },
      },
      {
        type: "Feature",
        properties: {
          message: "Bus",
          iconSize: [50, 50],
        },
        geometry: {
          type: "Point",
          coordinates: [],
        },
      },
      {
        type: "Feature",
        properties: {
          message: "Bus",
          iconSize: [40, 40],
        },
        geometry: {
          type: "Point",
          coordinates: [],
        },
      },
    ],
  };

  // add map zoom/nav toggles
  map.addControl(new mapboxgl.NavigationControl());

  // Pull bus route data from the MBTA api
  const getBusData = async () => {
      const response = await fetch("https://api-v3.mbta.com/vehicles/");
      const busData = await response.json();
      return busData.data;
  };

  // push available MBTA bus routes to the options within dropdown
  const reqRoutes   = async () => {
      const data = await getBusData();
      const menuArr = [];

      for (let i = 0; i < data.length; i++){
          menuArr.push(data[i].relationships.route.data.id);
      }
// update menu array when new routes become available

   const mainArr = [...new Set(menuArr)];
   
   for (route of mainArr) {
       const newRoute = document.createElement("option");
       newRoute.value = route;
       newRoute.innerText = route;
       routeList.appendChild(newRoute);

   }
  };

// filter buses by route
const selectRoute = async () => {
    const route = document.getElementById("routeList").value;
    const data = await getBusData();

    const selectRoute = data.filter( 
        (data) => data.relationships.route.data.id === route);  
        return selectRoute;
};

// toggle map modes 
const layerList = document.getElementById('menu');
  const inputs = layerList.getElementsByTagName('input');
   
  for (const input of inputs) {
  input.onclick = (layer) => {
  const layerId = layer.target.id;
  map.setStyle('mapbox://styles/mapbox/' + layerId);
  };
  }

  // display bus data and create a new div element (represented by marker/icon) for each new 'bus'
const showBuses = async () => {
    const filterArr = await selectRoute();

    for (let i = 0; i < filterArr.length; i++){
        const el = document.createElement('div');

        for (const marker of geojson.features){
            const width = marker.properties.iconSize[0];
            const height = marker.properties.iconSize[1];
            el.className = "marker";
            el.style.backgroundImage = 'url(images/bus.png)';
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
            el.style.backgroundSize = "100%";
        }

        let marker = new mapboxgl.Marker(el);

        marker.setLngLat([
            filterArr[i].attributes.longitude,
            filterArr[i].attributes.latitude,
        ]);
        marker.addTo(map);
        markerArr.push(marker);

    }
    busRoutes.innerText = `${markerArr.length} available buses`;
};

// refresh the map when new opt selected & once selected refresh 15ms
const refreshMap = () => {
  for (let i = 0; i < markerArr.length; i++){
    markerArr[i].remove();
  }
  markerArr = [];
};

const move = () => {
  refreshMap();

  timerId = setTimeout(() => {
    showBuses();
    move();
  },15000);
};


// add event listener for search button and trigger update functions to search for bus data
searchData.addEventListener('click', () => {
  if (document.getElementById('routeList').value === ""){
    alert("Please Select a Route");
    return;
  }
  showBuses()
  move();
});