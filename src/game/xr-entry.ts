export type XRMode = 'immersive-vr' | 'immersive-ar';

export interface XRSupport {
  vr: boolean;
  ar: boolean;
}

export async function probeXRSupport(
  xr: Pick<XRSystem, 'isSessionSupported'> | undefined,
): Promise<XRSupport> {
  if (!xr?.isSessionSupported) return {vr: false, ar: false};
  const check = async (mode: XRMode) => {
    try {
      return !!(await xr.isSessionSupported(mode));
    } catch {
      return false;
    }
  };
  const [vr, ar] = await Promise.all([
    check('immersive-vr'),
    check('immersive-ar'),
  ]);
  return {vr, ar};
}

export function isXRSupported(support: XRSupport): boolean {
  return support.vr || support.ar;
}

export function preferredXRMode(
  support: XRSupport,
  preferPassthrough = false,
): XRMode | null {
  if (preferPassthrough && support.ar) return 'immersive-ar';
  if (support.vr) return 'immersive-vr';
  if (support.ar) return 'immersive-ar';
  return null;
}

export function fallbackXRMode(
  failed: XRMode,
  support: XRSupport,
): XRMode | null {
  if (failed === 'immersive-vr' && support.ar) return 'immersive-ar';
  if (failed === 'immersive-ar' && support.vr) return 'immersive-vr';
  return null;
}

export function emulateHref(search = typeof location === 'undefined' ? '' : location.search): string {
  const params = new URLSearchParams(search);
  params.set('emulate', '');
  const value = params.toString().replace(/=(?=&|$)/g, '');
  return value ? `?${value}` : '?emulate';
}

export function xrFeedback(
  kind:
    | 'checking'
    | 'starting'
    | 'trying-ar'
    | 'entered-vr'
    | 'entered-ar'
    | 'ended'
    | 'unavailable'
    | 'failed',
  emulateAvailable = true,
): string {
  switch (kind) {
    case 'checking':
      return 'Checking immersive support…';
    case 'starting':
      return 'Starting immersive mode. Allow hand tracking when asked.';
    case 'trying-ar':
      return 'VR did not start. Trying mixed-reality passthrough…';
    case 'entered-vr':
      return 'Hands ready: pinch and hold on Your outline, go around the guide, then release.';
    case 'entered-ar':
      return 'Passthrough session started. Pinch and hold on Your outline, go around the guide, then release.';
    case 'ended':
      return 'XR session ended. Your creation is safe. Enter XR again when you are ready.';
    case 'unavailable':
      return emulateAvailable
        ? 'XR is unavailable in this browser. On a Quest, open this page in Quest Browser. To preview here, choose Preview XR — it reloads with the official emulator (?emulate). Desktop drawing still works.'
        : 'XR is unavailable in this browser or device. Use Quest Browser or the official emulator; desktop drawing works here.';
    case 'failed':
      return emulateAvailable
        ? 'XR could not start. Check headset support and permission, or choose Preview XR to emulate in this browser. You can still draw on Your outline here.'
        : 'XR could not start. Check headset support and permission. You can still draw on Your outline here.';
  }
}
