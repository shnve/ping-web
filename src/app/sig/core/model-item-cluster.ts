import { getUid } from 'ol';
import { buffer, createEmpty, createOrUpdateFromCoordinate, extend } from 'ol/extent';
import Feature from 'ol/Feature';
import Cluster, { Options as ClusterOptions } from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';

interface Options extends ClusterOptions{
  extentSizeMultiplier?: number;
}

export class ModelItemCluster extends Cluster {
  protected source: VectorSource;
  /**
   * If clustering is enabled
   */
  protected enabled: boolean;

  /**
   * Enlarge or shrink features extent representation
   * A feature with extentSizeMultiplier (N) is put out of any cluster if feature.maxExtentAxis * N > distance * resolution
   */
  protected extentSizeMultiplier: number;

  constructor(options: Options) {
    super(options);
    this.source = options.source;
    this.enabled = true;
    this.extentSizeMultiplier = options.extentSizeMultiplier || 1;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  protected cluster(): void {
    if (this.resolution === undefined || !this.source) {
      return;
    }
    const features = this.source.getFeatures();
    if(!this.enabled) {
      // Display all features without cluster
      this.features = features;
      return;
    }
    const clusters: Feature[] = [];
    const featuresOutOfClusters = [];
    const extent = createEmpty();
    const mapDistance = this.distance * this.resolution;
    const clustered: {[key: string]: boolean} = {};

    for (const feature of features) {
      const featureId = getUid(feature);
      if(clustered[featureId]) {
        continue;
      }
      // If feature is bigger than distance to create cluster
      // It is added alone, out of any cluster
      if(this.isFeatureExtentBiggerThanDistance(feature, mapDistance)) {
        clustered[featureId] = true;
        featuresOutOfClusters.push(feature);
        continue;
      }
      const geometry = this.geometryFunction(feature);
      if (geometry) {
        const coordinates = geometry.getCoordinates();
        createOrUpdateFromCoordinate(coordinates, extent);
        buffer(extent, mapDistance, extent);

        const neighbors = this.source.getFeaturesInExtent(extent)
          .filter(this.filterNeighbors.bind(this, clustered, featuresOutOfClusters, mapDistance));
        // If feature is alone in his cluster
        // Add it out of any cluster
        if(neighbors.length === 1) {
          featuresOutOfClusters.push(neighbors[0]);
        } else {
          clusters.push(this.createCluster(neighbors));
        }
      }
    }
    this.features = [
      ...featuresOutOfClusters,
      ...clusters
    ];
  }

  private filterNeighbors(clustered: Array<boolean>,
                          featuresOutOfClusters: Array<Feature>,
                          mapDistance: number,
                          neighbor: Feature) {
    const uid = getUid(neighbor);
    if (clustered[uid]) {
      return false;
    } else if(this.isFeatureExtentBiggerThanDistance(neighbor, mapDistance)) {
      // Add biggers features here (in a filter) to avoid some loop tour
      clustered[uid] = true;
      featuresOutOfClusters.push(neighbor);
      return false;
    } else {
      clustered[uid] = true;
      return true;
    }
  }

  protected createCluster(features: Feature[]): Feature {
    const extent = createEmpty();
    features.forEach(feature => extend(extent, feature.getGeometry().getExtent()));
    const clusterFeature = super.createCluster(features, extent);
    clusterFeature.set('isCluster', true);
    return clusterFeature;
  }

  /**
   * Check if feature is bigger than distance to create cluster
   * @param {Feature} feature
   * @param {number} distance
   * @returns {boolean}
   */
  private isFeatureExtentBiggerThanDistance(feature: Feature, distance: number): boolean {
    const featureMaxExtentAxis = feature.get('maxExtentAxis');
    return featureMaxExtentAxis * this.extentSizeMultiplier > distance;
  }
}
