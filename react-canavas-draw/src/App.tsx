import * as React from 'react';
import { useEffect, } from 'react';
import { io } from 'socket.io-client';
import Draw from 'ol/interaction/Draw.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';

export const socket = io('ws://localhost:1337');

let draw: any; // we can remove it later

const raster = new TileLayer({
	source: new OSM(),
});

const source = new VectorSource({ wrapX: false });

const vector = new VectorLayer({
	source: source,
});

const map = new Map({
	layers: [raster, vector],
	target: 'map',
	view: new View({
		center: [-11000000, 4600000],
		zoom: 4,
	}),
});

const typeSelect = document.getElementById('type') as any;

	function addInteraction() {
		const value = typeSelect.value;
		if (value !== 'None') {
			if (value === 'Draw') {
				draw = new Draw({
					source: source,
					type: 'LineString',
					freehand: true,
				});
			} else {
				draw = new Draw({
					source: source,
					type: typeSelect.value,
				});
			}
			map.addInteraction(draw);
		}

		draw.on('drawend', (event: { feature: { getGeometry: () => any } }) => {
      const geojson = new GeoJSON().writeFeature(event.feature as any);
      // console.log(geojson)
      const geometry = event.feature.getGeometry();
      // console.log(geometry);
			socket.emit('send-geometry', geojson);
		});
	}
	addInteraction();

	typeSelect.onchange = function () {
		map.removeInteraction(draw);
		addInteraction();
	};

function App() {
  useEffect(() => {

    socket.emit('join', {name: 'WINU-0725'});
    socket.on('geometry', (data) => {
      const feature =  new GeoJSON().readFeature(data);
      console.log(feature);
      source.addFeature(feature as any);
    });

    return () => {
      socket.off('geometry', (data) => {
				// console.log(data);
			});
    };
  }, []);

  return (
    <>
    </>
  );
}

export default App;
