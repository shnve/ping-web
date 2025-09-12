import { FeaturePart } from '../models/creation-warning.model';

export function getNumberForPart(searchedPart: FeaturePart, featureParts: FeaturePart[]): number {
  return featureParts.findIndex(part => part === searchedPart) + 1;
}