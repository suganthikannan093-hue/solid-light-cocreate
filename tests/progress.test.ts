import {describe,it,expect} from 'vitest';
import {
  SAVE_KEY,
  SAVE_VERSION,
  loadProgress,
  saveProgress,
  clearProgress,
  migrateProgress,
  hasResume,
  updateRecord,
  starRating,
  chapterPar,
  recordKey,
  emptyProgress,
  defaultSettings,
  type StorageLike,
} from '../src/game/progress';

class MemoryStorage implements StorageLike {
  private data=new Map<string,string>();
  getItem(key:string){return this.data.has(key)?this.data.get(key)!:null;}
  setItem(key:string,value:string){this.data.set(key,String(value));}
  removeItem(key:string){this.data.delete(key);}
}

class ThrowingStorage implements StorageLike {
  getItem(){throw new Error('private mode');}
  setItem(){throw new Error('private mode');}
  removeItem(){throw new Error('private mode');}
}

describe('progress persistence',()=>{
  it('saves and reloads completed chapters, current chapter, workshop unlocks and settings',()=>{
    const storage=new MemoryStorage();
    const records=updateRecord({},1,1);
    expect(saveProgress({
      version:SAVE_VERSION,
      completed:[1],
      currentChapter:2,
      workshopUnlocked:false,
      workshopVariant:0,
      records,
      settings:{...defaultSettings(),muted:true,volume:0.4,reduced:true,contrast:true,strategy:'efficient'},
      savedAt:1,
    },storage)).toBe(true);
    const loaded=loadProgress(storage);
    expect(loaded?.completed).toEqual([1]);
    expect(loaded?.currentChapter).toBe(2);
    expect(loaded?.workshopUnlocked).toBe(false);
    expect(loaded?.records['1']).toEqual({bestStrokes:1,stars:3,completions:1});
    expect(loaded?.settings).toMatchObject({muted:true,volume:0.4,reduced:true,contrast:true,strategy:'efficient'});
    expect(hasResume(loaded)).toBe(true);
  });

  it('migrates unversioned saves and fills missing fields',()=>{
    const migrated=migrateProgress({completed:[1,2],currentChapter:3,settings:{volume:2,strategy:'efficient'}});
    expect(migrated?.version).toBe(SAVE_VERSION);
    expect(migrated?.completed).toEqual([1,2]);
    expect(migrated?.currentChapter).toBe(3);
    expect(migrated?.settings.volume).toBe(1);
    expect(migrated?.settings.strategy).toBe('efficient');
    expect(migrated?.records).toEqual({});
    expect(migrated?.workshopUnlocked).toBe(false);
  });

  it('unlocks workshop when chapter 4 is already complete in an older save',()=>{
    expect(migrateProgress({version:1,completed:[1,2,3,4],currentChapter:4})?.workshopUnlocked).toBe(true);
  });

  it('returns null for corrupt, non-JSON, or unrecognizable data',()=>{
    const storage=new MemoryStorage();
    storage.setItem(SAVE_KEY,'{not json');
    expect(loadProgress(storage)).toBe(null);
    storage.setItem(SAVE_KEY,'null');
    expect(loadProgress(storage)).toBe(null);
    storage.setItem(SAVE_KEY,JSON.stringify({version:0,completed:'all'}));
    expect(loadProgress(storage)).toBe(null);
    expect(migrateProgress('oops')).toBe(null);
    expect(migrateProgress({currentChapter:99})).toBe(null);
  });

  it('does not throw when storage is missing or in private mode',()=>{
    expect(loadProgress(undefined)).toBe(null);
    expect(saveProgress(emptyProgress(),undefined)).toBe(false);
    expect(loadProgress(new ThrowingStorage())).toBe(null);
    expect(saveProgress(emptyProgress(),new ThrowingStorage())).toBe(false);
    const cleared=clearProgress(new ThrowingStorage(),{keepSettings:true});
    expect(cleared.currentChapter).toBe(1);
    expect(cleared.completed).toEqual([]);
  });

  it('clears chapter progress but can keep comfort and audio settings',()=>{
    const storage=new MemoryStorage();
    saveProgress({
      ...emptyProgress(),
      completed:[1,2],
      currentChapter:3,
      settings:{...defaultSettings(),muted:true,volume:0.2},
    },storage);
    const kept=clearProgress(storage,{keepSettings:true});
    expect(kept.completed).toEqual([]);
    expect(kept.currentChapter).toBe(1);
    expect(kept.settings.muted).toBe(true);
    expect(kept.settings.volume).toBe(0.2);
    expect(hasResume(loadProgress(storage))).toBe(false);
  });

  it('keeps the fewest-stroke record and 1–3 stars against chapter par',()=>{
    expect(chapterPar(1)).toBe(1);
    expect(starRating(1,1)).toBe(3);
    expect(starRating(2,2)).toBe(3);
    expect(starRating(2,3)).toBe(2);
    expect(starRating(2,8)).toBe(1);
    const first=updateRecord({},2,3);
    const better=updateRecord(first,2,2);
    expect(better[recordKey(2)].bestStrokes).toBe(2);
    expect(better[recordKey(2)].stars).toBe(3);
    expect(better[recordKey(2)].completions).toBe(2);
  });
});
