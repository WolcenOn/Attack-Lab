#!/usr/bin/env python3
"""Rebuild the local MITRE ATT&CK change browser from extracted changelog.json files.

Usage: python scripts/import_mitre_changelogs.py --source /path/docs/changelogs --output data/mitre/history
Needs only the Python standard library. It does not require or modify the web app.
"""
import argparse
from collections import Counter
from pathlib import Path
import json
import re

DOMAINS = {'enterprise-attack': 'E', 'mobile-attack': 'M', 'ics-attack': 'I'}
CATEGORIES = ['techniques','software','groups','campaigns','assets','mitigations','datasources','datacomponents','detectionstrategies','analytics']
CHANGES = ['additions','major_version_changes','minor_version_changes','other_version_changes','patches','revocations','deprecations','deletions']
CODE = re.compile(r'[A-Z]{1,4}[0-9]{4}(?:\.[0-9]{3})?\Z')


def version_sort(path):
    return tuple(int(x) for x in re.findall(r'\d+', path.parent.name))


def build(source, output):
    source, output = Path(source), Path(output)
    changes = sorted(source.glob('*/changelog.json'), key=version_sort)
    if not changes:
        raise ValueError('No changelog.json files under source/<transition>/')
    output.mkdir(parents=True, exist_ok=True)
    releases = []
    payload = []
    for path in changes:
        raw = json.loads(path.read_text(encoding='utf-8'))
        collected = []
        for domain, code in DOMAINS.items():
            for cat, events in raw.get(domain, {}).items():
                if cat not in CATEGORIES or not isinstance(events, dict):
                    continue
                for act in CHANGES:
                    for obj in events.get(act, []):
                        if not isinstance(obj, dict):
                            continue
                        ref = next((ref for ref in obj.get('external_references', []) if ref.get('source_name') == 'mitre-attack' and CODE.fullmatch(str(ref.get('external_id', '')))), None)
                        if ref is None:
                            continue
                        collected.append([ref['external_id'], code, CATEGORIES.index(cat), CHANGES.index(act), obj.get('name') or obj.get('title') or ref['external_id']])
        collected.sort(key=lambda row:(row[0],row[1],row[2],row[3]))
        releases.append({'id':path.parent.name,'file':path.parent.name+'.json','total':len(collected),'changes':dict(Counter(CHANGES[r[3]] for r in collected)),'domains':dict(Counter(next(k for k,v in DOMAINS.items() if v==r[1]) for r in collected))})
        payload.append(collected)
    shards=[]
    for i in range(0,len(releases),4):
        filename='changes-%02d.json'%(i//4)
        contents={releases[j]['id']:payload[j] for j in range(i,min(i+4,len(releases)))}
        (output/filename).write_text(json.dumps(contents,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        shards.append({'file':filename,'releases':list(contents),'events':sum(len(x) for x in contents.values())})
    manifest={'schema':1,'edition':'MITRE ATT&CK changelog extracts','source_archive':'docs.rar','scope':'v7.2→v20.0','events':sum(x['events'] for x in shards),'releases':releases,'shards':shards,'categories':CATEGORIES,'actions':CHANGES,'domains':{'enterprise':'E','mobile':'M','ics':'I'},'mobile_crosswalk':'mobile-crosswalk.json','license':'© 2026 The MITRE Corporation. This work is reproduced and distributed with permission of The MITRE Corporation.','reference':'https://attack.mitre.org/resources/versions/','quality':'Reduced historical change metadata from archived MITRE changelog JSON; not an authoritative current-state catalog.'}
    (output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(f"{len(releases)} releases; {manifest['events']} changes; {len(shards)} files")


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',required=True)
    parser.add_argument('--output',required=True)
    args=parser.parse_args()
    build(args.source,args.output)
