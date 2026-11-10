/** Optional desktop IWER Quest 3 runtime, installed only when the URL has ?emulate. */
async function boot() {
  const params = new URLSearchParams(location.search);
  if (params.has('emulate')) {
    const native = await navigator.xr
      ?.isSessionSupported('immersive-vr')
      .catch(() => false);
    if (!native) {
      try {
        const {XRDevice, metaQuest3} = await import('iwer');
        const device = new XRDevice(metaQuest3);
        device.installRuntime({forceInstall: true});
        device.primaryInputMode = 'hand';
        // Seated pose, looking toward the drawing board at z = -1.65.
        device.position.set(0, 1.2, 0.15);
        (window as unknown as {__iwer?: unknown}).__iwer = device;
      } catch (error) {
        console.warn('Solid Light could not start the XR emulator.', error);
      }
    }
  }
  await import('./index.js');
}

void boot();
