from pathlib import Path
import json, mimetypes, base64
root = Path('site')
files = {}
for path in sorted(root.rglob('*')):
    if path.is_file():
        mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        if mime.startswith('text/'):
            mime += '; charset=utf-8'
        files['/'+path.relative_to(root).as_posix()] = [mime,base64.b64encode(path.read_bytes()).decode()]
out = Path('dist/server/index.js')
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(Path('worker.mjs').read_text().replace('ASSET_TABLE',json.dumps(files)))
