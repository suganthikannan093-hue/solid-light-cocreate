import {describe,it,expect} from 'vitest';
import {audioStatusLabel,muteButtonLabel,clampVolume} from '../src/game/audio-ui';
import {Soundtrack} from '../src/game/soundtrack';

const view=(over:Partial<Parameters<typeof audioStatusLabel>[0]>)=>({state:'running',muted:false,paused:false,music:true,voice:'',volume:.8,error:'',...over});

describe('audio status and volume',()=>{
  it('labels locked, muted, playing and error states clearly',()=>{
    expect(audioStatusLabel(view({state:'locked',music:false}))).toMatch(/Enable sound/);
    expect(audioStatusLabel(view({muted:true}))).toMatch(/Sound off/);
    expect(audioStatusLabel(view({voice:'intro'}))).toMatch(/Playing guidance/);
    expect(audioStatusLabel(view({music:true}))).toMatch(/Music on/);
    expect(audioStatusLabel(view({error:'Voice could not load. Select Help to retry.'}))).toMatch(/Voice could not load/);
    expect(muteButtonLabel(true)).toBe('Sound off');
    expect(muteButtonLabel(false)).toBe('Sound on');
  });

  it('clamps volume and persists it on a soundtrack even before AudioContext exists',()=>{
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(.8);
    const sound=new Soundtrack();
    sound.setVolume(.4);
    expect(sound.status()).toMatchObject({state:'locked',volume:.4,muted:false});
    sound.setMuted(true);
    expect(sound.status().muted).toBe(true);
    sound.setMuted(false);
    // Unlock without a real AudioContext should record a fallback, not throw.
    const Audio=globalThis.AudioContext;
    // @ts-expect-error -- simulate a browser with no Web Audio
    delete (globalThis as {AudioContext?:unknown}).AudioContext;
    try{sound.unlock();expect(sound.status().error).toMatch(/unavailable|Enable sound|Help/);}
    finally{if(Audio)globalThis.AudioContext=Audio;}
  });
});
