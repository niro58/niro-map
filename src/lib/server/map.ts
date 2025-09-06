import Supercluster from 'supercluster';

type MapParameters = {
    mapSize: number;
    zoomMin: number;
    zoomMax: number;
    zoomScale: number;
}
type MarkerInput = {
    id: string;
    rank: number;
    lat: number;
    lng: number;
    width: number;
    height: number;
    margin: number;
}
export type MapStatesBody = {
    parameters: MapParameters;
    input: MarkerInput[];
};

type MarkerProperties = {
    index: number;
}

type AggregatedClusterProperties = {
    index: number
}

type MarkerPointFeature = Supercluster.PointFeature<{ index: number }>;
type AnyFeature = Supercluster.ClusterFeature<AggregatedClusterProperties> | MarkerPointFeature;


export class MapHandler {
    static DEGREES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    static DEFAULT_ANGLE_INDEX = this.DEGREES.indexOf(270);

    static async states(body:MapStatesBody) {

        console.time('Preparing points');
        const points: MarkerPointFeature[] = body.input.map((marker, index) => ({
            type: 'Feature',
            properties: {
                index: index,
            },
            geometry: {
                type: 'Point',
                coordinates: [marker.lng, marker.lat],
            },
        }));

        const supercluster = new Supercluster<MarkerProperties, AggregatedClusterProperties>({
            minZoom: body.parameters.zoomMin,
            maxZoom: body.parameters.zoomMax,
            radius: Math.max(body.input[0].width, body.parameters.mapSize / 10),
            extent: body.parameters.mapSize,
            reduce: (accumulated, properties) => {
                accumulated.index = Math.min(accumulated.index, properties.index);
            }
        });

        supercluster.load(points);
        console.timeEnd('Preparing points');

        const pointsResult: [number, [number, number][]][] = body.input.map(() => ([-1, []]))
        console.time('getAllExpansionZooms');
        const eventZooms = this.getAllExpansionZooms(supercluster, body.parameters);
        console.timeEnd('getAllExpansionZooms');

        console.time('Main loop');
        for (const zoom of eventZooms) {
            const featuresAtZoom = supercluster.getClusters([-180, -90, 180, 90], zoom);
            for (const feature of featuresAtZoom) {
                const index = feature.properties.index;

                if (pointsResult[index][0] === -1) {
                    pointsResult[index][0] = zoom;
                }
                const r: [number, number] = [zoom, this.calculateTooltipAngle(feature, featuresAtZoom)];

                if (pointsResult[index][1].length > 0 && pointsResult[index][1][pointsResult[index][1].length - 1][1] === r[1]) {
                    continue;
                }
                pointsResult[index][1].push(r);
            }
        }
        console.timeEnd('Main loop');

        return {
            points: pointsResult
        }
    }


    private static getAllExpansionZooms(supercluster: Supercluster<MarkerProperties, AggregatedClusterProperties>, params: MapParameters): number[] {
        const zooms = new Set<number>([0]);
        for (let z = params.zoomMin; z < params.zoomMax; z++) {
            const clusters = supercluster.getClusters([-180, -90, 180, 90], z);
            for (const cluster of clusters) {
                if ('cluster' in cluster.properties) {
                    const expansionZoom = supercluster.getClusterExpansionZoom(cluster.properties.cluster_id);
                    zooms.add(expansionZoom);
                }
            }
        }
        return Array.from(zooms).sort((a, b) => a - b);
    }

    private static calculateTooltipAngle(
        currentFeature: AnyFeature,
        allFeatures: AnyFeature[]
    ): number {
        const [x, y] = currentFeature.geometry.coordinates;
        const currentId = (currentFeature.properties as MarkerProperties).index;

        let closestNeighbor: AnyFeature | null = null;
        let minDistanceSq = Infinity;

        for (const feature of allFeatures) {
            const featureId = feature.properties.index

            if (featureId === currentId) continue;

            const [nx, ny] = feature.geometry.coordinates;
            const distanceSq = (x - nx) ** 2 + (y - ny) ** 2;

            if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                closestNeighbor = feature;
            }
        }

        if (!closestNeighbor) return this.DEFAULT_ANGLE_INDEX;

        const [nx, ny] = closestNeighbor.geometry.coordinates;
        const angleFromNeighbor = Math.atan2(y - ny, x - nx) * 180 / Math.PI;

        let bestAngle = 0;
        let maxAngleDiff = -1;

        for (const angle of this.DEGREES) {
            let diff = Math.abs(angle - angleFromNeighbor);
            if (diff > 180) diff = 360 - diff;
            if (diff > maxAngleDiff) {
                maxAngleDiff = diff;
                bestAngle = angle;
            }
        }

        return this.DEGREES.indexOf(bestAngle);
    }


}