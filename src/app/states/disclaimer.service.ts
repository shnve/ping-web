import { Injectable } from '@angular/core';

const HIDE_DISPLAY_DEVICE_ORIENTATION_MODE_DISCLAIMER = 'hideDisplayDeviceOrientationModeDisclaimer';

@Injectable({
  providedIn: 'root'
})
export class DisclaimerService {

  constructor() {}

  neverShowAgainDisplayMapDisclaimerForArea(areaId: string): void {
    localStorage.setItem(`hideDisplayMapDisclaimerForArea-${areaId}`, 'true');
  }

  showDisplayMapDisclaimerForArea(areaId: string): boolean {
    return !localStorage.getItem(`hideDisplayMapDisclaimerForArea-${areaId}`);
  }

  neverShowAgainDisplayTableDisclaimerForArea(areaId: string): void {
    localStorage.setItem(`hideDisplayTableDisclaimerForArea-${areaId}`, 'true');
  }

  showDisplayTableDisclaimerForArea(areaId: string): boolean {
    return !localStorage.getItem(`hideDisplayTableDisclaimerForArea-${areaId}`);
  }

  neverShowAgainDisplayGeoregulationDisclaimerForArea(areaId: string): void {
    localStorage.setItem(`hideDisplayGeoregulationDisclaimerForArea-${areaId}`, 'true');
  }

  showDisplayGeoregulationDisclaimerForArea(areaId: string): boolean {
    return !localStorage.getItem(`hideDisplayGeoregulationDisclaimerForArea-${areaId}`);
  }

  neverShowAgainDisplayDeviceOrientationModeDisclaimer(): void {
    localStorage.setItem(HIDE_DISPLAY_DEVICE_ORIENTATION_MODE_DISCLAIMER, 'true');
  }

  showDisplayDeviceOrientationModeDisclaimer(): boolean {
    return !localStorage.getItem(HIDE_DISPLAY_DEVICE_ORIENTATION_MODE_DISCLAIMER);
  }
}
