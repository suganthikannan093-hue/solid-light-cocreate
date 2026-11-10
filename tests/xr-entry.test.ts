import {describe,it,expect} from 'vitest';
import {probeXRSupport,preferredXRMode,fallbackXRMode,isXRSupported,emulateHref,xrFeedback} from '../src/game/xr-entry';

const xr = (vr:boolean|Error, ar:boolean|Error) => ({
  isSessionSupported: async (mode:string) => {
    const value = mode==='immersive-vr'?vr:ar;
    if(value instanceof Error) throw value;
    return value;
  },
});

describe('XR support and entry copy',()=>{
  it('treats a missing XR system as unsupported',async()=>{
    await expect(probeXRSupport(undefined)).resolves.toEqual({vr:false,ar:false});
    expect(isXRSupported({vr:false,ar:false})).toBe(false);
    expect(preferredXRMode({vr:false,ar:false})).toBeNull();
  });

  it('prefers VR, can prefer passthrough, and falls back to the other mode',async()=>{
    await expect(probeXRSupport(xr(true,true))).resolves.toEqual({vr:true,ar:true});
    await expect(probeXRSupport(xr(new Error('denied'),true))).resolves.toEqual({vr:false,ar:true});
    expect(preferredXRMode({vr:true,ar:true})).toBe('immersive-vr');
    expect(preferredXRMode({vr:true,ar:true},true)).toBe('immersive-ar');
    expect(preferredXRMode({vr:false,ar:true})).toBe('immersive-ar');
    expect(fallbackXRMode('immersive-vr',{vr:true,ar:true})).toBe('immersive-ar');
    expect(fallbackXRMode('immersive-ar',{vr:true,ar:false})).toBe('immersive-vr');
    expect(fallbackXRMode('immersive-vr',{vr:true,ar:false})).toBeNull();
  });

  it('keeps other query params when adding ?emulate',()=>{
    expect(emulateHref('')).toBe('?emulate');
    expect(emulateHref('?cloud=1')).toBe('?cloud=1&emulate');
    expect(emulateHref('?emulate')).toBe('?emulate');
  });

  it('explains desktop failure and the emulator preview path',()=>{
    expect(xrFeedback('unavailable')).toMatch(/Preview XR/);
    expect(xrFeedback('unavailable')).toMatch(/\?emulate/);
    expect(xrFeedback('failed')).toMatch(/Preview XR/);
    expect(xrFeedback('failed',false)).toMatch(/headset support/);
    expect(xrFeedback('starting')).toMatch(/Allow hand tracking/);
    expect(xrFeedback('trying-ar')).toMatch(/passthrough/);
  });
});
