#!/usr/bin/env python3
"""Validate consistency of local ATT&CK catalog shards in a static checkout."""
import json,sys,re,collections
from pathlib import Path
root=Path(sys.argv[1] if len(sys.argv)>1 else 'data/mitre/v20')
manifest=json.loads((root/'manifest.json').read_text())
assert manifest['version']=='v20'
ids=[]
for typ,meta in manifest['categories'].items():
 data=[]
 for shard in meta['shards']:
  assert re.fullmatch(r'[a-z]+-\d{2}\.json',shard),shard
  data+=json.loads((root/shard).read_text())
 assert len(data)==meta['count'],(typ,len(data),meta['count'])
 for r in data:
  assert r.get('id'),(typ,r)
  assert 'description_en' in r or typ in ('software','components') or r.get('short_en') or typ=='detections',typ
 print(typ,len(data),'records')
 ids.extend(data)
idx=[]
for shard in manifest['index_shards']:
 idx.extend(json.loads((root/shard).read_text()))
assert len(idx)>=sum(c['count'] for c in manifest['categories'].values())
for r in idx:
 assert (root/r['shard']).exists(),r
rel=json.loads((root/'links.json').read_text())
assert 'T1566' in rel
assert all(re.fullmatch(r'T\d{4}(?:\.\d{3})?',k) for k in rel)
print('Index',len(idx),'entries; linked techniques',len(rel),'VALID')