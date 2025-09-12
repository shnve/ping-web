import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { ModelItemCluster } from './model-item-cluster';

// Extension of WarningCluster to access to protected methods
class ModelItemClusterExtended extends ModelItemCluster {
  setResolution(resolution: number) {
    this.resolution = resolution;
  }

  getFeatures(): Feature[] {
    return this.features;
  }

  clusterExtended() {
    this.cluster();
  }
}
// Returns clusters features in 'clusters' and feature out of clusters in 'outFeatures'
function getClusterAndFeature(feature: Feature[]): {clusters: Feature[], outFeatures: Feature[]} {
  const res = {clusters: [], outFeatures: []};
  feature.forEach(feature => {
    if(feature.get('isCluster')) {
      res.clusters.push(feature);
    } else {
      res.outFeatures.push(feature);
    }
  });
  return res;
}

describe('ModelItemCluster', () => {
  let warningCluster: ModelItemClusterExtended;
  let source: VectorSource;

  beforeEach(() => {
    source = new VectorSource({});
    warningCluster = new ModelItemClusterExtended({source});
  });

  it('Should create no cluster because feature is alone in source', () => {
    const feature1 = new Feature(new Point([0,0]));
    source.addFeatures([
      feature1
    ]);
    warningCluster.setResolution(1);
    warningCluster.setDistance(1);
    warningCluster.clusterExtended();
    const clusteredFeatures = warningCluster.getFeatures();
    expect(clusteredFeatures.length).toEqual(1);
    expect(clusteredFeatures[0]).toBe(feature1);
  });

  it('Should not create no cluster because on feature extent is too big and the other is alone', () => {
    const feature1 = new Feature({
      geometry: new Point([0,0]),
      maxExtentAxis: 10
    });
    const feature2 = new Feature({
      geometry: new Point([0,0]),
      maxExtentAxis: 1
    });
    source.addFeatures([
      feature1,
      feature2
    ]);
    warningCluster.setResolution(1);
    warningCluster.setDistance(5);
    warningCluster.clusterExtended();
    const clusteredFeatures = warningCluster.getFeatures();
    const {clusters, outFeatures} = getClusterAndFeature(clusteredFeatures);
    expect(clusteredFeatures.length).toEqual(2);
    expect(outFeatures.length).toEqual(2);
    expect(clusters.length).toEqual(0);
  });

  it('Should create one cluster with two feature - two features with same coordinate', () => {
    const feature1 = new Feature({
      geometry: new Point([0,0]),
      maxExtentAxis: 10
    });
    const feature2 = new Feature({
      geometry: new Point([0,0]),
      maxExtentAxis: 1
    });
    source.addFeatures([
      feature1,
      feature2
    ]);
    warningCluster.setResolution(1);
    warningCluster.setDistance(11);
    warningCluster.clusterExtended();
    const clusteredFeatures = warningCluster.getFeatures();
    const {clusters, outFeatures} = getClusterAndFeature(clusteredFeatures);
    expect(clusteredFeatures.length).toEqual(1);
    expect(outFeatures.length).toEqual(0);
    expect(clusters.length).toEqual(1);
    const [cluster] = clusters;
    expect(cluster.get('features')).toBeTruthy();
    expect(cluster.get('features') as Feature[]).toContain(feature1);
    expect(cluster.get('features') as Feature[]).toContain(feature2);
  });

});
